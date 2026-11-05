---
name: project_nas_naming_audit
description: "Full audit 2026-08-18: NAS box hostnames are genuinely NasHost-01 (.82) and AppHost-02 (.84) — different word order by design, not a typo; only real inconsistency is ~42 lowercase 'AppHost-02' vs correct 'AppHost-02' casing, pure find-and-replace, zero functional risk"
category: engineering
source: project_nas_naming_audit.md
updated: 2026-09-04
---

Ryan asked for a full audit of naming inconsistency ("NasHost-01 vs. NasHost-01 vs. AppHost-02 vs. AppHost-02") across the project and both NAS hosts, plus a difficulty assessment for standardizing. Full read-only survey done across `~/projects`, all memory files, and both boxes' own DSM config.

**Ground truth (verified directly on each box, not from docs):**
- Box 1 (10.0.0.x, older box): `/etc/hostname` = **`NasHost-01`**.
- Box 2 (10.0.0.x, DS1525+, newer box): `/etc/hostname` = **`AppHost-02`**, matches its DHCP/mDNS-advertised name too.
- The word order really is different between the two boxes by design — not a typo, not something docs got wrong.
- `/etc/synoinfo.conf`'s `hostname="SynologyNAS"` on both boxes is the untouched DSM template default, not live — `/etc/hostname` is the real source of truth.

**Two suspected variants don't exist anywhere** — zero hits across the whole survey: `AppHost-02`/`AppHost-02`, and `NasHost-01` (word-order-swapped for Box 1).

**The actual, only real inconsistency:** ~42 occurrences (18 in `~/projects`, 24 in memory) spell Box 2's name as lowercase `AppHost-02` instead of matching its real `AppHost-02` casing. `NasHost-01` for Box 1 is used correctly ~174 times combined. Cross-box configs never reference either box by name — everything (compose env vars, `bin/nas`/`bin/nas2`) uses raw IPs, so there's no hidden functional dependency riding on getting the casing right.

**Difficulty assessment:**
- **Trivial/moderate (recommended path):** fix the ~42 lowercase→`AppHost-02` casing instances. Pure prose/doc find-and-replace, zero functional risk, ~20 min of work. Not yet done — offered to Ryan, awaiting go-ahead.
- **Hard/risky, NOT recommended:** renaming either box's actual DSM hostname. Box 1 especially — 5 containers run `network_mode: host` and literally inherit "NasHost-01" as their own container hostname (this exact mechanism is what caused the whole Avahi self-conflict storm investigated the same night, see [[project_homebridge]] and [[project_nas_compose_coverage_audit]]). Changing Box 1's real hostname would cascade into all of those. Renaming Box 2 alone (e.g. to visually match as "AppHost-02") is medium-risk — one DSM Control Panel field, re-advertises mDNS/DHCP within minutes, nothing found anywhere references `.84` by name — but would still need follow-up on `bin/nas2`/memory filenames/any cached `.local` name elsewhere.
- **Recommendation given:** keep both real hostnames exactly as-is (including the different word order), just fix the casing consistency. Don't touch either box's actual DSM hostname.

**Two side findings surfaced, not part of the original ask, flagged separately:**
1. Box 1's AT&T router DHCP entry shows hostname `ot2e361503065cd2ce`, not `NasHost-01` — looks like the `otbr` container is claiming the DHCP hostname lease instead of the NAS itself. Not investigated further, low urgency.
2. **Potentially concerning, contradicts an earlier "verified fixed" claim:** `avahi-browse` run from Box 1's own OS could see Box 2's (`AppHost-02`) mDNS records but NOT its own. This is odd given [[project_nas_compose_coverage_audit]]/[[project_homebridge]] documented `NasHost-01.local` as confirmed-fixed and stable earlier the same night (2026-08-18 ~5:05 PM PT, resolved correctly, stayed stable 3.5+ min). Could be a tooling limitation in how the check was run (no mDNS resolver available from the Ivy VM to independently cross-check), or could be a real regression. **Not yet re-verified — worth a clean re-check** (e.g. `avahi-resolve -n NasHost-01.local` from a fresh vantage point) before assuming either the earlier fix held or that it broke again.

**How to apply:** If Ryan approves the casing cleanup, it's safe to batch across all `~/projects` and memory files in one pass — no functional risk, no need for the careful one-container-at-a-time discipline used for actual infra changes tonight. If re-investigating the Box 1 self-mDNS-visibility question, start fresh rather than assuming either the fix-held or fix-regressed framing — get real current evidence first.
