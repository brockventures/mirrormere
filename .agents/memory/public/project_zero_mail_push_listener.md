---
name: project_zero_mail_push_listener
description: "Zero dedicated inbound email push listener daemon on AppHost-02 (.84)"
category: engineering
source: project_zero_mail_push_listener.md
updated: 2026-09-01
---

# 📬 Zero Inbound Email Push Listener Daemon

### 1. Overview
A dedicated, lightweight daemon running on AppHost-02 (`10.0.0.x`) that provides **instant (<15s) push alerts to Discord** whenever an email is received for `zero@example.com`.

### 2. Architecture & Isolation
- **Script Location:** `/opt/docker/discord-agy-agent/zero_mail_listener.py` on AppHost-02.
- **Log File:** `/opt/docker/discord-agy-agent/zero_mail_listener.log`
- **State Store:** `/opt/docker/discord-agy-agent/data/seen_zero_emails.json`
- **Polling Loop:** 15-second query against Gmail API (`q="to:zero@example.com is:unread"`).
- **Inbox Isolation:**
  - **Zero's Mail (`To: zero@example.com`):** Triggered instantly and posted to Discord `#zero-chat` (`1542081375287640084`).
  - **Personal Mail (`To: developer@example.com`):** Completely ignored by the push daemon; preserved for the scheduled **Nightly Assistant** briefing.

### 3. Security & Operational Guardrails
- **Deterministic Sanitization:** All inbound subject lines, sender names, and snippets are stripped of zero-width unicode characters, invisible formatting, HTML tags, and Discord ping triggers.
- **Human-in-the-Loop:** All notifications are framed as read-only cards for Ryan's review. No autonomous actions are executed on email arrival.
