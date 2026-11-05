---
name: Bridge Self-Dropping Regex Recursion Fix
description: "Zero's outbound Discord replies vanished because quoting internal CLI chatter triggered the bridge's"
category: scar
source: scar_bridge_self_dropping_regex_recursion_fix.md
updated: 2026-09-19
---

Zero's outbound Discord replies vanished because quoting internal CLI chatter triggered the bridge's own leak-detection heuristics in an "ouroboros" drop loop. The issue was resolved via an in-place bridge reload on Host 2 deploying deterministic chatter sanitization in `tools/bridge_formatting.py` (`strip_internal_cli_chatter` and `is_internal_cli_leak`) to strip leaks without discarding legitimate turns.
