---
name: Nest Doorbell Snapshot Race Fix
description: "Home Assistant's `google_nest_sdm` integration had a race condition where `event.doorbell_chime` tri"
category: scar
source: scar_nest_doorbell_snapshot_race_fix.md
updated: 2026-10-28
---

Home Assistant's `google_nest_sdm` integration had a race condition where `event.doorbell_chime` triggered automations before the snapshot finished downloading to `/config/.cache/nest/event_media/`, serving stale captures. Replaced the static 5-second buffer with dynamic 150ms cache polling upon event dispatch to reliably serve new doorbell chime snapshots with minimal latency.
