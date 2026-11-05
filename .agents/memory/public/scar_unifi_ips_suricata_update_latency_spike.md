---
name: UniFi IPS Suricata Update Latency Spike
description: "A daily automated UniFi IPS/IDS signature update on the Cloud Gateway Max launched a new Suricata in"
category: scar
source: scar_unifi_ips_suricata_update_latency_spike.md
updated: 2026-10-01
---

A daily automated UniFi IPS/IDS signature update on the Cloud Gateway Max launched a new Suricata instance (`PID 839608`) under `suricata_ubios_high.yaml`, triggering a kernel softirq wedge that resulted in ~40% upstream packet loss and latency spikes up to 740ms.
