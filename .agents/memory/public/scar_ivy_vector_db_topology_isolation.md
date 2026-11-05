---
name: Ivy Vector DB Topology Isolation
description: "Ivy's vector database is physically air-gapped at `/opt/docker/discord-ivy-agent/workspace/data/"
category: scar
source: scar_ivy_vector_db_topology_isolation.md
updated: 2026-10-02
---

Ivy's vector database is physically air-gapped at `/opt/docker/discord-ivy-agent/workspace/data/transcript_index.db` to prevent cross-contamination with Zero's index on DS1525+. Universal rules and `detached_runner.py` with the 2-minute threshold and `PYTHONPATH` fixes were deployed alongside the isolated indexing pipeline.
