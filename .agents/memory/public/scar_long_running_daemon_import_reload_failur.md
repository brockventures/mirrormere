---
name: Long-running Daemon Import Reload Failure
description: "Patching underlying Python tool modules on disk and attempting `importlib.reload()` within sidecars "
category: scar
source: scar_long_running_daemon_import_reload_failur.md
updated: 2026-09-17
---

Patching underlying Python tool modules on disk and attempting `importlib.reload()` within sidecars fails to propagate to long-running bridge daemons holding cached imports in memory. A full daemon or scheduler process restart is required to properly ingest changes to persistent watchdog and sidecar modules.
