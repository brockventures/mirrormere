---
name: reference_docker_playbook
description: "Authoritative NAS Docker container rules, safe recovery procedures, OTBR supervisor, and compose orphan guardrails"
category: engineering
source: reference_docker_playbook.md
updated: 2026-09-04
---

# Docker / NAS Container Playbook (Reference)

Authoritative reference for Docker container operations on NasHost-01 (10.0.0.x) and AppHost-02 (10.0.0.x).

## Absolute Rules
1. **Never use bare `docker stop/start` via SSH.** Always use `docker compose stop/start` from the compose project directory to avoid Container Manager UI desync.
2. **One Docker command at a time per container.** Wait for completion before issuing another. Never retry while a prior command is pending.
3. **If `docker stop/restart` does not complete within 30s, STOP.** Do not retry or force-kill; report to Ryan.
4. **SSH timeout does NOT mean failure.** Always verify container state with `ps` before follow-up.
5. **Never run `docker compose ... --remove-orphans`.** All appdata containers share `COMPOSE_PROJECT_NAME=trash-guides`; `--remove-orphans` will delete unreferenced containers (Plex, HA, Sonarr, Radarr).
6. **Limit concurrent SSH connections to 2 max.**
7. **Never restart ContainerManager or Docker daemon without explicit Ryan approval.**

## Safe Container Manager Recovery
If Container Manager DSM UI blanks / desyncs (does NOT stop containers):
`sudo systemctl restart pkg-ContainerManager-event-watcherd.service`
*(Never restart pkg-ContainerManager-dockerd without approval — that kills all containers).*

## OTBR Supervisor Architecture
- `docker ps` can show "Up" even when `otbr-agent` is dead.
- Supervisor loop in `/opt/docker/homeassistant/otbr-start.sh` checks `socat` + `otbr-agent` + `ot-ctl state` every 15s and auto-restarts in-place (~12s recovery).
- Real health check: `curl -s http://10.0.0.x:8081/node` (expect networkName `NEST-PAN-262C`, state `child`/`router`/`leader`).
- Thread dataset binds to persistent mount `/opt/docker/homeassistant/otbr-data:/var/lib/thread`.

## SQLite File Permissions
If Radarr/Sonarr database locks occur due to permission issues:
`sudo chown 1026:100 /opt/docker/appdata/radarr/radarr.db /opt/docker/appdata/radarr/logs.db`
