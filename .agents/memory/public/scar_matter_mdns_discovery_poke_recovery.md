---
name: Matter mDNS Discovery Poke Recovery
description: "Fixed an unresponsive Matter over Thread sensor (Entryway Motion) by injecting an mDNS TXT update po"
category: scar
source: scar_matter_mdns_discovery_poke_recovery.md
updated: 2026-10-20
---

Fixed an unresponsive Matter over Thread sensor (Entryway Motion) by injecting an mDNS TXT update poke directly into `matterserver` for node 31 instead of physically resetting hardware. Additionally mapped IKEA MYGGSPRAY motion sensor routing on the OpenThread Border Router mesh to eliminate brittle Google Home bridge helpers.
