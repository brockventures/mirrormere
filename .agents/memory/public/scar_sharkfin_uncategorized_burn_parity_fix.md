---
name: SharkFin Uncategorized Burn Parity Fix
description: "Resolved a discrepancy between Budget Pacing and Cash Flow burn in SharkFin by adding an explicit Un"
category: scar
source: scar_sharkfin_uncategorized_burn_parity_fix.md
updated: 2026-10-14
---

Resolved a discrepancy between Budget Pacing and Cash Flow burn in SharkFin by adding an explicit Uncategorized Spending triage card in `calculate_category_progress`. Also confirmed SimpleFIN Bridge and the daily 06:00 AM PT bank sync sidecar (`actual-bank-sync`) are active in production across all 8 accounts, resolving stale memory notes.
