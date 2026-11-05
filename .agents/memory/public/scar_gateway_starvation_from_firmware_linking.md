---
name: Gateway Starvation from Firmware Linking
description: "Unthrottled PlatformIO multi-job compilation (`xtensa-esp32s3-elf-g++`) induced memory pressure and "
category: scar
source: scar_gateway_starvation_from_firmware_linking.md
updated: 2026-10-28
---

Unthrottled PlatformIO multi-job compilation (`xtensa-esp32s3-elf-g++`) induced memory pressure and swap thrashing, causing synchronous calls in `bridge_scheduler.py` to block the main event loop and drop the Discord gateway heartbeat. Resolved by offloading `forge_supervisor.tick_sync()` to `asyncio.to_thread` with a strict 12-second timeout and throttling local firmware builds to prevent main-thread event loop starvation.
