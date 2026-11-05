---
name: Zigbee mesh — known offline devices and Aqara reconnect quirk
description: "Current ZHA offline devices, router topology, backyard hillside extender plan, and Aqara reconnect quirks (updated 2026-10-14)"
category: engineering
source: project_zigbee_mesh_status.md
updated: 2026-10-15
---

**Full ZHA Topology & Offline Audit as of 2026-10-14:**
- **Active Routers (4 indoor):** `Switch 2 Power` (`living_room`), `Desk Lamp` (`office`), `Ryan's Lamp` (`bedroom`), `Emily's Lamp` (`bedroom`).
- **No-Neutral Switches (`ZBMINIL2`) Are `EndDevice` Only:** Both `Deck Lights 2` (`backyard`) and `Entry lights` are Sonoff `ZBMINIL2` no-neutral switches — they operate as `EndDevice` nodes and do **NOT** repeat Zigbee traffic.
- **Backyard / Hillside Mesh Bottleneck & Plan (2026-10-14):**
  - `Outdoor smart plug` (`3RSP02064Z`, `backyard`) dropped offline on `2026-10-10 07:07 AM PT` (`LQI = 0` back to `Switch 2 Power` / `Emily's Lamp` due to zero Zigbee routers in the kitchen/back of house).
  - `Kitchen Door Sensor` (`lumi.sensor_magnet.aq2`) was routing through `Outdoor smart plug` (`Child`, `LQI 70`) and dropped offline `2026-10-12 12:21 PM PT`.
  - Ryan is ordering a **Sonoff `ZBDongle-P` / `ZBDongle-E`** to flash with Zigbee Router firmware and plug into a `5V / 1A` USB wall wart at the back of the house to blast `+20 dBm` (`5 dBi` antenna) up the hill to the `Outdoor smart plug` and 3 backyard soil sensors.
- **Offline Water Leak Sensors (4 of 6; require physical top-button press + `zha.permit` or `CR2032` battery swap):**
  - `Clothes Washer Leak Sensor` (`lumi.sensor_wleak.aq1`) — last radio contact `2026-08-03 02:31 PM PT`
  - `Bedroom Sink Leak Sensor` (`lumi.sensor_wleak.aq1`) — last radio contact `2026-08-04 02:06 AM PT`
  - `Kids Bathroom Leak Sensor` (`lumi.sensor_wleak.aq1`) — last radio contact `2026-08-19 11:35 AM PT`
  - `Fridge Leak Sensor` (`lumi.sensor_wleak.aq1`) — last radio contact `2026-09-10 08:39 AM PT`
  - *(Online leak sensors: `Kitchen Sink Leak Sensor` and `Office Leak Sensor`).*
- **Offline Garden Soil Moisture Sensors (`3RSM0147Z` — all 3 offline):**
  - `Soil sensor - blueberries` — last radio contact `2026-06-07 05:39 PM PT`
  - `Soil sensor - white beds` — last radio contact `2026-09-10 05:10 PM PT`
  - `Soil sensor - deck beds` — last radio contact `2026-09-10 05:12 PM PT`
  - *(Note: `Irrigation Brains` ESPHome valve switches `hill_left`, `hill_right`, and `deck_soaker` are all online).*
- **Other Offline Contact Sensors:**
  - `Front door sensor` (`lumi.sensor_magnet.aq2`) — last radio contact `2026-06-18 06:50 PM PT`
  - `Mailbox door sensor` (`lumi.sensor_magnet.aq2`) — last radio contact `2026-10-01 12:14 PM PT`

**Entity Cleanup Completed (2026-10-14):**
- Disabled 14 Aqara chip-die `*_device_temperature` entities, 4 duplicate smart-plug `*_instantaneous_demand` entities, 3 `*_ac_frequency` entities, 6 orphaned non-`_2` NUT UPS entities (`sensor.ups_*`), and `binary_sensor.outdoor_smart_plug_opening`.
- **Explicitly Kept Enabled:** All 22 Enphase individual solar micro-inverter entities (`sensor.inverter_542538*`) per Ryan's directive.

**IKEA button behavior:** IKEA ZHA buttons send `move` command on long-press (hold) instead of `off`. A short press sends `off`. Prefer `mode: restart` on lamp toggle automations.

**Aqara front door quirk:** `binary_sensor.lumi_lumi_sensor_magnet_aq2_opening` replays its last known state on every Zigbee reconnect. Door automations using this sensor need a `for: "00:00:02"` guard to suppress sub-2-second reconnect events.
