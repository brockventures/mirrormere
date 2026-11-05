---
name: Front Door GPS Drift Fix
description: "Indoor GPS drift on Ryan's Pixel triggered false arrival automations and unlocked the front door whi"
category: scar
source: scar_front_door_gps_drift_fix.md
updated: 2026-09-15
---

Indoor GPS drift on Ryan's Pixel triggered false arrival automations and unlocked the front door while he was still home. Fixed in Home Assistant `automations.yaml` (`1750000000001`) by adding an explicit Wi-Fi gating condition to require disconnection from home Wi-Fi before treating departure/arrival triggers as valid.
