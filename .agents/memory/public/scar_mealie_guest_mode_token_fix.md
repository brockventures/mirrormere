---
name: Mealie Guest Mode Token Fix
description: "Mealie v2/v3 architecturally restricts meal planner access to authenticated users, causing guest ses"
category: scar
source: scar_mealie_guest_mode_token_fix.md
updated: 2026-09-12
---

Mealie v2/v3 architecturally restricts meal planner access to authenticated users, causing guest sessions to lack planner visibility. Setting `TOKEN_TIME=8760` (1 year) in Mealie's Docker environment on Host 2 resolves frequent logouts and keeps devices persistently authenticated.
