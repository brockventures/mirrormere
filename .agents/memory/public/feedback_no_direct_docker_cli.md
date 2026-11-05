---
name: feedback-no-direct-docker-cli
description: Never use raw docker stop/docker start via SSH on NAS — always use docker-compose or Dockhand API to avoid Container Manager state desync
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 56d66ee4-767f-47f6-b74e-112a5b527cb6
---

Never use `docker stop <name>` / `docker start <name>` directly via SSH for NAS container operations. These bypass Container Manager's WebAPI and corrupt its internal state cache, causing it to blank all containers from the DSM UI.

**Why:** Container Manager maintains its own state database synced via Docker event subscription. Raw CLI stop/start generates events CM receives but can't reconcile, especially when combined with Dockhand healthcheck events (~2,880 exec events/day). The June 3-4 2026 incident (radarr/sonarr chown fix via CLI) triggered a full CM desync requiring a hard Container Manager restart and nuclear Docker restart.

**How to apply:**
- For container restarts: use `docker-compose restart <name>` or Dockhand's web UI/API at NAS:3866
- For stop/start as part of maintenance (e.g., chown, vacuum): use `docker compose stop <name>` / `docker compose start <name>` from the compose directory, NOT bare `docker stop`/`docker start`
- If bare CLI was unavoidable: run the CM recovery command afterward: `sudo systemctl restart pkg-ContainerManager-event-watcherd.service` — this restarts only CM's state cache daemon, all containers stay running (tested safe 2026-06-04)
- See [[project_nas_maintenance]] for Docker safety rules
