---
name: Homelab DNS Shortnames and HSTS Conflicts
description: "`.page` is an HSTS-preloaded public TLD that breaks single-word browser shortnames (e.g. `page/`), r"
category: scar
source: scar_homelab_dns_shortnames_and_hsts_conflict.md
updated: 2026-09-15
---

`.page` is an HSTS-preloaded public TLD that breaks single-word browser shortnames (e.g. `page/`), requiring renaming the dashboard shortcut to `dash/` (`dash.brock.ventures`). Additionally, router-hosted services like `unifi/` resolve directly to gateway IPs (`10.0.0.x`) where factory HTTP 301 redirects can get aggressively cached by client browsers.
