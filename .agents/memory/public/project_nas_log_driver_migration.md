---
name: project-nas-log-driver-migration
description: "2026-07-26/27: migrated baseball_db/otbr/matterserver/home-assistant off Synology's inefficient 'db' Docker log driver to json-file; discovered all appdata containers share COMPOSE_PROJECT_NAME=trash-guides (a --remove-orphans landmine, see DOCKER_PLAYBOOK.md); 23 containers still on the old driver across both NAS hosts (17 on NasHost-01, 6 on AppHost-02 — full list enumerated 08-18)"
category: engineering
source: project_nas_log_driver_migration.md
updated: 2026-10-09
---

Ryan noticed NAS disk-activity LEDs never go idle. Investigation traced part of the write volume to Synology's own `db` Docker log driver (a SQLite-backed logging driver with heavy per-line overhead, ~10x amplification vs `json-file`) on several chatty containers, plus it made `docker logs` hang or return very slowly (`matterserver --tail 5` took minutes before the fix, 0.038s after).

**Fixed 2026-07-26/27** for 4 containers (`baseball_db`, `otbr`, `matterserver`, `home-assistant`), migrated one at a time to `json-file` (10m/3 files, ~30MB cap — deliberately *not* matching the arr stack's tighter `200k`/10 cap, since matterserver/HA log retention was already too short to review and a 2MB cap would make that worse):
- `baseball_db` — also fixed a separate spam source: `log_connections = 'on'` was set via `ALTER SYSTEM` in **`postgresql.auto.conf`** (not the compose file, not `postgresql.conf` where it's commented out) — 98% of its log volume was `pg_isready` connection-logging noise (~16,400 lines/day). Fixed at the source (`ALTER SYSTEM SET log_connections=off`, live SIGHUP reload, no restart) rather than overriding via compose `command:`, since the compose-override approach would've left `auto.conf` still declaring `on` — two configs contradicting each other. If baseball_db log spam ever returns, check `postgresql.auto.conf` via `ALTER SYSTEM`/`SHOW`, not just the compose file.
- `otbr` — its `db` log stream was capturing the **entire NAS host syslog** (kernel, BTRFS, audit, cron PAM lines), not just container stdout — a major contributor to its chatty-container ranking.
- `matterserver` / `home-assistant` — fabric/entity state confirmed intact post-recreate (volume-backed, unaffected by the log-driver change).

**Key infra discovery: all appdata containers share `COMPOSE_PROJECT_NAME=trash-guides`.** HA and matterserver aren't in their own compose project despite living in separate directories/files — all three `.env` files under `/opt/docker/*` set the same project name, unifying ~21 containers into one Compose project. This means `docker compose up -d <service>` from *any* of those directories correctly targets the existing shared container (proven during this fix), but it also means **`--remove-orphans` from any one of those compose files would treat every container the *other* files define as an orphan and delete it** (Plex, Sonarr, Radarr, HA itself, etc. — 18+ containers). This is now Hard Rule 9 in `~/projects/DOCKER_PLAYBOOK.md` — confirmed by Ryan ("don't ever use remove-orphans, add to the rules").

**Full remaining list confirmed 2026-08-18 (Ryan asked directly, checked `docker inspect` on every container on both hosts — first time this was enumerated by name, not just counted):**
- **NasHost-01 (.82), 17 on `db`:** `speedtest`, `homebridge`, `kometa`, `maintainerr`, `dozzle`, `glances`, `posterizarr`, `adguard`, `tautulli`, `dockhand`, `homepage`, `imagemaid`, `go2rtc`, plus the 4 stopped baseball rollback containers (`baseball-scraper-1`, `baseball_shiny_pro`, `baseball_shiny_app`, `baseball_shiny_dev` — see [[project_baseball_stack_migration_84]], stopped+restart-disabled 2026-08-18 but still on `db` driver, would hit the same issue if ever restarted). Already on `json-file`: `plex`, `sabnzbd`, `prowlarr`, `seerr`, `sonarr`, `radarr`, `bazarr`, `otbr`, `home-assistant`, `matterserver`, `baseball_db`.
- **AppHost-02 (.84), 6 of 7 on `db`:** `baseball-scraper-1`, `dozzle-agent`, `dockhand`, `baseball_shiny_dev`, `baseball_shiny_app`, `baseball_shiny_pro`. Only `baseball_db` there is already on `json-file`. **This box was never previously included in the "17 pending" count** — the original 2026-07-26/27 migration only ever looked at NasHost-01; AppHost-02 didn't exist yet at that time (added ~08-07). Total across both hosts is 23, not 17.

**Concrete real-world symptom confirmed 2026-08-18: `homebridge` (one of the 17 remaining) had its `log.db` wedge/freeze entirely** — stopped capturing at 18:52 PT that evening (14439 rows, nothing since), causing `docker logs homebridge` to hang/timeout for both a fixing agent and a direct check, and looking enough like "the container might be crashing" that Ryan asked about it (it wasn't — container was healthy the whole time, just the log stream was frozen). This is a good concrete example of the old driver's failure mode beyond just disk I/O — it can silently stop logging entirely, not just log inefficiently. Worth citing if Ryan asks again why finishing this migration matters. See [[project_homebridge]] for the full incident.

**Disk-write follow-up (open, not yet acted on):** post-fix measurement showed disk writes still ~0.9–2.05 MB/s (was ~1.1–1.5 MB/s baseline) — the 4-container fix only reclaimed ~23 KB/min of logging, nowhere near enough to explain total I/O. HA's recorder was checked and ruled out (only ~2–5% of writes). The real remaining driver is **17 other containers still on the old Synology `db` log driver**, plus Tautulli spiking during Plex playback; roughly half the writes are unattributed (hypothesized as btrfs metadata overhead, not confirmed). Ryan's drives are healthy (~20% of rated write endurance used), so this is optimization, not urgency. Two follow-up options discussed but not approved: (1) finish the log-driver migration on the remaining 17 containers, (2) move high-churn small-write data (arr SQLite DBs, Tautulli, HA recorder DB) onto a USB SSD — caveat: a single USB SSD isn't redundant like the RAID array, so only replaceable/rebuildable data should go there.

**How to apply:** If NAS disk-write concerns come up again, this is where the investigation left off — 17 containers remain on `db` driver. Don't re-propose HA's recorder as a culprit; that's ruled out. Never run `docker compose ... --remove-orphans` on this NAS (see DOCKER_PLAYBOOK.md Hard Rule 9). If `docker logs <container>` hangs, check its log driver first before assuming the container itself is unhealthy.

## Host 2 (AppHost-02 / .84) Migration Complete (2026-10-08)
- Migrated 15 remaining containers on Host 2 to json-file (10m/3 files cap):
  - dockhand, dozzle-agent, glances (support stack)
  - octoprint
  - actual-server, browserless, zero-cloudflared, mealie, orcaslicer, sharkfin, openmessage
  - big_board_pro, baseball_projections_analysis, baseball-scraper-1
  - discord-ivy-agent
- Staged discord-antigravity-agent compose file with json-file (will take effect on next planned bridge reload).
- baseball_db was already on json-file.
- Result: continuous SQLite fsync write churn from dockerd dropped from ~30 w/s down to single digits.

## Host 2 (AppHost-02 / .84) Migration Complete (2026-10-08)
- Migrated 15 remaining containers on Host 2 to json-file (10m/3 files cap):
  - dockhand, dozzle-agent, glances (support stack)
  - octoprint
  - actual-server, browserless, zero-cloudflared, mealie, orcaslicer, sharkfin, openmessage
  - big_board_pro, baseball_projections_analysis, baseball-scraper-1
  - discord-ivy-agent
- Staged discord-antigravity-agent compose file with json-file (will take effect on next planned bridge reload).
- baseball_db was already on json-file.
- Result: continuous SQLite fsync write churn from dockerd dropped from ~30 w/s down to single digits.
