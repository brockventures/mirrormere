---
name: Shelfmark Webhook Suppression and Reload
description: "Bulk eBook queueing can spam Discord notification channels (`#now-available` and `#media-requests`) "
category: scar
source: scar_shelfmark_webhook_suppression_and_reload.md
updated: 2026-10-25
---

Bulk eBook queueing can spam Discord notification channels (`#now-available` and `#media-requests`) because Shelfmark triggers separate request-approval and availability webhooks. Suppressing outbound webhook calls requires guarding `requests.post()` in Shelfmark's `notifications.py` via a trigger file (`/tmp/.suppress_shelfmark_webhook`) and sending `SIGHUP` to the Gunicorn master process so cached live workers reload the module.
