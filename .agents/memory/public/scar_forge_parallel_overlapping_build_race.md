---
name: Forge Parallel Overlapping Build Race
description: "A concurrency bug in `tools/forge.py` caused `maybe_spawn_next_build_worker()` to launch overlapping"
category: scar
source: scar_forge_parallel_overlapping_build_race.md
updated: 2026-10-27
---

A concurrency bug in `tools/forge.py` caused `maybe_spawn_next_build_worker()` to launch overlapping builds in parallel rather than serializing them FIFO when queued with `--allow-overlap`. This resulted in race conditions on identical modified files across active build workers.
