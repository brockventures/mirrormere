---
name: Office CO2 Offset & Aqara Cleanup
description: "Office CO2 sensor requires a 13.0°C temperature offset to compensate for onboard heating and restore"
category: scar
source: scar_office_co2_offset_aqara_cleanup.md
updated: 2026-10-15
---

Office CO2 sensor requires a 13.0°C temperature offset to compensate for onboard heating and restore accurate temperature/humidity readings. All 12 Aqara Zigbee contact and leak `*_device_temperature` entities read inaccurate frozen values (~80–82°F) and should remain disabled in Home Assistant to prevent telemetry pollution.
