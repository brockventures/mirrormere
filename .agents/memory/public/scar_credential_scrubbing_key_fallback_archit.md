---
name: Credential Scrubbing & Key Fallback Architecture
description: "Implemented fallback SSH key discovery (`/secrets/id_ed25519` with fallback to `/root/.ssh/id_ed2551"
category: scar
source: scar_credential_scrubbing_key_fallback_archit.md
updated: 2026-09-04
---

Implemented fallback SSH key discovery (`/secrets/id_ed25519` with fallback to `/root/.ssh/id_ed25519`) and dynamic host IP resolution via secret configuration files. Enhanced `tools/bridge.py` with dynamic outbound credential redaction that ingests secrets from `/secrets/env.json` and `/secrets/ha.json` to prevent leakages across agent boundaries.
