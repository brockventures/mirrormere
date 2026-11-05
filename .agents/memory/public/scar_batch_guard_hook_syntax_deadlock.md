---
name: Batch Guard Hook Syntax Deadlock
description: "A syntax error introduced inside `/workspace/.agents/hooks/batch_guard.py` bricks all agent file edi"
category: scar
source: scar_batch_guard_hook_syntax_deadlock.md
updated: 2026-10-24
---

A syntax error introduced inside `/workspace/.agents/hooks/batch_guard.py` bricks all agent file editing and command execution tools simultaneously because `batch_guard.py` runs as a mandatory `PreToolUse` hook before every tool invocation. Pre-tool hooks must be syntax-checked with extreme care before saving, as failure instantly disables the agent's ability to self-heal using standard tools.
