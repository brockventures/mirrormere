---
name: Sonarr UpdateCheck Health False Alarm
description: "Sonarr exposes pending routine upstream updates in `/api/v3/health` under `source: UpdateCheck` with"
category: scar
source: scar_sonarr_updatecheck_health_false_alarm.md
updated: 2026-09-17
---

Sonarr exposes pending routine upstream updates in `/api/v3/health` under `source: UpdateCheck` with a `warning` type. Watchdog monitors inspecting the health endpoint must filter or ignore `UpdateCheck` warnings to prevent false positive outage alerts.
