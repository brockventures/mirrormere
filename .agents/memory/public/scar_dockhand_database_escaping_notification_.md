---
name: Dockhand Database Escaping Notification Fix
description: "Dockhand container state polling and webhook notifications broke on NasHost-01 due to malformed JSO"
category: scar
source: scar_dockhand_database_escaping_notification_.md
updated: 2026-09-04
---

Dockhand container state polling and webhook notifications broke on NasHost-01 due to malformed JSON in `environment_notifications.event_types` caused by nested shell escaping stripping inner quotes. Repairing the JSON directly in `dockhand.db` and restarting the container restored worker polling and webhook dispatch.
