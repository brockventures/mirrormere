---
name: Bridge Reload Startup Message Swallowing
description: "An in-place `!reload` replaces the Python process image via `os.execv` without resetting the Docker "
category: scar
source: scar_bridge_reload_startup_message_swallowing.md
updated: 2026-10-08
---

An in-place `!reload` replaces the Python process image via `os.execv` without resetting the Docker container cgroup, keeping PID 1 timestamps intact. A bug in background task parsing within `task_settle.py` inadvertently scanned prompt carry-forward and user input blocks, trapping the turn and swallowing startup announcements; task ID parsing must be strictly constrained to `tool_call` and `tool_result` steps.
