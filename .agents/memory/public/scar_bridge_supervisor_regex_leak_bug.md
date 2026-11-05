---
name: Bridge Supervisor Regex Leak Bug
description: "Ryan called out an unintended "Background task in progress" message, revealing a bug where tool outp"
category: scar
source: scar_bridge_supervisor_regex_leak_bug.md
updated: 2026-09-25
---

Ryan called out an unintended "Background task in progress" message, revealing a bug where tool outputs echoing Ivy's logs triggered false-positive background notifications via a regex leak in `tools/task_settle.py`. In addition, Ivy resolved a 30-minute turn stall in `tools/ivy_daemon.py` by adding an active transcript probe to exit early when stdout goes silent and the turn planner response is complete.
