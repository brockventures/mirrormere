---
name: Nest Lock Deterministic Watchdog Architecture
description: "The Nest lock self-healing watchdog (`tools/nest_lock_watchdog.py`) runs as a 100% deterministic loc"
category: scar
source: scar_nest_lock_deterministic_watchdog_archite.md
updated: 2026-10-06
---

The Nest lock self-healing watchdog (`tools/nest_lock_watchdog.py`) runs as a 100% deterministic local Python thread in the bridge scheduler via `asyncio.to_thread` with zero token cost. The LLM runtime (`agy`) is never invoked unless an unrecoverable failure occurs, and deployment required an in-place bridge reload to pick up scheduler changes.
