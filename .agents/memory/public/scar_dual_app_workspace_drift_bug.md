---
name: Dual App Workspace Drift Bug
description: "Bridge containers prioritize `/workspace` in `sys.path` (`from tools.<module> import ...`), causing "
category: scar
source: scar_dual_app_workspace_drift_bug.md
updated: 2026-10-25
---

Bridge containers prioritize `/workspace` in `sys.path` (`from tools.<module> import ...`), causing edits directly to `/app/<module>.py` to be silently shadowed by stale copies in `/workspace/tools/`. Changes to daemons and shared tools must always be written to `/workspace/tools/` and synchronized to `/app/` to prevent silent drift across container reloads.
