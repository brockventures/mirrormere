---
name: Bridge Message Severing and Mutex
description: "Root-caused and resolved an issue where `tools/bridge_pipeline.py` and `tools/bridge_formatting.py` "
category: scar
source: scar_bridge_message_severing_and_mutex.md
updated: 2026-09-12
---

Root-caused and resolved an issue where `tools/bridge_pipeline.py` and `tools/bridge_formatting.py` split messages prematurely at code fences when exceeding half the maximum length, which severed handoff envelopes across Discord boundaries. In addition, the Banana Mutex was wired directly into external delivery paths to hold locks across turn dispatches.
