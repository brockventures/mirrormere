---
name: project_financial_data_integration
description: "Financial accounts (Wealthfront, Chase, Vanguard, Schwab) are live and integrated via SimpleFIN Bridge + Actual Budget + SharkFin dashboard (https://finance.brock.ventures) with daily 06:00 AM PT automated sync sidecar"
category: engineering
source: project_financial_data_integration.md
updated: 2026-10-14
---

**Status (Updated 2026-10-13 — Fully Built & Live in Production):**
- **SimpleFIN Bridge + Actual Budget Integration:** All 8 household accounts (`Chase Premier Checking`, `Chase Freedom Unlimited`, `Charles Schwab Brokerage`, `Vanguard 401(k)`, `Wealthfront Cash Account`, `Wealthfront Joint Investment`, `Wealthfront 529 - Rosie`, `Wealthfront 529 - Isaac`) are linked via **SimpleFIN Bridge** (`account_sync_source='simpleFin'`) into the self-hosted Actual Budget server (`http://10.0.0.x:5006`).
- **Automated Daily Bank Sync Sidecar:** Provisioned in `scar_actual_bank_sync_sidecar_provisioned.md` — runs daily at **06:00 AM PT** via `/workspace/scripts/actual_bank_sync.js`, pulling settled transactions and balances from SimpleFIN and exporting fresh SQLite snapshots to `/opt/docker/sharkfin/data/actual_cache/db.sqlite` (and `/workspace/sharkfin/data/actual_cache/db.sqlite`).
- **SharkFin Dashboard (`https://finance.brock.ventures`):** Live FastAPI + React/Tailwind financial telemetry app running in the `sharkfin` container on Host 2 (`10.0.0.x:8000`), backed by the Actual Budget SQLite snapshot and automated property valuation for 123 Main St.
