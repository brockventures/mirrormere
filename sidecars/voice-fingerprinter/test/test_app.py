"""Unit tests for the voice-fingerprinter sidecar's FastAPI app (app.py).

The model is fully mocked via conftest.py's fake torch/torchaudio/
speechbrain modules — no network access, no model download, no real
torch/speechbrain import. Audio fixtures are synthesized in-process with
the stdlib `wave` module; nothing is ever played.
"""
from __future__ import annotations

import importlib
import io
import math
import struct
import sys
import wave
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))


def _make_wav_bytes(seconds: float, sample_rate: int = 16000, channels: int = 1,
                     freq: float = 220.0) -> bytes:
    """A synthesized sine-wave WAV — never audio played or recorded."""
    n_frames = int(seconds * sample_rate)
    buf = io.BytesIO()
    with wave.open(buf, "wb") as w:
        w.setnchannels(channels)
        w.setsampwidth(2)
        w.setframerate(sample_rate)
        frames = bytearray()
        for i in range(n_frames):
            sample = int(3000 * math.sin(2 * math.pi * freq * i / sample_rate))
            for _ in range(channels):
                frames += struct.pack("<h", sample)
        w.writeframes(bytes(frames))
    return buf.getvalue()


@pytest.fixture()
def app_module(monkeypatch):
    """Fresh import of app.py per test, with the model force-loaded via
    the fake speechbrain module (no network, no download)."""
    monkeypatch.setenv("MDE_SAVEDIR", "/tmp/voice-fingerprinter-test-savedir")
    sys.modules.pop("app", None)
    mod = importlib.import_module("app")
    mod._load_model()
    assert mod._load_error is None, f"fake model load failed: {mod._load_error}"
    assert mod._model is not None
    yield mod
    sys.modules.pop("app", None)


@pytest.fixture()
def client(app_module):
    return TestClient(app_module.app)


def test_health_ok(client):
    resp = client.get("/health")
    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] == "ok"
    assert body["loaded"] is True
    assert body["model"] == "speechbrain/spkrec-ecapa-voxceleb"
    assert body["device"] == "cpu"


def test_health_error_when_model_not_loaded(app_module, client):
    app_module._model = None
    app_module._load_error = "boom"
    resp = client.get("/health")
    assert resp.status_code == 503
    assert resp.json()["status"] == "error"
    assert resp.json()["load_error"] == "boom"


def test_embed_happy_path_16k_mono(client):
    wav = _make_wav_bytes(3.0, sample_rate=16000, channels=1)
    resp = client.post("/embed", content=wav)
    assert resp.status_code == 200
    body = resp.json()
    assert body["model"] == "speechbrain/spkrec-ecapa-voxceleb"
    assert isinstance(body["embedding"], list)
    assert len(body["embedding"]) == 192
    assert all(isinstance(x, float) for x in body["embedding"])


def test_embed_empty_body_is_400(client):
    resp = client.post("/embed", content=b"")
    assert resp.status_code == 400
    assert "empty body" in resp.json()["error"]


def test_embed_garbage_bytes_is_400(client):
    resp = client.post("/embed", content=b"not a wav file at all")
    assert resp.status_code == 400
    assert "error" in resp.json()


def test_embed_too_short_is_400(client):
    wav = _make_wav_bytes(0.1, sample_rate=16000, channels=1)
    resp = client.post("/embed", content=wav)
    assert resp.status_code == 400
    assert "too short" in resp.json()["error"]


def test_embed_model_not_loaded_is_503(app_module, client):
    app_module._model = None
    app_module._load_error = "not loaded yet"
    wav = _make_wav_bytes(2.0)
    resp = client.post("/embed", content=wav)
    assert resp.status_code == 503


def test_embed_downmixes_stereo(client):
    wav = _make_wav_bytes(2.0, sample_rate=16000, channels=2)
    resp = client.post("/embed", content=wav)
    assert resp.status_code == 200
    assert len(resp.json()["embedding"]) == 192


def test_embed_resamples_non_16k(app_module, client):
    # 44.1kHz input must be resampled to 16kHz before hitting the encoder —
    # verify indirectly by checking decode+resample produces a plausible
    # 16kHz-length array and the endpoint still succeeds.
    wav = _make_wav_bytes(2.0, sample_rate=44100, channels=1)
    samples = app_module._decode_and_resample(wav)
    assert 16000 * 2 * 0.95 <= len(samples) <= 16000 * 2 * 1.05

    resp = client.post("/embed", content=wav)
    assert resp.status_code == 200
    assert len(resp.json()["embedding"]) == 192


def test_embed_48k_stereo_downmix_and_resample(app_module):
    wav = _make_wav_bytes(1.5, sample_rate=48000, channels=2)
    samples = app_module._decode_and_resample(wav)
    expected_len = int(1.5 * 16000)
    assert abs(len(samples) - expected_len) <= expected_len * 0.05


