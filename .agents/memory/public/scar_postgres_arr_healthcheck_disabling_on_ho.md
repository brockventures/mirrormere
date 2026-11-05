---
name: Postgres-Arr Healthcheck Disabling on Host 1
description: "Disabled Docker healthchecks on `postgres-arr` in `/opt/docker/appdata/docker-compose.yml` (`dis"
category: scar
source: scar_postgres_arr_healthcheck_disabling_on_ho.md
updated: 2026-09-26
---

Disabled Docker healthchecks on `postgres-arr` in `/opt/docker/appdata/docker-compose.yml` (`disable: true`) on Host 1 to prevent false unhealthy container states while verifying connectivity via direct `pg_isready` checks. Applied hardening without container downtime and created a dated configuration backup.
