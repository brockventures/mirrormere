---
name: Ender-3 USB VBUS Disconnect Fix
description: "Ender-3 V2 serial `ch341-uart` dropouts are caused by 5V VBUS backpowering between the printer PSU a"
category: scar
source: scar_ender_3_usb_vbus_disconnect_fix.md
updated: 2026-10-15
---

Ender-3 V2 serial `ch341-uart` dropouts are caused by 5V VBUS backpowering between the printer PSU and NAS USB hub, resolvable by taping Pin 1 on the USB-A cable or using a data-only blocker. Software auto-resume handling for serial reconnects without re-homing was implemented in `zero_printer_watcher.py`.
