---
name: Actual Budget Tailscale Reverse Proxy Fix
description: "Tailscale clients rely on Split DNS via Host 1 (`10.0.0.x`) rather than reaching raw container p"
category: scar
source: scar_actual_budget_tailscale_reverse_proxy_fi.md
updated: 2026-10-02
---

Tailscale clients rely on Split DNS via Host 1 (`10.0.0.x`) rather than reaching raw container ports directly on Host 2. Accessing Actual Budget remotely over Tailscale requires routing traffic through Host 1's Nginx reverse proxy and the standard `*.brock.ventures` UniFi DNS topology.
