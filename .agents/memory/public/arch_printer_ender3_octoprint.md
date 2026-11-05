---
name: Ender-3 V2 OctoPrint Hardware Reference
description: "Connection parameters, API keys, firmware capabilities, and calibration data for Ryan's Creality Ender 3 V2 running on Synology Host 2 Docker."
category: hardware
source: printer_ender3_octoprint.md
updated: 2026-10-03
---

# Ender 3 V2 & OctoPrint Infrastructure

## Host & Connection
- **Host System:** Synology Host 2 (`AppHost-02`, `10.0.0.x`)
- **Deployment:** Docker stack at `/opt/docker/octoprint/`
- **OctoPrint URL:** `http://10.0.0.x:8888`
- **OctoPrint API Key:** `8FC0C5F37CD14D4384100ED682682A80`
- **Serial Port:** `/dev/ttyUSB0` (`QinHeng Electronics CH340`, VID `1a86`, PID `7523`)
- **Kernel Driver:** `ch341.ko` (Linux 5.10.55+ / `v1000nk`, boot persistence via `/usr/local/etc/rc.d/usbserial_ch341.sh`)
- **Baudrate:** 115200 baud
- **OctoPrint Base Directory:** `/opt/docker/octoprint/data/octoprint/`
- **Legacy Host (Retired):** `DESKTOP-1H2017G` (`10.0.0.x:8888`)

## Printer Hardware Profile
- **Machine Type:** Creality Ender-3 V2
- **Firmware:** Marlin 2.0.8.5 (Sep 16 2021)
- **Build Volume:** 220 x 220 x 250 mm
- **Nozzle:** 0.4 mm
- **Heated Bed:** Yes (max ~100°C)
- **Auto Bed Leveling:** BLTouch / CR Touch installed (`AUTOLEVEL: supported`, `Z_PROBE: supported`)
- **Smart Plug:** `switch.3d_printer_power` in Home Assistant

## Webcam Monitoring
- **Snapshot URL:** `http://10.0.0.x:3333/photo.jpg`
- **Stream URL:** `http://10.0.0.x:3333/video`
- **Control Script:** `/workspace/tools/webcam_control.py` (ADB over Wi-Fi to Pixel 8 Pro on `10.0.0.x:5555`)

## Calibration & Bed Mesh
- **4x4 Bilinear Mesh Grid:** X/Y coordinates at [0, 73, 147, 220]
- **Mesh Profile:**
  - Row 0: `[-0.277, -0.267, -0.241, -0.093]`
  - Row 1: `[-0.016, -0.036, -0.015, +0.121]`
  - Row 2: `[+0.080, +0.064, +0.085, +0.238]`
  - Row 3: `[+0.125, +0.094, +0.110, +0.268]`
- **Bed Leveling Macro:** `G28` homing followed by `M190 S60` and `G29 T` bilinear probing, stored with `M500`.

## Slicing Integration (OrcaSlicer)
- **Slicer Instance:** Synology Host 2 (`http://10.0.0.x:3005`)
- **OctoPrint Dispatch Target:** `http://10.0.0.x:8888/api/files/local`
