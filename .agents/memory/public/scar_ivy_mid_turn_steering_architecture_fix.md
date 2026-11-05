---
name: Ivy Mid-Turn Steering Architecture Fix
description: "Identified that Ivy's bridge previously queued mid-turn steering as standard FIFO tasks without proc"
category: scar
source: scar_ivy_mid_turn_steering_architecture_fix.md
updated: 2026-09-16
---

Identified that Ivy's bridge previously queued mid-turn steering as standard FIFO tasks without process interruption or stale response suppression. Patched `/opt/docker/discord-ivy-agent/bridge.py` on Host 2 by exposing module-scoped `active_proc` tracking and an `is_steered`/`steering_active` flag to abort running turns and discard stale output.
