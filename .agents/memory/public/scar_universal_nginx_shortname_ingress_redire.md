---
name: Universal Nginx Shortname Ingress Redirect
description: "Resolves the DNS vs. HTTP Layer 7 gap where single-word search domain queries reach Host 1 but fail "
category: scar
source: scar_universal_nginx_shortname_ingress_redire.md
updated: 2026-09-14
---

Resolves the DNS vs. HTTP Layer 7 gap where single-word search domain queries reach Host 1 but fail Nginx reverse proxy `server_name` checks. Implemented `/etc/nginx/conf.d/http.shortname_redirect.conf` with regex `~^(?<shortname>[a-zA-Z0-9_-]+)$` to 302-redirect bare hostname hits to `$shortname.home` without modifying individual service proxy rules or intercepting external web searches.
