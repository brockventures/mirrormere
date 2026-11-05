---
name: memsearch — future memory upgrade
description: Pinned for future implementation — semantic memory search to replace grep-based retrieval once memory depth warrants it
type: project
originSessionId: 569ef962-eb73-4487-9834-4f62cdf07efa
---
**Plan:** Replace/augment Claude Code's built-in grep-based memory retrieval with [memsearch](https://github.com/zilliztech/memsearch) (markdown-first, hybrid semantic+BM25 search, inspired by OpenClaw).

**Why:** Built-in auto-memory uses grep — breaks down after months of accumulated entries when exact wording isn't remembered. memsearch finds relevant memories by meaning, not just keywords.

**Why we're waiting:** Memory is still shallow. Retrieval isn't a bottleneck yet. Revisit in 2-3 months.

**How to apply:** When memory retrieval becomes noticeable friction (can't surface right context, relevant past decisions missed), install memsearch as a ccplugin (4 shell hooks + background watch process — no Node/MCP needed). Reference: [Milvus blog post](https://milvus.io/blog/adding-persistent-memory-to-claude-code-with-the-lightweight-memsearch-plugin.md).
