---
name: Radarr Discord Webhook Migration Tautulli
description: "Swapped media pipeline notifications from Radarr's legacy Discord webhook over to Tautulli by zeroin"
category: scar
source: scar_radarr_discord_webhook_migration_tautull.md
updated: 2026-10-03
---

Swapped media pipeline notifications from Radarr's legacy Discord webhook over to Tautulli by zeroing out Radarr event triggers (`onDownload: false`, `[]`). Preserved the Radarr Plex integration intact to maintain auto-refresh behavior without duplicate Discord notifications.
