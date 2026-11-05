---
name: Orphaned SDK Task Process Wedges
description: "Orphaned child processes detected by `get_verified_pending_sdk_tasks()` will indefinitely hold an ag"
category: scar
source: scar_orphaned_sdk_task_process_wedges.md
updated: 2026-10-23
---

Orphaned child processes detected by `get_verified_pending_sdk_tasks()` will indefinitely hold an agent turn open waiting for completion. Terminating orphaned PIDs directly inside the container flushes the pending turn immediately, and shared guard fixes were deployed to prevent hook threshold lockups.
