---
name: always-convert-timestamps-to-pt-including-from-ha-apis-and-discord
description: "Ryan flagged UTC timestamps twice; all external sources (HA, logs, Discord ts) are UTC — convert before presenting"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 496e5ad3-518b-44c5-9eef-2b9786f85289
---

Always convert all timestamps to Pacific Time (PT) before presenting to Ryan. HA REST API, log files, cron output, and Discord `ts` fields are all UTC.

**Why:** Ryan's timezone is America/Los_Angeles. Earlier agents reported raw UTC timestamps, which Ryan flagged twice.

**How to apply:** See CLAUDE.md Time Zone section for operational rules.
