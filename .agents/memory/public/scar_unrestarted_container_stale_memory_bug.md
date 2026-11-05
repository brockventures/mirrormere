---
name: Unrestarted Container Stale Memory Bug
description: "A disk patch to Ivy's `bridge.py` steering guards failed to take effect because the long-running `di"
category: scar
source: scar_unrestarted_container_stale_memory_bug.md
updated: 2026-09-18
---

A disk patch to Ivy's `bridge.py` steering guards failed to take effect because the long-running `discord-ivy-agent` container process had not been restarted, causing Python to continue executing stale pre-patch code in memory. Any code modifications to active agent daemon containers require an explicit container restart to reload memory state.
