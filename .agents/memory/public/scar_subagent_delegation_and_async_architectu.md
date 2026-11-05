---
name: Subagent Delegation and Async Architecture
description: "Zero has never delegated tasks to subagents (`invoke_subagent` count is 0) because synchronous execu"
category: scar
source: scar_subagent_delegation_and_async_architectu.md
updated: 2026-09-06
---

Zero has never delegated tasks to subagents (`invoke_subagent` count is 0) because synchronous execution directly within the turn provides better context density and error visibility. Furthermore, Discord bridge interactions wrap turns in a 9-second typing heartbeat while blocking on `bridge_runner.py`'s 600s watchdog, meaning subagents provide no intermediate updates and long-running workloads must instead be decoupled via detached background daemons or bridge schedules.
