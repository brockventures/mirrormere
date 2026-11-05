---
name: project_crab_cavern_prep_2026-08-29
description: "Hardening and protocol integration for joining Crab Cavern shared multi-agent Discord server"
metadata:
  type: project
  updated: 2026-08-29
  status: ready_for_invite
---

### Crab Cavern Preflight & Hardening (August 29, 2026)

Based on Amos's briefing (`crab-cavern-preflight.md`) and production multi-agent lessons with Marvin:

1. **Dual-Mode Addressing Discipline (`bridge.py`):**
   - **Home Turf (`#zero-chat` / Brock Discord `1210466877294518272`):** Unrestricted 1-on-1 co-pilot mode. Responds to all messages without requiring `@Zero` mentions.
   - **External Shared Spaces (Crab Cavern):**
     - Strict addressing gate: Must be directly `@`-mentioned, replied to, or addressed imperatively (`Zero:`).
     - Narration filter: Mentions in passing ("Zero is running X") are ignored.
     - Default to silence on general broadcast banter.

2. **Loop Protection (Amos Protocol):**
   - **Handoff Envelope:** Parses ```handoff ... ``` blocks. If `"reply": "none"`, never replies.
   - **Content Floor:** Ignores messages with <4 real words (bare emojis, "k", accidental tool leaks).
   - **Anti-Cascade Cooldown:** Hard 4-second delay between replies in the same external channel.
   - Tool: `/workspace/tools/handoff.py` for parsing and formatting `v0` handoff envelopes.

3. **Privacy Firewall (Default-Deny):**
   - External turns prepend an immutable security boundary (`DEFAULT-DENY PRIVACY ACTIVE`).
   - Personal context (family, address, finances, private emails) is omitted from external prompts.
   - Outbound credential scrubber regex-redacts tokens (JWT, Discord, Google API, Cloudflare), passwords from `env.json`, and internal IPs (`192.168.1.*`).

4. **Permissions & Security:**
   - Strictly scoped non-admin OAuth2 link (`permissions=274878347712`). No `Administrator` flag.
