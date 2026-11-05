---
name: UniFi CoreDNS Hitch LAN Post-Mortem
description: "An overnight internal LAN outage was caused by a PoE switch bounce triggering an AP ARP collision (`"
category: scar
source: scar_unifi_coredns_hitch_lan_post_mortem.md
updated: 2026-09-22
---

An overnight internal LAN outage was caused by a PoE switch bounce triggering an AP ARP collision (`10.0.0.x`) and starving the UCG-Max CoreDNS socket, while HA's ZHA integration stalled on coordinator link loss due to a 600-second retry backoff. Permanent mitigations require static IP reservations for UniFi APs, fallback DNS resolvers (`1.1.1.1`/`8.8.8.8`) on Host 1, and an automated fast-reload trigger for the SLZB-06P7 Zigbee coordinator integration.
