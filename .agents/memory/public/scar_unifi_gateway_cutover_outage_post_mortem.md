---
name: UniFi Gateway Cutover Outage Post-Mortem
description: "Migrating the default gateway from the AT&T router (`10.0.0.x`) to the UniFi Cloud Gateway Max "
category: scar
source: scar_unifi_gateway_cutover_outage_post_mortem.md
updated: 2026-09-11
---

Migrating the default gateway from the AT&T router (`10.0.0.x`) to the UniFi Cloud Gateway Max (`10.0.0.x`) caused an eth0 bounce, a temporary WAN/DNS drop breaking cloud authentication, and fresh DHCP pool reassignments that desynchronized static device mappings and coordinator connections. Devices must be verified for DHCP lease re-association and static IP consistency following network gateway transitions.
