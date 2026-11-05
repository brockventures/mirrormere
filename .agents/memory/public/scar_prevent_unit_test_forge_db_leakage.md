---
name: Prevent Unit Test Forge DB Leakage
description: "Fixed unit test harness leak where test executions in `test_detached_runner.py` and `test_forge.py` "
category: scar
source: scar_prevent_unit_test_forge_db_leakage.md
updated: 2026-10-23
---

Fixed unit test harness leak where test executions in `test_detached_runner.py` and `test_forge.py` wrote mock fixtures directly into production `forge.db`. Patched `tools/detached_runner.py` and `tools/forge.py` to isolate temporary test directories, pruning 14 stale entries to keep `/queue` clean.
