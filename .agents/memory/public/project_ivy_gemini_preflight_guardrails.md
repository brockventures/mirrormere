---
name: project_ivy_gemini_preflight_guardrails
description: "Pre-flight compilation, import validation, and tool parity check inside Dockerfile to prevent startup crashes"
metadata:
  type: project
  updated: 2026-08-25
---

# Pre-flight Build Guardrail for Ivy-Gemini

Documented 2026-08-25 following a top-of-file `NameError` crash during a container restart on 2026-08-24.

## Root Cause
When adding tool mappings to `TOOL_IMPLS` in `bot.py`, referencing functions before their definition caused a fatal `NameError` at module import time during container startup.

## Multi-Layer Guardrail Implemented
1. **`validate.py` Pre-flight Test Suite**:
   - Bytecode compiles all `.py` files in the project.
   - Dry-imports all core modules (`bot`, `sidecars`, `ev9_monitor`, `subagent_runner`, `spark_server`, etc.).
   - Verifies 1:1 bidirectional parity between `TOOL_DECLS` (Gemini declarations) and `TOOL_IMPLS` (dispatch map).
   - Validates that every tool dispatch target is callable.
2. **Dockerfile Build-Time Enforcement**:
   - Added `RUN python validate.py` to `Dockerfile`.
   - Any syntax error, import failure, top-level `NameError`, or tool dispatch drift will immediately cause `docker compose build` to exit with an error code.
3. **Restart Script Protection (`restart-agent.sh`)**:
   - Because `docker compose build` fails if `validate.py` fails, `restart-agent.sh` aborts *before* running `docker compose up -d`.
   - The existing stable container remains untouched and running.
   - An alert containing the exact failure traceback is posted to Discord.
