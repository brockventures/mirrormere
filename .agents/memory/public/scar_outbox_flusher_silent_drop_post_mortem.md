---
name: Outbox Flusher Silent Drop Post-Mortem
description: "Outbox messages exceeding Discord's 2,000-character REST ceiling were silently dropping due to unchu"
category: scar
source: scar_outbox_flusher_silent_drop_post_mortem.md
updated: 2026-09-12
---

Outbox messages exceeding Discord's 2,000-character REST ceiling were silently dropping due to unchunked dispatches in `tools/bridge_scheduler.py`. The fix enforces defensive chunking via `chunk_text(content, max_len=1900)` across all targets, including under the Banana Stand mutex lock, preventing payload rejections.
