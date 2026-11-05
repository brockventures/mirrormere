---
name: Calibre-Web and Shelfmark Self-Healing Healthchecks
description: "Resolved recurring unhealthy container states for `calibre-web-automated` and `shelfmark` on Host 1 "
category: scar
source: scar_calibre_web_and_shelfmark_self_healing_h.md
updated: 2026-10-27
---

Resolved recurring unhealthy container states for `calibre-web-automated` and `shelfmark` on Host 1 caused by aggressive upstream healthcheck timeouts. Established a self-healing healthcheck configuration in Docker Compose to eliminate flapping without manual intervention.
