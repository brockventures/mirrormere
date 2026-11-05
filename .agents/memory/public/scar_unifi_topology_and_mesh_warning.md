---
name: UniFi Topology and Mesh Warning
description: "All UniFi APs are physically hardwired to Ethernet drops with no wireless mesh dependencies, but Uni"
category: scar
source: scar_unifi_topology_and_mesh_warning.md
updated: 2026-09-12
---

All UniFi APs are physically hardwired to Ethernet drops with no wireless mesh dependencies, but UniFi Controller 10.6 displays a static, unconditioned warning modal when disabling Wireless Meshing even when zero devices use wireless uplinks. Network baseline configuration establishes IPv6 disabled to avoid Docker/IoT stalls, Auto STP Edge enabled, and Nightly Channel Optimization kept off.
