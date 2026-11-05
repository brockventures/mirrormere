---
name: project_gmessages_bridge_2026-08-29
description: "Google Messages (RCS/SMS) bridge deployment on AppHost-02 (.84)"
category: engineering
source: project_gmessages_bridge_2026-08-29.md
updated: 2026-09-04
---

### Google Messages (RCS/SMS) Bridge Deployment

1. **Architecture:**
   - Container `openmessage` deployed on AppHost-02 (`10.0.0.x:7080` / internal `7007`).
   - Built from source using Go 1.25 and `libgm` (`mautrix-gmessages` protocol library).
   - Persistent volume: `/opt/docker/openmessage/data:/data` (owned by `100:101`).
   - Session stored in `/data/session.json` (paired to phone ID `+1-9srCE9lkNRFZMnTeUO9PI80`).

2. **Status:**
   - Successfully paired with Ryan's Pixel on 2026-08-30.
   - Message database active at `/data/messages.db` with live thread synchronization.
   - Native CLI and programmatic tool support available for listing threads, querying recent conversations, and outbound text messaging.
