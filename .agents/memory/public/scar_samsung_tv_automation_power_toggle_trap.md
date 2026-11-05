---
name: Samsung TV Automation Power Toggle Trap
description: "Samsung TV automations must not use KEY_POWER; Switch 2 power automations set to 6.5W threshold"
category: scar
source: scar_samsung_tv_automation_power_toggle_trap.md
updated: 2026-10-09
---

Samsung TV automations must not use  as a power-on command because it acts as a toggle, inadvertently turning the TV off if state polling lags. Additionally, Switch 2 power automations use a trigger threshold of 6.5W (un-debounced) to capture the idle home menu / lock screen state (which draws ~6.5W–6.6W), while remaining above routine baseline sleep (0.3W–4.2W). Note that docked background trickle-charge pulses can occasionally reach 6.0W–7.8W for ~15–20s.
