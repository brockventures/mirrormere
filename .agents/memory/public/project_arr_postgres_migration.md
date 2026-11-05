---
name: Project Arr Postgres Migration
description: "Engineering architecture and post-mortem notes derived from project_arr_postgres_migration.md"
category: engineering
source: project_arr_postgres_migration.md
updated: 2026-09-01
---

# Project: Servarr PostgreSQL Migration

**Status:** Completed (Live in Production)  
**Host:** NasHost-01 (`10.0.0.x`)  
**Reference Document:** `/workspace/docs/arr_postgres_migration_plan.md`

## Overview
Successfully migrated Radarr, Sonarr, and Prowlarr from SQLite (`.db`) to dedicated PostgreSQL 16 on `postgres-arr` to permanently eliminate `database is locked` error cascades caused by concurrent writes during metadata marathons, scheduled maintenance sweeps, and indexer health checks.

## Current Production State
- **Engine:** `postgres:16-alpine` running on internal container network. Host port: `5433:5432` (internal `5432`).
- **Radarr:**
  - Database: `radarr-main`, `radarr-log` (user: `radarr`)
  - Status: 880 movies, 0 errors, health checks clean.
- **Sonarr:**
  - Database: `sonarr-main`, `sonarr-log` (user: `sonarr`)
  - Status: 239 series, 23,975 episodes, 8,685 files, 0 errors, health checks clean.
- **Prowlarr:**
  - Database: `prowlarr-main`, `prowlarr-log` (user: `prowlarr`)
  - Status: 3 indexers, 2 synced applications, 0 errors, health checks clean. Migrated via pgloader.
- **Automated Backups:** Daily `pg_dumpall` script (`/opt/docker/appdata/postgres-arr/backup-postgres.sh`) scheduled at 02:30 AM PT with 7-day retention (captures all Servarr databases in ~37MB compressed dump).
- **Major Version Upgrades:** Managed via automated dump, fresh volume stream, and verification before container cutover.
