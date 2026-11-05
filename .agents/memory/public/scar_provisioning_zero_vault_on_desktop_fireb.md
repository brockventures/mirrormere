---
name: Provisioning Zero Vault on Desktop Firebird
description: "Clones of the public `Zero-Agent` repo lack durable memory and secrets because they reside in the pr"
category: scar
source: scar_provisioning_zero_vault_on_desktop_fireb.md
updated: 2026-10-28
---

Clones of the public `Zero-Agent` repo lack durable memory and secrets because they reside in the private `brockventures/Zero-Vault` repo. On Firebird desktop, Zero-Vault was cloned and decrypted to hydrate `C:\secrets`, memory tiers, and configuration, with synchronization maintained via `python3 tools/vault_sync.py pull`.
