---
name: Nest Lock Connection Retry Patch
description: "Resolved an issue where `lock.entryway_lock` failed to self-heal due to a stale error allowlist in `"
category: scar
source: scar_nest_lock_connection_retry_patch.md
updated: 2026-10-24
---

Resolved an issue where `lock.entryway_lock` failed to self-heal due to a stale error allowlist in `homebridge-nest` (`nest-connection.js`) expecting legacy socket errors. Patched the plugin retry logic and Home Assistant automations to automatically recover from auth dropouts.
