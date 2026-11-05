---
name: Native Maintenance Tooling & Scheduled Cron Catalog
description: Reference catalog of Zero's autonomous background maintenance scripts, schedules, flags, and operational checks.
category: reference
updated: 2026-09-22
---

# Native Maintenance Tooling & Scheduled Cron Catalog

All scheduled maintenance jobs run autonomously via `tools/bridge_scheduler.py` based on definitions in `/workspace/config/scheduler_jobs.json`.

---

## 1. Recurring Scheduled Scripts (`/workspace/tools/`)

- **`update_antigravity.py`**
  - **Schedule:** Daily at 10:00 AM PT
  - **Purpose:** Checks Google Antigravity GitHub releases for CLI updates. When a newer version exists, hot-swaps `/usr/local/bin/agy` in <5s and updates the local Dockerfile reference.
  - **Command:** `python3 /workspace/tools/update_antigravity.py`

- **`ha_update_check.py`**
  - **Schedule:** Fridays at 10:30 AM PT
  - **Purpose:** Manages Home Assistant Core, Matter Server, and OTBR updates. Enforces stability gate: ignores `.0` and `.1` releases, alerting only on mature patch releases (`.2+`). Snapshots config, Matter, and Thread credentials prior to upgrades.
  - **Command:** `python3 /workspace/tools/ha_update_check.py`

- **`dockhand_update.py`**
  - **Schedule:** Sundays at 11:00 AM PT
  - **Purpose:** Compares Docker Hub digests for `fnsys/dockhand:latest` against Host 1 (`.82`) and Host 2 (`.84`), executes WAL-safe SQLite database backups, and recreates containers with post-start HTTP 200 validation.
  - **Command:** `python3 /workspace/tools/dockhand_update.py`

- **`ha_battery_check.py`**
  - **Schedule:** Mondays at 10:00 AM PT
  - **Purpose:** Scans all 40+ smart home IoT sensors (leak detectors, door contacts, motion sensors, blinds) and alerts in `#server-updates` if any sensor drops to ≤ 15% battery.
  - **Command:** `python3 /workspace/tools/ha_battery_check.py`

- **`nas_storage_check.py`**
  - **Schedule:** Wednesdays at 10:00 AM PT
  - **Purpose:** Monitors `/volume1` capacity (>85% alert) and `/proc/mdstat` for RAID degradation across both Synology NAS hosts.
  - **Command:** `python3 /workspace/tools/nas_storage_check.py`

- **`plex_weekly_digest.py`**
  - **Schedule:** Fridays at 4:00 PM PT
  - **Purpose:** Queries Tautulli API for media added in the last 7 days. Posts clean summary of new movies, full seasons, and new airing episodes with `@everyone` tag to `#server-updates`.
  - **Command:** `python3 /workspace/tools/plex_weekly_digest.py`

---

## 2. Background Daemons & Watchdogs

- **`bridge_watchdog.py`:** Monitors bridge gateway health, reap stale or orphaned `agy` CLI processes holding worker slots (>600s), and checks child process ticks.
- **`arr_health_check.py`:** Monitors Sonarr and Radarr indexer connectivity, download client states, and alerts on persistent failures.
- **`ha_triage.py`:** Real-time watchdog for Home Assistant WebSocket stability and entity states.
