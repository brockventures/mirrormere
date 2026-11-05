---
name: baseball-fangraphs-scraper-staleness
description: "FanGraphs scraper stale-data incidents (Jun 21-22, Jul 11, Jul 21, Aug 15 2026); /tmp+shm cleanup, Step 1 freshness check, actuals retry, login-nav retry, login-button-selector fix; open verify_projections.py silent-swallow bug found 07-21, unpatched"
category: engineering
source: project_baseball_fangraphs_scraper_staleness.md
updated: 2026-09-04
---

**Incident (Jun 21-22, 2026):** Baseball stats pipeline showed stale data for 2 days while the DSM task (task 8, daily 6:45 AM PT, `bash /opt/docker/baseball/run_refresh_stats.sh`) reported success every day.

**Root cause:** `scrape_fangraphs.py` in `baseball-scraper-1` failed with `SessionNotCreatedException` (`DevToolsActivePort file doesn't exist` on Jun 21, `user data directory is already in use` on Jun 22). Cause: a crashed Chrome left dozens of orphaned `/tmp/.com.google.Chrome.*` scratch dirs + locks; container `/dev/shm` is only 64MB (Docker default). Each subsequent Chrome launch failed.

**Why silent:** `refresh_stats.sh` Step 1 swallowed the scraper error (`|| { echo "...continuing"; }`) and did NOT add it to `PIPELINE_ERRORS`. Downstream R steps reused the frozen Jun 20 `actualbat_yesterday_2026.csv`, wrote "543 yesterday values" from stale data, and `last_refresh.txt` was bumped — so the app looked fresh. Only Steps 2/3 counted as "critical."

**Fix applied (Jun 22, 2026) to `/opt/docker/baseball/refresh_stats.sh`:**
1. Pre-Step-1 cleanup: `pkill -9 chromedriver/chrome` + `rm -rf /tmp/.com.google.Chrome.* /tmp/.org.chromium.*` in the scraper container.
2. Step 1 freshness check: capture mtime of `actualbat_yesterday_2026.csv` before/after scrape; non-zero exit OR unchanged mtime → record `Step 1:` error in `PIPELINE_ERRORS`.
3. Added `Step 1:` to the CRITICAL_STEPS_FAILED check so `last_refresh.txt` is NOT bumped on a stale scrape, and the existing Discord notifier (`notify.env` token) now fires.

**Alerting:** Discord alerts already existed (notify_discord via notify.env → channel in env) but never fired because Step 1 wasn't tracked. Now any critical-step failure or stale scrape posts to Discord.

**Permanent shm fix (Jun 22, 2026):** `shm_size: '256m'` added to the `scraper` service in `/opt/docker/baseball/docker-compose.yml` (line 78). Container force-recreated; live ShmSize verified at 268435456 bytes = 256MB. This addresses the root cause.

**If it recurs:** SSH `deploy@app-host -p 22 -i ~/.ssh/id_ed25519`. Check `docker exec baseball-scraper-1 ls /tmp | grep -c chrome` and `df -h /dev/shm`. The active app is `shiny_app_pro`; pipeline writes raw CSVs to `shiny_app/data` (shared volume mounted into scraper at `/app/data`).

---

**Recurrence 2026-07-11 ~6:45 AM PT — Step 1 hard `SessionNotCreatedException`, not the shm/pkill causes (both re-verified live and working).** Staleness guard worked correctly: alert fired, `last_refresh.txt` held at Jul 10. Ryan asked for a manual rerun + refreshed morning email. Rerun (7:15-7:27 AM PT, `setsid`-launched with the SSH session blocking on the real exit code) succeeded overall — exit 0, fresh scrape, email sent — but artifact verification (not just trusting the log) caught a **second, narrower failure**: `actualbat_2026.csv` (full-season batters) stayed stamped Jul 10 while 5 of 6 other actuals CSVs updated. Root cause: a Chrome **renderer timeout** (`Timed out receiving message from renderer: 6.099`) on that specific download, which the script caught and continued past — Step 1 exited clean and `last_refresh.txt` bumped anyway, so the app advertised "refreshed today" while carrying one stale hitter file (same failure class as Jun 21-22, narrower scope — feeds the 33/67 hitter blend, ~1 day out of ~90).

