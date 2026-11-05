---
name: Host 1 USB Bus Starvation
description: "A shared USB host controller contention between the CyberPower UPS and external USB backup drive tri"
category: scar
source: scar_host_1_usb_bus_starvation.md
updated: 2026-09-26
---

A shared USB host controller contention between the CyberPower UPS and external USB backup drive triggered a 4-minute storage I/O stall (load average 61.4, primarily I/O wait) on Host 1. This starved userland processes, interrupted active Plex playback on the Google TV Streamer, and briefly made Home Assistant and Docker unreachable.
