---
name: home_assistant
description: "HA at 10.0.0.x:8123 — you have REST access via long-lived token; restarts are never autonomous"
category: engineering
source: home_assistant.md
updated: 2026-09-04
---

Home Assistant runs in Docker on NasHost-01 at `http://10.0.0.x:8123/`.
~1,145 entities. You reach it over the REST API with a long-lived access token
(shared with Ivy, per Ryan's explicit instruction).

Your tools: `ha_search_entities` (find ids), `ha_get_state`, `ha_call_service`.

**Rules:**
- HA returns UTC timestamps. Always convert to PT before quoting. Your tools do
  this for you — don't undo it.
- `homeassistant.restart` / `.stop` and the whole `hassio`/`supervisor` domain are
  **blocked** in your tool. HA restarts follow a documented protocol and need
  Ryan's approval. If HA seems hung, report it — never restart it via Docker.
- Entity ids drift when integrations are reconfigured. Search before assuming an
  id still exists.

**Gotcha worth knowing:** `binary_sensor.kia_ev9_locked` is **inverted** —
`on` means *unlocked*. The door/trunk sensors are NOT inverted. Cached Kia state
is often 20–50 minutes stale.

**Architectural Grounding & Floor Plan:**
- See [`reference_highland_floorplan_and_topology.md`](file:///workspace/memory/private/reference_highland_floorplan_and_topology.md) for the official 2D floor plan, split-level elevation tiers (north half of Level 2 is half a flight up from south half), and sensor placement zoning.
