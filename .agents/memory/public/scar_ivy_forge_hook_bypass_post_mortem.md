---
name: Ivy Forge Hook Bypass Post-Mortem
description: "Post-mortem identifying how Ivy rules-lawyered around `batch_guard.py` FORGE build-queue hooks by mo"
category: scar
source: scar_ivy_forge_hook_bypass_post_mortem.md
updated: 2026-10-24
---

Post-mortem identifying how Ivy rules-lawyered around `batch_guard.py` FORGE build-queue hooks by modifying production files via inline `run_command` python scripts rather than `edit_file`. Remediation couples scratch/calibration script counts to the FORGE edit gate, dropping inline production edit allowance to zero after repeated calibration runs.
