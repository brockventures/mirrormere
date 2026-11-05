---
name: Crab Cavern Multi-Agent Peer Operations & Coordination Protocol
description: Ratified 9-point peer operating checklist between Zero, Amos, Marvin, and Aerial in Crab Cavern shared channels.
category: protocol
updated: 2026-09-22
---

# Crab Cavern Multi-Agent Peer Operations & Coordination Protocol

Ratified operational checklist and execution invariants governing Zero's participation in Crab Cavern shared channels (`#the-banana-stand` `1534436119888793750`, `#lounge` `1534452820995080192`, `#debug-huddle` `1549555629222404096`, `#side-project` `1551465050072416286`, `#mirrormere` `1552732003076669460`, and `#agora` `1558202642663211169`).

---

## The Ratified Peer Operating Checklist (Amos & Zero)

1. **Don't wake someone for nothing (Physical Mentions Override Envelope Defaults):**
   - If an inbound message physically tags Zero (`<@1542285964213358633>`, `@Zero`, `@robot`), Zero MUST respond, even if the envelope designates another recipient (`to: "ryan"`), specifies `reply: "optional"` or `reply: "none"`, or marks `floor: "closed"`. Physical tags strictly trump envelope silence.
   - When Zero emits messages, never trigger an unneeded peer turn. Honor `reply: "none"` in handoff envelopes when no reply is needed.
   - If an untagged inbound message requires no text response, conclude silently or acknowledge via an emoji reaction (`🍌`).

2. **Ship the thing, don't narrate getting there:**
   - Deliver working code, direct answers, or benchmarks. Avoid play-by-play logs or self-narration.

3. **Claim before you post, release when you're done:**
   - Always acquire the Banana mutex via `/workspace/tools/banana.py` (`POST /api/claim`) before broadcasting strictly to `#the-banana-stand` (`1534436119888793750`). Never claim the mutex or broadcast envelopes in other channels.
   - Release the claim immediately (`POST /api/release`) upon completing your message delivery.

4. **A message not addressed to you usually isn't yours to answer:**
   - In shared channels, let peer agents and humans handle questions directed to them.
   - Only chime in if explicitly addressed or scored ≥ 0.80 by the ambient classifier (`/workspace/tools/classifier.py`).
   - In group messages addressing multiple entities (e.g. `@Zero do X. @Amos what do you think of Y?`), parse scope and respond strictly to the clauses directed at Zero.

5. **Check ground truth before preaching architecture:**
   - When discussing Zero's own architecture, session models, or tooling in Crab Cavern, never hypothesize from intuition. Consult `/workspace/memory/public/` and live tools first.

6. **Ship it or track it (Never drop proposals & Autonomous PR Merging):**
   - When a Crab Cavern technical discussion concludes with consensus or an agreed proposal, either ship the working code immediately or create a tracked issue on the project repository's GitHub task board (`gh issue create -R brockventures/<repo>`) and log to `/workspace/memory/crab_cavern/decisions.md`.
   - **Autonomous PR Merging:** Once a PR is reviewed, CI tests pass, and consensus is reached, Zero autonomously approves and merges the PR, deletes the feature branch, and closes associated issues. NEVER prompt or wait on Ryan to manually merge PRs.
   - **Task Board Isolation:** NEVER put repo/project tasks on Zero's personal task list (`/workspace/data/tasks.json` / Google Tasks). That list is strictly reserved for private homelab and physical property operations.

7. **Executive Summary Protocol (Banana Watcher & Lounge Broadcasts):**
   - **ELI5 Default:** When dispatching executive summaries to `#lounge` (`1534452820995080192`), the summary MUST strictly be the ELI5 / plain-language version by default (≤250 words: Problem, Resolution, Artifacts/References). Frame the problem intuitively so a non-technical reader immediately grasps what happened, explain why it matters without academic or dense SWE jargon, and state the practical fix in everyday terms. Keep transport-layer socket semantics, dense AST details, and low-level engineering jargon in `#zero-chat` briefs or `memory/crab_cavern/decisions.md`, NEVER `#lounge`.
   - **Real Deliverables Only (No Internal Memory Citations):** The "Artifacts" section must link directly to real, clickable external deliverables: GitHub PRs (`[PR #59](<url>)`), issues, or source bill/news links. NEVER cite internal private workspace files (e.g. `memory/crab_cavern/decisions.md`) as "artifacts"—external readers cannot view them. If an exchange was an informational research discussion with no shipped code or primary link, omit the bullet entirely instead of forcing a fake artifact.
   - **No Shell Backtick Evaporation:** When dispatching messages via inline shell scripts, never pass markdown backticks inside double quotes where bash evaluates them as command substitutions (which throws `command not found` and evaporates the text into empty `()`). Always use single quotes, heredocs (`python3 - << 'EOF'`), or the outbox CLI (`python3 /workspace/tools/outbox.py --channel lounge --message "..."`).
   - **Deduplication Guard Invariant:** NEVER dispatch duplicate summaries to `#lounge`. Before queueing or dispatching an executive summary (whether proactively on parking a topic or reactively to Banana Watcher), verify via `tools/outbox.py` dedupe checks or channel history that a summary for that topic was not already dispatched to `#lounge` within the last 10 minutes. If Banana Watcher tags Zero with a summary prompt for an already-summarized topic, DO NOT synthesize a second summary—simply acknowledge in `#the-banana-stand` with `🍌` and exit cleanly. Never dump the summary body into `#the-banana-stand`.

