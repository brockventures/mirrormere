---
name: Dynamic Channel Worker Lifecycle Architecture
description: "The `agy` CLI process terminates immediately upon turn completion with no warm worker pool or idle g"
category: scar
source: scar_dynamic_channel_worker_lifecycle_archite.md
updated: 2026-09-04
---

The `agy` CLI process terminates immediately upon turn completion with no warm worker pool or idle grace period for dynamic channels. Only the three dedicated channels maintain persistent process state, while dynamic channels execute as strictly ephemeral per-turn workers.
