---
name: Arch Security Shared Repo Audit
description: "Engineering architecture and post-mortem notes derived from security_shared_repo_audit.md"
category: engineering
source: security_shared_repo_audit.md
updated: 2026-09-11
---

# Comprehensive Security Architecture Audit: Zero Shared Repository & Multi-Tenant Defense

**Audit Date:** 2026-08-30  
**Target:** Shared GitHub Repository Deployment (Crab Cavern / Public Open Source)  
**Classification:** CRITICAL SECURITY SPECIFICATION & AUDIT REPORT  
**Verdict:** ⛔ **CRITICAL RISK — DEPLOYMENT BLOCKED AS-IS**

---

## 1. Executive Summary & Core Verdict

A deep security architecture audit of `/workspace` was conducted to evaluate the safety of turning Zero's codebase into a public or shared GitHub repository for Crab Cavern peer agents and external collaborators.

### Key Audit Findings:
1. **Critical Secret & PII Sprawl**: Live credentials, active Google OAuth refresh tokens (with Gmail modification and Drive read scopes), Banana bearer tokens, AT&T gateway access codes/WiFi passwords, private SSH keys, and detailed personal PII (full home address in Redwood City, family members' names, birthdates, phone numbers, and complete financial spreadsheets) are currently hardcoded directly into source files in `/workspace/tools/`, `/workspace/config/`, `/workspace/data/`, and `/workspace/memory/`.
2. **Missing Repository Defense Layer**: There is currently **no `.gitignore` file** in `/workspace`. Standard `git add .` or `git add -A` will stage all private keys, `.env`, credentials in `config/`, data directories containing address books and spreadsheets, and memory notes.
3. **Severe Multi-Tenant Execution Vulnerability**: Zero's external message processing (`bridge.py`) executes turns in Crab Cavern using `--dangerously-skip-permissions` inside the **same un-sandboxed container** that mounts host SSH keys (`/root/.ssh/id_ed25519`), private secrets (`/secrets/`), and direct LAN network routes to Synology NAS hosts (`10.0.0.x`, `10.0.0.x`). The only security layer is soft prompt instructions (`DEFAULT-DENY PRIVACY ACTIVE`), which provides zero deterministic protection against Indirect Prompt Injection (IPI) or malicious tool invocations.
4. **Scrubber Bypass & Command Exposure**: Outbound regex scrubbing in `bridge.py` (`scrub_credentials`) is ineffective against Google refresh tokens, custom bearer tokens, and NAS hostnames, and does not block tool-assisted data exfiltration during execution. Furthermore, Discord commands such as `!reload` in external channels allow unauthenticated process manipulation.

---

## 2. Hardcoded Secret & PII Scan Findings

### 2.1 Private Homelab Infrastructure & Topology
* **Private IP Addresses**: `10.0.0.x` (NasHost-01), `10.0.0.x` (AppHost-02), Hue, Kasa, Thread, Smart TV, AT&T Gateway (`10.0.0.x`), UniFi Gateway (`10.0.0.x`).
* **Custom Ports**: `22` (Synology DSM SSH), `8123` (HA), `8181` (Tautulli), `3866` (Dockhand), `3000` (Browserless), `32400` (Plex).
* **Storage Paths**: `/opt/docker/`, `/mnt/storage/`, `/root/.ssh/id_ed25519`.

### 2.2 Active Secrets & API Keys
* **Google OAuth Credentials & Live Refresh Tokens** in `/workspace/config/google_oauth.json` and `youtube_oauth.json`.
* **Crab Cavern Banana Token** in `/workspace/data/banana_credentials.json`.
* **Network & Gateway Credentials** in `/workspace/.env`.

### 2.3 Personal PII in Source Files
* Full residential address on Highland Ave hardcoded across `tools/build_friends_sheet.py` (L57, L68, L79, L90, L524, L579).
* Phone numbers hardcoded in `tools/update_master_birthdays.py` (L7, L10).
* Full financial models and family spreadsheets in `/workspace/data/`.

---

## 3. Defense & Remediation Roadmap

### Phase 1: Pre-Git Source Sanitization
1. **Scrub Hardcoded PII from Python Scripts**: Refactor `build_friends_sheet.py` and `update_master_birthdays.py` to read dynamically from external data files, never hardcoded in python source.
2. **Parameterize Homelab Tools**: Refactor all tools (`sidecars.py`, `ha_mcp.py`, `dockhand_update.py`, `tautulli.py`, `browser_tool.py`) to read hostnames/ports from `os.environ` with safe fallback defaults.
3. **Move OAuth Tokens to `/secrets/`**: Eliminate all plaintext JSON credentials from `/workspace/config/`.

### Phase 2: Repository Segregation & Automated Pre-Commit Hook
1. Deploy production Default-Deny `.gitignore`.
2. Deploy `.git/hooks/pre-commit` using `validate_commit_safety.py` to cryptographically block staging of any private IPs, ports, tokens, or PII.

### Phase 3: Multi-Tenant Host Hardening (Crab Cavern Security)
1. **Authenticate Admin Commands**: Restrict `!reload`, `!reset`, and `/model` strictly to Ryan's Discord User ID.
2. **Decouple External Agent Execution**: External multi-agent channels must run in a sandboxed execution context without access to host SSH keys (`id_ed25519`), `/secrets/`, or local NAS management MCP tools.
