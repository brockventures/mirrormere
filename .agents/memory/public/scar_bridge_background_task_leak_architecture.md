---
name: Bridge Background Task Leak Architecture
description: "Diagnosed recurring mid-turn leak messages ("Wait for background task to complete...") as failure of"
category: scar
source: scar_bridge_background_task_leak_architecture.md
updated: 2026-09-22
---

Diagnosed recurring mid-turn leak messages ("Wait for background task to complete...") as failure of brittle blacklist regexes and prompt duct tape against non-deterministic SDK interactive background states. Red-teamed architectural fixes against naive turn-blocking supervisors, highlighting deadlock from persistent daemons and race conditions from concurrent parallel tasks, establishing that detached task runners with deterministic PID lifecycle monitoring are required instead.
