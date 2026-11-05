---
name: Provenance-Gated Timezone Architecture & Prompt Invariants
description: "Resolved root-cause timezone confusion and broken GIF fallbacks between Zero-Chat (`home`) and Crab "
category: scar
source: scar_provenance_gated_timezone_architecture_p.md
updated: 2026-09-04
---

Resolved root-cause timezone confusion and broken GIF fallbacks between Zero-Chat (`home`) and Crab Cavern (`external`) environments. Implemented strict provenance gating to prevent double-conversion/phantom-shift bugs when converting UTC timestamps to Pacific Time, codifying the 6-layer defense across `agents.md`, `.agents/rules/pacific_time_discipline.md`, and runtime prompt templates. Eliminated hardcoded GIF fallbacks in favor of dynamic search fallback (Tenor -> Giphy -> graceful skip).
