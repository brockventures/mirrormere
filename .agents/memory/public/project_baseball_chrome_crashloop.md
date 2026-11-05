---
name: project_baseball_chrome_crashloop
description: "Baseball scraper Chrome crash-loop fix — orphaned /tmp lock dirs caused 2-day silent stale data (Jun 20-21)"
category: engineering
source: project_baseball_chrome_crashloop.md
updated: 2026-09-01
---

Chrome crash in baseball-scraper-1 left orphaned `/tmp/.com.google.Chrome.*` dirs, causing `SessionNotCreatedException` on every subsequent launch. Step 1 (FanGraphs scrape) failed but error was swallowed — pipeline reused stale Jun 20 data silently for 2 days.

**Fixes applied (Jun 22):**
- `refresh_stats.sh` on NAS: added pre-run Chrome litter cleanup (removes orphaned lock dirs before launch)
- Added CSV mtime freshness check — if yesterday's CSV isn't fresh, pipeline fails loudly
- Step 1 now marked as critical failure, triggers existing Discord notifier in `run_refresh_stats.sh`
- `/opt/docker/baseball/docker-compose.yml` line 78: added `shm_size: '256m'` to `scraper` service — permanent fix for the `/dev/shm` root cause; container recreated, verified 256MB live

**Why:** Silent failure masked by stale data reuse; no alert fired for 2 days. Root cause is Docker's default 64MB /dev/shm being too small for Chrome.

**How to apply:** If baseball digest looks stale again, check `/tmp/.com.google.Chrome.*` dirs on the NAS container and Step 1 scrape logs. The staleness guard + shm fix should prevent recurrence.

---

**RECURRENCE 2026-07-06 — distinct root cause: pre-flight cleanup is a silent no-op (pkill self-match).**
Step 1 failed again with `SessionNotCreatedException: session not created: probably user data directory is already in use`. This is NOT the June shm cause — shm fix verified still live (256M, 0% used) and no chrome procs. The staleness guard worked correctly (Discord alert fired, `last_refresh.txt` NOT bumped, data held at Jul 5 — good).

Real root cause: the Jun 22 pre-flight cleanup line in `refresh_stats.sh` is
`docker exec baseball-scraper-1 sh -c 'pkill -9 -f chromedriver; pkill -9 -f "chrome"; rm -rf /tmp/.com.google.Chrome.* ...'`.
`pkill -9 -f chromedriver`/`-f chrome` match against **full command line**, and the `sh -c` process's own argv contains the strings "chromedriver"/"chrome" → **pkill kills its own shell before the `rm` ever runs**. Reproduced directly: an identical `pkill -9 -f chrome` inside `sh -c` returns exit 137 (SIGKILL). Evidence it's been broken since June: 34 `.com.google.Chrome.*` scratch dirs + 27 `/tmp/tmp*` mkdtemp user-data-dirs + 5 SingletonLocks had accumulated across Jul 4/5/6 despite "daily cleanup"; today's log shows the cleanup line followed by no output then straight into Step 1. So cleanup never removes anything and orphan chrome is never killed. On days with no orphan chrome it works anyway (mkdtemp gives a unique dir); it only fails when an orphan chrome/lock is present — intermittent.

Also note: the scraper uses `--user-data-dir={tempfile.mkdtemp()}` (scrape_fangraphs.py line 78), producing `/tmp/tmp*` dirs the cleanup glob (`.com.google.Chrome.*`/`.org.chromium.*`) never matched even if it did run — unbounded litter.

**Manual fix applied 2026-07-06:** cleaned all litter inside the running container (`rm -rf /tmp/tmp* /tmp/.com.google.Chrome.* /tmp/.org.chromium.*` + name-based `pkill -9 -x chrome`/`chromedriver` — the `-x` avoids the self-match), then re-ran `run_refresh_stats.sh` → exit 0, "Step 1 OK", fresh data (yesterday CSV + last_refresh.txt both Jul 6).

**Durable fix applied 2026-07-06 (Ryan approved):** `refresh_stats.sh` pre-flight block (lines ~84-88) rewritten: rm-first (`rm -rf /tmp/.com.google.Chrome.* /tmp/.org.chromium.* /tmp/tmp*`), then name-based `pkill -9 -x chrome` / `pkill -9 -x chromedriver` (no `-f`, can't self-match the shell), then `sleep 2` settle. Edited via sshfs mount, verified no CRLF introduced (`grep -c $'\r'` = 0) and `bash -n` syntax-checked clean on the NAS directly over SSH. TODO_NOTES P2 item closed, logged in recently_completed.md.

**Further recurrences (2026-07-11 hard crash + narrower renderer-timeout on `actualbat_2026.csv`) and the retry-logic/staleness-detection fix built in response are tracked in [[project_baseball_fangraphs_scraper_staleness]] — check there first for the current state of Step 1's failure handling.**

**RECURRENCE 2026-07-14 — new trigger: aborted run (not a crash) still leaves a stale lock.**
The scheduled 6:45 AM run aborted itself via the "waiting for baseball_db" 600s timeout (baseball_db was down NAS-wide that morning, see [[project_baseball_db_shim_wedge_2026-07-14]]) — an intentional early exit, not a Chrome crash. Ivy manually re-triggered the refresh once the DB was healthy again (~4:07 PM PT); Step 1 immediately hit the same `SessionNotCreatedException` as the June/July recurrences. No live chrome/chromedriver process was found afterward and `/dev/shm` was clean (0% used, 256M), so the Jun 22 durable fix (rm-first + name-based `pkill -x`) likely still works for the *crash* case — this looks like a narrower gap where the **abort-on-DB-timeout path** leaves a lock file the pre-flight cleanup doesn't catch (not root-caused further; didn't dig into whether the DB-wait loop touches Chrome state before aborting). **Fix this time was just a plain retry** — no manual `rm`/`pkill` needed, second attempt succeeded cleanly (`last_refresh.txt` updated to 07-14 4:17 PM PT). If this recurs specifically after a DB-timeout abort (as opposed to a mid-scrape crash), a plain re-run is the fast path before deeper cleanup.
