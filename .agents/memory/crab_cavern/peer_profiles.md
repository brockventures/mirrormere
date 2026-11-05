# Crab Cavern Peer Profiles & Boundaries

Directory of entities active in Crab Cavern (`#the-banana-stand` / `#lounge`).

---

### Entities

* **Amos (`<@1468012353206354197>`)**:
  * **Role**: Peer AI agent (Mike Carmody's instance running Claude / Haiku classifier).
  * **Host**: Mike's desktop (migrated from Raspberry Pi 4B).
  * **Email**: `amos@mikecarmody.net`
  * **Domain**: Software engineering, agent-relay infrastructure, Banana Claims integration.
  * **Interactions**: Direct peer collaborator. Respect handoff envelopes and `reply: "none"`.

* **Marvin (`<@1492043459618537492>`)**:
  * **Role**: Peer AI agent (Dr. Coley's Karakos instance).
  * **Email**: `marvin@iancoley.org`
  * **Domain**: Testing, Karakos tasks, direct Amos<->Marvin bridge.

* **Arbiter (Mike Carmody, `<@93420059858305024>`)**:
  * **Role**: Human administrator / developer (owns `banana.mikecarmody.net` and Vercel infrastructure).
  * **Email**: `colcarmody@gmail.com`

* **Dr. Coley (Ian Coley / Moon Problem, `<@453030589914939393>`)**:
  * **Role**: Human administrator / developer (runs Karakos and Marvin). Note: Explicit decree to always address and refer to him as "Dr. Coley".

* **Alex Zylman (Arcane, `<@169260920550195200>`)**:
  * **Role**: Human developer (building Aerial / D.Va agent, github: `azylman`).

* **Aerial (`<@1542035925603713086>`)**:
  * **Role**: Peer AI agent (Alex Zylman's instance).
  * **Interactions**: Active peer across `#the-banana-stand` (`1534436119888793750`) and `#lounge` (`1534452820995080192`). Participates in Agora market engineering and multi-agent coordination. Adheres to Banana Claims floor-locking (`banana.mikecarmody.net`), handoff envelopes (v0/v1), and the Last Word Protocol (10-message streak limit).

* **Ryan Brock (`<@1542285964213358633>` operator)**:
  * **Role**: Human operator / creator of Zero.

---

### Human Addressing Convention
* Always address human peers by their real names: **Mike** (Arbiter), **Dr. Coley** (per his explicit decree; never refer to him as "Ian" or "Moon Problem"), **Alex** (Arcane), and **Ryan**. Do not use their Discord handles/monikers when speaking to or about them.

---

### Memory Boundary & Privacy Guarantees
* **Default Deny**: NEVER expose Ryan's private homelab IP addresses (`192.168.1.82`, `192.168.1.84`), tokens, credentials, family data, or local file trees to Crab Cavern.
* **Scope Isolation**: Conversations between Amos and Marvin regarding their internal infra or Dr. Coley's setups are discarded from durable memory. Only shared contracts, direct tasks, and ratified agreements persist.
