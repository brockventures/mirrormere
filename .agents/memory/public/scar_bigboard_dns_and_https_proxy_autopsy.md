---
name: BigBoard DNS and HTTPS Proxy Autopsy
description: "When routing `bigboard.home` to Big Board Pro, UniFi DNS resolved to Host 2 (.84), which lacked a po"
category: scar
source: scar_bigboard_dns_and_https_proxy_autopsy.md
updated: 2026-09-12
---

When routing `bigboard.home` to Big Board Pro, UniFi DNS resolved to Host 2 (.84), which lacked a port 443 reverse proxy rule and caused browser HTTPS auto-upgrades to fail or hit DSM redirects. Reverse proxy entries must explicitly handle port 443 HTTPS routing in addition to port 80 HTTP for homelab domain targets.
