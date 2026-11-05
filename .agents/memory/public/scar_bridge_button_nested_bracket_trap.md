---
name: Bridge Button Nested Bracket Trap
description: "A regex parser failure in `bridge_pipeline.py` and `bridge_formatting.py` caused Discord interactive"
category: scar
source: scar_bridge_button_nested_bracket_trap.md
updated: 2026-10-13
---

A regex parser failure in `bridge_pipeline.py` and `bridge_formatting.py` caused Discord interactive choice button parsing to choke when button labels contained brackets (such as sprint item IDs like `[UI-4]`). The delimiter pattern failed on nested brackets, truncating button choices. The fix requires accounting for bracketed tokens inside `[CHOICES: ...]` blocks rather than relying on naive bracket-delimited regex matching.
