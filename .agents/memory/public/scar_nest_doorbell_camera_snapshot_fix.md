---
name: Nest Doorbell Camera Snapshot Fix
description: "Home Assistant's `camera.snapshot` and proxy for the battery Nest Doorbell were returning a 2.6 KB black placeholder PNG or a stale previous event clip due to WebRTC stream limitations and Pub/Sub clip download race conditions."
category: scar
source: scar_nest_doorbell_camera_snapshot_fix.md
updated: 2026-10-28
---

Home Assistant's `camera.snapshot` and proxy for the battery Nest Doorbell were returning a 2.6 KB black placeholder PNG due to WebRTC stream limitations. Extracted full-color JPEG frames directly from the cached Nest event MP4 clips under `/config/.cache/nest/event_media/` into `/config/www/doorbell_latest.jpg` and patched `NestWebRTCEntity` to restore live snapshot capability.

On 2026-10-27, resolved a race condition where `event.doorbell_chime` triggered `camera.snapshot` ~200ms before `google_nest_sdm` finished downloading and transcoding the new `*-doorbell_chime.mp4` clip (~3.7s after `event.doorbell_chime` state update), causing `camera.snapshot` to grab the previous `*-camera_person.mp4` clip from hours earlier. Hot-patched `NestWebRTCEntity._async_wait_for_recent_event_clip` in `homeassistant/components/nest/camera.py` (with zero fixed delay in `automations.yaml`) to poll `/config/.cache/nest/event_media/` every 150ms (up to 10s max) for the fresh `*-doorbell_chime.mp4` file (`mtime >= chime_ts - 3s`) and extract the frame the instant the clip lands on disk.
