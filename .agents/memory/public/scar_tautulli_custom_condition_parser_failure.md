---
name: Tautulli Custom Condition Parser Failure
description: "Organic Tautulli Discord notifications failed silently due to a malformed custom condition parsing e"
category: scar
source: scar_tautulli_custom_condition_parser_failure.md
updated: 2026-10-02
---

Organic Tautulli Discord notifications failed silently due to a malformed custom condition parsing exception, while manual test triggers bypassed condition evaluation and succeeded. Fixing the condition array directly in the SQLite database took effect immediately without container restarts because Tautulli evaluates notification rules dynamically per event.
