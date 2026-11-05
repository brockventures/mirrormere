---
name: ZHA SLZB-06P7 Radio Recovery Patch
description: "When the SLZB-06P7 CC2652P7 coordinator UART wedges under heavy zigbee traffic, the recovery require"
category: scar
source: scar_zha_slzb_06p7_radio_recovery_patch.md
updated: 2026-10-22
---

When the SLZB-06P7 CC2652P7 coordinator UART wedges under heavy zigbee traffic, the recovery requires pulsing `button.slzb_06p7_zigbee_restart` before reloading ZHA with a 35-second timeout. Additionally, the TCP port 6638 probe socket in `ha_reauth_watchdog.py` must be immediately closed with a 0.5-second cooldown to avoid socket contention with Home Assistant during coordinator re-initialization.
