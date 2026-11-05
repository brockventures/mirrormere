---
name: Python Sys Modules Cache Invalidation
description: "Hotfixes applied to standalone tool scripts do not take effect inside long-running daemon processes "
category: scar
source: scar_python_sys_modules_cache_invalidation.md
updated: 2026-09-17
---

Hotfixes applied to standalone tool scripts do not take effect inside long-running daemon processes due to Python's in-memory `sys.modules` caching. When patching daemon-imported tools, the parent service must be restarted or explicitly reload the target module to prevent stale bytecode execution and recurring false alarms.
