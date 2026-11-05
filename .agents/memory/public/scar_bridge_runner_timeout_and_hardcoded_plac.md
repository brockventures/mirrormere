---
name: Bridge Runner Timeout and Hardcoded Placeholder
description: "The bridge runner terminated turn PID 19273 with exit code -9 (SIGKILL) after tripping the `ProcessR"
category: scar
source: scar_bridge_runner_timeout_and_hardcoded_plac.md
updated: 2026-09-22
---

The bridge runner terminated turn PID 19273 with exit code -9 (SIGKILL) after tripping the `ProcessReaper` 10-minute (608s) hard watchdog ceiling during investigation. Root cause analysis also revealed hardcoded status broadcast placeholders directly embedded in `tools/bridge_scheduler.py` (line 208) for the Nightly NAS Log Review.
