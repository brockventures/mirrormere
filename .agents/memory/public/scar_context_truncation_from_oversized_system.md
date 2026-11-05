---
name: Context Truncation from Oversized System Prompts
description: "Antigravity enforces a hard 24,000-byte per-file ceiling on context files, causing `AGENTS.md` and `"
category: scar
source: scar_context_truncation_from_oversized_system.md
updated: 2026-09-22
---

Antigravity enforces a hard 24,000-byte per-file ceiling on context files, causing `AGENTS.md` and `GEMINI.md` (~51.7 KB) to silently truncate by over 54%. Oversized configuration and operational guidance must be refactored into on-demand skills (`.agents/skills/`) and durable memory files (`memory/public/`) rather than bundled into root prompt markdown files.
