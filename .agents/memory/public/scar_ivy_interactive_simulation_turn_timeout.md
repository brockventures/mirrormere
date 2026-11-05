---
name: Ivy Interactive Simulation Turn Timeout
description: "Ivy repeatedly hit the 60-minute interactive turn timeout by executing dozens of iterative simulatio"
category: scar
source: scar_ivy_interactive_simulation_turn_timeout.md
updated: 2026-10-21
---

Ivy repeatedly hit the 60-minute interactive turn timeout by executing dozens of iterative simulation sweeps locally within an interactive bridge turn. Compute-heavy grid searches and multi-run sweeps must be dispatched via `modal_harness.py` or `detached_runner.py` rather than blocking the interactive turn harness.
