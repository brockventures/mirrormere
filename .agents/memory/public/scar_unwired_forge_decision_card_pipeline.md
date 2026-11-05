---
name: Unwired Forge Decision Card Pipeline
description: "While the SQLite storage and Discord button handlers for FORGE Decision Cards were implemented in `f"
category: scar
source: scar_unwired_forge_decision_card_pipeline.md
updated: 2026-10-24
---

While the SQLite storage and Discord button handlers for FORGE Decision Cards were implemented in `forge.py` and `bridge.py`, no automated triggers or workflows were actually invoking `forge.py stage-decision --post`. Ryan had not seen any Decision Cards because none were ever staged into `forge_decisions`.
