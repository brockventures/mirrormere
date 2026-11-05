---
name: Switch 2 HDMI-CEC Wake Collision
description: "When the Switch 2 sleeps, HA's 23s power-off polling timeout trips Chromecast change source, waking the TV via HDMI-CEC"
category: scar
updated: 2026-10-10
---

When the Switch 2 sleeps (<5W for 5s), `automation.switch_disconnected` powers down the Samsung S95B via WebSocket. Home Assistant's `samsungtv` integration holds a synthetic `power_off_in_progress` state for 23 seconds (`DEFAULT_SCAN_INTERVAL + 5s`). Because the S95B Wi-Fi/Tizen stack remains responsive in low-power standby, expiring that 23s window causes HA to report the TV transitioning from `off` to `on`. 

If `automation.chromecast_change_source` triggers unconstrained on TV `on` events when Switch 2 power is <5W, it immediately blasts Broadlink IR to switch the HDMI matrix to Chromecast, which fires an HDMI-CEC `Active Source` wake packet that turns the TV panel back on.

To prevent this power loop:
1. `automation.chromecast_change_source` must be guarded with conditions ensuring `switch_disconnected` and `input_boolean.switch_2_on` have not changed within 120 seconds.
2. `automation.switch_disconnected` must include the Broadlink discrete IR `POWER_OFF` command (`b64:JgBGAJOVEDoQOhA6DxYPFhAVEBUQFRA6ETkROREUERQRFBEUEBUQFREUERQRORE5EBUQFRE5ETkRORE5ERUQFRA6DzsPFhAADQUAAA==`) in addition to WebSocket turn-off to ensure the physical display panel shuts down cleanly.
