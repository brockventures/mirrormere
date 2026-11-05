---
name: Discord table & diagram formatting
description: Discord mobile wraps code blocks at ~35-40 chars. Never use wide ASCII box diagrams or multi-column trees.
type: feedback
updated: 2026-08-30
---

# Discord Formatting: No Wide ASCII Trees, No Pipe Tables

* **The Problem:** 
  1. Horizontal ASCII box-drawing diagrams (`┌──┬──┐`, `│`, side-by-side boxes) wrap every line on Discord mobile, rendering as a fractured mess.
  2. Markdown pipe tables (`| Col1 | Col2 | Col3 |`) do not render on mobile Discord and get flattened into unreadable strings with nested parentheses like `• Feature (Val1): Val2`.
* **The Rule:** NEVER output wide multi-column ASCII diagrams, and NEVER output markdown pipe tables.
* **Best Formats:**
  * **Option Cards:** Group specs under each candidate option (`### 1. Option Name` followed by bullet specs).
  * **Feature Sub-Bullets:** Compare options directly under each feature:
    ```markdown
    • **Defrost Type:**
      - *Chest:* Manual (steady -10°F to 0°F)
      - *Upright:* Auto / frost-free (daily heat cycles)
    ```
* **Monospace Tables:** If using code blocks for tabular data, keep line width **strictly under 35 characters**.
