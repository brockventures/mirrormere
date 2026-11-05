---
name: Event Loop Voice Handshake Timeout
description: "Synchronous memory embedding searches on the main asyncio event loop blocked Discord gateway heartbe"
category: scar
source: scar_event_loop_voice_handshake_timeout.md
updated: 2026-10-20
---

Synchronous memory embedding searches on the main asyncio event loop blocked Discord gateway heartbeats past the 15-second voice handshake threshold, causing voice connection timeouts. Fixed by offloading prompt memory searches to `asyncio.to_thread` in `bridge_runner.py` and adding 3-attempt connection retries with stale client cleanup in `bridge_voice.py`.
