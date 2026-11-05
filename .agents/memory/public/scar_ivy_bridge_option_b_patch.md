---
name: Ivy Bridge Option B Patch
description: "Autopsied Ivy's 30-minute turn stall on Host 2 caused by serial micro-probing (202 tool calls) and u"
category: scar
source: scar_ivy_bridge_option_b_patch.md
updated: 2026-10-07
---

Autopsied Ivy's 30-minute turn stall on Host 2 caused by serial micro-probing (202 tool calls) and unread worker pipe buffers after turn close. Deployed fixes across the shared bridge infrastructure, adding SDK Option B waiting leak suppression to `bridge_safety.py` and tightening operational invariants. Also recorded Ryan's explicit preference for K% and BB% plate-appearance metrics over convolved per-9 stats (K/9, BB/9).
