---
name: project-sonarr-nfs-deadlock-2026-07-13
description: "RESOLVED — dead NFS mount from offline DS1525+ silently deadlocked Sonarr's command queue for 4+ days; self-reported healthy the whole time"
category: engineering
source: project_sonarr_nfs_deadlock_2026-07-13.md
updated: 2026-09-01
---

**Incident:** DS1525+ (second NAS) went unreachable ~2026-07-08 10:15 AM PT. NasHost-01 still had a live NFS mount from it (`10.0.0.x:/srv/storage/movies` → `/mnt/storage/media/movies_new`, part of the [[project_second_nas_ds1525]] migration staging area) sitting inside the `/data/media` tree Sonarr watches. Any disk-space check that walked that mount blocked forever in uninterruptible (D-state) I/O — including Sonarr's own `CheckHealth` command. That exhausted Sonarr's command worker pool: `RssSync` and `MissingEpisodeSearch` got stuck too, and the queue fully deadlocked from 2026-07-10 7:02 PM PT onward. Result: Sonarr grabbed nothing for any show for ~4 days, but `/api/v3/health` reported empty/healthy the whole time because the health-check command was itself one of the hung ones — no alert fired anywhere.

Surfaced when Ryan noticed Love Island and House of the Dragon episodes weren't downloading (2026-07-12). Root-caused by a background agent (`sonarr-debug`) via direct log/queue/API inspection — Radarr was only partially affected (health check stuck too, but its queue wasn't jammed, kept grabbing normally).

**Fix applied 2026-07-13, ~9:44 PM PT** (Ryan approved DS1525+ staying off indefinitely, so no point waiting for it):
1. `umount -f -l /mnt/storage/media/movies_new` on NasHost-01 — clean, mount was `soft` so no lingering D-state hang. Confirmed gone from `mount` output and `df` stopped hanging.
2. `docker compose restart sonarr` (from `/opt/docker/appdata/`) — cleared the deadlock. Confirmed via API (`/api/v3/command`): all 24 backed-up commands drained within ~1 minute of restart, RSS/health/missing-search all back to normal scheduled behavior.
3. Confirmed fixed via grab history: House of the Dragon S03E04 and Love Island S08E32-34 all grabbed within a minute of the restart.

**Why it matters going forward:** any dead/hung NFS or SMB mount living inside a path an *arr app scans can silently wedge its entire command queue with **zero alerting**, because the health check itself is a queued command and gets stuck along with everything else. `/api/v3/health` returning clean is not proof of a healthy Sonarr/Radarr if the app has been unresponsive — check for actual recent grab activity too.

**Proposed but not yet built:** a heartbeat check for "has Sonarr grabbed anything in >24h" plus NFS mount liveness, which would have caught this on day one instead of day four. Not implemented yet — revisit if this pattern recurs, or proactively if HEARTBEAT.md gets touched again soon.

**How to apply:** If Sonarr/Radarr appear healthy via API but nothing is being grabbed, check for stuck NFS/SMB mounts under their watched paths before assuming an indexer/download-client problem. `df` hanging on the NAS is a strong tell.

**Unrelated follow-on incident 2026-07-13/14 — see [[project_baseball_db_shim_wedge_2026-07-14]]:** baseball_db (separate container, same NAS) went unhealthy with a massive Postgres connection leak (~2,383 backend processes) starting ~10:52 AM PT on 07-13 — timing points to the nightly baseball refresh pipeline, not this Sonarr incident or the collation fix from the same night. Do not conflate the two; different containers, different root causes, investigated separately.
