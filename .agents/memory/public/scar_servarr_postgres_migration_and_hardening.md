---
name: Servarr Postgres Migration and Hardening
description: "Completed the structural root-cause migration of Prowlarr to PostgreSQL alongside alert hygiene hard"
category: scar
source: scar_servarr_postgres_migration_and_hardening.md
updated: 2026-09-07
---

Completed the structural root-cause migration of Prowlarr to PostgreSQL alongside alert hygiene hardening for Servarr apps. Raw `onHealthIssue` Discord webhooks were disabled in favor of debounced alerting via `arr_queue_watchdog.py` to prevent alert fatigue.
