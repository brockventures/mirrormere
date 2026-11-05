---
name: Decision Card Sidecar Silence Flaws
description: "Root-cause triage of sidecar double-posting revealed un-reloaded bridge scheduler fallbacks, missing"
category: scar
source: scar_decision_card_sidecar_silence_flaws.md
updated: 2026-10-31
---

Root-cause triage of sidecar double-posting revealed un-reloaded bridge scheduler fallbacks, missing prompt guards, and stubbed live data fetchers (`pass` placeholders in `proactive_decision_cards.py`). Sidecars must ensure live fetchers query Home Assistant and SQLite state directly rather than relying on override fixtures.
