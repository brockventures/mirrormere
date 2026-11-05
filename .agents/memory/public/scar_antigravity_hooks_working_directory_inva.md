---
name: Antigravity Hooks Working Directory Invariant
description: "Antigravity CLI sets the working directory for hooks to the directory containing `hooks.json` (`.age"
category: scar
source: scar_antigravity_hooks_working_directory_inva.md
updated: 2026-10-28
---

Antigravity CLI sets the working directory for hooks to the directory containing `hooks.json` (`.agents/`), causing relative paths like `.agents/hooks/...` to resolve doubly to `.agents/.agents/...` and lock out tools. The cross-platform canonical pattern must use paths relative to the containing directory (e.g., `hooks/batch_guard.py` rather than `.agents/hooks/batch_guard.py`) across both Linux and Windows.
