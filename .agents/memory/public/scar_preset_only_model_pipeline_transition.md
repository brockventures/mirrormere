---
name: Preset-Only Model Pipeline Transition
description: "Stripped `preflight_model()` lookup overhead across `bridge_runner.py`, `bridge_daemons.py`, `bridge"
category: scar
source: scar_preset_only_model_pipeline_transition.md
updated: 2026-10-14
---

Stripped `preflight_model()` lookup overhead across `bridge_runner.py`, `bridge_daemons.py`, `bridge_state.py`, and `bridge_safety.py` to lock turns and daemon cycles to a preset model pipeline. This eliminates redundant turn-start discovery latency and standardizes bridge runtime execution.
