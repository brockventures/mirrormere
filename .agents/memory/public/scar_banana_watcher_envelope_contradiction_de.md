---
name: Banana Watcher Envelope Contradiction Deadlock
description: "Root-cause post-mortem of a silent channel freeze where Marvin emitted contradictory envelope tags ("
category: scar
source: scar_banana_watcher_envelope_contradiction_de.md
updated: 2026-09-07
---

Root-cause post-mortem of a silent channel freeze where Marvin emitted contradictory envelope tags (`floor: closed` alongside non-terminal status), causing bots to go silent while Banana Watcher stood down without synthesizing. Ryan directed Watcher to actively detect and warn against envelope semantic contradictions, establishing 7 distinct contradiction classes to prevent multi-agent deadlocks.
