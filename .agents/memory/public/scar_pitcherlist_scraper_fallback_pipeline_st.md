---
name: PitcherList Scraper Fallback & Pipeline Stall
description: "Diagnosed and resolved two fantasy pipeline issues on Host 2: updated `scrape_pitcherlist.py` with U"
category: scar
source: scar_pitcherlist_scraper_fallback_pipeline_st.md
updated: 2026-09-10
---

Diagnosed and resolved two fantasy pipeline issues on Host 2: updated `scrape_pitcherlist.py` with URL regex fallback `r"(?:top-100-starting|the-list-)"` to support playoff articles, and identified that empty inputs caused `compute_league_values.R` to skip writing output files, leaving stale prior-day CSVs on disk for email delivery.
