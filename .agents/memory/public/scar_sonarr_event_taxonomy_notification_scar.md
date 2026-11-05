---
name: Sonarr Event Taxonomy Notification Scar
description: "In Task #22, treating Sonarr's `onImportComplete` as an umbrella catch-all missed episodic releases,"
category: scar
source: scar_sonarr_event_taxonomy_notification_scar.md
updated: 2026-10-02
---

In Task #22, treating Sonarr's `onImportComplete` as an umbrella catch-all missed episodic releases, because weekly episodic drops only trigger `onDownload`. Evaluating Tautulli notifications reveals tradeoffs with latency and inconsistent notification card styling between Radarr and Sonarr in `#seerr-notifications`.
