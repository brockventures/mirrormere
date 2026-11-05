---
name: project_ha_unlock_blip_fix
description: "HA front door unlock blip fix — GPS geofence drift triggered false unlocks; fixed with WiFi-based boolean guards"
category: engineering
source: project_ha_unlock_blip_fix.md
updated: 2026-09-03
---

GPS geofence blip at 2:14/2:21 AM PT on Jun 14 caused phone to briefly "leave" then "return" home, triggering `automation.unlock_door`. Fixed with a boolean guard pattern.

**What was built:**
- `input_boolean.ryan_truly_left` — set by WiFi disconnect from SciWiFi, cleared by unlock firing (not by WiFi reconnect)
- `input_boolean.emily_truly_left` — same pattern for Emily's Pixel 9 Pro (`device_tracker.pixel_9_pro`)
- `automation.ryan_left_home_wifi` — trigger: `sensor.rqb_10_pro_xl_wi_fi_connection` leaves SciWiFi → set boolean ON
- `automation.emily_left_home_wifi` — trigger: `sensor.pixel_9_pro_wi_fi_connection` leaves SciWiFi → set boolean ON (sensor not yet enabled by Emily as of Jun 14)
- `automation.unlock_door` — updated: Ryan's trigger (device_id `4ca6c7577dea074e80609db33a47c9c8`) requires `ryan_truly_left == on`; Emily's trigger (`f689b9b8eabe0e1d6cca1e908dd9be6c`) requires `emily_truly_left == on`; attempts to clear boolean after firing but `trigger.device_id` template check in actions is unreliable — **do not rely on this to clear the boolean**
- `automation.ryan_returned_home_wifi` — added Jun 20: trigger: `sensor.rqb_10_pro_xl_wi_fi_connection` changes TO SciWiFi → turns `ryan_truly_left` OFF. This is the reliable clear path.

**Why:** GPS blips don't drop WiFi, so if WiFi never left SciWiFi, the departure was fake → skip unlock. The symmetric WiFi-reconnect automation ensures the boolean always clears on real return.

**Known bug (Jun 20):** `trigger.device_id` template inside `unlock_door` action conditionals silently fails — boolean wasn't being cleared on GPS arrival. Fixed by adding WiFi-return automation instead.

**Departure Jitter Fix (Sep 02, 2026):**
- **Symptom:** On departure, phone dropped WiFi, turning `ryan_truly_left` ON immediately. GPS boundary jitter 20-30s later caused a brief `not_home` -> `home` flicker, prematurely unlocking the door and consuming `ryan_truly_left` back to OFF. When Ryan actually returned home later, the door stayed locked because `ryan_truly_left` was OFF.
- **Fix Deployed:**
  1. `automation.ryan_left_home_wifi`: Debounced by requiring WiFi != `SciWiFi` `for: minutes: 2` (or `device_tracker` `not_home` `for: minutes: 3`).
  2. `automation.unlock_door`: Added duration condition requiring `trigger.from_state` (`not_home`) to have lasted `>= 120` seconds: `(now() - trigger.from_state.last_changed).total_seconds() >= 120`. Any quick GPS bounce (< 2m) is rejected without unlocking or consuming the boolean.

**How to apply:** Emily needs to enable WiFi Connection sensor in HA companion app for her half to work. If `ryan_truly_left` gets stuck ON, WiFi reconnect to SciWiFi will now auto-clear it. If unlock stops working for real arrivals, check boolean state first.
