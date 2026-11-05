---
name: Host 1 WebStation 504 Timeout
description: "Disk I/O lockups on Host 1 can trip Synology WebStation's 60-second Nginx upstream proxy timeout (11"
category: scar
source: scar_host_1_webstation_504_timeout.md
updated: 2026-10-17
---

Disk I/O lockups on Host 1 can trip Synology WebStation's 60-second Nginx upstream proxy timeout (110: Connection timed out) on port 915, causing Cloudflare to relay 504 Gateway Timeout errors to browsers. Mitigation for dynamic WordPress endpoints like wp-login.php involves disabling W3 Total Cache's file-based database cache via WP-CLI to prevent lock contention and route dynamic queries directly to MariaDB.
