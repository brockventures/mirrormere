---
name: Incident: Kia EV9 Mid-Drive Remote Climate Stop Near-Miss
description: "Forensic analysis of stale lock state causing remote climate stop command to fire while vehicle was in motion"
category: incident
source: incident_ev9_mid_drive_climate_bug_2026-08.md
updated: 2026-09-04
---

# Incident Post-Mortem: Kia EV9 Mid-Drive Stop Command Near-Miss (2026-08-17)

## Summary
On 2026-08-17, Ryan entered his EV9 earlier than normal (at 08:05 PT) and began driving. The automation's T+5 stop-climate step fired because `lock.my_ev9_door_lock` still read `locked` in cached cloud state.

## Remediation
* Added multi-factor safety guard: stop-climate requires `lock == locked` AND `binary_sensor.my_ev9_engine == "off"` AND `device_tracker.my_ev9_location == "home"`.
* Moved pre-cool trigger from 08:00 to 07:55 AM PT.
