---
name: Bridge ProcessReaper and Path Disconnect
description: "Post-mortem identified turn termination via SIGKILL (-9) caused by the bridge daemon's ProcessReaper"
category: scar
source: scar_bridge_processreaper_and_path_disconnect.md
updated: 2026-09-21
---

Post-mortem identified turn termination via SIGKILL (-9) caused by the bridge daemon's ProcessReaper watchdog timeout, container runtime missing SSH target environment variables defaulting to localhost, and path mismatches caused by commit safety filters rejecting `/opt/docker`. Bug fixes also addressed over-aggressive regex HTML tag stripping of inequalities/redirects and keyword suppression issues.
