---
name: Postgres-Arr Docker DNS Outage Post-Mortem
description: "Resolved a silent 20-hour Arr health outage caused by Docker's internal DNS failure resolving the `p"
category: scar
source: scar_postgres_arr_docker_dns_outage_post_mort.md
updated: 2026-10-29
---

Resolved a silent 20-hour Arr health outage caused by Docker's internal DNS failure resolving the `postgres-arr` container. Restoring container networking during the nightly triage cleared the stale database connection failures across the Arr stack and triggered the resolution alert.
