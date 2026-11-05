---
name: Feedback: Sidecar Execution Health vs Domain Findings
description: "Distinguish internal sidecar execution health from external findings/degraded container logs and acknowledge deployed fixes"
category: feedback
source: feedback_sidecar_status_classification.md
updated: 2026-09-01
---

# Feedback: Sidecar Execution Health vs Domain Findings

## Operational Invariants
1. **Sidecar Execution vs Findings:** A sidecar that completes its inspection, parses logs/APIs, and outputs findings has executed successfully (status: ok). Finding errors in external container logs (like dockhand) is the sidecar doing its job, NOT a sidecar execution failure.
2. **Acknowledge Deployed Fixes:** If a code fix or timeout expansion has already been applied (e.g. tautulli.py 25s timeout & retry deployed in 9f6f71a), do not report the sidecar as currently having an issue or failing in briefings.
3. **Nightly Assistant Reporting:** Nightly Assistant sidecar failure sections must only surface actual job crashes, unhandled exceptions, or infrastructural outages, never successful inspection passes that surfaced container warnings.
