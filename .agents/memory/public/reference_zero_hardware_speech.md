---
name: Reference Zero Hardware Speech
description: "Engineering architecture and post-mortem notes derived from reference_zero_hardware_speech.md"
category: engineering
source: reference_zero_hardware_speech.md
updated: 2026-10-05
---

# Zero Hardware Speech Profile (Pixel 8 Pro)

- **Locked-In Profile:** Steffan (Ultron)
- **Model:** `en-US-SteffanNeural`
- **Tuning:** `pitch="-5Hz"`, `rate="-5%"`
- **Hardware Target:** Pixel 8 Pro (`36261FDJG0003L`) over ADB USB via Host 2 (`10.0.0.x:5037`)
- **Default Media Volume:** `21/25`
- **Dispatcher CLI:** [`/workspace/tools/phone_speech.py`](file:///workspace/tools/phone_speech.py)
- **Audio Routing:** Synthesized via `edge-tts`, pushed to `/sdcard/Notifications/`, played via Files PreviewActivity (`com.google.android.apps.nbu.files.gateway.preview.PreviewActivity`), auto-dismissed back to home screen via keyevent 3.
- **Port Stability:** Coexists continuously with IP Webcam foreground streaming on port 3333 without drops.
