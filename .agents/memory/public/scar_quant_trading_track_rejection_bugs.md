---
name: Quant Trading Track Rejection Bugs
description: "Auditing trade rejection logs across quant tracks revealed that Tracks 2, 3, and 4 stalled due to ov"
category: scar
source: scar_quant_trading_track_rejection_bugs.md
updated: 2026-10-15
---

Auditing trade rejection logs across quant tracks revealed that Tracks 2, 3, and 4 stalled due to overly rigid bull-only filters, an excessive $2.0M open-interest floor, and a latent SQLite UNIQUE constraint bug. Key fixes include upserting or dropping the UNIQUE constraint, lowering the OI floor to $500k for $250 slots, and allowing reverse basis execution during negative funding.
