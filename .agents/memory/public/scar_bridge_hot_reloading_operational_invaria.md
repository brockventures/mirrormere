---
name: Bridge Hot Reloading Operational Invariant
description: "Live updates to `bridge_handlers.py` require a bridge restart/reload because Python caches modules i"
category: scar
source: scar_bridge_hot_reloading_operational_invaria.md
updated: 2026-09-04
---

Live updates to `bridge_handlers.py` require a bridge restart/reload because Python caches modules in memory for PID 1, but restarts must be deferred until active file transfers or decoupled jobs finish to prevent connection drops. A routing defect where `is_home` strictly checked a hardcoded channel ID was identified and covered with unit tests in `test_bridge_handlers.py`.
