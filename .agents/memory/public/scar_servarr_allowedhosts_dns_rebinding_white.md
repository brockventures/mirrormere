---
name: Servarr AllowedHosts DNS Rebinding Whitelist
description: "Recent Servarr updates enforce an `AllowedHostsCheck` health validation whenever `disabledForLocalAd"
category: scar
source: scar_servarr_allowedhosts_dns_rebinding_white.md
updated: 2026-09-18
---

Recent Servarr updates enforce an `AllowedHostsCheck` health validation whenever `disabledForLocalAddresses` authentication bypass is enabled. To clear the warning and protect against DNS rebinding, an explicit whitelist of local hostnames and subnet IPs must be configured across Servarr instances.
