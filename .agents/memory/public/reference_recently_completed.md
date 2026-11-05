---
name: reference_recently_completed
description: "Chronological record of recent infrastructure milestones, fixes, and cutovers"
category: engineering
source: reference_recently_completed.md
updated: 2026-10-22
---

# Recently Completed Work & Milestones (Reference)

- **2026-10-22:** Codebase Hardcode & Dead-Weight Sweep: added pre-enqueue duplicate check and worker `flock` to `detached_runner.py` (Task #88), fixed `zero_printer_watcher.py` outbox imports, replaced unordered set slicing with `_OrderedSet` in `resident_agents_watcher.py`, fixed custom season title suppression in `plex_weekly_digest.py`, shell-quoted remote SSH paths in `arr_queue_watchdog.py`, gated healthy Matter/Thread SSH checks in `ha_reauth_watchdog.py`, and audited all 27 skills (`0` warnings/defects).
- **2026-10-21:** `r/ResidentAgents` automation & community setup: deployed `resident_agents_watcher.py` (`#r-residentagents` routing, daily Playbook tips megathread rotation, curated link seeding, self-service flairs) and synced Zero's Discord avatar to `u/RA_Zero`.
- **2026-10-19:** Built daily CISA KEV + NVD CPE vulnerability monitor for core homelab containers and re-paired Deck IKEA motion sensor (`MYGGSPRAY`) directly to OpenThread Border Router.
- **2026-10-14:** Deployed Home Assistant + VictoriaMetrics statistical telemetry anomaly detector (`ha_anomaly_detector.py`) and 3D printer autonomous watcher + Modal Blender Cycles rendering pipeline.
- **2026-09-28:** Kometa post-run triage: resolved SQLite unique constraint crash on Jackie Chan Adventures via cache purge, commented out deprecated Trakt block, and eliminated 126 TMDb episode 404s by disabling unneeded episode-level user/audience rating queries.
- **2026-08-18:** DS1525+ Movies cutover finalized — `movies_old` deleted on NasHost-01, reclaiming ~7.3TB free space.
- **2026-08-18:** Homebridge mDNS hostname conflict loop resolved via Avahi interface restriction + `publish-addresses=no`.
- **2026-08-16:** Washer start/finish power threshold fixed to 100W start / 20W finished with 2-min debounce.
- **2026-08-07:** Baseball stack (Postgres DB, 3 Shiny apps, scraper) fully migrated from NasHost-01 to AppHost-02 (`.84`).
- **2026-08-07:** Dockhand instance deployed on `.84` (`:3866`) and Dozzle extended to multi-host coverage via Dozzle-agent (`:7007`).
- **2026-08-07:** Sonarr/Radarr SQLite 3rd lock cause identified (Sonarr's own RefreshSeries self-contention).
- **2026-08-07:** Kometa & Posterizarr asset errors investigated and resolved (Netflix overlay bug fixed, P90X root-caused).
- **2026-08-05:** DS1525+ Movies library live cutover executed to AppHost-02 (`.84`) over NFS.
- **2026-08-04:** DSM auto-update disabled on both NasHost-01 and AppHost-02.
- **2026-08-04:** Claude OAuth Tier 2 setup token fix deployed.
- **2026-07-26:** OTBR Thread persistent volume mount deployed, fixing mesh disconnects on recreate.
