---
name: project-maintainerr-bug
description: "Maintainerr P2 bug: axios-retry excludes ECONNABORTED so Sonarr timeouts drop shows from collections silently"
category: engineering
source: project_maintainerr_bug.md
updated: 2026-09-04
---

**Status: FIXED 2026-06-17.**

**Root cause (confirmed):** Maintainerr fires ~150 concurrent Sonarr API lookups during its daily rules run. Under Node.js HTTP socket pool pressure, some requests time out (ECONNABORTED). `axios-retry`'s default `retryCondition` excludes `ECONNABORTED` — so timeouts are never retried. The show returns `null` for "Is monitored", fails the rule (`null != 1`), and gets dropped from the collection. The next day Sonarr succeeds and adds it back — causing a ping-pong add/remove cycle.

- Confirmed affected shows: Fringe, The Dinosaurs, Pagan Peak (cycling since at least Jun 12)
- No media deleted — shows only removed from Maintainerr collection, not Plex or disk

**Upstream reference:** Maintainerr/Maintainerr #1603 (≥3.15.0, rule-evaluation path still open upstream).

**Fix applied 2026-06-17:** Two-patch startup script via compose entrypoint override.
- `/opt/docker/appdata/maintainerr/patch.sh` — runs at container startup from mounted data volume
  - Patch 1: `httpRetry.js` — adds `retryCondition` to retry on ECONNABORTED (Sonarr timeout)
  - Patch 2: `sonarr-getter.service.js` — changes memoize condition from `series === undefined` to `series === undefined || series === null`, so empty Sonarr responses aren't cached (each rule section gets a fresh retry)
- Compose (`/opt/docker/appdata/docker-compose.yml`) has `entrypoint: ["/bin/sh", "/opt/data/patch.sh"]`
- Patches survive container restarts AND image updates

**The Dinosaurs (Plex ID 38484):** Also has a stale PlexGetterService ID — manually added with `isManual=1` to protect from rule removal. May need Plex ID refresh if it stops showing in Plex collection.

**Recurrence 2026-07-07 ~9:10-9:16 AM PT — different root cause, NOT a regression of the June 17 fix.** Verified `patch.sh` still applies cleanly on every container start (logs confirm both patches active as recently as the 2026-07-06 08:39 startup, no WARNING lines) and the ECONNABORTED retries *did* fire (repeat WARN lines for the same tvdb IDs across multiple retry cycles). The retries just weren't enough this time: both `SonarrApi` (dozens of "Error retrieving show by tvdb ID" warnings) and `PlexApiService` ("Plex api communication failure") failed for a sustained ~6 minutes, longer than 3 retries + exponential backoff can cover. Result: `RuleExecutorService` removed 10 items from "TV Shows Leaving Soon", and one removal (media 42144) itself half-failed ("Couldn't remove media 42144 from collection") due to Plex being unreachable mid-operation.

**New cause identified:** Maintainerr's daily rule run (`rules_handler_job_cron` / `collection_handler_job_cron`, both `"0 9 * * *"` = 9:00 AM PT) landed squarely inside the movies-migration rsync's new 8am-4pm window (see [[project_second_nas_ds1525]], schedule moved from overnight to daytime this same morning, 2026-07-07). The migration's heavy read I/O against NasHost-01's shared storage array is the same suspected mechanism behind the overnight `baseball_db`/HA incidents the night before — this is the 3rd distinct service to show contention symptoms tied to this migration.

**Fix applied 2026-07-07 ~9:45 AM PT:** PATCHed Maintainerr's own settings via its API (`curl -X PATCH http://localhost:6246/api/settings`) to move both cron fields to `"0 6 * * *"` (6:00 AM PT) — before the migration's 8 AM start, verified via GET. No container/compose change needed, Maintainerr's scheduler picks up the new cron live.

**Not yet done:** the 10 dropped shows should self-heal on tomorrow's 6 AM run (same self-healing pattern as the original bug — next successful run re-adds anything still qualifying). Offered Ryan a manual re-run via `POST /api/rules/execute` once today's migration window closes (~4pm) rather than immediately, since the migration is still running and a manual retrigger now would likely just fail the same way.

**How to apply:** If churn recurs again, check (in order): 1) `patch.sh` still applying (container startup logs), 2) whether Maintainerr's cron (now 6 AM) still avoids the current migration window — if the migration window ever moves again, re-check for overlap, 3) whether this is evidence the migration itself needs throttling (`--bwlimit`/`ionice`) rather than continuing to reschedule every affected service around it — 3 services hit in <24h is a pattern, not noise.

**REVERTED TO PURE UPSTREAM 2026-08-30 (Ryan approved):**
- Dropped `/opt/docker/appdata/maintainerr/patch.sh` (archived to `.bak`).
- Removed `entrypoint` override from `/opt/docker/appdata/docker-compose.yml`.
- Maintainerr now runs 100% pure stock upstream `ghcr.io/maintainerr/maintainerr:latest`.
- Rationale: The midnight PT cron (`"0 0 * * *"`) operates during completely quiet NAS I/O, rendering the custom retry/caching monkey patches unnecessary while eliminating container drift (which previously broke Discord webhook alerts). Verified stock container boots cleanly and delivers Discord notifications.
