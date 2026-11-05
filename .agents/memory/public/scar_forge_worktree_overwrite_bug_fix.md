---
name: FORGE Worktree Overwrite Bug Fix
description: "Identified a bug in `tools/forge.py` where path mismatch (absolute vs. relative `target_files`) bypa"
category: scar
source: scar_forge_worktree_overwrite_bug_fix.md
updated: 2026-10-27
---

Identified a bug in `tools/forge.py` where path mismatch (absolute vs. relative `target_files`) bypassed chunk overlap detection, causing parallel git worktrees to clobber changes and conflict. The fix requires normalizing target file paths and rebasing the chunk worktree onto the default branch before verification and under `git_lk` lock, catching rebase conflicts early in the retry loop.
