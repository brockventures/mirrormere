---
name: Bridge Turn Lifecycle Disconnect Fix
description: "Investigated an issue where background subtasks completing after `bridge_runner.py` closed stdout le"
category: scar
source: scar_bridge_turn_lifecycle_disconnect_fix.md
updated: 2026-09-15
---

Investigated an issue where background subtasks completing after `bridge_runner.py` closed stdout left results unpushed to Discord until the next user prompt. Patched `tools/bridge_pipeline.py` to strip faulty `[NO_REPLY]` guidance on background tasks, holding stdout open for active requests and establishing the `detached-task`/`outbox.py` protocol for jobs exceeding 3 minutes.
