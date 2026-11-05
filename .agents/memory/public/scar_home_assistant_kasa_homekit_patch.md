---
name: Home Assistant Kasa HomeKit Patch
description: "Resolved an issue causing three TP-Link Kasa smart switches to drop offline in Home Assistant by pat"
category: scar
source: scar_home_assistant_kasa_homekit_patch.md
updated: 2026-10-24
---

Resolved an issue causing three TP-Link Kasa smart switches to drop offline in Home Assistant by patching `python-kasa`'s `homekit.py` module to disable unsupported HomeKit probing. Container updates or package reinstalls in Home Assistant may overwrite this patch and require re-application if the devices regress.
