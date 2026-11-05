---
name: Ivy Bridge IndentationError Reload Failure
description: "An in-place reload failure in Ivy's container was traced to a dangling empty `if sha:` block in host"
category: scar
source: scar_ivy_bridge_indentationerror_reload_failu.md
updated: 2026-10-25
---

An in-place reload failure in Ivy's container was traced to a dangling empty `if sha:` block in host-mounted `bridge.py` triggering an `IndentationError` on startup after git commit SHA logging was stripped. Future cleanup of prompt formatting must ensure structural blocks without bodies are either removed or stubbed to prevent crash-looping service workers.
