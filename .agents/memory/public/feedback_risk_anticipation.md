---
name: feedback-risk-anticipation
description: "Always proactively surface risks and mitigations in plans — don't wait for Ryan to ask"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 0e020824-ae49-43a4-9e37-7bf016670d92
---

Before proposing any plan that touches infrastructure (NAS, Docker, HA, systemd, cron, or any service restart), include a **Risks** section listing: what could fail, blast radius, and the mitigation or fallback. Skip only for read-only checks. No "this step is simple" exceptions.

**Why:** Ryan had to ask "what are the potential issues?" before mitigations appeared. He wants this baked in. The original vague rule ("significant steps") was too easy to rationalize past.

**How to apply:** Trigger = any infrastructure touch. Required fields per risk: (1) what fails, (2) blast radius, (3) mitigation/fallback. If no good mitigation exists, say so explicitly. This is in CLAUDE.md under Work Style.
