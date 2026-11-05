---
name: Bridge Safety Regex Defense-in-Depth
description: "Regex scrubbing remains necessary even with structured JSON stream extraction because safety rules g"
category: scar
source: scar_bridge_safety_regex_defense_in_depth.md
updated: 2026-09-20
---

Regex scrubbing remains necessary even with structured JSON stream extraction because safety rules guard against internal payload content rather than transport leaks. It acts as an indispensable defense-in-depth layer for scrubbing leaked credentials/tokens and enforcing Discord UI hygiene (stripping local URI schemes and converting unreadable markdown tables).
