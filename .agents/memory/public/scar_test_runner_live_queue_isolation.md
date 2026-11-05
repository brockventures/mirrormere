---
name: Test Runner Live Queue Isolation
description: "Test runners were writing dummy Decision Cards directly into the live queue database, polluting Disc"
category: scar
source: scar_test_runner_live_queue_isolation.md
updated: 2026-10-31
---

Test runners were writing dummy Decision Cards directly into the live queue database, polluting Discord channels and pinned rollups. The test runner is now strictly isolated to a temporary database to prevent test pollution of live operational queues.
