---
name: Z-Wave Watchdog Single-Pass Restart Guard
description: "Fixed Home Assistant's self-healing watchdog to prevent redundant back-to-back container restarts du"
category: scar
source: scar_z_wave_watchdog_single_pass_restart_guar.md
updated: 2026-10-29
---

Fixed Home Assistant's self-healing watchdog to prevent redundant back-to-back container restarts during Z-Wave JS recovery. Recovered entries are now pruned prior to alert dispatch to suppress false alerts when network recovery succeeds.
