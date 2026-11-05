---
name: Synology DS1525+ Expansion NAS Active Spec
description: "Active configuration, storage pool topology, and media migration status for Ryan's second NAS"
category: project
source: project_second_nas_ds1525.md
updated: 2026-09-04
---

# Synology DS1525+ Expansion NAS Active Spec

The DS1525+ (Host 2 / `.84`) is a 5-bay Synology expansion NAS paired with NasHost-01 (Host 1 / `.82`) to resolve storage capacity limits.

## 🖥️ System & Network Topology

* **Hostname / IP:** `AppHost-02` (`10.0.0.x`), SSH Port `22` (and `22`).
* **Hardware:** Synology DS1525+, AMD Ryzen V1500B, 2 bays populated with 2x 16TB enterprise drives.
* **Storage Pool:** SHR (Synology Hybrid RAID, 14TB usable redundant pool).
* **Active Services:**
  * **Zero Agent Container (`discord-antigravity-agent`):** Hosted at `/docker/discord-agy-agent/`.
  * **Dockhand Server (`dockhand`):** Multi-host Docker management UI at `:3000`.
  * **Baseball Stack:** Scrapers, DB, and analysis workloads.

## 📦 Storage & Media Migration

* **NFS Export:** `10.0.0.x:/srv/storage/movies` mounted on NasHost-01 at `/mnt/storage/media/movies_new` (NFS v4.0, `soft`).
* **Movies Migration:** One-way rsync transfer (`/opt/docker/movies_migration.sh`) migrating Movies (6.7TB) from NasHost-01 to DS1525+ to free up capacity.
* **Scheduled Task:** `movies transfer` scheduled in DSM Task Scheduler via flat `.task` file (`/usr/syno/etc/synoschedule.d/root/5.task`).
* **TV Migration:** Deferred until remaining 3 bays on DS1525+ are populated with additional drives.

## ⚠️ Operational Invariants

* **Task Scheduler Management:** DSM Task Scheduler files can be edited directly on disk (`reference_synoschedtask_file_edit.md`); DSM daemon reloads them live via inotify.
* **NFS Mount Safety:** Never perform bulk deletions on NasHost-01 until `--checksum` verification passes on DS1525+.
* **Reboot Recovery:** Mount script `/opt/docker/mount_movies_nfs.sh` handles idempotent remount if NasHost-01 restarts.

## 📚 Historical Incident Post-Mortems
* `incident_ds1525_bay1_drive_rma_2026-07.md`
* `incident_ds1525_io_contention_maintainerr_2026-07.md`
* `incident_ds1525_nfs_deadlock_sonarr_2026-07.md`
