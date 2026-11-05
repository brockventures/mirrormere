---
name: Home Assistant Door Unlock Debounce Fix
description: "Resolved GPS drift and WiFi departure jitter in Home Assistant door unlocking by implementing a 2-mi"
category: scar
source: scar_home_assistant_door_unlock_debounce_fix.md
updated: 2026-09-04
---

Resolved GPS drift and WiFi departure jitter in Home Assistant door unlocking by implementing a 2-minute debounce delay on `automation.ryan_left_home_wifi` and adding state duration checks (`(now() - trigger.from_state.last_changed).total_seconds() >= 120`) to prevent rapid false-positive arrival triggers. Documented post-mortem and verified deployment on NasHost-01.
