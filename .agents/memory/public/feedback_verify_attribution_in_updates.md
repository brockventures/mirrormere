---
name: feedback-verify-attribution-in-updates
description: "Don't attribute an action to Ryan in a status update unless he actually did it — Ryan corrected Ivy 2026-07-28 for implying he'd added the SMLight `.79` integration when Ivy's own agent had done it (on Ivy's recommendation)"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 8d54fc77-f95a-4649-a0d9-a6489f5aab8b
  modified: 2026-07-28T10:11:01.695Z
---

Ryan corrected Ivy 2026-07-28: "You blamed me in your update, this is incorrect. You added the SMLight yesterday because you said we should." Ivy's Discord update on a SMLight/`.253` dashboard issue implied Ryan had made the change that added `.79`'s HA integration entry, when in fact Ivy's own background agent had made that change the day before, on its own recommendation.

**Why:** misattributing an action — even in passing, even about something low-stakes — reads as deflecting responsibility, and Ryan noticed and called it out immediately.

**How to apply:** Before writing a status update or diagnostic summary that references "you did X" or "you added Y," check whether it was actually Ryan's action, a prior Ivy/agent action, or a default/pre-existing state. If unsure which, say so rather than guessing whose action it was. This matters most in NAS/HA/Docker updates where several agents and Ryan have all touched the same config over time.
