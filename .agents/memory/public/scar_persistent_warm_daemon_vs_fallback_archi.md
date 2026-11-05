---
name: Persistent Warm Daemon vs Fallback Architecture
description: "High-velocity channels (`#zero-chat`, `#the-banana-stand`, `#lounge`) run dedicated, persistent 24/7"
category: scar
source: scar_persistent_warm_daemon_vs_fallback_archi.md
updated: 2026-09-15
---

High-velocity channels (`#zero-chat`, `#the-banana-stand`, `#lounge`) run dedicated, persistent 24/7 warm `agy` daemon instances (~150ms first-token latency), while secondary dynamic channels and task threads use ephemeral subprocesses. Zero previously hallucinated lack of persistent processes by mistakenly inspecting only the 40-line fallback runner instead of the active 900-line daemon engine.
