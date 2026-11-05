---
name: Host 1 Disk IO Deadlock Autopsy
description: "Host 1 (`10.0.0.x`) suffered a system-wide userland and disk I/O lockup where the network stack "
category: scar
source: scar_host_1_disk_io_deadlock_autopsy.md
updated: 2026-09-09
---

Host 1 (`10.0.0.x`) suffered a system-wide userland and disk I/O lockup where the network stack acknowledged packets but processes accessing `/srv/storage` deadlocked in unkillable disk sleep (likely Btrfs lock, volume I/O freeze, or page thrash). This root-cause autopsy explains apparent stream failures and SSH banner timeouts during host lockups.
