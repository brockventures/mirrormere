---
name: Bridge Scheduler In-Memory Module Caching
description: "Modifying scheduled job scripts without reloading the running bridge process leaves stale functions "
category: scar
source: scar_bridge_scheduler_in_memory_module_cachin.md
updated: 2026-10-22
---

Modifying scheduled job scripts without reloading the running bridge process leaves stale functions active in `sys.modules`, causing ticks to execute pre-update routing logic. To ensure sidecar watcher updates take effect immediately without requiring a full container restart, dynamic imports or `importlib.reload()` must be wired into the scheduler dispatch loop. In addition, r/ResidentAgents watcher notifications route exclusively to `#r-residentagents`, with community flair configured for self-serve toggling rather than automated assignment per Ryan.