**Durable fix applied 2026-07-11 (Ryan approved, implemented by background agent `baseball-actuals-retry-fix`):**
1. **Retry in `scrape_fangraphs.py`:** extracted `_download_actuals_with_retry(driver, url, output_filepath, label)`, used by both `download_fangraphs_actual_stats()` and `download_fangraphs_actual_stats_period()`. 2 attempts, 5s pause between, then prints a `FATAL_DOWNLOAD_FAILURE: <label> - <error>` marker on final failure.
2. **Enhanced staleness detection in `refresh_stats.sh`:** now also checks mtimes on the full-season `actualbat_2026.csv`/`actualpit_2026.csv` (previously only watched the "yesterday" CSV), and scans Step 1 output for the new `FATAL_DOWNLOAD_FAILURE` marker — both feed the existing `PIPELINE_ERRORS`/Discord-notify mechanism, no new alert path built.
3. **Deliberate side effect (flagged, not hidden):** a failed actuals download now also blocks the `last_refresh.txt` bump, same as the original Jun 21-22 guard.
4. Verified without a live pipeline run (to avoid a duplicate Discord email): retry loop exercised against a fake failing Selenium driver end-to-end in the real container; new bash detection logic run through 5 simulated scenarios (including no-double-count and no offseason false alarm). Real first test was the next scheduled 6:45 AM PT run.

**How to apply:** If a full-season actuals CSV (`actualbat_2026.csv`/`actualpit_2026.csv`) looks stale despite a "successful" run, check Step 1's output for `FATAL_DOWNLOAD_FAILURE` — the pipeline should now catch and alert on this itself rather than silently serving a partially-stale file.

---

**Recurrence 2026-07-21 — renderer timeout on the *login* nav (the last unprotected `driver.get`).** The 6:45 AM PT run died at `login_fangraphs()` on a bare `driver.get(FANGRAPHS_LOGIN_URL)` that sat outside any try/except. Staleness guard again worked (no `last_refresh.txt` bump). A manual re-run at 7:17 AM failed identically; a second at 7:26 AM succeeded and data went fresh (`last_refresh.txt` = 2026-07-21T07:39:31-07:00).

**Non-obvious diagnostic finding — renderer timeouts here are NOT resource exhaustion.** During the failures the scraper container was at 33 MB / 9.5 GB, **zero** Chrome procs, `/dev/shm` 0% of 256 MB, zero `/tmp` litter — i.e. every Jun-22-era root cause was clean. `curl` from inside the container fetched the login page in **0.52s, HTTP 200**. The real mechanism: `driver.get` blocks until the full `load` event, and blogs.fangraphs.com stalls on third-party resources long after the login form is already in the DOM. So don't chase shm/`/tmp`/memory when the symptom is `Timed out receiving message from renderer` — check whether the page HTML itself is served fine first (curl), because the fix is load-event handling, not cleanup.

**Fix applied 2026-07-21:** added `_load_login_page(driver)` to `scrape_fangraphs.py` (`LOGIN_ATTEMPTS = 2`, `LOGIN_RETRY_DELAY = 5`), replacing the bare `driver.get`. Retries once on `TimeoutException`/`WebDriverException`, calls `driver.execute_script("window.stop()")` between attempts to un-wedge the renderer, then **falls through** to the pre-existing `WebDriverWait` for `user_login` rather than raising — so a form that did arrive still logs in, and a form that didn't still fails loud via the existing `except`. Same retry-once philosophy as `_download_actuals_with_retry`.

**Caveat — patch is unproven in production.** The successful re-run logged in on the *first* attempt (no retry lines), so the transient condition cleared on its own; the patch was never exercised. Verified by syntax check only. If a login renderer timeout recurs, grep the log for `Error loading login page` / `Retrying login page` to see whether the retry actually saved the run.

**Also note:** `/opt/docker/baseball/scraper/` is live-bind-mounted into the container at `/app/scraper/`, so edits take effect with no rebuild and no container restart. `python3 -m py_compile` fails in-container with `Permission denied: /app/scraper/__pycache__` — use `python3 -c "compile(open(path).read(), path, 'exec')"` instead. Related: [[project_baseball_chrome_crashloop]].

---

