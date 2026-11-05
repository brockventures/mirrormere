---
name: project_arr_lock_watchdog
description: "arr-lock-watch.sh — 5min cron on NasHost-01, catches Sonarr/Radarr SQLite lock bursts live and snapshots diagnostics before log retention ages out"
category: engineering
source: project_arr_lock_watchdog.md
updated: 2026-09-01
---

Built 2026-08-05 per Ryan's request, after the 07-31/08-03 non-Posterizarr-window SQLite lock recurrences (see [[project_arr_sqlite_noise]]) couldn't be root-caused because Sonarr's own command history and on-disk logs had already aged out by the time it was investigated.

**`/opt/docker/arr-lock-watch.sh`** on NasHost-01, cron `/etc/cron.d/arr-lock-watch`, every 5 min (same pattern as [[project_ha_watchdog]]):
- Checks `docker logs sonarr|radarr --since 6m` for "database is locked"
- On detection: Discord alert immediately (timestamp), plus a full diagnostic snapshot to `/opt/docker/arr-lock-snapshots/lock-<timestamp>.txt` — `docker logs` (last 15m) from sonarr, radarr, bazarr, seerr, maintainerr, posterizarr, dockhand, kometa, plus both Sonarr's and Radarr's live `/api/v3/command` history (last 250 entries)
- Debounced: one alert per 20-min cooldown (`/tmp/arr-lock-watch-last-alert` state file), so a sustained multi-cycle burst doesn't spam

Tested manually (`sudo bash -x`) — runs clean, no false triggers. Did NOT force a fake detection to test the alert path (would have sent a real test message to the live Discord channel — see [[feedback_no_test_messages_live_channel]]); trusted the code review instead since it mirrors the already-proven ha-watchdog structure.

**How to apply:** when this fires next, the snapshot file is the thing to read — don't re-derive from `docker logs` after the fact, the whole point was avoiding that retention race. Cross-reference the command-history dumps from both services to see exactly what was queued/running at the lock moment.

**Mute support added 2026-08-06 ~8:20 AM PT.** Once the root cause was found (Kometa's marathon run — see [[project_arr_sqlite_noise]]), Ryan asked to mute the Discord alerts for the rest of that day without losing data. Added `/tmp/arr-lock-watch-mute-until` — an epoch timestamp; if `now < mute_until`, the script still detects the lock and saves the full diagnostic snapshot as normal, it just skips the Discord POST (logged to stderr instead). No separate "unmute" action needed — the check is time-based and expires on its own once `now` passes the stored timestamp. Set via `echo <epoch> > /tmp/arr-lock-watch-mute-until` (e.g. `date -d 'tomorrow 00:00' +%s` for "mute through end of today").

**Discord alerts permanently disabled 2026-08-07 (snapshots unaffected), Ryan-approved.** Once all 3 known lock-burst patterns were root-caused (Posterizarr timing — fixed; Kometa marathon — one-time, resolved; Sonarr's own `RefreshSeries` overlap — self-recovering, not independently actionable short of the Postgres migration P1; see [[project_arr_sqlite_noise]]), the alerts stopped carrying actionable signal — every occurrence is now either already-explained or points at the same already-tracked fix. Added a separate `ALERTS_DISABLED=true` flag (deliberately distinct from the time-based `MUTE_FILE` mechanism above, so a future one-off "mute for today" request doesn't get confused with this standing decision, and vice versa) — both feed into the same `MUTED` check, so a temporary mute would still be additive/harmless if ever needed on top of this. **Detection and full diagnostic snapshotting still run exactly as before** — only the Discord POST is skipped. If a genuinely new/different lock signature ever shows up, it'll still be caught and saved to `/opt/docker/arr-lock-snapshots/`, just won't page — worth checking that directory periodically (or during any future NAS log review) rather than relying on being pinged. To re-enable alerts, flip `ALERTS_DISABLED` back to `false` in `/opt/docker/arr-lock-watch.sh` (backed up as `arr-lock-watch.sh.bak-20260807` before this edit).
