---
name: Gotchi Channel Latency Root Causes
description: "Secondary channels like Gotchi suffer 2–4+ minute response latencies due to cold starts and bloated "
category: scar
source: scar_gotchi_channel_latency_root_causes.md
updated: 2026-10-31
---

Secondary channels like Gotchi suffer 2–4+ minute response latencies due to cold starts and bloated session history, whereas primary channels remain warm in memory. Cold-booting session context outside the four pinned primary rooms is the key bottleneck for turn performance.
