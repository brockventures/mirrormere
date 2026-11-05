---
name: Homelab UniFi and DNS Hardening
description: "Hardened homelab network topology by migrating UniFi APs and switches to permanent static IP assignm"
category: scar
source: scar_homelab_unifi_and_dns_hardening.md
updated: 2026-09-22
---

Hardened homelab network topology by migrating UniFi APs and switches to permanent static IP assignments via the controller API. Configured Host 1 (NasHost-01 / Home Assistant host) with Cloudflare fallback DNS (1.1.1.1) alongside 10.0.0.x with timeout and retry options to ensure container resolution resilience during router CoreDNS downtime.
