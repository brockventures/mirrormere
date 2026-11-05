---
name: Default Private Homelab Routing Invariant
description: "Root-cause post-mortem on accidental public exposure of internal `.brock.ventures` services revealed"
category: scar
source: scar_default_private_homelab_routing_invarian.md
updated: 2026-10-24
---

Root-cause post-mortem on accidental public exposure of internal `.brock.ventures` services revealed that the previous 3-layer routing standard automatically wired Cloudflare tunnels and public DNS, while WAN port-forwarding on Host 1 allowed arbitrary `Host:` header routing without LAN ACLs. The homelab routing architecture was locked down to a strict 2-layer private-LAN-only default requiring explicit user approval for any public ingress, plaintext OAuth environment variables in Docker Compose were replaced with read-only secret file mounts, and server blocks were hardened with mandatory RFC 1918 allow/deny directives.
