---
name: UniFi TP-Link Internet Block Breakdown
description: "Blocking WAN access on the IoT VLAN drops TP-Link Kasa devices offline in Google Home because Google"
category: scar
source: scar_unifi_tp_link_internet_block_breakdown.md
updated: 2026-09-17
---

Blocking WAN access on the IoT VLAN drops TP-Link Kasa devices offline in Google Home because Google Home relies on cloud-to-cloud sync (`*.tplinkcloud.com`) rather than local LAN control. Local Home Assistant retains direct LAN control over port 9999, but cloud access was restored via disabling the UniFi traffic rule `Block WAN - TP-Link Kasa Smart Plugs & Switches` to maintain Google Home availability.
