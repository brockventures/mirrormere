---
name: Check Discord chat history before asking Ryan
description: When confused about something that happened in a recent session, fetch Discord history before asking Ryan to repeat himself
type: feedback
originSessionId: e2e42c0e-6f68-4581-bd1b-80ec1961a5e7
---
When confused about the source, origin, or context of something (a file, a decision, a URL), use fetch_messages to scan recent Discord chat history before asking Ryan.

**Why:** Ryan expects Ivy to be self-sufficient about recent context — asking him to re-explain something that's in the chat history is unnecessary friction.

**How to apply:** Any time you'd ask "where did this come from?" or "what was the source of X?" — check Discord history first via fetch_messages on channel 1493086600970764348. Also: when you receive a short reply like "Yes", "No", or "Sure" with no obvious referent in the current conversation, fetch recent messages FIRST to identify what the user is responding to before acting. Misreading a standalone "Yes" triggered a deployment that wasn't authorized (2026-05-21 incident).
