---
name: Lifecycle Advisory Over-Compliance and Deduplication
description: Resolved an operational failure mode where rigid lifecycle advisory rules re-prompted users with reload choice buttons immediately after execution or during verification turns
category: scar
source: scar_lifecycle_advisory_over_compliance.md
updated: 2026-09-05
---

Resolved an operational failure mode where rigid, absolutist instructions in `agents.md` caused Zero to re-prompt Ryan with `[CHOICES: Reload Bridge In-Place | Postpone Reload]` immediately after Ryan had already clicked the reload button. The over-compliance was triggered by passive file synchronization (`cp tools/bridge.py /app/bridge.py`) during a follow-up status check ("Did the refactor work?"). Codified four strict exemptions in `agents.md` and `architecture_bridge_lifecycle_and_restarts.md`: (1) prior-turn action deduplication, (2) status and verification turn exemption, (3) autonomous flag arming suppression (`reload_bridge.flag`), and (4) passive identical mirror sync exemption. Additionally, embedded mechanical choice suppression in `tools/bridge_pipeline.py` to strip reload buttons whenever `reload_bridge.flag` is armed.
