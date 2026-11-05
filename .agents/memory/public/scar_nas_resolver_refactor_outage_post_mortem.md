---
name: NAS Resolver Refactor Outage Post-Mortem
description: "A modularization refactor in `tools/nas_log_triage.py` broke the NAS log reviews sidecar due to a du"
category: scar
source: scar_nas_resolver_refactor_outage_post_mortem.md
updated: 2026-09-20
---

A modularization refactor in `tools/nas_log_triage.py` broke the NAS log reviews sidecar due to a duplicated isolated implementation of `_resolve_nas_config()` instead of using the canonical resolver. Root cause was resolved by delegating to canonical resolution, followed by an exhaustive verification of dynamic imports across all `tools/` modules and live multi-container testing.
