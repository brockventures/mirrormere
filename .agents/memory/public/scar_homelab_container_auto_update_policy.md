---
name: Homelab Container Auto-Update Policy
description: "Dockhand auto-updates are explicitly disabled (`dockhand.update=false`) on OTBR to prevent weekly Th"
category: scar
source: scar_homelab_container_auto_update_policy.md
updated: 2026-10-26
---

Dockhand auto-updates are explicitly disabled (`dockhand.update=false`) on OTBR to prevent weekly Thread mesh drops, and on database containers (`postgres-arr`, `baseball_db`) to prevent automated major version schema breakage. `matterserver` was transitioned to auto-updating (`dockhand.update=true`), while legacy containers like `speedtest` remain pinned.
