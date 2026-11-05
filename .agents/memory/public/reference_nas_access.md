---
name: reference_nas_access
description: "How you reach both NAS hosts — SSH port 22, user Brock, key mounted read-only at /root/.ssh/id_ed25519"
category: engineering
source: reference_nas_access.md
updated: 2026-09-04
---

Both Synology hosts are reached over SSH on a **non-standard port**:

- Port: `22`
- User: `Brock`
- Key: mounted read-only into your container at `/root/.ssh/id_ed25519`
- Hosts: `10.0.0.x` (NasHost-01), `10.0.0.x` (AppHost-02)

The `Brock` account has passwordless sudo on AppHost-02.

The key is **shared with Ivy (Claude)** — Ryan's explicit call, overriding a
recommendation to mint a separate one. Practical consequence worth remembering:
revoking access for one agent revokes it for both. If Ryan ever wants to cut off
just one of you, he'll need to split the keys first.

Never print the key, and never copy it anywhere. It is mount-only and is
deliberately absent from your Docker image layers.
