---
name: Baseball Stats Cron Schedule and Retries
description: "Baseball stats refresh fails due to FanGraphs upstream morning payload delays, leading to an updated"
category: scar
source: scar_baseball_stats_cron_schedule_and_retries.md
updated: 2026-09-13
---

Baseball stats refresh fails due to FanGraphs upstream morning payload delays, leading to an updated schedule of 7:15 AM PT on Host 2 (`.84`). A self-healing retry pipeline with automatic retry attempts at 7:30 AM and 7:45 AM PT was instituted before escalating alerts.
