---
name: Option B Suppression and Schedule Ban
description: "Patched shared bridge infrastructure in `bridge_safety.py` to suppress AGY SDK Option B waiting temp"
category: scar
source: scar_option_b_suppression_and_schedule_ban.md
updated: 2026-10-07
---

Patched shared bridge infrastructure in `bridge_safety.py` to suppress AGY SDK Option B waiting template leaks into Discord. Enforced an operational invariant explicitly banning the runtime `schedule` tool during interactive turns in favor of `run_command` and bridge scheduler wakeups.
