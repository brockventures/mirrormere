---
name: Ivy Compaction Background Task Leak
description: "Fixed an issue in `ivy_daemon.py` where triggering session compaction while a background task was ac"
category: scar
source: scar_ivy_compaction_background_task_leak.md
updated: 2026-10-19
---

Fixed an issue in `ivy_daemon.py` where triggering session compaction while a background task was active caused `extract_ivy_carryforward()` to ingest unsanitized CLI background task stubs into the new session. Resolved via `is_internal_cli_leak()` filtering and verified in `tests/test_ivy_daemon_reconcile.py`.
