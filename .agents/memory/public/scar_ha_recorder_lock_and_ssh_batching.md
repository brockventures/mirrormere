---
name: HA Recorder Lock and SSH Batching
description: "Sequential SSH roundtrips and unindexed `SELECT` queries on `home-assistant_v2.db` caused multi-minu"
category: scar
source: scar_ha_recorder_lock_and_ssh_batching.md
updated: 2026-10-18
---

Sequential SSH roundtrips and unindexed `SELECT` queries on `home-assistant_v2.db` caused multi-minute turn latency despite low thinking mode. This established a permanent rule in `tool_roundtrip_minimization.md` and deterministic enforcement in `batch_guard.py` requiring bound indexed timestamps on HA SQLite queries and single-shot SSH batching.