def test_load_config_file(tmp_path):
    cfg_file = tmp_path / "voice-fingerprinter.yaml"
    cfg_file.write_text("port: 9099\nbind: 127.0.0.1\ndevice: cpu\nthreads: 2\n")
    import app
    loaded = app.load_config_file(str(cfg_file))
    assert str(loaded["port"]) == "9099"
    assert loaded["bind"] == "127.0.0.1"


def test_load_config_file_port_zero(tmp_path):
    cfg_file = tmp_path / "voice-fingerprinter.yaml"
    cfg_file.write_text("port: 0\nbind: 127.0.0.1\n")
    import app
    loaded = app.load_config_file(str(cfg_file))
    assert str(loaded["port"]) == "0"


def _make_silent_wav_bytes(seconds: float, sample_rate: int = 16000, channels: int = 1) -> bytes:
    """Fast synthesized silent 16-bit PCM WAV for boundary and rejection tests."""
    n_frames = int(seconds * sample_rate)
    buf = io.BytesIO()
    with wave.open(buf, "wb") as w:
        w.setnchannels(channels)
        w.setsampwidth(2)
        w.setframerate(sample_rate)
        w.writeframes(b"\x00\x00" * (n_frames * channels))
    return buf.getvalue()


def test_embed_oversized_body_content_length_is_413(app_module, client, monkeypatch):
    monkeypatch.setattr(app_module, "MAX_BODY_BYTES", 1024)
    encode_called = False

    def fail_encode(*args, **kwargs):
        nonlocal encode_called
        encode_called = True
        raise AssertionError("encode_batch must not be called for oversized body")

    monkeypatch.setattr(app_module._model, "encode_batch", fail_encode)

    resp = client.post("/embed", content=b"x" * 2048)
    assert resp.status_code == 413
    assert "too large" in resp.json()["error"].lower()
    assert not encode_called


def test_embed_oversized_streamed_body_is_413(app_module, client, monkeypatch):
    monkeypatch.setattr(app_module, "MAX_BODY_BYTES", 1024)

    def chunk_gen():
        for _ in range(4):
            yield b"a" * 512

    resp = client.post("/embed", content=chunk_gen())
    assert resp.status_code == 413
    assert "too large" in resp.json()["error"].lower()


def test_embed_default_10mib_body_cap_is_413(app_module, client):
    assert app_module.MAX_BODY_BYTES == 10 * 1024 * 1024
    resp = client.post(
        "/embed",
        content=b"",
        headers={"content-length": str(app_module.MAX_BODY_BYTES + 1)},
    )
    assert resp.status_code == 413
    assert "too large" in resp.json()["error"].lower()


def test_embed_excessive_duration_rejected_before_sf_read_and_lock(app_module, client, monkeypatch):
    import soundfile as sf

    wav = _make_silent_wav_bytes(31.0, sample_rate=8000, channels=1)

    def forbid_read(*args, **kwargs):
        raise AssertionError("sf.read must not be called when sf.info detects duration > 30s")

    def forbid_encode(*args, **kwargs):
        raise AssertionError("encode_batch must not be called for over-duration audio")

    monkeypatch.setattr(sf, "read", forbid_read)
    monkeypatch.setattr(app_module._model, "encode_batch", forbid_encode)

    resp = client.post("/embed", content=wav)
    assert resp.status_code in (400, 413)
    assert resp.status_code == 413
    assert "too long" in resp.json()["error"].lower()


def test_embed_excessive_channels_rejected_before_sf_read_and_lock(app_module, client, monkeypatch):
    import soundfile as sf

    wav = _make_silent_wav_bytes(1.0, sample_rate=16000, channels=4)

    def forbid_read(*args, **kwargs):
        raise AssertionError("sf.read must not be called when sf.info detects channels > 2")

    def forbid_encode(*args, **kwargs):
        raise AssertionError("encode_batch must not be called for >2 channel audio")

    monkeypatch.setattr(sf, "read", forbid_read)
    monkeypatch.setattr(app_module._model, "encode_batch", forbid_encode)

    resp = client.post("/embed", content=wav)
    assert resp.status_code == 400
    assert "channel" in resp.json()["error"].lower()


@pytest.mark.parametrize("bad_rate", [4000, 192000])
def test_embed_invalid_sample_rate_rejected_before_sf_read_and_lock(
    app_module, client, monkeypatch, bad_rate
):
    import soundfile as sf

    wav = _make_silent_wav_bytes(1.0, sample_rate=bad_rate, channels=1)

    def forbid_read(*args, **kwargs):
        raise AssertionError("sf.read must not be called when sf.info detects invalid sample rate")

    def forbid_encode(*args, **kwargs):
        raise AssertionError("encode_batch must not be called for invalid sample rate")

    monkeypatch.setattr(sf, "read", forbid_read)
    monkeypatch.setattr(app_module._model, "encode_batch", forbid_encode)

    resp = client.post("/embed", content=wav)
    assert resp.status_code == 400
    assert "sample rate" in resp.json()["error"].lower()


def test_embed_valid_8k_boundary_succeeds(client):
    wav = _make_wav_bytes(1.0, sample_rate=8000, channels=1)
    resp = client.post("/embed", content=wav)
    assert resp.status_code == 200
    assert len(resp.json()["embedding"]) == 192


