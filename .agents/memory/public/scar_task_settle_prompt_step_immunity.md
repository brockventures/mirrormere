---
name: Task Settle Prompt Step Immunity
description: "Fixed false-positive task detection in `tools/task_settle.py` by hardening `get_turn_pending_tasks()"
category: scar
source: scar_task_settle_prompt_step_immunity.md
updated: 2026-10-08
---

Fixed false-positive task detection in `tools/task_settle.py` by hardening `get_turn_pending_tasks()` to strictly filter out `USER_INPUT`, `CHECKPOINT`, and `EPHEMERAL_MESSAGE` steps. This prevents user quotes, conversational references, and autopsy traces from falsely triggering pending task wait states.
