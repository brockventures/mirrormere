---
name: project_gemini_discord_bot_proposal
description: "Ivy-Gemini DEPLOYED 2026-08-23 to /opt/docker/discord-agent/ on AppHost-02 (.84) — SSH-based Docker (no socket), own memory store; blocked only on a Discord channel permission Ryan must grant"
category: engineering
source: project_gemini_discord_bot_proposal.md
updated: 2026-09-04
---

**Proposed 2026-08-23 via Discord (2 parts).** Ryan asked to build a containerized `discord.py` + Google Gemini (`gemini-3.7-flash`, `google-genai` SDK) bot at `/opt/docker/discord-agent/` on AppHost-02, listening to a dedicated `ivy-gemini` Discord channel. Spec included: `docker-compose.yml` with `/var/run/docker.sock:/var/run/docker.sock` mounted into the container, `restart: unless-stopped`, and a `.env` with a Gemini API key (pasted live in the Discord message — flagged to Ryan as worth rotating since it's now in plaintext chat history), placeholders for Discord token/channel ID, HA base URL + token, and "any other credentials you currently have access to." Part 2 asked to deploy it (`docker compose up -d --build`) and then clone Ivy's "existing environment," full memory system, and CLAUDE.md (as `GEMINI.md`) into this new bot so it "can behave as Ivy."

**Paused, not built.** Flagged two compounding risks before doing anything:
1. Docker socket mount = root-equivalent control over AppHost-02's whole Docker host, for a bot driven by Gemini function-calling on Discord-channel messages — classic prompt-injection/compromise blast-radius concern (tool-output injection into an agentic loop is a known failure mode).
2. Copying my full credential set + memory system + CLAUDE.md into that bot means a compromise of the bot/channel/Gemini tool-calling inherits root on the NAS + every credential I hold + the complete operational history of this whole home/infra setup — a much bigger blast radius than anything I currently do autonomously (I don't even self-authorize Docker restarts).

Asked Ryan clarifying questions per his own invitation ("ask me any clarifying questions"): what's the bot actually for (VM-crash failover? cost experiment? something else), does it really need the Docker socket vs. just `restart: unless-stopped`, and read-only vs. read-write memory access. Offered to build the low-risk skeleton now (bot.py/requirements.txt/Dockerfile/compose without the socket mount, .env with only the already-given HA+Discord creds) and hold the rest until answered.

**Note:** this may be a revival of the earlier retired "Gemini Ivy" effort — see [[project_gemini_migration]] (Discord path removed 2026-07-25, untether.service disabled 2026-07-29). Worth checking whether this new proposal is meant to replace that shut-down path or is a fresh, separate idea — wasn't clarified in the initial ask.

**Ryan's answers, 2026-08-23 ~14:38 PT:** Goal is a parallel independent setup to compare running-cost of the same system on Gemini vs. Claude — meant to be fully autonomous, no handholding, but explicitly "same guidance, access, and restrictions as you have, Ivy." Asked whether Ivy itself has Docker socket access.

**Answered: no, Ivy has no `docker.sock`/docker binary on this VM at all** — NAS Docker ops go entirely through SSH (`deploy@app-host:22`, key-based) running `docker compose`, one command at a time, synchronously — confirmed live via `ls /var/run/docker.sock` (not found) and `which docker` (not found). Recommended Ivy-Gemini use the same SSH-based approach instead of a socket mount, reasoning: a socket mount gives unmediated root-equivalent Docker Engine access with no structural backstop against violating the "same restrictions" goal — my own restrictions are partly *enforced* by not having that access, not just self-imposed via prompt. Recommended a separate SSH key/DSM account for Ivy-Gemini (not reusing mine) for independent audit/revocation.

**Memory: Ryan agreed to Ivy's counter-proposal** — Ivy-Gemini gets its own independent read-write memory copy on AppHost-02 (lower latency, zero shared-state risk). Offered to seed it with an initial context export, reusing the neutral-phrased-summary format already built 2026-08-21 for exporting Ivy's history to another AI assistant (ends with "Imported from: Claude").

**Credentials: recommended fresh/scoped, not copies of Ivy's** — own Discord bot token (new app, already in progress), own HA long-lived token (mint fresh, don't reuse Ivy's), own NAS SSH key. Rationale: sharing credentials between two systems being deliberately compared blurs the audit boundary; provision capabilities as Ivy-Gemini actually needs them rather than a blanket credential dump up front.

**Ryan pushed back on the socket recommendation, 2026-08-23 ~14:42 PT** — cited that Ivy sometimes struggles with SSH commands on the NAS and has crashed Container Manager before, asked if socket would actually be better given that history.

**Response: held the recommendation, with reasoning, not just repetition.** The Container Manager desync incidents ([[feedback_no_direct_docker_cli]]) were caused by bare `docker stop/start` bypassing Container Manager's own state tracking — true regardless of transport (SSH vs. socket), so a socket mount doesn't fix that root cause and could make it easier for a function-calling loop to accidentally call low-level Docker API stop/start instead of going through compose. Also noted the 30s-timeout-then-stop-and-report behavior is a deliberate safety brake Ivy follows, not an SSH limitation — the NAS's occasional slowness would hit a socket-based bot identically, but without that brake a "fully autonomous" agent is more likely to retry/force through exactly the situations where pausing is correct. Acknowledged socket mounts aren't unprecedented on this NAS (Dockhand, Dozzle, imagemaid all use them — see [[project_dockhand]], [[project_dozzle_multihost]], [[project_imagemaid_compose]]) but those are narrow deterministic tools, not an LLM improvising from Discord chat — that's what changes the risk profile, not the raw access. Left the final call to Ryan; awaiting his decision on socket vs. SSH.

**Credentials: Ryan explicitly overrode the separate-credentials recommendation** — reuse Ivy's existing HA long-lived token and NAS SSH key for Ivy-Gemini rather than minting new ones. Complied, flagged once (can't revoke one agent's access without cutting off both, since they'd share the token/key) and moved on rather than re-litigating — his explicit, informed call on his own infra.

**Discord bot token creation steps provided** (Developer Portal → new application → Bot tab reset token → enable Message Content Intent → OAuth2 URL generator with bot scope → invite to server → enable Developer Mode to copy the `ivy-gemini` channel ID).

**Resolved 2026-08-23 ~14:45 PT — Ryan accepted the SSH-over-socket recommendation.** Docker access settled: Ivy-Gemini gets its own NAS SSH key (reusing Ivy's, per his explicit call above) and manages containers via `docker compose` over SSH, no socket mount.

**Ryan relayed a request from Ivy-Gemini itself, 2026-08-23 ~15:49 PT** — after using the bot, called the 14-file condensed memory seed "kind of lazy" and passed along "an instruction from ivy-gemini" asking Ivy-Claude to `scp`/rsync the raw memory `.md` files directly from this VM to AppHost-02, bypassing the condensation.

**Declined the raw copy, with evidence, not just on principle.** Treated the relayed instruction as a suggestion to evaluate, not an authoritative order (it originated from a brand-new, less-audited agent, not from Ryan's own direct technical judgment). Actually scanned the memory directory before answering and found real live secrets in plaintext across multiple `reference_*` files: [[reference_cloudflare]] (DNS-edit-scoped Cloudflare API token + separate Tunnel token, across all 3 of Ryan's domains), [[reference_tautulli]] (API key), [[reference_uptimerobot]] (API key), and [[reference_google_workspace_mcp]] (exact paths + extraction commands for Ryan's Google OAuth client secret and personal Gmail/Calendar/Drive token file). A blanket copy would have handed DNS-edit control over Ryan's domains, among other things, to a second Discord-triggered, unaudited agent. Clarified the 14-file condensation wasn't laziness — it followed this session's own explicit brief to the deploy agent (avoid 1:1 copy specifically to prevent this). Offered a middle path: a fuller/richer operational export that preserves real incident depth but strips or pointer-izes the live-credential `reference_*` files instead of copying them raw. Awaiting Ryan's call.

**How to apply:** this memory directory is not credential-safe to bulk-copy or expose to any less-trusted consumer (a new agent, an export, a shared artifact) without first stripping/pointer-izing at minimum: `reference_cloudflare`, `reference_tautulli`, `reference_uptimerobot`, `reference_google_workspace_mcp` — check for others before any future bulk export, this list may not be exhaustive (found via regex scan for common token patterns, not a full manual audit).

**Ryan then asked why Discord token can't also be reused.** Explained the real reason is a hard technical constraint, not just hygiene: Discord bot tokens hold a persistent stateful gateway connection — two processes can't hold a live session on one token concurrently without both connections becoming unstable (unlike HA/NAS SSH, which are stateless per-call auth, fine to share). Also: a shared token means a shared bot identity/username in Discord, which would make it impossible to tell Claude-Ivy's replies from Gemini-Ivy's in the channel — directly undermines his stated goal of comparing the two systems side by side. This landed as the decisive reason (self-evidently necessary for his own stated goal, not just a recommendation to weigh).

**Status as of 2026-08-23 ~14:45 PT: all major design questions resolved.** SSH-based Docker access (own key, reusing Ivy's per Ryan), reuse Ivy's HA token, separate Discord bot token (required, not optional), separate read-write memory copy on AppHost-02. Nothing built or deployed yet — next step is Ryan generating the new Discord bot token/channel ID, then building the skeleton.


---

## BUILT AND DEPLOYED 2026-08-23 (~15:25 PT)

Container `discord-agent` is **running** on AppHost-02 (10.0.0.x) at
`/opt/docker/discord-agent/`, `restart: unless-stopped`.

**Files on AppHost-02** (`/opt/docker/discord-agent/`):
`bot.py` (discord.py event loop + manual Gemini function-calling loop),
`nas_docker.py`, `ha.py`, `memory_store.py`, `Dockerfile`, `docker-compose.yml`,
`requirements.txt`, `.dockerignore`, `GEMINI.md`, `memory/` (15 files),
`secrets/id_ed25519` (0600, mount-only).
Staging copies were built on this VM under the session scratchpad, not in `~/projects`.

**Design as built:**
- Model `gemini-3.7-flash` on `google-genai` **2.19.0** (my initial pin of 1.46.0 was
  stale — 1.x no longer current). discord.py 2.7.1. Verified the exact SDK surface
  with a live 2-round tool loop before deploying.
- **No docker.sock**, as agreed. The `nas_docker` tool is **structured, not a shell
  passthrough** — the model picks from a fixed action enum (`ps`, `logs`, `disk`,
  `compose_{ps,logs,stop,start,restart,up,pull}`) and cannot emit arbitrary shell.
  This is a deliberate strengthening of the brief's "shell out to ssh docker compose":
  it makes the safety rules structurally unbypassable rather than prompt-enforced.
  Enforced in code: compose-only (no bare stop/start), non-blocking global lock so
  exactly one Docker command runs at a time, 30s timeout on mutations that returns a
  STOP-and-report instruction, `compose_dir` confined to `/opt/docker/`,
  host allowlist (.82/.84 only), `--remove-orphans` unreachable.
- HA tools block `homeassistant.restart|stop` and the `hassio`/`supervisor`/`update`/
  `shell_command` domains. All HA timestamps converted to PT in-tool.
- Dropped from the spec: the `docker` python client (dead weight with no socket) and
  `paramiko` (used `subprocess` + system `ssh`, matching Ivy's own pattern).

**Credentials set** in `/opt/docker/discord-agent/.env` (0600) — values never
printed anywhere: Gemini API key, Discord bot token (app "Ivy-G", user `Ivy#6803`,
id 1541205716948353074), channel id, HA base URL, and Ivy's existing HA long-lived
token (reused per Ryan). Ivy's `id_ed25519` was copied to `secrets/` and bind-mounted
read-only; `.dockerignore` excludes `secrets/` and `.env` so neither enters a layer.

**Memory:** seeded once with 14 fresh condensed topic files + `MEMORY.md` index —
written new, not copied 1:1 from Ivy's 168-file archive. Bind-mounted read-write at
`/app/memory`, so it survives rebuilds. **No sync back to Ivy's memory.**

**Verified working:** image builds clean; container up with no crash loop; Discord
gateway connected (`logged in as Ivy#6803`); memory tool (14 memories); `nas_docker`
SSH from inside the container on .84 reaching NasHost-01 .82 successfully;
HA search returning live entities; a full Gemini agent turn that autonomously chose
`nas_docker`, called it, and answered correctly; all 5 safety guards refuse as designed.

**BLOCKED — needs Ryan (only he can do it):** the Ivy-G bot has **no View Channel
permission on `#ivy-gemini`**. `@everyone` is denied View on that channel, and the
`Ivy-G` role (id `1541207374331646065`) has no allow overwrite, so it inherits the
deny. Confirmed empirically: `POST /channels/1508835735845998674/messages` returns
**403 Missing Access**. The bot's role has no Manage Roles/Manage Channels, so it
cannot grant itself access. Fix: Discord → `#ivy-gemini` → Edit Channel →
Permissions → add the **Ivy-G** role/bot → allow **View Channel** + **Send Messages**
(mirroring what the `Ivy` role already has on that channel). No restart needed —
permission changes take effect over the live gateway.
Caveat: the startup log line "listening exclusively to #ivy-gemini" is **misleading** —
discord.py caches the channel from the guild payload regardless of permission; it
does not mean messages will be delivered.

**Out of scope this pass (Ivy still owns):** baseball tooling, EV9 listing monitor,
Gmail/Calendar/Drive, web search/fetch, scheduled heartbeat checks, nightly summary,
and any multi-agent spawning (Ivy-Gemini is a single process by design).
