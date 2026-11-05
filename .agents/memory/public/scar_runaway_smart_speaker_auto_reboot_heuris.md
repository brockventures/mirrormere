---
name: Runaway Smart Speaker Auto-Reboot Heuristic
description: "Implemented automated self-healing in `/workspace/tools/ha_anomaly_detector.py` for runaway smart sp"
category: scar
source: scar_runaway_smart_speaker_auto_reboot_heuris.md
updated: 2026-10-20
---

Implemented automated self-healing in `/workspace/tools/ha_anomaly_detector.py` for runaway smart speakers exceeding a 20 GB/day threshold with active traffic in trailing 3 hours. The remediation sequence triggers a local Google Cast `/setup/reboot` and UniFi station reconnect to remediate bandwidth leaks.
