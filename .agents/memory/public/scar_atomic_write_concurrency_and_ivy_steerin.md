---
name: Atomic Write Concurrency and Ivy Steering Scars
description: "Fixed a concurrency race in `_atomic_write_json` on Host 2 caused by simultaneous sidecar thread wri"
category: scar
source: scar_atomic_write_concurrency_and_ivy_steerin.md
updated: 2026-10-04
---

Fixed a concurrency race in `_atomic_write_json` on Host 2 caused by simultaneous sidecar thread writes. Identified that `[IvyDaemon]` turn errors (status: ERROR) are expected artifacts of mid-turn steering via `SIGINT` interruption rather than true daemon crashes.
