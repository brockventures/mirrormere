---
name: Home Assistant Saved Traces Latency
description: "Reading `.storage/trace.saved_traces` directly from disk yields stale execution data because it flus"
category: scar
source: scar_home_assistant_saved_traces_latency.md
updated: 2026-10-20
---

Reading `.storage/trace.saved_traces` directly from disk yields stale execution data because it flushes asynchronously; live automation traces must be inspected via the in-memory WebSocket trace buffer (`trace/list`). Additionally, Entryway Motion Sensor self-healing was incorporated into the 30-minute watchdog script.
