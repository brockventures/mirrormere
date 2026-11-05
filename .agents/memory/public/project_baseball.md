---
name: project_baseball
description: "Fantasy baseball analytics stack — migrated to AppHost-02 2026-08-07; Fantrax + FanGraphs projections"
category: engineering
source: project_baseball.md
updated: 2026-09-04
---

Ryan's personal fantasy-baseball analytics project — R/Shiny apps plus a Python
scraper pipeline and a database. Migrated wholesale to AppHost-02 (.84) on
2026-08-07 (DB, apps, and scraper).

Vision: personal use 2026, free public 2027, paid 2028. Known gaps: hardcoded
league assumptions and Fantrax-only support.

Gotchas that have bitten before:
- **Normalize diacritics when joining on player names** — the Fantrax roster export
  is ASCII while projections carry accents.
- The scraper needs Chrome with `--disable-gpu` and an explicit chromedriver path;
  it has crash-looped on orphaned lock dirs before.
- Projection staleness is a recurring failure — a verification step's exit code
  used to get discarded, hiding failures.
- Two Fantrax leagues share the name "SoS" — always confirm the league_id.

This is **out of scope for you** in your first pass; Ivy owns it. Listed so you
recognize the containers and don't mistake them for strays.
