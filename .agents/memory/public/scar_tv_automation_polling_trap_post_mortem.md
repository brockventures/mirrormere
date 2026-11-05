---
name: TV Automation Polling Trap Post-Mortem
description: "Hardened Home Assistant's `switch_disconnected` automation by adding a discrete Broadlink IR power-o"
category: scar
source: scar_tv_automation_polling_trap_post_mortem.md
updated: 2026-10-11
---

Hardened Home Assistant's `switch_disconnected` automation by adding a discrete Broadlink IR power-off command alongside the WebSocket payload to resolve a secondary 23-second polling trap. Config was deployed to Host 1 (`/opt/docker/homeassistant/config/automations.yaml`) and verified after an automation engine reload.
