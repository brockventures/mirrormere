---
name: Matter Server Zombie Listener Deadlock
description: "Failed Matter commissioning attempts can leave orphan C++ CHIP SDK discovery listeners armed in `mat"
category: scar
source: scar_matter_server_zombie_listener_deadlock.md
updated: 2026-10-21
---

Failed Matter commissioning attempts can leave orphan C++ CHIP SDK discovery listeners armed in `matterserver`. When a subsequent pairing attempt begins, this zombie listener intercepts the incoming mDNS announcement with stale credentials before the new commissioning sequence completes, causing silent pairing timeouts.
