---
name: LAN Split-DNS Chrome QUIC Failure
description: "Switching a domain from Cloudflare edge proxy to local LAN split-DNS triggers `ERR_QUIC_PROTOCOL_ERR"
category: scar
source: scar_lan_split_dns_chrome_quic_failure.md
updated: 2026-09-16
---

Switching a domain from Cloudflare edge proxy to local LAN split-DNS triggers `ERR_QUIC_PROTOCOL_ERROR` because Chrome caches Cloudflare's `alt-svc: h3` advertisement and attempts UDP QUIC against the local reverse proxy. Chrome Incognito does not bypass this because it shares the global network process and QUIC socket pool, requiring restarting Chrome or flushing `chrome://net-internals/#quic`.
