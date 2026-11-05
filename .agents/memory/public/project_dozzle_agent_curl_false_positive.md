---
name: project_dozzle_agent_curl_false_positive
description: "dozzle-agent on .84 always fails a plain curl HTTP check (empty reply, exit 52) even when healthy — it's gRPC/mTLS, not HTTP"
category: engineering
source: project_dozzle_agent_curl_false_positive.md
updated: 2026-09-04
---

Heartbeat check 1c (`curl http://10.0.0.x:7007/`) against dozzle-agent
consistently returns `http_code=000 exit=52` (empty reply from server) —
looks like a hard connection failure. Confirmed via `docker logs dozzle-agent`
on 08-07 that it's actually healthy: listening on `[::]:7007`, and had
recently exchanged "Updated notification config from main server" with
NasHost-01's Dozzle instance minutes earlier.

**Why:** Dozzle's agent mode speaks gRPC over mTLS on that port, not plain
HTTP — a bare `curl -f` GET will never get a normal response even when the
agent is fully functional. This is a check-design mismatch, not a service
issue.

**How to apply:** If check 1c (or any future ad-hoc check) shows
`dozzle-agent:000`/empty-reply, don't alert on that alone — verify via
`docker logs --tail 20 dozzle-agent` on AppHost-02 for "Agent listening"
and recent "Updated notification config" lines instead. Treat curl-empty-reply
against this specific port as expected, not a failure signal. See
[[project_dozzle_multihost]] for the original setup.
