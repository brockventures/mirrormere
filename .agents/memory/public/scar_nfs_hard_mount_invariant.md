---
name: NFS Hard Mount Invariant
description: "Switching media and homelab NFS storage mounts from `hard` to `soft` risks silent data corruption an"
category: scar
source: scar_nfs_hard_mount_invariant.md
updated: 2026-09-26
---

Switching media and homelab NFS storage mounts from `hard` to `soft` risks silent data corruption and broken file transfers during transient network drops or timeouts. Retain `hard` mounts with appropriate retry timeouts to protect data integrity across storage shares.
