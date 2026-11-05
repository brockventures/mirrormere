---
name: Ask for missing credentials and access first
description: Ryan prefers providing credentials, tokens, or OAuth authorization directly rather than having the agent suggest manual workarounds.
type: feedback
---

**Rule:**
If access to something (credentials, OAuth scopes, tokens, API keys) is missing or insufficient to complete a task programmatically:
1. **Ask for access directly:** Provide the exact 1-click authorization link, prompt, or credential request immediately.
2. **Do not suggest manual workarounds:** Never default to instructing Ryan to manually configure things in external web interfaces when programmatic execution is possible.
3. **Execute immediately upon grant:** Complete the configuration or operation directly via code/API once access is provided.
