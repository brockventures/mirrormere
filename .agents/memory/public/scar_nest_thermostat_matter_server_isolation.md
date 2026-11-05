---
name: Nest Thermostat Matter Server Isolation
description: "When the Office Nest Temperature Sensor freezes telemetry, reloading the Home Assistant Matter integ"
category: scar
source: scar_nest_thermostat_matter_server_isolation.md
updated: 2026-10-26
---

When the Office Nest Temperature Sensor freezes telemetry, reloading the Home Assistant Matter integration and restarting `matterserver` on Host 1 isolates whether the issue is transport-layer or device-level. Post-restart traces confirmed other Matter nodes reconnected cleanly, isolating persistent state stalls directly to the Nest Learning Thermostat 4th Gen hardware rather than HA or container connectivity.
