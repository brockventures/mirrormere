---
name: Bridge Stream Parser Post-Mortem
description: "Resolved intermediate play-by-play chatter leak in `#zero-chat` by dismantling the fragile regex lad"
category: scar
source: scar_bridge_stream_parser_post_mortem.md
updated: 2026-09-12
---

Resolved intermediate play-by-play chatter leak in `#zero-chat` by dismantling the fragile regex ladder in `tools/bridge_formatting.py` and implementing structured NDJSON stream parsing. The parser natively tracks `step_update` protocol events to structurally discard pre-tool speech at tool boundaries rather than relying on heuristic regex filtering.
