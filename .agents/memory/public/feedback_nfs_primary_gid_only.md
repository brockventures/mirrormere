---
name: feedback_nfs_primary_gid_only
description: "NFS clients reliably assert only a user's primary GID, not supplementary group membership — DSM ACLs relying on a supplementary group silently fail for NFS/Docker PUID access"
metadata: 
  node_type: memory
  type: project
  originSessionId: 038a977f-59de-4cbd-9e4a-9e3f38b368fd
  modified: 2026-08-07T05:39:41.089Z
---

Applied an ACL fix on `.84` (copied the `homes` share's pattern — admin-group-only + everyone-execute-only) to fix a permissions problem during the Movies NAS migration. It worked for direct SSH/DSM access (Brock is genuinely in the `administrators` group there) but silently broke Radarr's full-library rescans once the cutover made that share Radarr's live NFS-mounted path — not caught until 2 days later when it surfaced as "every movie fails to rescan." Full incident: [[project_second_nas_ds1525]].

**Why:** Radarr connects to the share over NFS as a numeric UID (its Docker `PUID`), not as an authenticated DSM user. NFS reliably communicates a client's **primary GID** in each request, but does not reliably communicate **supplementary group membership** the way a real DSM login session does. An ACL entry granting access to a group only via supplementary membership (e.g. `group:administrators`, where the PUID's primary group is actually `users`) will silently deny NFS/Docker-PUID clients even though the same UID would pass fine through SSH or the DSM UI. This is easy to miss because manual verification (SSH as that account, or `sudo -u <uid>` for a simple file read) can pass while the actual failure mode (directory *listing*, which needs the specific ACL'd group) doesn't show up unless tested precisely the way the real client does it.

**How to apply:** when setting DSM share permissions for any path that a Docker container (PUID/PGID) will access over NFS, grant the needed permission to the UID's **primary** group explicitly — don't rely on a supplementary/admin group ACE, even if that group grants access fine for direct human/SSH use. When verifying such a fix, test the *exact* operation that was failing (e.g. `ls`/directory listing, not just a file read) as the *exact* UID via the *exact* access path (e.g. `docker exec -u <uid> <container> ls <path>` over the live NFS mount) — a successful `sudo -u <uid> cat <file>` from the host doesn't prove directory-listing access works.
