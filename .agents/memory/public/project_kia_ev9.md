---
name: Kia EV9 — Active Integration & Automation Spec
description: "Active configuration, entity mappings, and live operational automations for Ryan's Kia EV9"
category: project
source: project_kia_ev9.md
updated: 2026-09-04
---

# Kia EV9 Active Integration & Automation Spec

Ryan drives a Kia EV9 integrated with Home Assistant via the `kia_uvo` custom integration (v3.10.0, `hyundai_kia_connect_api==4.26.1`).

## 🚘 Live Automations

### 1. Weekday Morning Cabin Pre-Cool (`automation.kia_ev9_weekday_morning_climate`)
* **Trigger:** Weekdays at **07:55 AM PT**.
* **Thresholds:** Current temperature (`sensor.openweathermap_temperature`):
  * **Heat:** `< 50°F` (engages heating + steering wheel heater `steering_wheel: 2`).
  * **AC:** `> 59°F` (engages AC compressor + battery pre-conditioning).
* **Stop Guard (T+10 min):** Calls `kia_uvo.stop_climate` at T+10m **ONLY IF**:
  `lock.my_ev9_door_lock == "locked"` AND `binary_sensor.my_ev9_engine == "off"` AND `device_tracker.my_ev9_location == "home"`.
  *(If Ryan drives away before T+10, the call safely no-ops and the car's native 10m cap terminates climate).*

### 2. Auto-Lock on Android Auto Disconnect (`automation.lock_ev9_on_android_auto_disconnect`)
* **Trigger:** Android Auto disconnects on arrival home.
* **Door-Open Safety Gate:** Presses `button.kia_ev9_force_refresh` and delays 45s.
  * If any door/trunk is open (`binary_sensor.my_ev9_front_left_door`, etc.), repeats check up to 5 minutes (5 refreshes).
  * If still open after 5 min: sends notification `EV9 NOT Locked - Door Open` and aborts (does not lock).
* **Lock Execution:** Locks via `lock.my_ev9_door_lock`, force-refreshes, verifies, and retries once if still unlocked.
* **Notifications:** Strictly **failure-only** (`EV9 Lock FAILED` or `EV9 Lock UNVERIFIED`). Completely silent on success.

### 3. Nightly Safety Net Lock (`automation.lock_ev9_at_11_pm`)
* **Trigger:** Daily at 23:00 PT. If `lock.my_ev9_door_lock == "unlocked"`, triggers lock sequence.

## ⚠️ Critical Operational Invariants & Pitfalls

* **Lock Entity Inversion Footgun:** ALWAYS use `lock.my_ev9_door_lock` (`locked`/`unlocked`). NEVER reference `binary_sensor.kia_ev9_locked` (its `device_class: lock` is semantically inverted: `on` = unlocked, `off` = locked).
* **Door Sensors:** Door/trunk sensors (`device_class: door`) read normally (`on` = open, `off` = closed). Hood is excluded from auto-lock gating.
* **Telematics Staleness:** Cached `kia_uvo` sensor data is routinely 20–50 min stale when parked. Any automation requiring real-time physical car status MUST press `button.kia_ev9_force_refresh` and wait ~45s first.
* **Normal Battery Drain Baseline:** Normal parked HV drain is ~1% per 21h stationary. Telematics polling (`scan_interval: 30m`, reads cached cloud data) does not wake the vehicle or drain the 12V battery.

## 📚 Historical Incident Post-Mortems
* `incident_ev9_lock_inversion_and_door_gate_2026-08.md`
* `incident_ev9_mid_drive_climate_bug_2026-08.md`
* `incident_ev9_otp_reauth_outage_2026-08.md`
* `incident_ev9_precool_stop_bug_2026-08.md`
