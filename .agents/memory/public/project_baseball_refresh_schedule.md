---
name: project-baseball-refresh-schedule
description: "Baseball stats refresh runs at 7:15 AM PT on Synology Host 2 with self-healing auto-retries at 7:30 and 7:45 AM PT"
category: engineering
source: project_baseball_refresh_schedule.md
updated: 2026-09-13
---

The baseball pipeline stats refresh is a Synology scheduled task (Task ID 3, `/usr/syno/etc/synoschedule.d/root/3.task`) on Host 2 (`10.0.0.x`).

**Schedule change (2026-09-12):** Changed base run from 6:45 AM to 7:15 AM PT, with self-healing auto-retries at 7:30 AM and 7:45 AM PT.
- **Root cause:** Following the Sep 9 payload validation guard (`< 300` bytes in `scrape_fangraphs.py`), empty CSV downloads on `month=32` ("Yesterday") correctly trigger `FATAL_DOWNLOAD_FAILURE`. FanGraphs does not finish calculating overnight split data (especially pitchers after late West Coast games) until ~7:15–7:30 AM PT. A 6:45 AM scrape was consistently hitting empty/header-only (158B) pitcher CSVs.
- **Architecture:** `run_refresh_stats.sh` now executes Attempt 1 at 7:15 AM PT with suppressed Discord failure alerts. If FanGraphs split data is delayed, it sleeps and automatically retries at 7:30 AM (Attempt 2) and 7:45 AM (Attempt 3). If any retry succeeds, it posts an informational recovery note to Discord. Only if all 3 attempts fail does it fire the `@Ryan` failure ping.
- **Task ID:** Task ID 3 on Host 2 (`/usr/syno/etc/synoschedule.d/root/3.task`), mirrored in `/etc/crontab` as `15 7 * * * root /usr/syno/bin/synoschedtask --run id=3`.
