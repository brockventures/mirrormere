---
name: UniFi AP ARP Collision and ZHA Backoff Hardening
description: "Hardened homelab network against phantom outages by locking UniFi AP/switch static IPs, disabling auto-upgrades, adding Host 1 DNS fallback, and deploying HA fast-reload watchdog."
category: scar
source: scar_unifi_ap_arp_collision_and_zha_backoff_hardening.md
updated: 2026-09-22
---

Following an overnight incident where an unreserved U6-Mesh AP rebooted and collided with `10.0.0.x` (causing an ARP storm, CoreDNS starvation, and a 34-minute HA ZHA retry backoff lockout), executed 4-layer hardening:
1. **UniFi Static Infrastructure IPs:** Statically locked all switches and APs via controller API (`U6-IW` at `10.0.0.x`, `U6-Mesh` units at `10.0.0.x` & `10.0.0.x`, `USW-Lite-8-PoE` units at `10.0.0.x` & `10.0.0.x`).
2. **Auto-Upgrade Protected:** Kept `auto_upgrade: true` scheduled at 3:00 AM PT (`auto_upgrade_hour: 3`). With static IPs and the fast-recovery watchdog in place, firmware upgrade reboots will cleanly cycle without ARP collisions or extended ZHA backoff lockouts.
3. **HA Fast-Recovery Watchdog:** Deployed native Home Assistant automation (`zha_coordinator_auto_recover`) triggered by `binary_sensor.slzb_06p7_internet` reconnects, and patched `tools/ha_reauth_watchdog.py` with port 6638 socket probes to auto-reload ZHA in <5 seconds.
4. **Host 1 Fallback DNS:** Added `1.1.1.1` as secondary nameserver with `options timeout:2 attempts:2` in `/etc/resolv.conf` on Host 1 (`10.0.0.x`) to prevent local gateway DNS starvation from failing cloud integrations.
