---
name: Outbox Silent Drop and Play-by-Play Autopsy
description: "Discovered and patched a critical flaw in `tools/outbox.py` where `--flush` drained pending queue me"
category: scar
source: scar_outbox_silent_drop_and_play_by_play_auto.md
updated: 2026-09-13
---

Discovered and patched a critical flaw in `tools/outbox.py` where `--flush` drained pending queue messages directly to stdout before the background bridge worker could broadcast them, causing silent drops. Additionally reinforced operational invariants against emitting empty play-by-play status messages without actual notification hooks, and fixed failure to trigger user/agent mentions.
