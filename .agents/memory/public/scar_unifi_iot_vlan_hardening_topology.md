---
name: UniFi IoT VLAN Hardening Topology
description: "Deployed and verified an isolated IoT VLAN (VLAN 20, 10.0.0.x/24) on the UCG-Max with mDNS routi"
category: scar
source: scar_unifi_iot_vlan_hardening_topology.md
updated: 2026-09-16
---

Deployed and verified an isolated IoT VLAN (VLAN 20, 10.0.0.x/24) on the UCG-Max with mDNS routing for Home Assistant. Enforced air-gapping on 20 TP-Link Kasa smart devices via gateway traffic rules while maintaining local LAN control from Home Assistant (10.0.0.x). Verified no management ports are exposed to WAN.
