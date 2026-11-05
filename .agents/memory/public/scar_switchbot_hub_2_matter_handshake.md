---
name: SwitchBot Hub 2 Matter Handshake
description: "The `matterserver` container did not crash; failure was caused by network isolation when SwitchBot H"
category: scar
source: scar_switchbot_hub_2_matter_handshake.md
updated: 2026-10-12
---

The `matterserver` container did not crash; failure was caused by network isolation when SwitchBot Hub 2 roamed to the IoT VLAN (`SciWiFi-IoT`, VLAN 20). UniFi firewall rules blocked Host 1 (`10.0.0.x`) from initiating the Matter CASE handshake across VLAN boundaries.
