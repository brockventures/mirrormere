---
name: Ivy Compaction Ceilings & Container Threading Fixes
description: "Auditing transcript sizes revealed that a 150-step / 350 KB compaction threshold wipes Ivy's modelin"
category: scar
source: scar_ivy_compaction_ceilings_container_thread.md
updated: 2026-10-14
---

Auditing transcript sizes revealed that a 150-step / 350 KB compaction threshold wipes Ivy's modeling context in 1-2 turns, requiring calibrated container compaction limits. Fixed CPU contention and container startup bugs by capping OpenMP/BLAS thread concurrency (`OMP_NUM_THREADS=2`) in `docker-compose.yml` and repairing array splitting in Ivy's `entrypoint.sh`.
