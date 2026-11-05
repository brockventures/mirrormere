---
name: Bridge Cache & Broadlink Fixes
description: "Resolved a Google Tasks sidecar failure caused by stale in-memory cached modules in `bridge.py` prio"
category: scar
source: scar_bridge_cache_broadlink_fixes.md
updated: 2026-10-18
---

Resolved a Google Tasks sidecar failure caused by stale in-memory cached modules in `bridge.py` prior to disk syncing to `/app/sidecars.py`. Disabled the 60-second sensor polling loop on the Broadlink RM4 Mini (`pref_disable_polling: true`) in Home Assistant to eliminate periodic LED flashes while preserving remote IR command responsiveness.
