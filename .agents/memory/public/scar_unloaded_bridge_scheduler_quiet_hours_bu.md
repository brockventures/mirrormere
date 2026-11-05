---
name: Unloaded Bridge Scheduler Quiet Hours Bug
description: "A patch to `bridge_scheduler.py` failed to enforce the 11 PM quiet-hours pause because the daemon wa"
category: scar
source: scar_unloaded_bridge_scheduler_quiet_hours_bu.md
updated: 2026-10-10
---

A patch to `bridge_scheduler.py` failed to enforce the 11 PM quiet-hours pause because the daemon was not reloaded, leaving stale in-memory logic running with an inverted comparison bug (`23 <= hour < 7`). Bridge scheduler and daemon changes must undergo immediate process reloads after disk writes to prevent stale memory loops from firing during quiet hours.
