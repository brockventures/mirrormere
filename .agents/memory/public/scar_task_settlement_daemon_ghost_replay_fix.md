---
name: Task Settlement Daemon Ghost Replay Fix
description: "Diagnosed a 2-hour ghost replay caused by the background task settlement daemon accidentally parsing"
category: scar
source: scar_task_settlement_daemon_ghost_replay_fix.md
updated: 2026-10-08
---

Diagnosed a 2-hour ghost replay caused by the background task settlement daemon accidentally parsing foreign task IDs from inspected logs. Hardened `tools/task_settle.py` by requiring disk existence verification against `.system_generated/tasks/` and decoupling 7,200s TTL pruning from completed task processing to block false transcript completions.
