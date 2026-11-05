---
name: Post-Offload Lock Exemption for Probes
description: "Discovered and patched a deadlock collision between `batch_guard.py`'s post-offload turn lock and in"
category: scar
source: scar_post_offload_lock_exemption_for_probes.md
updated: 2026-10-26
---

Discovered and patched a deadlock collision between `batch_guard.py`'s post-offload turn lock and inline `--no-synthesize` probes launched during background tasks. Inline calibration commands and short probe failures (<25s) with `--no-synthesize` must be exempted from turn-locking in `batch_guard.py` and `forge.py` to prevent halting multi-step recovery scripts and cross-agent wakeup routines.
