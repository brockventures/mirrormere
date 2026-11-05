---
name: Project Lapel Mic Lifelogger
description: "Engineering architecture and post-mortem notes derived from project_lapel_mic_lifelogger.md"
category: engineering
source: project_lapel_mic_lifelogger.md
updated: 2026-10-18
---

# Project Roadmap: DIY BLE Lapel Mic & Day-Long Lifelogger ("Zero Lifelogger")

- **Created:** 2026-10-17 (PT)
- **Status:** Backlog / Future Hardware & Software Project (Separated from Discord Voice Live chat)
- **Owner:** Ryan Brock & Zero

---

## 1. Objective
Build an ultra-compact, screenless, clip-on Bluetooth LE (BLE) lapel/collar microphone (similar in spirit to Omi/Friend/Limitless Pendant, separated from the screen-heavy Muse Charm concept) that captures spoken conversations and voice thoughts throughout the day, streams compressed audio to Ryan's Pixel 11 Pro XL, and feeds a Host 2 (`.84`) distillation pipeline to construct structured daily memory files for Zero.

---

## 2. Why a Dedicated BLE Collar Mic Over Bare Smartphone Mic
- **OS Background Mic Throttling:** Android and iOS aggressively mute or kill background microphone recording whenever phone calls, Zoom/Teams meetings, or media playback take audio focus.
- **Acoustic Clarity:** A phone muffled inside a denim pocket captures poor room audio and fabric rustle; a collar/lapel MEMS microphone sits 6 inches from the vocal cords.
- **Battery Conservation:** Continuous hot-mic + VAD on a phone drains 30–40% battery; a dedicated nRF52840 or ESP32-S3 BLE wearable running Opus compression sips ~10–15mW and runs 14–24 hours on a tiny coin/pouch LiPo.

---

## 3. Candidate Hardware BOM (~$20–$30)
1. **Compute + BLE:** Seeed Studio **XIAO nRF52840 Sense** (ultra-low power BLE + onboard digital PDM microphone + IMU) or **XIAO ESP32S3 Sense** (if Wi-Fi fallback or local microSD buffering is desired).
2. **Battery:** 250mAh–400mAh 3.7V LiPo pouch cell + magnetic pogo-pin or USB-C charging.
3. **Physical Controls:** Tactile hardware **Mute Toggle Switch** + LED privacy indicator (hard requirement for NDA/work meetings and two-party consent boundaries).
4. **Enclosure:** Custom 3D-printed magnetic lapel clip / collar pebble fabricated on the **Creality Ender-3 V2**.

---

## 4. Host 2 (`.84`) Ingestion & Distillation Pipeline
1. **Transport:** BLE Opus stream -> Pixel 11 Pro XL background relay (or local microSD sync-on-dock when returning home) -> Host 2 FastAPI endpoint.
2. **Stage 1 — Local VAD (Silero VAD):** Strip all dead air, keyboard clatter, traffic, and TV noise before transcription.
3. **Stage 2 — Diarization & Speaker Verification:** Transcribe active speech blocks in 15–30 minute batches using `gemini-3.5-transcribe` / Whisper with speaker embedding verification (distinguishing *Ryan* vs. other speakers).
4. **Stage 3 — Two-Tier Memory Distiller:**
   - **Ephemeral Daily Log (`/workspace/memory/private/lifelog_YYYY_MM_DD.md`):** Chronological summary of topics, tasks, reminders, and ideas (7-day rolling window).
   - **Durable Fact Promotion:** High-signal permanent facts, preferences, and commitments promoted into `/workspace/memory/private/` and indexed via `transcript_index.py` (SQLite FTS5 + FastEmbed vector hybrid index), followed by automatic raw audio purge.

---

## 5. Privacy & Legal Guardrails
- **All-Party Consent Compliance (WA/CA):** Hardware mute switch + optional "Ryan-voice-only" filter or explicit meeting-memo mode.
- **Zero-Chat Air-Gap:** All lifelog transcripts and distilled memories stay strictly isolated inside `/workspace/memory/private/` (never accessible to external or Crab Cavern channels).
