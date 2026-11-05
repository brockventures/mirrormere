---
name: Schedule Atomic Save Concurrency Race
description: "Concurrent sidecar and scheduler processes racing on a fixed `/workspace/data/schedule.tmp` path cau"
category: scar
source: scar_schedule_atomic_save_concurrency_race.md
updated: 2026-10-24
---

Concurrent sidecar and scheduler processes racing on a fixed `/workspace/data/schedule.tmp` path caused file replacement conflicts during `save_schedule()` in `scheduler_tool.py`. Atomic temporary writes must use PID- or UUID-unique temporary filenames (or process locks) to avoid collisions under millisecond-level concurrent writes.
