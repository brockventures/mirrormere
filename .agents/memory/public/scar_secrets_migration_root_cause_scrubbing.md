---
name: Secrets Migration Root Cause & Scrubbing
description: "Migrating credentials from environment variables to `/secrets/env.json` and `/secrets/ha.json` broke"
category: scar
source: scar_secrets_migration_root_cause_scrubbing.md
updated: 2026-09-04
---

Migrating credentials from environment variables to `/secrets/env.json` and `/secrets/ha.json` broke scripts relying on `os.getenv()` and legacy path hardcoding (`tools/exchange_oauth_token.py`). Crucially, because `os.getenv()` returns empty strings when variables are unexported, secret values bypass Discord outbound regex scrubbing unless explicitly loaded into the scrubbing pattern map.
