---
name: OAuth Token JSON Corruption Outage
description: "A ~56-minute outage causing outbound turns to fail with interactive auth timeouts was traced to trai"
category: scar
source: scar_oauth_token_json_corruption_outage.md
updated: 2026-09-14
---

A ~56-minute outage causing outbound turns to fail with interactive auth timeouts was traced to trailing-byte JSON corruption in the on-disk OAuth token file. Corrupted tokens must be automatically validated, sanitized, or truncated to the top-level closing bracket before spawning CLI print mode processes.