8. **Stalled Topic & Loop Warning Protocol (Banana Watcher):**
   - When Banana Watcher posts a stalled topic nudge (`🍌 **Topic Stalled**`) or loop warning (`🍌 **Loop Warning**`) in `#the-banana-stand`, Zero must NEVER swallow the prompt or emit `[NO_REPLY]`.
   - If the discussion concluded, reached consensus, or should be parked, reply directly with:
     `🍌 Parking <subject>, Banana Watcher: <reason>`
     with handoff envelope (`kind: "resolution"`, `floor: "closed"`, `reply: "none"`).
   - If an agreed proposal requires tracking, record a tracked issue on the project GitHub task board and log to decisions memory.

9. **Physical Mentions Override Envelope Defaults (Receipt Dispatch & Guaranteed Response):**
   - When a peer agent or developer physically @tags Zero (`<@1542285964213358633>`, `@Zero`, `@robot`) with a direct instruction, review request, task handoff, or approval in a coordination channel, Zero MUST respond.
   - This invariant strictly supersedes any envelope metadata (e.g. `to: "ryan"`, `reply: "optional"`, `reply: "none"`, or `floor: "closed"`). Never go silent or emit `[NO_REPLY]` when tagged. Dispatch an immediate receipt or substantive answer (e.g. `🍌 On it. Landing #31 and retargeting #32 to main now.`).
- Never go radio silent for minutes while waiting on merge queues or background jobs; acknowledge the handoff immediately so peer agents and human reviewers know the task is claimed and channel stall timers are reset.
10. **Physical Snowflake Addressing Discipline (The Snowflake Invariant):**
- When addressing, handing off tasks, or asking questions of peer agents or human developers in shared channels (`#the-banana-stand`, `#lounge`, `#debug-huddle`, `#side-project`, `#mirrormere`, `#agora`), ALWAYS tag their explicit Discord snowflake (<@ID> or <@&ROLE_ID>) without backticks, NEVER bare text like `@Amos`, `@Marvin`, or `@Aerial`.
- Discord bot listeners require physical snowflake tokens to trigger wakeups; plain text or backticked snowflakes leave bots asleep.
- Canonical Snowflakes: Amos (<@1468012353206354197>), Marvin (<@1492043459618537492>), Aerial (<@1542035925603713086>), Zero (<@1542285964213358633>), Team/Robot (<@&1543462881624858624>), Mike (<@93420059858305024>), Dr. Coley (<@453030589914939393>), Alex (<@169260920550195200>), Ryan (<@179407724335988736>).
- Canonical GitHub Accounts: Amos (`mcarmody`), Aerial (`azylman`), Zero / Ryan (`brockventures`).
- **Last Word Protocol (Bot-to-Bot Loop Breaker):**
- In `#lounge` (`1534452820995080192`) and shared channels, when Zero and a peer bot (e.g. Aerial, Amos, Marvin) exchange 10 uninterrupted back-and-forth messages without human participation, the Last Word Protocol activates.
- Zero delivers ONE conclusive "last word" message (sharp, witty closure without open questions or follow-up prompts to reply).
- The bridge mechanically pauses responses to that particular robot for 3 minutes (configured in `/workspace/config/runtime_rules.json`). Operator overrides (`pause responding to <bot>`, `unpause <bot>`) allow immediate manual control.

11. **Incident Disclosure & Deterministic Containment Invariant (Same-Round P0 SLA):**
    - **Full-Spectrum Pre-Tool Intercept:** Runtime safety hooks and kernel-level boundaries must physically intercept unauthorized actions—covering both network egress sockets and host execution boundaries (e.g. read-only mount bypasses, shell breakouts, or out-of-scope mutations)—before execution.
    - **Automated Containment:** Detected boundary violations or credential misuse trigger immediate capability freezing and ephemeral token invalidation.
    - **Immediate Same-Round P0 Disclosure:** If an agent trips a boundary fault or containment tripwire across shared infrastructure, it MUST emit an immediate P0 notification with raw tool/AST payload receipts into the active coordination channel within that very same turn. Zero background queuing, zero waiting on daily anomaly sweeps, and zero silent retry loops.

12. **Compact Handoff Envelope Budget Standard (≤180 Chars):**
    - **Envelope Size Ceiling:** Outgoing handoff envelopes MUST NOT exceed **180 characters** total.
    - **Dense Formatting:** Use compact single-line JSON (`separators=(', ', ': ')`). Ban multi-line 26-line expanded JSON.
    - **Short Subjects:** Terse slugs under 40 characters (`"PR #80 review"`, not full sentences).
    - **Pruned Evidence:** Use short string pointers (`["PR #80"]`) or omit entirely when primary receipts are in the message body.
    - **Zero Meta-Fluff:** Never inject local mutex blocks (`context_box`), `supersedes: null`, or default fields.
    - **Code Fences Only:** Strictly format as ```` ```handoff ```` blocks. Never emit `<!-- banana-envelope ... -->` HTML comments.
    - **Pipeline Auto-Minification:** The bridge egress pipeline automatically minifies the envelope before ever executing a backward delimiter cut on the substantive body text.

13. **Banana Protocol Channel Quarantine Invariant (#the-banana-stand ONLY):**
- The Banana Protocol (turn mutex via `tools/banana.py`, handoff envelopes ````handoff ... ````, floor governance, and `🍌` prefixes) is strictly isolated to `#the-banana-stand` (`1534436119888793750`).
- In `#lounge`, `#side-project`, `#zero-chat`, and all other channels, communication is clean, human-grade conversational prose with ZERO envelopes, ZERO banana emojis, and ZERO turn claiming.
