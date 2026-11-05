---
name: infra_topology
description: "Host map — NasHost-01 .82 (main NAS/HA), AppHost-02 .84 (Zero & Ivy live here)"
category: engineering
source: infra_topology.md
updated: 2026-09-16
---

| Host | Address | Role |
|---|---|---|
| NasHost-01 | 10.0.0.x | Synology NAS. Main Docker host, file server, Home Assistant. |
| AppHost-02 | 10.0.0.x | Synology DS1525+. Baseball stack, `discord-ivy-agent` (Ivy, #baseball), `discord-antigravity-agent` (Zero), Browserless, Dockhand, Dozzle. |
| Windows PC | LAN | Ryan's dev machine. Android Studio, Git, Veeam backups to the NAS. |

Notes:
- The two NAS hostnames really are different word orders (NasHost-01 vs.
  AppHost-02) — that's intentional, not a typo. Don't "fix" it.
- Docker on both hosts is managed by Synology **Container Manager**, which keeps
  its own state. That's why compose semantics matter (see [[nas_docker_rules]]).
- `/opt/docker/` is the Docker root on both hosts.
- Zero lives at `/opt/docker/discord-agy-agent/` (`discord-antigravity-agent`) on 10.0.0.x.
- Ivy lives at `/opt/docker/discord-ivy-agent/` (`discord-ivy-agent`) on 10.0.0.x, running Antigravity (`agy`) in `#baseball`.
