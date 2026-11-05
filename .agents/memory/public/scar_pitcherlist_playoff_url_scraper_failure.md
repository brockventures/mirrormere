---
name: PitcherList Playoff URL Scraper Failure
description: "`scrape_pitcherlist.py` broke because it hardcoded `url_pattern="top-100-starting"`, ignoring Pitche"
category: scar
source: scar_pitcherlist_playoff_url_scraper_failure.md
updated: 2026-09-10
---

`scrape_pitcherlist.py` broke because it hardcoded `url_pattern="top-100-starting"`, ignoring PitcherList's late-season naming shift to `the-list-*` playoff guide format. The pipeline requires updating URL pattern matching to accommodate playoff guides and synthesizing rank positions from tiered tables.
