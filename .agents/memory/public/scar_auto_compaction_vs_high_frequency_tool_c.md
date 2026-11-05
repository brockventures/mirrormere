---
name: Auto-Compaction vs High-Frequency Tool Costs
description: "Auto-compaction successfully recycled sessions every 15 turns to prevent context window overflow, bu"
category: scar
source: scar_auto_compaction_vs_high_frequency_tool_c.md
updated: 2026-10-06
---

Auto-compaction successfully recycled sessions every 15 turns to prevent context window overflow, but failed to curb token expenditure during high-frequency execution loops. Reducing turn limits does not lower costs when early turns already burn heavy tokens through tool invocation density; the true architectural lever is tool roundtrip minimization and batching rather than aggressive compaction intervals.
