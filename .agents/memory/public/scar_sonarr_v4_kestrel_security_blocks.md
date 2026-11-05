---
name: Sonarr v4 Kestrel Security Blocks
description: "Sonarr v4's Kestrel web server enforces strict host header validation (`AllowedHosts`) and drops req"
category: scar
source: scar_sonarr_v4_kestrel_security_blocks.md
updated: 2026-10-02
---

Sonarr v4's Kestrel web server enforces strict host header validation (`AllowedHosts`) and drops requests originating across CGNAT or non-standard subnets without explicit configuration. Overcoming HTTP 400 Bad Request blocks requires updating both host filtering rules and trusted subnet ranges before restarting the service.
