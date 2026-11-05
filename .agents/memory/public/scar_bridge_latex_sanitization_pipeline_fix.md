---
name: Bridge LaTeX Sanitization Pipeline Fix
description: "Raw LaTeX leakage into Discord was traced to a blind spot in the bridge formatting pipeline rather t"
category: scar
source: scar_bridge_latex_sanitization_pipeline_fix.md
updated: 2026-10-05
---

Raw LaTeX leakage into Discord was traced to a blind spot in the bridge formatting pipeline rather than rule length violations. Resolved by piping `clean_discord_latex()` directly into `format_for_discord()` across all consumers and refining regex matching for inline numbers followed by punctuation.
