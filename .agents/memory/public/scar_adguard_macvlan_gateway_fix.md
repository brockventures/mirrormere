---
name: AdGuard Macvlan Gateway Fix
description: "AdGuard Home uses a dedicated Docker macvlan network (`trash-guides_adguard_net2`) with a statically"
category: scar
source: scar_adguard_macvlan_gateway_fix.md
updated: 2026-09-11
---

AdGuard Home uses a dedicated Docker macvlan network (`trash-guides_adguard_net2`) with a statically pinned IPAM gateway in compose, causing routing failures when gateway topology changes. Resolving stale gateway routing requires stopping AdGuard, manually deleting the Docker macvlan network with `docker network rm`, and recreating the container via `docker compose up -d`.
