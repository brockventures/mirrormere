---
name: Z-Wave TubesZB Self-Healing Architecture
description: "Implemented two-layer self-healing for dropped TubesZB TCP serial connections (port 6638/ESPHome 605"
category: scar
source: scar_z_wave_tubeszb_self_healing_architecture.md
updated: 2026-10-27
---

Implemented two-layer self-healing for dropped TubesZB TCP serial connections (port 6638/ESPHome 6053) affecting `zwave-js-ui` and Somfy living room blinds. Layer 1 uses `ha_reauth_watchdog.py` to pulse the TubesZB restart button and bounce `zwave-js-ui` on Host 1, while Layer 2 adds retry wrappers to HA blind automations.
