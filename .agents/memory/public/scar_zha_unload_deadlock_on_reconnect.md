---
name: ZHA Unload Deadlock on Reconnect
description: "When SLZB coordinators briefly drop during network or power fluctuations, Home Assistant's ZHA integ"
category: scar
source: scar_zha_unload_deadlock_on_reconnect.md
updated: 2026-09-27
---

When SLZB coordinators briefly drop during network or power fluctuations, Home Assistant's ZHA integration can enter an unrecoverable `UNLOAD_IN_PROGRESS` asyncio deadlock in memory while the physical hardware remains healthy. The integration cannot recover automatically from this state, requiring a clean restart of the `homeassistant` container to clear the wedged task and re-establish coordinator communication.
