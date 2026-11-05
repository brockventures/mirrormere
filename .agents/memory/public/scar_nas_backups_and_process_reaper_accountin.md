---
name: NAS Backups and Process Reaper Accounting
description: "Resolved multi-host NAS backup targeting across `.82` and `.84` via dynamic resolver `tools/nas_conf"
category: scar
source: scar_nas_backups_and_process_reaper_accountin.md
updated: 2026-09-21
---

Resolved multi-host NAS backup targeting across `.82` and `.84` via dynamic resolver `tools/nas_config.py`. Enhanced sidecar process watchdog accounting using `/proc/<pid>/stat` cumulative CPU jiffies (`utime + stime + cutime + cstime`) to prevent killing active computing jobs while reliably reaping STDIN deadlocks.
