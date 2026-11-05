---
name: FORGE Card Status Normalization Fix
description: "FORGE widget cards in Discord remained stuck in RUNNING because SQLite stored uppercase statuses ('C"
category: scar
source: scar_forge_card_status_normalization_fix.md
updated: 2026-10-28
---

FORGE widget cards in Discord remained stuck in RUNNING because SQLite stored uppercase statuses ('COMPLETED', 'MERGED') while widget renderers and pruning routines checked lowercase values. Normalizing build, chunk, and job statuses with `.lower()` across rendering and pruning functions resolved the card stuck state across agent mounts.
