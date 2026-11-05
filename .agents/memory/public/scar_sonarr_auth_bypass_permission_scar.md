---
name: Sonarr Auth Bypass Permission Scar
description: "Staged Nginx LAN bypass headers failed to persist or function in Sonarr due to an underlying UID per"
category: scar
source: scar_sonarr_auth_bypass_permission_scar.md
updated: 2026-10-03
---

Staged Nginx LAN bypass headers failed to persist or function in Sonarr due to an underlying UID permission mismatch on `/config/asp/` (`1026` vs `1024:100`), triggering `System.UnauthorizedAccessException` on ASP.NET key storage. Resolving reverse-proxy auth bypasses for self-hosted apps requires auditing container-specific config directory permissions alongside reverse proxy headers.
