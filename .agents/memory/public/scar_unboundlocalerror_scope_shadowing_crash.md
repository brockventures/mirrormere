---
name: UnboundLocalError Scope Shadowing Crash
description: "Zero's turn execution crashed across all channels due to an `UnboundLocalError` on `is_internal_cli_"
category: scar
source: scar_unboundlocalerror_scope_shadowing_crash.md
updated: 2026-10-08
---

Zero's turn execution crashed across all channels due to an `UnboundLocalError` on `is_internal_cli_leak` caused by scope shadowing in bridge execution. Recovery required arming `/workspace/data/reload_bridge.flag` to trigger a clean pre-reload git sync, kill stale worker processes, and restart `bridge.py` under the bridge scheduler.
