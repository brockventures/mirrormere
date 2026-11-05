---
name: Synology USB and Postgres Failure Isolation
description: "Synology container cascading outages caused by Postgres healthcheck timeouts and USB bus contention "
category: scar
source: scar_synology_usb_and_postgres_failure_isolat.md
updated: 2026-09-26
---

Synology container cascading outages caused by Postgres healthcheck timeouts and USB bus contention can be mitigated by disabling Docker healthchecks on Postgres and isolating UPS USB HID cables to a separate physical USB controller from external storage.
