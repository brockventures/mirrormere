---
name: USW-Flex Hand-Crimped Uplink Failure
description: "A network outage involving disconnected U6 Mesh APs was traced to a newly installed UniFi Switch Fle"
category: scar
source: scar_usw_flex_hand_crimped_uplink_failure.md
updated: 2026-10-03
---

A network outage involving disconnected U6 Mesh APs was traced to a newly installed UniFi Switch Flex (USW-Flex) receiving power but failing data link on Port 1 (PoE-In uplink) due to a faulty hand-crimped RJ45 cable. Hand-wired Ethernet runs showing flashing green RJ45 activity without establishing link require testing with known-good factory patch cables to isolate pinout/termination flaws.
