---
name: Upstairs ESPHome BLE RF Brownout
description: "ESP32 SCD41 sensor disconnects in upstairs bedrooms were traced to a compounding RF and power failur"
category: scar
source: scar_upstairs_esphome_ble_rf_brownout.md
updated: 2026-10-18
---

ESP32 SCD41 sensor disconnects in upstairs bedrooms were traced to a compounding RF and power failure: marginal Wi-Fi signal (-78 dBm) causing AP drops during DHCP handshakes when BLE scanning toggles channels, combined with weak wall-wart voltage brownouts during radio spin-up. Flashing on clean PC power confirmed hardware wiring health. Migrating to the dedicated IoT Wi-Fi network and stabilizing power supply resolved the connectivity drops.
