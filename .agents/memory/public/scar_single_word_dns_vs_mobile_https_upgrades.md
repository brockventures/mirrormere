---
name: Single-Word DNS vs Mobile HTTPS Upgrades
description: "Bare shortnames (e.g. `page/`, `mealie/`) fail on mobile Chrome because HTTPS-First mode forces `htt"
category: scar
source: scar_single_word_dns_vs_mobile_https_upgrades.md
updated: 2026-09-15
---

Bare shortnames (e.g. `page/`, `mealie/`) fail on mobile Chrome because HTTPS-First mode forces `https://<shortname>`, triggering TLS certificate authority errors since public CAs cannot certify unadorned single words. In contrast, local domains with dots like `page.home` work without automatic HTTPS upgrade, and proper services should target fully qualified endpoints like `*.brock.ventures` or explicit `.home` hostnames.
