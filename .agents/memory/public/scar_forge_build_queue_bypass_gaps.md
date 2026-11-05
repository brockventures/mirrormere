---
name: FORGE Build Queue Bypass Gaps
description: "Long-running tasks bypassed the FORGE build queue due to container wiring timing (Ivy tasks ran befo"
category: scar
source: scar_forge_build_queue_bypass_gaps.md
updated: 2026-10-23
---

Long-running tasks bypassed the FORGE build queue due to container wiring timing (Ivy tasks ran before queue integration) and unconstrained `scratch/*.py` executions in `batch_guard.py`. Hardening requires enforcing `forge.py job start` or `forge.py enqueue` for heavy benchmarks, migrations, and iterative scratch loop scripts executed via `run_command`.