**RECURRENCE 2026-08-15 ~6:46 AM PT — new root cause, first of its kind: FanGraphs changed their login page markup.** Not the Chrome-litter/shm pattern (checked and ruled out clean: 0 orphaned dirs, shm 256M/0% intact, no live Chrome procs, no host memory pressure, no Kometa overlap — scraper's been on AppHost-02/.84 since the 08-07 migration, Kometa stayed on .82). Real cause: FanGraphs' theme CSS (`wp-content/themes/fangraphs/login.css`, updated 06:05:24 PT that morning, 40 min before the run) added `body.login.login-action-login #loginform p.submit { display: none; }`, hiding the WordPress core submit button (`id="wp-submit"`) that `scrape_fangraphs.py` was hard-coded to click. FanGraphs' own replacement button (`input[name="wp-submit"].fg-login-submit`) has no `id`, so the old selector just found an invisible element → `ElementNotInteractableException`. Worked every prior day; this was a same-day upstream markup change, not a resource/environment issue at all.

**Fix applied 2026-08-15, verified with real freshness data (not just exit code):** added `_click_login_submit()` to `/opt/docker/baseball/scraper/scrape_fangraphs.py` (AppHost-02/.84) — finds whichever `#loginform` submit element is actually displayed+enabled, falls back to submitting the form directly if button-matching ever breaks again (more robust against a repeat of this exact failure class). Backup: `scrape_fangraphs.py.bak-20260815-fglogin`. Re-ran `run_refresh_stats.sh` (08:24:23 PT, ~3m45s): `last_refresh.txt` bumped, `actualbat_yesterday_2026.csv`/`actualbat_2026.csv`/`actualpit_2026.csv` all confirmed fresh mtimes matching the run, not just trusting the script's reported success.

**How to apply:** if Step 1 fails again, don't assume it's automatically the Chrome-litter pattern — check the actual error text first. `ElementNotInteractableException` or any "found but couldn't click" style error on the *login* step specifically points at FanGraphs changing their page again, not environment/resource causes. The new `_click_login_submit()` should be resilient to minor future markup changes, but a login-page redesign could still break it.

**Zombie-reaping FIXED same day, 2026-08-15 ~08:39 AM PT.** Root cause confirmed (not assumed): container's PID 1 was `tail -f /dev/null`, which never calls `wait()` — all 79 zombie `chrome` processes found (grown from the initial 75) had PPID 1, directly orphaned to it. Fix: added `init: true` to the `scraper` service in `/opt/docker/baseball/docker-compose.yml` on AppHost-02 (backup: `docker-compose.yml.bak-20260815-init`), then `docker compose up -d --force-recreate --no-deps --no-build --pull never scraper` (the `--no-build --pull never` flags were deliberate — service has `pull_policy: always` but the image is locally-built with no registry source, so a plain recreate risked a failed pull or a 2.17GB rebuild). Verified: PID 1 now `/sbin/docker-init`, zombie count 0, other 6 containers in the same compose project untouched, all mounts/restart-policy/256m shm intact, container confirmed ready ahead of the next 6:45 AM PT scheduled run.

---

**OPEN — found 2026-07-21, not yet patched: `verify_projections.py` result is silently discarded (same failure class as Jun 21-22, now for projections instead of actuals).** `scrape_fangraphs.py` runs `verify_projections.py` as a final check (`subprocess.run(...)`, `main()` line 414) — it checks all 16 projection-system files (steamer, zips, atc, thebat, thebatx, oopsy, fangraphsdc, razzball × bat/pit) for missing/too-small/stale and prints `[STALE]`/`[MISSING]`, but the return code is never read and `scrape_fangraphs.py` never exits non-zero on it. `refresh_stats.sh`'s `SCRAPER_EXIT` only reflects a hard crash, so a run where every projection file failed to update would still report success. Nobody wired this check into the exit path when `verify_projections.py` was added.

**Second bug, same discovery:** in Rest-of-Season mode (current mode), the scraper downloads `razzballrbat_2026.csv`/`razzballrpit_2026.csv` (proj_code `razzballr`), but `verify_projections.py`'s ROS list has `'razzball'` (missing the `r`) — so it's been checking the wrong (pre-season, last written April 13) files the whole time. The check has been silently useless in ROS mode, independent of bug #1.

Found while answering Ryan's "Anything else we should patch?" (Discord, 2026-07-21T14:47 PT) — reported to him but no fix has landed yet as of this writing. **If picking this up:** wire `verify_projections.py`'s exit code into `PIPELINE_ERRORS`/staleness gating the same way the Jun 22 actuals fix did, and fix the `razzballr` typo in the ROS filename list.
