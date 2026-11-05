---
name: Steam Deck SSH Transfer Freeze Root Cause
description: "Large SSH/rsync file transfers to the Steam Deck caused system-wide agent stalls and device lockups "
category: scar
source: scar_steam_deck_ssh_transfer_freeze_root_caus.md
updated: 2026-09-04
---

Large SSH/rsync file transfers to the Steam Deck caused system-wide agent stalls and device lockups due to unthrottled flash I/O exhausting the controller write cache and triggering SteamOS idle deep suspend mid-write. This led to silent TCP black-hole timeouts blocking the bridge turn runner, codified into the permanent `remote-transfer` skill mandating `--bwlimit`, sleep inhibition (`systemd-inhibit`), and background decoupled execution.
