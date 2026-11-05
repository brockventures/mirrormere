---
name: Stale Daemon Execution Stalls Sidecar Fixes
description: "A root-cause post-mortem revealed that USB backup sidecars failed to run silently because the active"
category: scar
source: scar_stale_daemon_execution_stalls_sidecar_fi.md
updated: 2026-09-16
---

A root-cause post-mortem revealed that USB backup sidecars failed to run silently because the active bridge daemon (PID 1) was executing stale in-memory code. Changes made to `tools/bridge_scheduler.py` require a full daemon process restart to take effect rather than relying on on-disk code updates alone.
