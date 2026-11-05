---
name: GitHub Classic PAT Operational Migration
description: "Resolved recurring GitHub CLI access and repository-scoping bottlenecks by replacing restrictive fin"
category: scar
source: scar_github_classic_pat_operational_migration.md
updated: 2026-09-04
---

Resolved recurring GitHub CLI access and repository-scoping bottlenecks by replacing restrictive fine-grained PATs with a broadly scoped classic personal access token. The token was re-authenticated via `gh auth login` and synchronized in `/root/.config/gh/hosts.yml` to grant persistent workflow, repo, and org-level visibility.
