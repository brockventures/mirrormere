---
name: feedback-context-restart-removed
description: Ryan disabled the context-based auto-restart in ~/.ivy/stop.sh 2026-07-12 — found it annoying; native Claude Code auto-compaction replaces it
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 72329d0c-181d-4e15-a38e-115c3f70d085
  modified: 2026-08-10T14:22:05.173Z
---

Ryan called the context-based auto-restart "very annoying" (2026-07-12) and asked if it was needed. Removed it.

**What was removed:** the block in `~/.ivy/stop.sh` that watched `cache_read_input_tokens` after every turn, posted a Discord warning at 70% (140k/200k tokens), and at 80% (160k) killed the tmux session, ran a haiku summarizer, and respawned Claude via `ivy-restart.service`.

**What stayed:** the Discord-reply enforcement in the same hook (blocks turn-end if a Discord-tagged message got no reply/edit_message/react tool call) — that's a separate, unrelated function and Ryan didn't object to it.

**Why:** the restart logic predates Claude Code's native auto-compaction (context is now summarized automatically as it fills, without killing the session). The custom mechanism had become redundant and its downside — a hard tmux kill/respawn mid-conversation — was pure cost with no remaining benefit.

**Orphaned but not deleted:** `~/bin/ivy-summarize-and-restart.sh` and `~/bin/ivy-nightly-restart.sh` are no longer called by anything (nightly timer was already disabled 2026-06-20, see [[project_ivy_restart_lock]]) but were left on disk rather than deleted, in case Ryan wants a manual/on-demand summarized restart later.

**How to apply:** Don't reintroduce token-count-triggered restarts in `stop.sh` or elsewhere without checking with Ryan first — he prefers relying on native compaction over custom session-kill logic. If asked to add proactive context-management, default to "does the harness already do this" before building a custom mechanism.

**Checked whether native compaction actually keeps costs down, 2026-08-10 — it doesn't, by design.** Ryan asked "I thought you were supposed to auto compact but maybe that's not happening?" after seeing the huge cache-read cost numbers (see [[project_ai_provider_cost_comparison]]). Verified directly in the transcript with the most turns (1,195 writes, session `038a977f-...jsonl`, spanning 08-04 through at least 08-08): found exactly **one** real compaction event (`isCompactSummary: true` + a `system`-type entry with `compactMetadata`), dated 08-07. So compaction is real and does fire — but only when approaching a hard context ceiling, not proactively to control cost/size. Between rare compaction events, a long-lived session's context (and per-call cache-read cost) just keeps growing unchecked. **This means native compaction solves "don't hit a hard wall," not "keep this cheap/small"** — the two disabled-by-Ryan mechanisms above (nightly restart, 70/80% context restart) were actually addressing a real gap, just in a way Ryan found annoying (hard kill mid-conversation) and unnecessary (assumed compaction fully covered it, which it doesn't). Presented this to Ryan without unilaterally re-enabling anything, given he's explicitly turned off both mechanisms before.
