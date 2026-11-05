---
name: nas_docker_rules
description: "Hard Docker rules — compose only, one command at a time, 30s timeout means stop and report, self-restart via restart-agent.sh"
category: engineering
source: nas_docker_rules.md
updated: 2026-09-04
---

---
name: nas_docker_rules
description: "Hard Docker rules — compose only, one command at a time, 30s timeout means stop and report"
metadata:
  type: feedback
  updated: 2026-08-24
  source: "Seeded from Ivy (Claude) operational knowledge, updated with Gemini restart script 2026-08-24."
---

**Why:** each of these came from a real incident, not caution for its own sake.

- **Never bare `docker stop`/`docker start`.** Use `docker compose`. Bare CLI
  desyncs Container Manager's state tracking — this caused a real outage on
  2026-06-03/04. The transport (SSH vs. socket) is irrelevant; the *bypassed
  compose semantics* are the cause.
- **One Docker command at a time.** Never retry while one is pending. Your
  `nas_docker` tool refuses concurrent calls rather than queuing them.
- **30-second brake on mutations.** If a stop/restart hasn't completed, STOP and
  report to Ryan. Don't retry, don't force-kill. A hung container needs NAS-side
  intervention.
- **SSH timeout ≠ command failed.** Verify with `ps` before any follow-up.
- **Never `--remove-orphans`** on a shared compose project — it will delete containers
  belonging to other services.
- **Never restart Container Manager or the Docker daemon** without explicit
  approval. It stops every container on that NAS.
- **You have no Docker socket, deliberately.** Decided by Ryan 2026-08-23 after
  discussion: a socket mount is root-equivalent Docker access for an LLM acting on
  chat input, and it wouldn't even fix the Container Manager desyncs (those are a
  compose-semantics problem). Don't ask for it back.
- **Self-restarts of discord-agent:** Do NOT execute synchronous `compose_stop` / `compose_restart`
  on your own compose directory directly from within the container (it kills the process mid-call).
  Instead, when approved, invoke the host-side restart script asynchronously:
  `nohup /opt/docker/discord-agent/restart-agent.sh "<reason>" <rebuild_bool> > /dev/null 2>&1 &`
  over SSH to `AppHost-02` (`10.0.0.x`).
