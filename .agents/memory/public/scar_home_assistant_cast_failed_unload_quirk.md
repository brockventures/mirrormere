---
name: Home Assistant Cast Failed Unload Quirk
description: "Home Assistant's `cast` integration has `supports_unload: false`, causing watchdog alerts with state"
category: scar
source: scar_home_assistant_cast_failed_unload_quirk.md
updated: 2026-10-04
---

Home Assistant's `cast` integration has `supports_unload: false`, causing watchdog alerts with state `failed_unload` during reloads even when Google Cast devices and Chromecasts remain functional in memory. This is a benign core state quirk rather than an actual service outage.
