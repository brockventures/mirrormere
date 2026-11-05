---
name: Incident: Kia EV9 Lock Sensor Inversion & Door-Open Safety Gate
description: "Diagnosis of semantically inverted binary_sensor.kia_ev9_locked and deployment of 5-minute door-open safety gate"
category: incident
source: incident_ev9_lock_inversion_and_door_gate_2026-08.md
updated: 2026-09-04
---

# Incident Post-Mortem: Kia EV9 Lock Sensor Inversion & Door-Open Safety Gate (2026-08-23)

## Summary
1. **Sensor Inversion:** `binary_sensor.kia_ev9_locked` carried `device_class: lock` where HA defines `on = unlocked` and `off = locked`. The automation was checking `== 'off'`, meaning it only ran when the car was ALREADY locked.
2. **Door Gate Implementation:** Implemented a 5-minute repeat loop checking all 4 doors and trunk with `force_refresh` before locking.

## Remediation
* Switched all automations to read `lock.my_ev9_door_lock` exclusively.
* Made notifications strictly failure-only.
