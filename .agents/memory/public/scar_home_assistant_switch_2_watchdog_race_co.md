---
name: Home Assistant Switch 2 Watchdog Race Condition
description: "A race condition between the Switch 2 sleep event and a 5-minute cleanup watchdog prematurely cleare"
category: scar
source: scar_home_assistant_switch_2_watchdog_race_co.md
updated: 2026-10-10
---

A race condition between the Switch 2 sleep event and a 5-minute cleanup watchdog prematurely cleared `input_boolean.switch_2_on`, preventing TV shutdown automation from triggering. The issue was resolved by adding a 30-second `last_changed` grace window to `automation.switch_disconnected` to ensure shutdown commands execute reliably even if the boolean state is reset concurrently.
