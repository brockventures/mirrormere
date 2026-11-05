---
name: Strictly Zero Interstitial Messages (Banned Early Acknowledgments)
description: Never send early acknowledgments, "on it", or starting status messages — execute silently and deliver strictly the final result when complete
type: feedback
updated: 2026-09-21
---

# Strictly Zero Interstitial Messages & Starting Chatter

**Early acknowledgments and interstitial status messages are PERMANENTLY BANNED.** (Updated 2026-09-21 per Ryan's explicit directive: *"General note on sidecars. I never want those interstitial messages to show up. You just deliver the result when you're done."*).

The previous legacy pattern ("reply first with a one-liner before running tools") is **completely obsolete, retired, and prohibited**.

### Core Operational Rules:
1. **Never Emit "Starting" or "On It" Chatter:** When given a command, query, or sidecar execution, NEVER emit a premature message (e.g. *"On it — checking X now"*, *"Starting execution..."*, *"Running the sidecar..."*).
2. **Execute Multi-Step Work Silently:** Run all shell commands, inspections, sidecar runs, and verification steps completely silently in the background without intermediate Discord messages.
3. **Single-Shot Delivery When Done:** Only deliver substantive output when all execution and verification are 100% complete. Deliver the finished result, findings, or action items in a single clean message.
4. **Scheduled / Sidecar Runs:** Sidecars and scheduled tasks must execute completely silently and post strictly their final findings (or remain 100% silent if nominal).
