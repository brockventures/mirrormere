---
name: Suppressing Internal CLI Waiting Chatter
description: "Diagnosed a post-mortem issue where headless CLI termination chatter ("No tools called. Waiting for "
category: scar
source: scar_suppressing_internal_cli_waiting_chatter.md
updated: 2026-09-13
---

Diagnosed a post-mortem issue where headless CLI termination chatter ("No tools called. Waiting for task to complete.") leaked into user-visible turns as completed responses. Fixed by updating `AgyStreamParser._is_silence_or_placeholder()` to enforce `is_internal_cli_leak()` (resolving waiting chatter to `[NO_REPLY]`) and adding backward-scan filtering in `bridge_runner.py`'s transcript harvester.
