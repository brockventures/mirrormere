---
name: Brain Pruning & Multi-Channel Watchdog
description: "Implemented 30-day rolling brain/scratch retention in `tools/brain_retention.py` with 2:00 AM multi-"
category: scar
source: scar_brain_pruning_multi_channel_watchdog.md
updated: 2026-09-04
---

Implemented 30-day rolling brain/scratch retention in `tools/brain_retention.py` with 2:00 AM multi-channel rollover. Updated watchdog and presence beacon checks in `tools/bridge_scheduler.py` to monitor `channel_active_procs` across concurrent channels rather than relying on legacy single-process pointers.
