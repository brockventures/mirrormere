---
name: Stale In-Memory Bridge Scheduler Glitch
description: "Updating `schedule.json` while the bridge daemon is actively running causes "Turn Incomplete" ghost "
category: scar
source: scar_stale_in_memory_bridge_scheduler_glitch.md
updated: 2026-10-12
---

Updating `schedule.json` while the bridge daemon is actively running causes "Turn Incomplete" ghost alerts due to an out-of-sync in-memory scheduler state until a bridge reload is applied. Homelab PID and thread telemetry confirmed nominal headroom on Host 2, ruling out process exhaustion.
