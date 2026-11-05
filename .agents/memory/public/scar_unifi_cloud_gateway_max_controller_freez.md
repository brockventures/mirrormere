---
name: UniFi Cloud Gateway Max Controller Freeze
description: "Wireless and client connectivity failure was traced to a hung UniFi Network Controller application ("
category: scar
source: scar_unifi_cloud_gateway_max_controller_freez.md
updated: 2026-10-01
---

Wireless and client connectivity failure was traced to a hung UniFi Network Controller application (`/proxy/network/` timeouts) while UniFi OS core management remained responsive. Distinguishes client-side hardware/laptop issues from gateway controller plane lockups during homelab network outages.
