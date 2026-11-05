---
name: Decoupled Watchdog Ceilings in Batch Guard
description: "Stripped artificial step, file edit, and scratch write caps from `batch_guard.py` to prevent termina"
category: scar
source: scar_decoupled_watchdog_ceilings_in_batch_gua.md
updated: 2026-10-14
---

Stripped artificial step, file edit, and scratch write caps from `batch_guard.py` to prevent terminating deep mid-turn convergence. In `ivy_daemon.py`, active-turn ceiling and print timeouts were doubled (`30m` to `60m`, `1800s` to `3600s`) while preserving the 600s inactivity timeout to distinguish legitimate long-running tasks from dead-air hangs.
