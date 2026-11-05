---
name: Decommission AdGuard for Native UniFi
description: "AdGuard running in Docker on Host 1 (NAS) was decommissioned to eliminate a DNS single point of fail"
category: scar
source: scar_decommission_adguard_for_native_unifi.md
updated: 2026-09-11
---

AdGuard running in Docker on Host 1 (NAS) was decommissioned to eliminate a DNS single point of failure during NAS reboots. Household DNS resolution, ad blocking, and DNS Shield (DoH) are now natively handled by the UniFi Cloud Gateway Max (UCG-Max) at the root of the network stack.
