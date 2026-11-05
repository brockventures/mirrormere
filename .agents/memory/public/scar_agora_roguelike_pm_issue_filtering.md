---
name: Agora Roguelike PM Issue Filtering
description: "Fixed a bug in `agora_roguelike_pm.py` and `agora_roguelike_engineer.py` where human-gated holds and"
category: scar
source: scar_agora_roguelike_pm_issue_filtering.md
updated: 2026-10-14
---

Fixed a bug in `agora_roguelike_pm.py` and `agora_roguelike_engineer.py` where human-gated holds and issues assigned to `mcarmody` leaked into active queues via `unassigned_issues`. Both sidecars now explicitly quarantine hold issues (like #30 Steamworks onboarding) when external dependencies or human owner actions are pending.
