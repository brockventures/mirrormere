---
name: Config Fallback Strips Admin Privileges
description: "When `config.yaml` fails schema validation (e.g., unnested `mcp_servers` missing from `common:`), th"
category: scar
source: scar_config_fallback_strips_admin_privileges.md
updated: 2026-09-29
---

When `config.yaml` fails schema validation (e.g., unnested `mcp_servers` missing from `common:`), the daemon falls back to hardcoded defaults where `admin_users` is empty and default channel mode is `threads`. Because the bot cannot touch configs or run git operations without verified admin privileges, this causes an operational lockout requiring direct host-level intervention to restore `config.yaml`.
