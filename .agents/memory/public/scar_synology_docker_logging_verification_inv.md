---
name: Synology Docker Logging Verification Invariant
description: "Codified operational invariant never to use `docker logs` (or Dozzle streaming proxies) for post-fli"
category: scar
source: scar_synology_docker_logging_verification_inv.md
updated: 2026-09-14
---

Codified operational invariant never to use `docker logs` (or Dozzle streaming proxies) for post-flight verification on Synology DSM hosts due to custom SQLite `log.db` driver hangs. Agents must verify container state via domain APIs (`ha_mcp`, `docker inspect`, HTTP health checks) or read bind-mounted log files directly on disk if triage logs are strictly required.
