---
name: Cloudflare API token
description: "Cloudflare API token with edit permissions for brock.ventures, getbigboard.com, ryanbrock.org; brock.ventures registrar transfer pending, auto-completes 2026-07-20"
category: engineering
source: reference_cloudflare.md
updated: 2026-09-29
---

API token: stored at `~/.ivy/cloudflare.env` (`CLOUDFLARE_API_TOKEN`) — moved out of this file 2026-08-23, do not re-add the raw value here.

**Permissions:** Zone Settings:Edit, Zone:Read, DNS Records:Edit, Page Rules:Edit, Cloudflare Tunnel:Edit

**Zones:**
- `brock.ventures` — id: 7c624c33f4cccb91fb3d3cb3e8282692
- `getbigboard.com` — id: 8209ad5f968672986323ec6096a62726
- `ryanbrock.org` — id: 34d15ededa2dab8c9224395c47c29a6d

**API base:** `https://api.cloudflare.com/client/v4/`

**Zero health tunnel (Live):**
- Tunnel name: `zero-health`, ID: `2befb2df-ea17-4ae6-b13b-38011fa1a567`
- Host: AppHost-02 (`10.0.0.x`) Docker container `zero-cloudflared` (network: `discord-agy-agent_default`)
- Origin Service: `http://discord-antigravity-agent:8769` (Zero Health Check HTTP Server)
- Public URL: `https://probe.brock.ventures/` (external UptimeRobot probe; zero.brock.ventures decommissioned to local-only)
- DNS: CNAME `probe.brock.ventures` → `2befb2df-ea17-4ae6-b13b-38011fa1a567.cfargotunnel.com` (proxied)

**Legacy Ivy health tunnel (Decommissioned 2026-09-02):**
- Former tunnel ID: `82d76489-f936-40cc-95f4-24c3df242700` (`ivy.brock.ventures`, `spark.brock.ventures` records deleted).

**Pending domain transfer (flagged 2026-07-15 nightly review, session `e78fa78f`):** a transfer request for `brock.ventures` from Namecheap to Cloudflare Registrar is in progress, auto-completing **2026-07-20** unless cancelled. Cloudflare's confirmation email suggests Ryan self-initiated it, but it was surfaced to him in Discord as high-stakes (this domain hosts the `ivy.brock.ventures` health tunnel) for a sanity check before it auto-completes. Check back after 2026-07-20 — if the transfer completed, update the registrar note here; if Ryan says he didn't intend it, this needs urgent follow-up before the completion date.
