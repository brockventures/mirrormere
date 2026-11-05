---
name: Homelab Uptime & Ingress Hardening
description: "Hardened UniFi WAN ports 80/443 to Cloudflare IPv4 edge CIDRs with local/Tailscale hairpin NAT exemp"
category: scar
source: scar_homelab_uptime_ingress_hardening.md
updated: 2026-10-28
---

Hardened UniFi WAN ports 80/443 to Cloudflare IPv4 edge CIDRs with local/Tailscale hairpin NAT exemptions on the UCG-Max. Configured Host 2 DNS failover with Cloudflare fallback (1.1.1.1, 2s timeout) to survive router reboots, and cut out the Synology DDNS CNAME middleman in Cloudflare DNS for direct root domain routing.
