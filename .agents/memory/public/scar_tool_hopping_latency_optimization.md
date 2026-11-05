---
name: Tool Hopping Latency Optimization
description: "High turn latency (3+ minutes) was diagnosed as excessive serialized tool hopping (40+ individual in"
category: scar
source: scar_tool_hopping_latency_optimization.md
updated: 2026-09-08
---

High turn latency (3+ minutes) was diagnosed as excessive serialized tool hopping (40+ individual invocations per turn). Mitigations include consolidating multi-step verification into single-shot batch scripts and raising `WaitMsBeforeAsync` to 10000ms to avoid unnecessary backgrounding and polling overhead.
