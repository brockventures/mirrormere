---
name: Tautulli Batch Delay Config Fix
description: "SABnzbd import delays and Plex scanner timeouts caused Tautulli's default 15-minute batch window to "
category: scar
source: scar_tautulli_batch_delay_config_fix.md
updated: 2026-10-27
---

SABnzbd import delays and Plex scanner timeouts caused Tautulli's default 15-minute batch window to fracture season notifications into multiple waves. To prevent notification spam and config overwrites, Tautulli was stopped and `notify_recently_added_delay` in `config.ini` was set to 2700 (45 minutes) with a 60-second Plex timeout, alongside blocking Turkish subtitle release profiles in Sonarr.
