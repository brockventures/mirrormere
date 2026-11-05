---
name: Washer Automation Debounce Calibration
description: "The washing machine automation requires a carefully calibrated debounce window to account for mid-cy"
category: scar
source: scar_washer_automation_debounce_calibration.md
updated: 2026-10-13
---

The washing machine automation requires a carefully calibrated debounce window to account for mid-cycle power drops, such as the rinse soak dipping to ~91.5W against a 102W threshold. While longer debounce windows prevent premature "cycle finished" alerts during soak stages, they directly trade off notification latency for Ryan.
