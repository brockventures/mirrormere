---
name: UniFi Native Static DNS Migration
description: "Migrated local homelab subdomain resolution from brittle DNS forwarding to UniFi's native controller"
category: scar
source: scar_unifi_native_static_dns_migration.md
updated: 2026-10-02
---

Migrated local homelab subdomain resolution from brittle DNS forwarding to UniFi's native controller database via `/proxy/network/v2/api/site/default/static-dns`. Created 41 static A-records pointing to Host 1 (`10.0.0.x`) to ensure internal domain resolution survives gateway reboots and firmware updates.
