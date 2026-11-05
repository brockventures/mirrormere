---
name: Shiny Reconnection Loop Removal Architecture
description: "In the baseball app, Shiny's volatile WebSocket reconnection loop was permanently disabled via `sess"
category: scar
source: scar_shiny_reconnection_loop_removal_architec.md
updated: 2026-09-21
---

In the baseball app, Shiny's volatile WebSocket reconnection loop was permanently disabled via `session$allowReconnect(FALSE)` in `modules/settings_server.R`. Because state persistence is handled through backend RDS disk caching and frontend cookies, attempting to resuscitate dead in-memory R sessions over WebSockets caused flickering UI loops instead of seamless session recovery.
