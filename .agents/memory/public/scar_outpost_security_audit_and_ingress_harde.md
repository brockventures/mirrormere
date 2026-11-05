---
name: Outpost Security Audit and Ingress Hardening
description: "Hardened internal homelab virtual hosts by locking them to RFC 1918 LAN ranges and isolating the fin"
category: scar
source: scar_outpost_security_audit_and_ingress_harde.md
updated: 2026-10-24
---

Hardened internal homelab virtual hosts by locking them to RFC 1918 LAN ranges and isolating the finance app (`SharkFin`) from public ingress. Patched Outpost against path traversal and unbounded upload DoS in upload endpoints, and restricted unauthenticated maintenance and SSE broadcast routes to LAN/loopback or `X-API-Key` authentication.
