---
name: Ivy Listener Isolation Patch
description: "A live patch in `bridge.py` (commit `216f50a`) resolved phantom turn collisions and mid-turn steerin"
category: scar
source: scar_ivy_listener_isolation_patch.md
updated: 2026-09-26
---

A live patch in `bridge.py` (commit `216f50a`) resolved phantom turn collisions and mid-turn steering aborts between Ivy and Zero. The bridge daemon now strictly enforces `is_ivy_explicitly_tagged` before processing Zero messages in memory.
