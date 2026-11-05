---
name: VictoriaMetrics Grid & iCal Concurrency Fixes
description: "VictoriaMetrics uniform step sampling in `ha_anomaly_detector.py` collapsed dynamic overdue threshol"
category: scar
source: scar_victoriametrics_grid_ical_concurrency_fi.md
updated: 2026-10-19
---

VictoriaMetrics uniform step sampling in `ha_anomaly_detector.py` collapsed dynamic overdue thresholds by evaluating scrape intervals instead of state changes. Concurrently, `ical-bridge` on Host 2 was patched with per-key request coalescing locks and a reduced 6-second upstream timeout to prevent cascading timeouts in `hearth-core`.
