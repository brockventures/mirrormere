---
name: Ivy Runtime Hybrid Grounding Overhaul
description: "Shipped major architectural overhaul to Ivy (`brockventures/ivy-agent` commit `6bc14cb`) on Host 2, "
category: scar
source: scar_ivy_runtime_hybrid_grounding_overhaul.md
updated: 2026-10-02
---

Shipped major architectural overhaul to Ivy (`brockventures/ivy-agent` commit `6bc14cb`) on Host 2, establishing Turn 0 hybrid pre-grounding in `tools/ivy_daemon.py`. Implemented nightly context hygiene at 02:00 PT with daily daemon session rollover, step pruning, and SQLite `VACUUM` on `transcript_index.db`, alongside native background scheduling in `bridge_scheduler.py`.
