---
name: Atomic Token Sanitizer Architecture
description: "Implemented a self-healing token sanitizer across `tools/bridge_state.py` and `tools/bridge_runner.p"
category: scar
source: scar_atomic_token_sanitizer_architecture.md
updated: 2026-09-14
---

Implemented a self-healing token sanitizer across `tools/bridge_state.py` and `tools/bridge_runner.py` replacing naive `shutil.copy2` with `json.JSONDecoder().raw_decode()` and pre-flight validation. This prevents corrupted state and crash loops caused by background language server daemons leaving trailing bytes when overwriting token payloads before spawning `agy`.
