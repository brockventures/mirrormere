---
name: Calibre-Web Gmail OAuth Configuration
description: "Configured Calibre-Web-Automated to dispatch outbound book delivery via Gmail OAuth2 (`mail_server_t"
category: scar
source: scar_calibre_web_gmail_oauth_configuration.md
updated: 2026-10-25
---

Configured Calibre-Web-Automated to dispatch outbound book delivery via Gmail OAuth2 (`mail_server_type = 1`, `agent@example.com`) by updating `app.db` settings directly with a refreshed OAuth token. Noted that `cwa_scheduled` table did not exist in the database during migration.
