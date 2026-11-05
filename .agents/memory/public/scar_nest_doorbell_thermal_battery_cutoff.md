---
name: Nest Doorbell Thermal Battery Cutoff
description: "Nest Doorbell (Battery) firmware cuts off charging above ~104°F to protect lithium cells, causing ba"
category: scar
source: scar_nest_doorbell_thermal_battery_cutoff.md
updated: 2026-09-12
---

Nest Doorbell (Battery) firmware cuts off charging above ~104°F to protect lithium cells, causing battery drain down to 0% during heatwaves despite valid 24V AC wiring. Once dropped to true zero, the low-voltage trickle circuit cannot provide sufficient peak boot wattage, requiring manual dismount and high-current USB-C charging to revive.
