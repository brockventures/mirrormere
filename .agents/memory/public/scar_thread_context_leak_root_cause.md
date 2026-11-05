---
name: Thread Context Leak Root Cause
description: "Resolved a recurring bug where threads crossed contexts due to unscoped global state and transcripts"
category: scar
source: scar_thread_context_leak_root_cause.md
updated: 2026-09-04
---

Resolved a recurring bug where threads crossed contexts due to unscoped global state and transcripts in `session_summarizer.py` and `bridge.py`. Global state flags (`is_steering`, `reset_session`) were refactored into per-channel sets, and transcript/artifact directory resolution was strictly scoped to `brain_root / conv_id`.
