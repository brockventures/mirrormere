---
name: project-ha-kids-curtain-routines
description: "Morning/evening HA curtain automations for Isaac's and Rosie's rooms — structure and a 2026-07-05 failure"
category: engineering
source: project_ha_kids_curtain_routines.md
updated: 2026-09-04
---

Entities: `cover.curtain_3_64` (Isaac's Curtains), `cover.curtain_3_31` (Rosie's Curtains) — Zigbee/Aqara-style curtain motors (numeric IDs, `binary_sensor.curtain_3_64_problem` / `_31_problem` are their config-status sensors).

Two separate morning automations both target these, plus Living Room/Bedroom blinds:
- **Wakeup 1** (`automation.wakeup_1`, alias "Wakeup 1", fires 6:45 AM daily) — its action steps that open Isaac's and Rosie's curtains are explicitly **disabled** in the automation config (`enabled: false` on those two device-automation steps). Unknown whether intentional (avoid waking kids at 6:45 AM) or a leftover mistake — not changed as of 2026-07-05, needs Ryan's call.
- **Wakeup 2** (`automation.sunrise`, alias "Wakeup 2", fires 7 AM weekdays / 8 AM weekends) — this one has both kids' curtain-open actions enabled and is the "real" opener for their rooms.
- **Sunset** (`automation.sunset`, fires ~sunset or 7 PM fallback) — closes all covers including both kids' curtains; every action step has `continue_on_error: true`.

**2026-07-05 incident:** Wakeup 2 (8 AM Sunday trigger) aborted mid-script: its first action (Living Room Blinds, a Samsung SmartThings-integrated device) threw `pysmartthings.exceptions.SmartThingsConnectionError: Timeout occurred while connecting to SmartThings` at 8:00:10 AM PT. HA automations without `continue_on_error` halt the whole script on an unhandled action error, so both kids' curtain-open actions (later in the sequence) never ran. Confirmed via `/mnt/NasHost-01/homeassistant/config/home-assistant.log` — this SmartThings timeout is rare (1 prior occurrence in 5 days of logs, 2026-07-02), not chronic. Sunset (evening) ran clean the same day — it has `continue_on_error: true` on every step, which is exactly why one bad device didn't block the rest.

**Fix applied 2026-07-05 (~10:31 PM PT):** Ryan approved adding `continue_on_error: true` to every action step in both Wakeup 1 and Wakeup 2 (32 steps total), matching Sunset's pattern. Edited `/mnt/NasHost-01/homeassistant/config/automations.yaml` directly (backed up first as `automations.yaml.bak_20260705_222951`), validated YAML with `python3 -c "import yaml; yaml.safe_load(...)"`, then reloaded via `POST /api/services/automation/reload` (no HA restart needed). Confirmed both automations back to `on` post-reload. This closes the gap — no longer needs Ryan's call on the disabled Wakeup 1 curtain steps to matter for reliability, though that separate question (intentional vs. leftover) is still open.

**2026-09-03 incident:** At 03:25 AM PT, a transient LAN DNS drop knocked the SmartThings integration into `setup_error`. At 07:00:00 AM PT, Wakeup 2 triggered; because `continue_on_error: true` was in place from the 07-05 fix, the unavailable blinds (`cover.bedroom_blinds`, `cover.living_room_blinds_*`) were skipped with a warning and Isaac's/Rosie's curtains opened normally. SmartThings config entry (`01KGD8NHE1JY2HK4V62QJTVSCE`) was reloaded via HA API at 07:31 AM PT to restore communication.

**Watchdog deployed 2026-09-03:** Deployed `automation.watchdog_auto_recover_smartthings_blinds` (`smartthings_blinds_watchdog`). Triggers if bedroom or living room blinds stay `unavailable` for 5 minutes, plus a 06:40 AM PT pre-flight canary before morning routines. Calls `homeassistant.reload_config_entry` on the SmartThings entry with a 15-minute cooldown (`mode: single` + delay) to self-heal without infinite retry loops during real outages. Bridges the gap until direct Z-Wave JS migration ([[project_zwave_smartthings_replacement]]).

**Bedroom blinds temporarily disabled 2026-09-03 (~08:17 AM PT):** Per Ryan's request, disabled the bedroom blinds steps (`enabled: false`) in both morning and evening automations:
- `automation.sunrise` (Wakeup 2): action index 2 (`type: open` for `cover.bedroom_blinds`) set to `enabled: false`. (In Wakeup 1, action 2 was already disabled).
- `automation.sunset` (Sunset): action index 12 (`type: close` for `cover.bedroom_blinds`) set to `enabled: false`.
All other actions (living room blinds, kids' curtains, lights, switches) remain enabled and untouched. Backups of pre-edit configs saved in scratch directory.

**Bedside lamps auto-on disabled in Sunset 2026-09-03 (~09:23 AM PT):** Per Ryan's request (tackling newborn sleep disturbance #1), disabled the bedside lamps auto-turn-on steps (`enabled: false`) in `automation.sunset` (ID `1763093532229`):
- Action index 13: `switch.ryan_s_lamp` (`8260f43355be57799196f81b3088cc38`) set to `enabled: false`.
- Action index 14: `switch.emily_s_lamp` (`69562194a92e0fc19caf1392854db754`) set to `enabled: false`.
All other Sunset actions (living room blinds, kids' curtains, main lights) remain active. Lamps are now strictly controlled manually from bedside or buttons. Backup saved in scratch directory.

**How to look this up again:** entity registry (device_id/entity_id UUIDs used inside automation configs) lives at `/mnt/NasHost-01/homeassistant/config/.storage/core.entity_registry` — resolve UUIDs from an automation's `actions` list against this file's `data.entities[].id`. Automation YAML configs are fetchable live via `GET /api/config/automation/config/<numeric id>` (the `id` attribute from `/api/states/automation.X`, not the entity_id slug). Full HA log at `/mnt/NasHost-01/homeassistant/config/home-assistant.log` (+ `.log.1`) via the same NAS mount — no separate SSH needed for read-only log/config inspection.
