---
name: Sonarr Notification Health Check Handling
description: "Sonarr's `NotificationStatusCheck` warning triggers when an outbound Discord webhook times out, but "
category: scar
source: scar_sonarr_notification_health_check_handlin.md
updated: 2026-10-01
---

Sonarr's `NotificationStatusCheck` warning triggers when an outbound Discord webhook times out, but adding external retry loops is rejected as brittle over-engineering. Instead, the watchdog handles this via Tier 1 self-healing by issuing a `CheckHealth` API command to clear transient states and suppresses cosmetic notification failures from `#server-updates` outage escalations.
