---
name: Ivy Modal Harness Offloading Threshold
description: "Offloading small grid sweeps (<=64 combos) to Modal introduces 10x-40x latency overhead compared to "
category: scar
source: scar_ivy_modal_harness_offloading_threshold.md
updated: 2026-10-14
---

Offloading small grid sweeps (<=64 combos) to Modal introduces 10x-40x latency overhead compared to running locally on Host 2's Ryzen cores. A hybrid threshold is established in `modal_harness.py`: run lightweight sweeps (<=64 combos) locally, reserving Modal cloud compute for heavy 5-fold cross-validation and massive combo sweeps to prevent NAS memory thrashing.
