---
name: Arr Stack SQLite & Storage Contention Spec
description: "Active configuration, WAL optimization, and SQLite lock triage rules for Sonarr and Radarr"
category: project
source: project_arr_sqlite_noise.md
updated: 2026-09-04
---

# Arr Stack SQLite & Storage Contention Spec

Operational guide for managing SQLite performance, database locks, and storage contention across the Arr media stack (Sonarr, Radarr, Prowlarr, Bazarr) on NasHost-01 (`.82`).

## 🗄️ Database Architecture

* **Engine:** SQLite 3 with Write-Ahead Logging (`journal_mode=WAL`).
* **Database Locations:** `/opt/docker/appdata/<service>/<service>.db`.
* **Lock Management:** SQLite locks (`database is locked` / `busy_timeout`) are transient symptoms of I/O saturation (e.g. heavy unthrottled Kometa runs, massive library rescans, or intense rsync passes), NOT corrupted database files.

## 🩺 Triage & Remediation Runbook

1. **Check Disk I/O & Swap First:**
   * Run `iostat -xz 1 5` and `free -h`.
   * Look for swap thrashing or high `%util` on volume1.
2. **Do Not Spud/Rebuild DBs on Lock Warnings:**
   * Transient locks self-resolve as soon as host memory and disk queue pressure clear.
3. **Pacing & Schedule Staggering:**
   * Stagger scheduled cron tasks (Maintainerr at 06:00, Dockhand update sweeps at 07:00, Kometa off-peak).
   * Apply `--bwlimit` or `ionice -c2 -n7` to heavy migration background tasks.

## 📚 Historical Incident Post-Mortems
* `incident_kometa_memory_exhaustion_sqlite_locks_2026-08.md`
