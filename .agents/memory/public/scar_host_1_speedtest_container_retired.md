---
name: Host 1 Speedtest Container Retired
description: "Retired the legacy unread hourly Ookla `speedtest` container on Host 1, removing its service definit"
category: scar
source: scar_host_1_speedtest_container_retired.md
updated: 2026-10-26
---

Retired the legacy unread hourly Ookla `speedtest` container on Host 1, removing its service definition from `/opt/docker/appdata/docker-compose.yml` while leaving historical data in `/opt/docker/speedtest/database.sqlite`. Eliminates continuous phantom disk I/O and bandwidth consumption across the homelab stack.
