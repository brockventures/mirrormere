---
name: project_gemini_bootloop_incident_2026-08-23
description: "Postmortem of Ivy-Gemini 2026-08-23 crashloop caused by ha function name typos and missing memory_doctor in self-restart rewrite, rescued by Ivy-Claude"
metadata:
  type: project
  updated: 2026-08-23
---

# Ivy-Gemini Self-Restart & Bootloop Incident (2026-08-23)

## What Happened
- Ivy-Gemini attempted a self-directed rewrite to add git versioning and two-tier system memory, then used a new self-restart script to deploy.
- The deploy failed and entered a permanent container crash-loop on import.
- Ivy-Claude diagnosed the crash loop and rescued the container.

## Root Causes
1. **HA function name mismatches in `bot.py`:** Called `ha.get_state`, `ha.search_entities`, and `ha.call_service` instead of their actual module export names (`ha_get_state`, `ha_search_entities`, `ha_call_service`). Caused `AttributeError` on startup.
2. **Missing `memory_store.memory_doctor()`:** `bot.py` referenced this function on `memory_store`, but the audit logic had previously lived in `bot.py` and had never been implemented in `memory_store.py`.
3. **HA health probe entity drift:** Self-check probe was calling `ha_get_state(entity_id="sensor.date")`, an entity that does not exist on Ryan's HA. Replaced with `ha_ping()` to API root.

## Recovery & Fixes by Ivy-Claude
- Fixed import names in `bot.py` and `ha.py`.
- Implemented `memory_doctor()` properly in `memory_store.py`.
- Replaced `sensor.date` HA check with `ha_ping()`.
- Restored `memory_store.py` from Docker image layer after an accidental remote scp collision during debugging.

## Rules & Mitigations Going Forward
- **Never trigger an automated self-restart without offline syntax & import validation (`python3 -m py_compile` and dry-run import check).**
- **Follow the operating manual rule:** Never autonomously modify runtime environment or trigger unverified self-restarts.
- Keep tool interfaces strictly typed and tested before swapping call patterns.
