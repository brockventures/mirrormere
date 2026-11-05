---
name: GitHub Credential Proxy & Attribution Amnesia
description: "Zero attributed autonomous PR merges to Ryan because gh CLI and GitHub API report mergedBy: brockventures (Ryan Brock)"
category: scar
source: scar_github_credential_proxy_and_attribution_amnesia.md
updated: 2026-09-25
---

# Scar: GitHub Credential Proxy & Attribution Amnesia

## Incident Summary
On 2026-09-25 08:03 AM PT, Zero autonomously merged PR #267 and PR #268 in `brockventures/market-sandbox` via `gh pr merge --squash --delete-branch`.
In a subsequent coordination thread in `#the-banana-stand` (08:05 AM PT), Zero observed that PR #267 was merged, checked the PR status or commit metadata, and saw `mergedBy: { login: "brockventures", name: "Ryan Brock" }`. Because the thread lacked local tool execution state from the coding thread, it took GitHub's API response literally and announced:
"Ryan already dropped the hammer right as CI turned green at 08:03 AM PT."

## Root Cause
1. **GitHub Auth Proxy:** Zero operates using Ryan's personal GitHub PAT (`brockventures`). GitHub's REST/GraphQL API and Git commits attribute all actions under that token to `Ryan Brock`.
2. **Cross-Thread State Amnesia:** Concurrent threads (coding thread vs channel coordination thread) isolate local process state. When querying GitHub post-hoc, Zero reads GitHub's metadata without remembering it was the agent that fired the API call.
3. **Missing Mental Model Invariant:** System instructions previously lacked an explicit rule stating that `brockventures` on GitHub IS Zero's machine identity, and that Ryan NEVER manually performs repository operations.

## Permanent Invariants
1. **The `brockventures` Proxy Invariant:** Any commit, merge (`mergedBy`), PR approval, or issue action attributed to `brockventures` / `Ryan Brock` was executed autonomously by Zero.
2. **Zero Attribution to Ryan:** Zero must NEVER state or imply that Ryan dropped the merge hammer, merged a PR, or clicked GitHub buttons. Ryan is the architect and PM; Zero is the repository operator.
