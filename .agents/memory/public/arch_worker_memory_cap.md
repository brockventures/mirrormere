---
name: arch_worker_memory_cap
description: "Specification and operational limits for worker subprocess memory caps (2 GiB / 2048 MiB)"
metadata:
  type: architecture
  updated: 2026-08-31
  status: active
---

# Worker Memory Cap Calibration & Resource Isolation

## 1. Overview
Worker subprocesses and background execution jobs (CLI runs, sidecars, data aggregators, and analysis scrapers) operate under an explicit memory ceiling to protect host stability without causing premature process terminations.

## 2. Resource Limit Calibration
* **Configured Cap:** `2048 MiB` (2 GiB) per worker subprocess.
* **Configuration Key:** `worker_memory_cap_mb: 2048` in `/workspace/config/runtime_rules.json`.
* **Host Baseline:** Host 2 (`.84`) maintains ~8 GiB total system RAM (~5.5 GiB available when idle).

## 3. Forensic Rationale (Why 512 MiB Failed)
* **Pymalloc & Glibc Arenas:** Python runtimes allocate memory in memory arenas and do not immediately return fragmented heap allocations to the OS kernel.
* **Transient Bursts:** Large JSON deserialization (e.g., 50MB+ takeouts, multi-megabyte log scans, and SQLite WAL syncs) and regex compilation create transient RSS spikes of 400–900 MiB before GC reclamation.
* **2 GiB Headroom:** 2 GiB provides sufficient headroom for intensive data aggregation tasks (e.g., `openmessage` database queries, Drive inventories, Sheet exports) while guaranteeing that a single runaway or leaking subprocess cannot starve the host OS or trigger system-wide kernel panics.
