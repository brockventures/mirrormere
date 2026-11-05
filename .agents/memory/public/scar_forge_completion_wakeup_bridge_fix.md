---
name: Forge Completion Wakeup Bridge Fix
description: "Fixed an issue in `/app/bridge_scheduler.py` where completed `#forge` background worker builds faile"
category: scar
source: scar_forge_completion_wakeup_bridge_fix.md
updated: 2026-10-27
---

Fixed an issue in `/app/bridge_scheduler.py` where completed `#forge` background worker builds failed to proactively wake and brief the originating channel. Additionally confirmed that `automations.yaml` reloads cannot heal dropped TubesZB TCP serial disconnects for Z-Wave JS, requiring the `ha_reauth_watchdog.py` sidecar to handle container and socket recovery.
