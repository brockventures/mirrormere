---
name: Event Loop Heartbeat Starvation Postmortem
description: "Synchronous FastEmbed vector search in `prepare_turn_prompt` on `transcript_index.db` blocked the ma"
category: scar
source: scar_event_loop_heartbeat_starvation_postmort.md
updated: 2026-10-25
---

Synchronous FastEmbed vector search in `prepare_turn_prompt` on `transcript_index.db` blocked the main `asyncio` event loop during concurrent turns, starving the Discord gateway heartbeat for ~40 seconds and triggering a disconnect. Turn-0 memory pre-fetching must run off the main event loop or in an executor to avoid stalling WebSocket keepalives.
