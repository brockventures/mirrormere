---
name: Incident: Kometa Memory Exhaustion & Cascading SQLite Lock Wave
description: "Analysis of marathon Kometa run causing host memory exhaustion, swap thrashing, and SQLite lock cascades across Arr stack"
category: incident
source: incident_kometa_memory_exhaustion_sqlite_locks_2026-08.md
updated: 2026-11-02
---

# Incident Post-Mortem: Kometa Memory Exhaustion & SQLite Lock Cascade (2026-08-06)

## Summary
An abnormally long Kometa collection overlay run on 2026-08-05/06 consumed all available host RAM (4.3GB -> 0, swap 7.1GB). This caused SQLite disk I/O lock cascades across Sonarr and Radarr, and tripped the Home Assistant watchdog.

## Resolution
* Verified that SQLite databases were uncorrupted.
* All locks self-resolved the moment Kometa completed and host memory recovered.
* Established the rule: do not spud SQLite databases on transient lock warnings.
* **Permanent Fix (2026-11-01):**
  - **Kometa CPU/Disk/RAM Throttling:** Updated `kometa` in `/opt/docker/appdata/docker-compose.yml` with `entrypoint: ["/tini", "-s", "--", "/usr/bin/nice", "-n", "19", "/usr/bin/ionice", "-c", "3", "python3", "kometa.py"]`, `cpu_shares: 256`, and `mem_limit: 1536m` so its 1:00 AM PT TV overlay pass runs strictly in the Linux `idle` disk I/O class and lowest CPU priority without exhausting host RAM/swap.
  - **Home Assistant Recorder Bloat Cleanup:** Excluded `sensor.outdoor_smart_plug_*` (voltage, current, power_factor, ac_frequency, power — 379k+ rows) and `sensor.bermuda_*` / `sensor.*_estimated_distance` / `sensor.*_room_distance` (272k+ rows) in `/opt/docker/homeassistant/config/configuration.yaml`, tightened `purge_keep_days: 7` and `commit_interval: 15`, and triggered `recorder.purge_entities` + `recorder.purge(repack=True)`.
