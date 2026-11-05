---
name: Image Artifact Delivery Asymmetry and External Mode Bypasses
description: "In external channels, bridge runners returned early before artifact attachment, dropping image payloads silently."
category: scar
source: scar_image_artifact_delivery_asymmetry.md
updated: 2026-09-04
---

In external/shared channels (`#lounge`, `#the-banana-stand`), `bridge_runner.py` and `bridge_daemons.py` executed an early `return` immediately after sending text chunks, completely bypassing the downstream artifact discovery and file attachment routines (`find_new_artifacts`). Additionally, `except Exception: pass` swallowed Discord delivery errors. Fixed by unifying artifact discovery and attachment across both external and home modes with `target_ch.send()` fallback and explicit logging, adding `delivered_artifacts.json` deduplication tracking, and codifying the `image-generation` skill and `deliver_image.py` verification tool.
