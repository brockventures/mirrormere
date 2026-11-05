---
name: Incident: Kia EV9 Pre-Cool Stop Bug & Delay Diagnosis
description: "Forensic post-mortem of concurrent template switch conflict and 60s timing drift in EV9 pre-cool automation"
category: incident
source: incident_ev9_precool_stop_bug_2026-08.md
updated: 2026-09-04
---

# Incident Post-Mortem: Kia EV9 Pre-Cool Stop Bug (2026-08-03/04)

## Root Causes Identified
1. **Timing Drift:** A 60s delay baked into the template switch wrapper pushed the automation's stop attempt to ~61s after the car's native 10-minute session had already expired (error 1140).
2. **Concurrent Coordinator Action:** The stop sequence targeted both `switch.ev9_heat` and `switch.ev9_air_conditioning` simultaneously; `kia_uvo` coordinator rejected the second action.

## Remediation Applied
* Replaced template switch calls with direct `kia_uvo.start_climate` and `kia_uvo.stop_climate` service calls.
* Thresholds configured to current temperature: Heat `< 50°F`, AC `> 59°F`.
* Verified clean reload via `automation.reload`.
