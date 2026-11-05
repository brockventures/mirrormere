---
name: project_gemini_tool_round_limit
description: "MAX_TOOL_ROUNDS bumped to 200 in bot.py, configurable via env"
metadata:
  type: project
  updated: 2026-08-23
---

---
name: project_gemini_tool_round_limit
description: "MAX_TOOL_ROUNDS bumped to 200 in bot.py, configurable via env"
metadata:
  type: project
  updated: 2026-08-23
---

# Ivy-Gemini Tool Round Cap Bump

On 2026-08-23, Ryan approved increasing `MAX_TOOL_ROUNDS` to 200:
- `bot.py` updated to `MAX_TOOL_ROUNDS = int(os.environ.get("MAX_TOOL_ROUNDS", "200"))`.
- Allows deep multi-step diagnostic, migration, and triage passes without hitting premature round caps.
