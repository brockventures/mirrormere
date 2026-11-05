---
name: Batch Guard Per Turn Reset
description: "Cross-turn state bleed in `batch_guard.py` accumulated execution counts across user messages, artifi"
category: scar
source: scar_batch_guard_per_turn_reset.md
updated: 2026-10-26
---

Cross-turn state bleed in `batch_guard.py` accumulated execution counts across user messages, artificially throttling commands and causing multi-minute turn latency. The root cause was resolved by tracking inbound turn identifiers via `/workspace/data/in_flight_turn.json` to reset turn state per message, alongside avoiding nested quote collisions during remote SSH `docker exec` commands.
