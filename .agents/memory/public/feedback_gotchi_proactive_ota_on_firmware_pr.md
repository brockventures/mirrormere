---
name: Proactive Gotchi V1 OTA Flash on Firmware PRs
description: Whenever Zero or Amos pushes a PR or commit affecting Gotchi ESP32-S3 firmware, proactively build and push the OTA update to Ryan's Gotchi V1 device without waiting for confirmation.
type: feedback
---

**Rule:** Anytime a pull request or commit is pushed that affects the Gotchi ESP32-S3 firmware (`firmware/`), proactively compile (`pio run -e seeed_xiao_esp32s3`) and push the OTA image (`POST http://<GOTCHI_V1_LAN_IP>/api/ota`) directly to Ryan's active Gotchi V1 unit, then verify post-boot telemetry via `/api/rpc` (`{"cmd":"get_logs"}`).

**Why:** Ryan explicitly requested on 2026-10-30 in `#gotchi` that firmware PRs/commits be flashed over OTA immediately so the physical test unit always runs the latest branch build without an extra roundtrip asking to flash.
