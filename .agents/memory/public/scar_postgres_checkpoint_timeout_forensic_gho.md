---
name: Postgres Checkpoint Timeout Forensic Ghost
description: "Diagnosed transient Sonarr and Radarr PostgreSQL read stream timeouts as non-issue forensic ghosts c"
category: scar
source: scar_postgres_checkpoint_timeout_forensic_gho.md
updated: 2026-09-07
---

Diagnosed transient Sonarr and Radarr PostgreSQL read stream timeouts as non-issue forensic ghosts caused by an earlier heavy checkpoint flush that self-recovered. Also resolved Kometa validation failures stemming from YAML inline comment syntax (`#`) evaluating blank API keys and unmatched Plex GUIDs.
