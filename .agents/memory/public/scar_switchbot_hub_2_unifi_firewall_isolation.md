---
name: SwitchBot Hub 2 UniFi Firewall Isolation
description: "SwitchBot Hub 2 (Node 2) on Wi-Fi (`SciWiFi-IoT`) advertised its Matter fabric record but failed CAS"
category: scar
source: scar_switchbot_hub_2_unifi_firewall_isolation.md
updated: 2026-10-12
---

SwitchBot Hub 2 (Node 2) on Wi-Fi (`SciWiFi-IoT`) advertised its Matter fabric record but failed CASE session establishment with Home Assistant because it was blocked by the UniFi IoT firewall drop rule. Matter over Wi-Fi cross-VLAN communication requires specific firewall rule allowances between the IoT VLAN and Home Assistant.
