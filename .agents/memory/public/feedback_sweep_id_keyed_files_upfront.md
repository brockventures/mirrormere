---
name: feedback-sweep-id-keyed-files-upfront
description: "When fixing a player/entity-ID merge or rename, enumerate every file/table keyed by that ID upfront instead of fixing reactively — a partial sweep during the 2026-07-26 baseball dual-ID fix caused two unnecessary container restarts"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 8d54fc77-f95a-4649-a0d9-a6489f5aab8b
  modified: 2026-07-28T10:08:59.109Z
---

When consolidating or renaming IDs (e.g. merging duplicate `player_id`s in [[project_baseball_dual_player_id_bug]]), grep/audit **all** files and DB tables keyed by that ID before declaring the fix done or restarting any service — not just the obvious primary tables. The first pass covered 4 DB tables but missed a 5th source (`metadata_prospect_positions.csv`, fed by a separate scraper), which surfaced as a second, different-looking bug (wrong player positions) and required two separate `shiny_app_pro` restarts to fully resolve.

**Why:** Ryan explicitly asked "can you go back and see if your previous changes were unnecessary" after the second restart — a fair question given two prior "confirmed fixed" claims had each turned out incomplete. An honest audit (separating confirmed-necessary fixes from unverified proactive ones) was well received; defensively justifying every step would not have been.

**How to apply:** Before the first fix attempt on an ID/key migration bug, search broadly (`grep -r <old_id_pattern>` across the whole data directory/repo, not just the table that showed the symptom) for every place the ID appears. Treat "fixed" as meaning the full sweep is clean, not just that the one symptom you were shown went away — a second restart to catch a missed file is a process miss worth avoiding, not routine iteration.
