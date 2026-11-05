---
name: Fix Switch 2 Shutdown Automation
description: "Removed the redundant Broadlink IR command switching HDMI matrix inputs during `automation.switch_di"
category: scar
source: scar_fix_switch_2_shutdown_automation.md
updated: 2026-10-10
---

Removed the redundant Broadlink IR command switching HDMI matrix inputs during `automation.switch_disconnected`. Eliminating this blast prevents an IR/CEC race condition that interrupted clean TV power-down when the Nintendo Switch was undocked or shut off.
