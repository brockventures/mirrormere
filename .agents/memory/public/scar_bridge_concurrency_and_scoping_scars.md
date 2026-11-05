---
name: Bridge Concurrency and Scoping Scars
description: "Mid-turn steering in multi-channel environments triggered silent failure due to an unscoped global b"
category: scar
source: scar_bridge_concurrency_and_scoping_scars.md
updated: 2026-09-05
---

Mid-turn steering in multi-channel environments triggered silent failure due to an unscoped global boolean (`is_ext_steering`) in `bridge_handlers.py` being evaluated across channels. Additionally, runtime reloads revealed scoping bugs (`local variable 're'`), prompting Ryan to challenge assumptions on latency and request granular timing instrumentation and architectural refactoring for the 3-persistent / 3-dynamic session bridge topology.
