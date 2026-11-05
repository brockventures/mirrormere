---
name: Bridge Watchdog Timeout on Bloated Context
description: "Turns were terminated not by the 300-second overall turn ceiling, but by the bridge's 90-second step"
category: scar
source: scar_bridge_watchdog_timeout_on_bloated_conte.md
updated: 2026-09-29
---

Turns were terminated not by the 300-second overall turn ceiling, but by the bridge's 90-second step-inactivity watchdog (`turn_step_idle_seconds: 90.0`) when time-to-first-token on 120k+ uncompacted context exceeded 90s. The issue cleared automatically once session compaction fired on a subsequent turn.
