---
name: Homepage CustomAPI Dashboard Routing Scar
description: "Homepage's `customapi` widget broke with `SyntaxError: Unexpected token '<'` because deploying an HT"
category: scar
source: scar_homepage_customapi_dashboard_routing_sca.md
updated: 2026-09-29
---

Homepage's `customapi` widget broke with `SyntaxError: Unexpected token '<'` because deploying an HTML dashboard at root `/` on `zero.brock.ventures` returned HTML instead of expected JSON. Resolving internal homelab routing across Tailscale requires configuring Split DNS for `brock.ventures` to `10.0.0.x` in Tailscale Admin.
