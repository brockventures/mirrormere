---
name: Ivy Memory Isolation and Lifecycle Divergence
description: "Ivy's hybrid search and vector index are physically isolated to her own container database at `/volu"
category: scar
source: scar_ivy_memory_isolation_and_lifecycle_diver.md
updated: 2026-10-02
---

Ivy's hybrid search and vector index are physically isolated to her own container database at `/opt/docker/discord-ivy-agent/workspace/data/transcript_index.db`, preventing cross-agent data contamination. Unlike Zero's scheduled daily session rollovers (02:00 PT) and Turn 0 hybrid pre-grounding pipeline, Ivy relies on turn count ceilings for session recycling and lacks identical pipeline automations.
