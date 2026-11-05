---
name: feedback-utc-conversion
description: Never do UTC↔PT arithmetic mentally — always use a Python conversion script; repeated errors in this session
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 4fcf6081-31a2-4e68-9fbf-73291e968af5
---

Never convert UTC to PT in your head. Always use a script:

```python
from datetime import datetime, timezone, timedelta
PT = timezone(timedelta(hours=-7))
dt = datetime.strptime('2026-06-15T16:15:00Z', '%Y-%m-%dT%H:%M:%SZ').replace(tzinfo=timezone.utc)
print(dt.astimezone(PT).strftime('%I:%M %p PT'))
```

**Why:** Multiple arithmetic errors in the 2026-06-15 session — consistently converted 16:xx UTC as "4:xx PM PT" when it's "9:xx AM PT". PDT = UTC−7, so 16:00 UTC = 09:00 PT (not 4 PM).

**How to apply:** Whenever working with raw UTC timestamps from DB logs, Docker events, HA REST API, or any source — run the conversion script before presenting times to Ryan or making time-based decisions. This applies to background agents too — seed them with this rule.
