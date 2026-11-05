---
name: Host 1 Backup Sidecar Timeout & GNU Tar Exit Code 1 Hardening
description: "Nighttime disk contention, SQLite lock delays, and GNU tar exit code 1 on live WAL mutations in Host 1 backup"
category: scar
source: scar_host_1_backup_sidecar_timeout.md
updated: 2026-10-16
---

1. **Timeout Ceiling (2026-09-25):** Nighttime disk contention and SQLite lock delays on Host 1 caused the scheduled backup to breach the 360-second runner timeout before finishing Docker appdata archiving. The timeout ceiling in `tools/sidecars.py` was raised to 600 seconds (10 minutes), with SQLite backup windows expanded to 240 seconds and automated rollback cleanup on failure.
2. **GNU `tar` Exit Code `1` on Live SQLite WAL Mutations (2026-10-15):** During `backup_docker_appdata()` at `03:46 AM PT`, GNU `tar 1.34` exited with code `1` (`"file changed as we read it"`) while archiving live appdata directories (`maintainerr`, `seerr`, `tautulli`, `dockhand`) whose SQLite/WAL files mutated mid-read. Two compounding bugs in `tools/backup_host1.py` turned that benign warning into a hard failure: `2>/dev/null` swallowed `stderr` completely, and `if code != 0:` deleted the newly created `appdata_critical_*.tar.gz`. Fixed in both `tools/backup_host1.py` and `tools/backup_host2.py` by running passive SQLite WAL checkpoints (`PRAGMA wal_checkpoint(PASSIVE);`) before archiving, passing `--warning=no-file-changed` to `tar`, accepting exit codes `(0, 1)`, and removing `2>/dev/null` so real `stderr` errors are preserved.
