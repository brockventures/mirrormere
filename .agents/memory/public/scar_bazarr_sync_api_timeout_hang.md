---
name: Bazarr Sync API Timeout Hang
description: "Synchronous API calls triggering full Bazarr subtitle re-indexes block runner request threads until "
category: scar
source: scar_bazarr_sync_api_timeout_hang.md
updated: 2026-09-09
---

Synchronous API calls triggering full Bazarr subtitle re-indexes block runner request threads until background task timeouts occur. Direct on-disk config patching bypasses API deadlocks during library maintenance. Windows Plex clients should use the native desktop app or direct LAN IP (`http://10.0.0.x:32400/web`) to avoid browser Relay fallbacks.
