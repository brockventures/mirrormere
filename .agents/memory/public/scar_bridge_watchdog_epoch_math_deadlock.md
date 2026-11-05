---
name: Bridge Watchdog Epoch Math Deadlock
description: "Root-caused a watchdog failure where missing or zero timestamps caused `now_ts - ts` epoch math to m"
category: scar
source: scar_bridge_watchdog_epoch_math_deadlock.md
updated: 2026-09-05
---

Root-caused a watchdog failure where missing or zero timestamps caused `now_ts - ts` epoch math to miscalculate silence as ~56 years (>29.8M minutes). Fixes were applied to `tools/bridge_scheduler.py` and `tools/bridge_state.py`, requiring a bridge daemon restart over SSH to unbind unpatched code held in memory by PID 1.
