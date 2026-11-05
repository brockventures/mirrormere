---
name: Bridge In-Place Reload Startup Post-Mortem
description: "Resolved an issue where a clean in-place reboot (`os.execv`) succeeded but appeared frozen because t"
category: scar
source: scar_bridge_in_place_reload_startup_post_mort.md
updated: 2026-09-05
---

Resolved an issue where a clean in-place reboot (`os.execv`) succeeded but appeared frozen because the startup briefing turn failed before delivering to Discord. Documented compile-time variable shadowing hotfixes (`except Exception as re:`) in `tools/bridge_runner.py` and `tools/bridge_daemons.py` to prevent silent startup failures during container reloads.
