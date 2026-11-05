---
name: Banana Watcher Blind Token Fallback
description: "A Discord SSL handshake timeout triggered a secondary fallback token in Banana Watcher that lacked m"
category: scar
source: scar_banana_watcher_blind_token_fallback.md
updated: 2026-10-11
---

A Discord SSL handshake timeout triggered a secondary fallback token in Banana Watcher that lacked message body read intents/visibility. This caused topic idle time to miscalculate and delay auto-parking by over 400 minutes on an already closed thread.
