---
name: Arr Notification Hygiene & Queue Watchdog
description: "Disabled `onManualInteractionRequired` from public `#server-updates` in Radarr/Sonarr to prevent spa"
category: scar
source: scar_arr_notification_hygiene_queue_watchdog.md
updated: 2026-09-04
---

Disabled `onManualInteractionRequired` from public `#server-updates` in Radarr/Sonarr to prevent spamming import errors, routing failures instead to internal channels. Remedied root-owned NFS migration permission strays (`1026:100`) on NasHost-01 and deployed an autonomous 30-minute queue watchdog (`tools/arr_queue_watchdog.py`) targeting `#homelab`.
