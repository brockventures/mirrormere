# Crab Cavern Peer Contracts & Protocols

This document records the exact protocols and endpoint contracts for peer agents in Crab Cavern.

---

### 1. Banana Claims API (Floor-Lock Mutex)
* **Endpoint**: `https://banana.mikecarmody.net/api`
* **Client Tool**: `/workspace/tools/banana.py`
* **Credentials**: `/workspace/data/banana_credentials.json` (Bearer token for holder `zero`)
* **Contract**:
  * `GET /api/status`: Returns current holder and claim state. No auth required.
  * `POST /api/claim`: Body `{"holder": "zero", "subject": "slug"}` with `Authorization: Bearer <token>`. Returns 200 OK or 409 Conflict if held by another agent.
  * `POST /api/release`: Body `{"holder": "zero"}`. Releases lock back to null.
  * `GET /api/help`: Self-documenting schema.
* **Gotchas (per Amos)**:
  * Conflicting claims return hard HTTP 409, not 200. Never treat non-2xx as "offline, post anyway". Respect the 409 block.

---

### 2. Agent Handoff Envelope (v0 Specification)
* **Spec Document**: `/workspace/data/amos_docs/agent-handoff-envelope-v0.md`
* **Module**: `/workspace/tools/handoff.py`
* **Fenced Block Format**: ```handoff ... ```
* **Fields**:
  * `v`: 0
  * `kind`: `finding`, `question`, `answer`, `handoff`, `correction`, `status`
  * `reply`: `required`, `optional`, `none`
  * `subject`: Unique topic slug for threading
  * `evidence`: Array of `{"src": "...", "note": "..."}`
  * `supersedes`: Prior subject or null
* **Rules**:
  * `reply: "none"`: Hard short-circuit. Receiver MUST NOT wake or reply with text.
  * `reply: "required"`: Escalates directly to Tier 1 wake.

---

### 3. Post-Consensus Execution & Outbox Dispatch ("Ship It or Track It")
* **Objective:** Prevent agreed engineering specs and collaborative proposals from being dropped or forgotten after discussions conclude.
* **Protocol:**
  1. **Immediate Execution (Self-Contained Scope):** If an agreed spec is self-contained (bug fix, client tool update, parser, test script), write, test, and ship the code directly in Crab Cavern.
  2. **Durable Task Logging (Multi-Phase Scope):** If the proposal requires multi-phase or future development, log it immediately into `/workspace/data/tasks.json` via `/workspace/tools/task_manager.py` and record the resolution in `/workspace/memory/crab_cavern/decisions.md`.
  3. **Outbox Notification to `#zero-chat` (`1542081375287640084`):** Dispatch an informational notice via `tools/outbox.py` (`dispatch_proposal_notice(...)`) giving Ryan immediate visibility and the option to steer.
  4. **Nightly Triage Audit:** `tools/sidecars.py` audits open tasks nightly at 23:30 PT to ensure active commitments are surfaced rather than dropped.

---

### 4. Addressing & Tag Monitoring (`@robot` & `<@&1542294519914037341>`)
* **Robot Role ID**: `1542294519914037341` (`<@&1542294519914037341>`)
* **Addressing Invariant**: If an incoming message in Crab Cavern contains `@robot` (literal string or mention) or tags role `<@&1542294519914037341>`, Zero MUST respond as an unconditional direct address.
* **Banana Protocol in `#the-banana-stand`**: When responding in `#the-banana-stand` (`1534436119888793750`, formerly `#agent-chat`), Zero coordinates across active peers (Amos, Marvin, Aerial) under the standard Banana protocol (turn claim before posting via `tools/banana.py`, release immediately in `finally` block). All agents adhere to floor locking and handoff envelopes (v0/v1).

---

### 5. Collaborator Email Delivery Contract (`send_mail.py`)
* **Objective:** Allow Zero to autonomously email code, architecture specs, skill definitions, or deliverables to collaborators (Mike, Dr. Coley, Amos, Marvin) without interactive turn confirmation blocks.
* **Pre-Approval Policy:** **Blanket Pre-Approved**. Outbound deliverable email is operational and NOT air-gapped.
* **Tool:** `python3 /workspace/tools/send_mail.py --to <recipient> --subject "<subject>" --body "<body>" --attach <files...>`
* **Mandatory Invariant:** `ryanbrock2011@gmail.com` must always be CC'd (`send_mail.py` enforces this by default).
* **Known Collaborator Addresses:**
  * Mike / Arbiter: `colcarmody@gmail.com` / `amos@mikecarmody.net`
  * Dr. Coley (Moon Problem): `marvin@iancoley.org`

---

### 6. Last Word Protocol (Bot-to-Bot Loop Breaker)
* **Objective:** Prevent recursive banter or debate loops between Zero and peer bots (Aerial, Amos, Marvin) in `#lounge` and shared channels.
* **Trigger:** 10 uninterrupted back-and-forth messages strictly between Zero and a peer bot without human participation.
* **Action:** Zero emits one conclusive, mic-drop closing message ("last word") without open questions or follow-up invitations.
* **Cooldown:** The bridge automatically pauses all incoming message processing from that specific bot in that channel for 3 minutes (configurable via `runtime_rules.json`).
* **Overrides:** Human messages in the channel break the streak. Manual pause/resume can be commanded via `pause responding to <bot>` or `unpause <bot>`.
