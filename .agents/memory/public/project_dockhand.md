---
name: dockhand-docker-auto-updater-replaced-pullio
description: "Dockhand is the NAS Docker container auto-updater as of 2026-05-22, replacing Pullio which kept crashing ContainerManager; update schedule moved to Thu 4:30 AM PT + image pruning enabled 2026-07-27 to fix a recurring collision with Kometa/Posterizarr/Maintainerr"
category: engineering
source: project_dockhand.md
updated: 2026-09-25
---

Dockhand replaced Pullio as the NAS Docker auto-update tool on 2026-05-22. It is also a full container manager with stop/start/restart capability via the web UI — not just an auto-updater. Runs as a container on NasHost-01 with a web UI at `http://10.0.0.x:3866` (docker.sock mounted, `SKIP_DF_COLLECTION=true`). Defined in `/opt/docker/appdata/docker-compose.yml`, data dir `/opt/docker/appdata/dockhand/`.

**Second, independent instance added on AppHost-02 (`.84`) 2026-08-07** — `http://10.0.0.x:3866`, same port (was free), same compose block, defined in a new `/opt/docker/support/docker-compose.yml` there. Dockhand does NOT do cross-host monitoring — each Synology box needs its own instance, this isn't a config option.

**`.84`'s schedule ported from NasHost-01 same day (2026-08-07), confirmed live.** Same cron as NasHost-01: update-check+auto-update `30 4 * * 4`, dangling-image prune `30 5 * * 4` (1hr stagger), both `America/Los_Angeles`. Two real gotchas hit while porting, both apply to any future Dockhand instance setup:
1. **A Dockhand instance must have a registered Docker "environment" (`/api/environments`) before any `env_N_*` settings key does anything** — a fresh instance starts with 0 environments even though it's already mounting `docker.sock`; writing schedule rows before registering the environment creates orphaned settings that silently never fire. Register the environment first (Dockhand's own UI/API does this by testing the socket), confirm its numeric ID (don't assume `env_1` — it happened to be `1` here but was verified, not assumed), then write settings keyed to that ID.
2. **`env_N_timezone` is a required third settings key**, easy to miss by only copying the two documented schedule keys (`env_N_update_check`, `env_N_image_prune`) — without it, schedules register in UTC, silently shifting a "Thursday 4:30 AM PT" cron to "Wednesday 9:30 PM PT." Always copy `env_N_timezone = "America/Los_Angeles"` alongside any schedule migration.

**SQLite write method that worked safely:** stop only the `dockhand` service (not other containers sharing its compose file), back up with `cp` — **but note a plain `cp` can miss data sitting in the WAL file if the DB was ever opened WAL-mode; the safe backup is `sqlite3 dockhand.db ".backup 'dockhand.db.bak-<date>'"` or an explicit WAL checkpoint first**, `sqlite3 dockhand.db` to write rows directly, restart, then re-read the DB post-restart to confirm the write actually took (don't trust an unread write).

**Security note, not yet acted on (flagged to Ryan 2026-08-07, no response yet):** neither Dockhand instance (`.82` or `.84`) has ever had an admin account configured — both run with `auth_enabled=0`, fully open on the LAN with unauthenticated full Docker-socket control (start/stop/recreate any container, no login). This is pre-existing on NasHost-01, not something introduced by the `.84` migration — surfaced only because setting up `.84` prompted a check. Don't enable auth unilaterally, it would affect the already-working `.82` instance too — needs Ryan's explicit go-ahead.

**Not ported to `.84` (deliberately, pending Ryan's call):** `env_N_disk_warning_*` (80% threshold on NasHost-01), `env_N_vulnerability_scanner` setting, and UI/grid display prefs — these are host-specific monitoring config, not schedule config, left on `.84`'s defaults rather than blindly copied.

**Why the switch:** Pullio's weekly run did a mass `docker compose up -d` across all stacks, which knocked Home Assistant offline and put ContainerManager into a failing state (confirmed by Ryan over multiple weeks, incidents through 2026-05-21). Dockhand updates per-container, sequentially, with a safe-pull strategy and staggered schedules. See [[project_pullio_split_brain]] for the failure mode that drove this.

**Excluded from auto-update** (label `dockhand.update=false`): Home Assistant (`homeassistant`), `matterserver`, `go2rtc`, and the baseball containers. HA especially must never be auto-recreated — recreating a hung HA crashes ContainerManager (see [[feedback_nas_docker_service]] and [[feedback_ha_hang_protocol]]).

**Known issue — Python/env version mismatch after update (2026-06-18):** Dockhand pulled a new `glances` image that bumped Python 3.12 → 3.14, but the container env still had `PYTHON_VERSION=3.12` hardcoded, pointing to a non-existent binary. The container appeared up but was broken. Fix: force-recreate via `docker compose up -d --force-recreate glances` to pick up the new image's env. If a Dockhand-updated container appears up but behaves broken, check for env/entrypoint mismatches before digging deeper.

**How to apply:**
- Pullio is fully decommissioned — do not reference or re-enable.
- Candidate for a heartbeat check: Dockhand container up + last-update-run status. Flag if it starts auto-updating an excluded container.
- When asked which containers update vs. skip, read the `dockhand.update` labels in the compose files for ground truth.
- After Dockhand updates a container, if it looks up but is functionally broken, force-recreate it to pick up the new image's env cleanly.

**New noise pattern, observed 2026-07-22 nightly log review:** Dockhand logged 3 brief "Docker not reachable" flaps overnight (~1:39am, 2:37am, 3:12am PT), each self-recovering within seconds. Likely tied to the nightly Kometa/Posterizarr job window (same overlap pattern that causes Maintainerr's ECONNABORTED errors, see [[project_maintainerr_bug]]). Not yet a confirmed pattern (one occurrence) — treat as noise unless it recurs or stops self-recovering.

**Schedule collision confirmed and fixed 2026-07-27.** Dockhand's update schedule lives in its **SQLite DB** (`/opt/docker/appdata/dockhand/db/dockhand.db`, `settings` table, key `env_1_update_check`), not a config file — was `{"cron":"0 3 * * 4", ...}` = Thursdays 3:00 AM PT. This collided with the nightly job window and was **not Kometa-specific**: it also recreated Posterizarr (1:30 AM job) and Maintainerr (midnight cron), hitting Kometa 3 of the last 4 Thursdays. Moved to **Thursday 4:30 AM PT** (Ryan rejected the initially-proposed 2:00 PM as "middle of the day when I might be active"). Image pruning (`env_1_image_prune`, dangling-only) was found disabled by default and enabled, scheduled right after at **5:30 AM** to avoid a second collision.

**Dockhand API gotchas (found 2026-07-27):** its settings-save endpoint overwrites the **whole** settings object on each `PUT` — always read current settings first and merge, or other toggles (`autoUpdate`, vulnerability scan settings) silently reset. Also, probing the wrong endpoint/verb on this API can trigger a live action immediately (one agent accidentally fired a real "prune now" while testing which endpoint was the save endpoint — harmless that time since 0 images were dangling, but treat this API as unsafe to probe with `PUT`/`POST` outside of the documented save flow).

**Discord Notification Routing (updated 2026-09-24):** Dockhand's Discord webhook (`Dockhand`, Webhook ID `1210466937126002728`) was moved from `#server-updates` (`1330447543477338202`) to `#homelab` (`1544955535722545253`) via Discord API. All automated batch update summaries and failure alerts from NasHost-01 now route directly to `#homelab`.
