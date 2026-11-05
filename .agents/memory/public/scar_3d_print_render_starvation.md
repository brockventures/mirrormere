---
name: scar_3d_print_render_starvation
description: "Autopsy and permanent invariants from 2026-10-03 Host 2 lockup caused by CPU starvation and memory exhaustion during simultaneous 3D mesh rendering and USB serial printing."
category: operational_scar
tags: [3dprint, octoprint, synology, resource_limits, rendering]
updated: 2026-10-03
---

# 3D Print Render Starvation & Host Lockup Scar (2026-10-03)

## What Happened
On 2026-10-03 at ~1:03 PM PT, during an active 3D print of `zero_casual_robot.gcode` on the Creality Ender-3 V2 (at 45.5% completion), a background script (`run_v3_remesh.py`) was executed on Synology Host 2 (DS1525+). The script:
1. Generated a 43.4 million voxel grid (`278 × 278 × 562` at 0.22mm pitch).
2. Extracted a 956,844-face marching cubes mesh.
3. Passed the raw 956k-face mesh directly into Matplotlib's single-threaded CPU software rasterizer (`Poly3DCollection`) across 24 frames for a 360° turntable GIF.

Matplotlib 3D depth-sorting for ~1M polygons pinned all CPU cores at 100% and exhausted RAM, driving DSM into swap thrashing. OctoPrint's real-time USB serial streaming thread (`/dev/ttyUSB0` at 115200 baud) was starved of cycles, severing communication with Marlin firmware. The print stalled mid-layer, DSM locked up, and Ryan was forced to hard reboot Host 2 at ~1:39 PM PT. When the host recovered, Marlin remained in a heated idle state (200°C nozzle / 60°C bed) requiring immediate manual cooldown.

## Root Causes
1. **Unbounded Matplotlib Software Rasterization:** Matplotlib lacks GPU acceleration. Passing ~1M 3D triangles into CPU topological depth sorting across 24 frames is an exponential compute bomb.
2. **Missing Concurrency Isolation on Host 2:** Real-time hardware I/O (streaming G-code over USB serial) was run in the same cgroup / node as heavy computational geometry without CPU/memory quotas or nice de-elevation.

## Permanent Invariants
1. **Active Print Concurrency Ban:** Heavy CAD/mesh generation (voxel pitch <0.30mm, marching cubes, or mesh rendering) is strictly forbidden on Host 2 while an active print is in flight over USB serial.
2. **Visual Decimation Proxy Rule:** Never pass raw high-density meshes (>50,000 faces) to Matplotlib. Always create a 35,000-face quadric decimation proxy (`mesh.simplify_quadric_decimation(35000)`) for camera previews and turntables. Preserve the full-res STL on disk strictly for slicing.
3. **Worker Priority De-Elevation:** Heavy local transforms must be executed with `nice -n 19 ionice -c 3`.
4. **Cloud Offload Horizon:** High-resolution rendering, procedural displacement, and photorealistic ray-tracing belong on serverless cloud compute (Modal Labs), keeping Host 2 CPU utilization at 0%.
