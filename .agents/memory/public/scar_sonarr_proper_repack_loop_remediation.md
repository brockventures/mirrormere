---
name: Sonarr Proper/Repack Loop Remediation
description: "Sonarr's default `downloadPropersAndRepacks` setting caused collision grabs with scene releases, dif"
category: scar
source: scar_sonarr_proper_repack_loop_remediation.md
updated: 2026-09-24
---

Sonarr's default `downloadPropersAndRepacks` setting caused collision grabs with scene releases, differing from Radarr's configuration. The self-healing watchdog remediates completed collision downloads via Sonarr's queue API with `removeFromClient=true` and `blocklist=true` to prevent upgrade loops, logging audit receipts to `data/arr_triage_audit.jsonl`.
