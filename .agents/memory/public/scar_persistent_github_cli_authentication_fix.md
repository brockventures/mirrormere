---
name: Persistent GitHub CLI Authentication Fix
description: "`gh` CLI at `/usr/bin/gh` was erroneously thought missing because it was unauthenticated in subshell"
category: scar
source: scar_persistent_github_cli_authentication_fix.md
updated: 2026-09-22
---

`gh` CLI at `/usr/bin/gh` was erroneously thought missing because it was unauthenticated in subshell environments and container root config (`/root/.config/`) was wiped across Docker container recreations. Durable auth is resolved by reading the scoped token from `/workspace/.env` to avoid re-authentication loss during Dockhand container updates.
