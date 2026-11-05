---
name: Samsung TV Shutdown Automation Failure
description: "Automation using Broadlink IR hex codes (`0x98`) failed to reliably power off the Samsung QD-OLED TV"
category: scar
source: scar_samsung_tv_shutdown_automation_failure.md
updated: 2026-09-29
---

Automation using Broadlink IR hex codes (`0x98`) failed to reliably power off the Samsung QD-OLED TV due to flaky IR reception and stale ping sensor gating. Direct WebSocket shutdown commands via the Samsung integration are required for deterministic TV power-off state changes.
