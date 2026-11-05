---
name: Nest Lock Watchdog Boot Timing
description: "Homebridge restarts take approximately 42 seconds to boot and initialize the Nest lock on Host 1. Th"
category: scar
source: scar_nest_lock_watchdog_boot_timing.md
updated: 2026-10-23
---

Homebridge restarts take approximately 42 seconds to boot and initialize the Nest lock on Host 1. The `execute_self_heal` routine in `nest_lock_watchdog.py` previously failed recovery because its 10-second hardcoded sleep timed out before Homebridge finished initialization, requiring a poll loop of up to 60 seconds before triggering the HomeKit Controller reload.
