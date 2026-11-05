---
name: Cold-Start CLI Eligibility Auth Scars
description: "Cold-start worker channels invoke `agy`'s Go startup routine synchronously, making them vulnerable t"
category: scar
source: scar_cold_start_cli_eligibility_auth_scars.md
updated: 2026-09-25
---

Cold-start worker channels invoke `agy`'s Go startup routine synchronously, making them vulnerable to TLS handshake timeouts on Google API endpoints (`lh3.googleusercontent.com` and `oauth2/v2/userinfo`) during local network turbulence. Unlike warm persistent daemons, these startup hiccups fail the turn entirely unless intercepted by `is_internal_cli_leak()` in `bridge_safety.py` and handled with retries.
