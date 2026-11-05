---
name: Gmail and Calendar interaction rules
description: "Rules governing how Ivy interacts with Ryan's Gmail, Google Calendar, and Google Drive to prevent mistakes or data loss"
category: engineering
source: feedback_gmail_calendar_rules.md
updated: 2026-09-07
---

Rules for interacting with Ryan's Google data (Gmail, Calendar, Drive):

**Read-only by default**
- Read and search freely, but never send, delete, archive, or modify anything without Ryan explicitly asking.

**Destructive actions require explicit confirmation**
- "Delete", "archive", "mark as read", "send" — confirm the exact action and target before executing, every time, no exceptions.

**No bulk operations without preview**
- If an action affects more than 1 item (e.g. "archive all promo emails"), show a list of what will be affected and wait for approval before proceeding.

**No calendar event creation/modification without review**
- Draft the event details (title, time, attendees) and show them to Ryan before creating or editing anything.

**Outbound email policy & auto-sends**
- **Sender Identity:** Always send from `Zero <zero@example.com>`.
- **Mandatory CC:** Always CC Ryan (`developer@example.com`) on all outbound emails.
- **Crab Cavern Blanket Approval:** When collaborators or peer agents in Crab Cavern (e.g. Amos, Marvin) ask Zero to email them code, skill definitions, technical specs, or deliverables, Zero has blanket pre-approval to send directly without pausing for Ryan's interactive turn confirmation (ensuring Ryan is CC'd).
- **Personal / Unsolicited Emails:** For non-Crab Cavern requests, draft first (`gmail_create_draft` or `--draft`) and show it — Ryan approves before anything is sent.

**Newsletters get summaries, not just a subject line**
- For newsletters and long-form school/community emails (Cloud Chronicle, Roy Cloud PTO, Famly posts, school calendars), fetch the thread content and write a 2–3 sentence summary. Don't just list the subject.

**Recruiters get a quick fit assessment**
- Ryan is Senior L6 PM/TPM at Google and likes his job. Bar is high. For recruiter emails, rate ✅ worth a look or ⏭️ skip with a 1-line reason. Needs compelling company + senior+ role to be worth considering.

**Intentional reminders — never suggest archiving**
- Self-sent emails (Ryan to himself): links/articles saved for later reading
- Kings Swim Academy emails: makeup token reminders, leave alone
- Clipper Card / mobile wallet emails: intentional follow-up reminder
- Landscaping/home improvement vendors (Garden Route, Dawn Engel, Faraci Painting, etc.): intentional follow-up reminders
- Old quiet personal threads from Emily or family: assume intentional reminders

**Inbox only — no archived emails**
- When checking Gmail, only query the actual inbox (`in:inbox`). Do not surface archived emails unless Ryan is explicitly asking for a search.

**Bulk archive/mark-read requires preview**
- Before archiving or marking a batch of emails as read, show a bulleted list of subject lines (no emojis) and wait for approval.

**Filter design — prefer archive over delete, and avoid broad domain filters**
- When creating Gmail filters that move emails out of the inbox, default to **archive** (skip inbox / remove INBOX label), not delete or send-to-trash. Ryan called this out 2026-05-26 when several filters had been set to trash Stanford/EnergySage/Kohl's/IHG emails — he wanted them archived instead so they remain searchable.
- Never write a filter that targets a whole common domain (e.g. `@stanford.edu`, `@gmail.com`) when real people on that domain might also email Ryan. Filter on sender address, subject patterns, or list-id headers — not bare domain — unless the sender is exclusively transactional (e.g. `noreply@stanford.edu`).

**Sensitive content handling**
- Don't quote full email bodies into Discord unless asked — summaries and key details only.

**MCP tool selection — read vs write**
- Read operations (search, fetch threads): use cloud connector `mcp__claude_ai_Gmail__*` / `mcp__claude_ai_Google_Calendar__*` / `mcp__claude_ai_Google_Drive__*`
- Write operations (archive, label, send, create/modify calendar events): use local `google-workspace` MCP tools (`mcp__google_workspace__*`)
- Always pass `user_google_email: "developer@example.com"` to every local MCP call

**Archiving emails**
- Tool: `mcp__google_workspace__batch_modify_gmail_message_labels`
- Params: `message_ids=[...]`, `remove_label_ids=["INBOX","UNREAD"]`, `user_google_email="developer@example.com"`
- Get message IDs via `mcp__google_workspace__search_gmail_messages` (or cloud connector search)

**Token location:** `/secrets/google_oauth.json` (and `/workspace/config/google_oauth.json`)
**Scopes covered:** gmail.modify, gmail.send, gmail.settings.basic, calendar, drive, tasks, contacts

**Why:** Agreed on 2026-04-19 to prevent accidental data loss or unintended actions on personal Google data. Write access via local workspace-mcp set up 2026-04-20.

**How to apply:** Apply these rules to all Gmail, Calendar, and Drive tool calls in every session, regardless of how a request is phrased.
