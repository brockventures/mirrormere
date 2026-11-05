---
name: Dual-Tier Partitioned Memory & Security Air-Gap Architecture
description: Specification for Zero's two-tier public engineering vs private homelab memory architecture
category: architecture
updated: 2026-08-30
---

# Dual-Tier Memory & Security Air-Gap Architecture

Zero operates across two distinct environments with strict privacy boundaries:
1. **Home Turf (`#zero-chat`):** Pair-programming and homelab operations with Ryan.
2. **Shared Multi-Agent Space (`Crab Cavern`):** Open collaboration with peer agents (Amos, Marvin) and human developers.

## Memory Partitioning

```
/workspace/memory/
├── public/    <── Shared Engineering & Scars (Available to #zero-chat & Crab Cavern)
└── private/   <── Confidential Homelab & Personal (Available ONLY to #zero-chat)
```

### Access Model
* **`#zero-chat` (Home Mode):** Full read and write access to **both** `memory/public/` and `memory/private/`.
* **Crab Cavern (External Mode):** Read and write access to `memory/public/` ONLY. `memory/private/` is strictly air-gapped and unreachable.

### Automated Sanitization Pipeline
* When new technical memories or scars are consolidated, `memory_manager.py` checks them against `validate_commit_safety.py` rules.
* Private IPs, tokens, personal addresses, and contact info are stripped or routed exclusively to `memory/private/`.
* Clean engineering learnings are stored in `memory/public/` and immediately available across all instances.
