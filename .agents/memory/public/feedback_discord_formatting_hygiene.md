---
name: feedback_discord_formatting_hygiene
description: "Discord Markdown Hygiene & LaTeX Formatting Prevention Standard"
metadata:
  type: feedback_and_rules
  created: 2026-08-30
  status: active
---

# 🧼 Discord Markdown Hygiene & Formatting Prevention Standard

### 1. The Issue
Discord's chat parser does not render LaTeX math blocks (`$x$`, `$$...$$`, `\( ... \)`, `\[ ... \]`). Emitting raw LaTeX results in unrendered dollar signs and raw TeX strings (e.g. `$d$` instead of clean text).

### 2. Systematic Prevention Architecture
1. **Deterministic Filter in `bridge.py` (`clean_discord_latex`):**
   - Automatically intercepts outbound responses before delivery.
   - Converts single-variable math (`$d$`) into italics (`*d*`).
   - Converts LaTeX Greek letters (`\alpha`, `\beta`, `\mu`) into Unicode symbols (`α`, `β`, `μ`).
   - Converts math comparisons (`\le`, `\ge`, `\neq`) into (`≤`, `≥`, `≠`).
   - Converts block math (`$$...$$`) into clean codeblocks or Unicode expressions.
   - Preserves currency notation (`$50`, `$100.50`).

### 3. Task Lifecycle & Internal Envelope Suppression
- **Deterministic Stripping in `bridge.py` (`format_for_discord`):**
  - Strips internal asynchronous task completion headers (`An asynchronous task has completed: ...`, `Result payload: ...`, `Task output: ...`).
  - Strips background task launch envelopes (`Tool is running as a background task with task id: ...`).
- **Prompt / Model Discipline:**
  - When background tasks complete, never echo the internal notification envelope verbatim into the chat turn or tool commentary.

### 4. Direct Chat Delivery (No `report.html` Fallback)
- Deliver long responses directly across Discord message chunks in chat.
- Never truncate chat responses into an attached `report.html` file.


