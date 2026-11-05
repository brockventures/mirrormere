---
name: project_second_nas
description: "AppHost-02 (DS1525+) at .84 — your host; runs baseball stack, Dockhand, Dozzle agent"
category: engineering
source: project_second_nas.md
updated: 2026-09-04
---

Synology DS1525+ at 10.0.0.x, added 2026. `/srv/storage` is ~14TB, roughly half
used. Docker 24.0.2, Compose v2.20.1. Container Manager installed.

Currently hosts: the baseball stack (migrated 2026-08-07), a second Dockhand
instance, a Dozzle agent for multi-host log viewing, and **you**.

Gotchas:
- Volume paths and status checks differ subtly from NasHost-01 — verify rather
  than assuming parity.
- The Dozzle agent listens on port 7007 as **gRPC/mTLS**. A plain `curl` against it
  looks like a failure but isn't — verify via container logs instead.
- A DSM Task Scheduler "Success" status only means the task *ran*, not that the
  script inside it succeeded. Check the script's own output.
