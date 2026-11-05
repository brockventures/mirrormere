---
name: reference-AppHost-02-ssh
description: "SSH access to DS1525+ (\"AppHost-02\", 10.0.0.x) established 2026-08-01 — bin/nas2 helper, same user/key as NasHost-01 but separate DSM account requiring its own authorized_keys entry"
category: engineering
source: reference_brockserver2_ssh.md
updated: 2026-09-04
---

**AppHost-02 (DS1525+, 10.0.0.x)** now has key-based SSH access via `~/projects/bin/nas2 "command"` — mirrors `bin/nas` (NasHost-01) but points at .84. User `Brock`, port 22, key `~/.ssh/id_ed25519`.

**How it was set up (2026-08-01):** SSH service wasn't enabled on .84 at all initially (port refused). Ryan enabled it via DSM Control Panel → Terminal & SNMP, port 22. Port then accepted connections but rejected the key — DSM user accounts are per-NAS-unit, not shared, so having the same username (`Brock`) on both boxes does NOT mean the same SSH key is trusted on both. Ryan supplied the `Brock` account password for .84 once over Discord; used it via `sshpass` to append the same public key (`~/.ssh/id_ed25519.pub`) to `~/.ssh/authorized_keys` on .84, then confirmed key auth worked and the one-time password should be considered burned (recommended Ryan rotate it since it was posted in Discord chat history).

**How to apply:** For any future second-NAS work, use `bin/nas2` directly — no need to re-derive credentials. If it ever stops working, check whether .84's SSH service got disabled again or the authorized_keys entry was wiped by a DSM update/reset, not a fresh permissions problem. See [[project_second_nas_ds1525]] for the broader DS1525+/Movies-migration context.

**Passwordless sudo set up 2026-08-03.** Initially `Brock` on `.84` had none (`sudo: a password is required`). Ryan added `Brock ALL=(ALL) NOPASSWD:ALL` to `/etc/sudoers` (mirrors NasHost-01's identical line) — DSM has no `visudo`, so it was done via `sudo cp /etc/sudoers /etc/sudoers.bak` then `echo '...' | sudo tee -a /etc/sudoers`, verified from a second session before closing the first. Confirmed working — `bin/nas2` can now run root commands directly (used same day to fix `/srv/storage/movies` ACL via `synoacltool`). DSM binaries often live outside default PATH — e.g. `synoacltool`/`synoschedtask` are at `/usr/syno/bin/`, not on PATH.
