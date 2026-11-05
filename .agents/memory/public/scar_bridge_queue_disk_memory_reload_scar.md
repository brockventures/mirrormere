---
name: Bridge Queue Disk-Memory Reload Scar
description: "Fixed an `asyncio.Queue.task_done()` regression in `tools/bridge_handlers.py` where passing test sui"
category: scar
source: scar_bridge_queue_disk_memory_reload_scar.md
updated: 2026-09-19
---

Fixed an `asyncio.Queue.task_done()` regression in `tools/bridge_handlers.py` where passing test suites masked that the running bridge daemon (PID 1) had not reloaded the code from disk. Restored queue dispatch across channels by restarting the worker processes to ensure on-disk async fixes are actively loaded into runtime memory.
