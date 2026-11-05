---
name: Bridge Reload Session Persistence Architecture
description: "In-place bridge reloads preserve conversation context without pre-compaction because session state i"
category: scar
source: scar_bridge_reload_session_persistence_archit.md
updated: 2026-10-13
---

In-place bridge reloads preserve conversation context without pre-compaction because session state is persisted to disk and reloaded on reconnection. Conversational memory stays intact across hot reloads, while compaction operates independently via Smart Rolling Compaction or explicit session resets.
