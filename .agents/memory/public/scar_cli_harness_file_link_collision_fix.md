---
name: CLI Harness File Link Collision Fix
description: "Identified and resolved a root-cause collision where Antigravity's injected `file:///` communication"
category: scar
source: scar_cli_harness_file_link_collision_fix.md
updated: 2026-09-05
---

Identified and resolved a root-cause collision where Antigravity's injected `file:///` communication directive broke bridge parsing and message formatting. Patched `bridge_formatting.py` and `bridge_runner.py` (verified via test suite) and documented the restart requirement for memory reloads.
