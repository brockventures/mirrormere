---
name: Post-Outage Coordinator STP Deadlock
description: "Ungraceful power outages cause network-attached Home Assistant coordinators (Z-Wave/Zigbee ESP32 app"
category: scar
source: scar_post_outage_coordinator_stp_deadlock.md
updated: 2026-10-04
---

Ungraceful power outages cause network-attached Home Assistant coordinators (Z-Wave/Zigbee ESP32 appliances) to trigger UniFi Spanning Tree Protocol (STP) port-blocking loops upon reboot. Mitigated by applying startup delay/healthchecks to `zwave-js-ui` and ZHA containers on Host 1 and addressing switch port flap handling to allow hardware link negotiation before polling.
