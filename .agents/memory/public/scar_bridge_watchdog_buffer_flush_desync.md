---
name: Bridge Watchdog Buffer Flush Desync
description: "A turn timeout watchdog kill caused a desync where stranded CLI runtime output ("Waiting for task..."
category: scar
source: scar_bridge_watchdog_buffer_flush_desync.md
updated: 2026-09-11
---

A turn timeout watchdog kill caused a desync where stranded CLI runtime output ("Waiting for task...") flushed into the subsequent turn buffer alongside the new turn's output, duplicating responses. This documents the failure mode between the bridge watchdog timeout and persistent CLI buffer state.
