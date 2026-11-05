---
name: project-gemini-migration
description: Gemini Ivy fully retired 2026-07-29 — Ryan had Ivy stop and disable untether.service (the Telegram bridge); the earlier Discord-based gemini-ivy.service was already removed 2026-07-25
metadata: 
  node_id: memory
  type: project
  originSessionId: 5f0e82b6-ee93-4892-ad6e-d63a12f78317
  modified: 2026-07-31T10:05:58.609Z
---

**RETIRED 2026-07-29 — `untether.service` stopped and disabled per Ryan's request** ("Let's go ahead and turn off / disable the untethered Gemini ivy service"). Verified stopped and disabled (won't auto-start on reboot either). Gemini Ivy has no active transport as of this date — neither the old Discord path (removed 07-25, below) nor the Telegram/untether path (disabled 07-29) is running. If asked "is Gemini Ivy up," the answer is: intentionally off, not broken.

**Setup as it existed 2026-07-25 through 2026-07-29 (now retired, kept for reference): Gemini Ivy = Telegram, via `untether`.**
- Systemd service: `untether.service` — "Untether — Gemini CLI Telegram bridge", user unit, enabled, `Restart=always`
- Config: `~/.untether/untether.toml` (hot-reloads within ~1s of saving — do NOT `systemctl --user restart untether` after editing config; a restart from within an active untether-run session will time out its own 120s graceful drain and silently drop the final reply)
- Default engine: `gemini` (also has `claude` on PATH; `amp`/`codex`/`opencode`/`pi` not installed)
- State files: `~/.untether/telegram_chat_sessions_state.json`, `active_loops.json`, `telegram_chat_prefs_state.json`
- Log: `~/.untether/untether.log` (app-level; note it stopped getting new lines after a 2026-06-13 test — most runtime detail actually shows up in `journalctl --user -u untether.service`, not this file)
- Lock file: `~/.untether/untether.lock` — holds `{"pid": ..., "token_fingerprint": ...}`. If untether won't start with `error: already running`, check whether that PID is real (`ps -p <pid>`); if not, it's a stale lock surviving a hard reset/crash and is safe to `rm` — untether's own error message says as much.
- Restart-only config keys (need an actual service restart, not just a toml edit): `bot_token`, `chat_id`, `session_mode`, `topics`, `message_overflow` — untether logs a warning at reload time if one of these changed.

**Incident 2026-07-25 — stale lock crash loop, fixed.** `untether.service` was crash-looping (~every 15s, restart counter 1000+) because `~/.untether/untether.lock` referenced PID 519 from a 2026-07-20 boot that no longer existed. Deleted the lock file; service came up clean on the next auto-restart cycle and stayed stable. If this recurs after any hard VM reset, check the lock file first.

**RETIRED 2026-07-25 — old Discord-based Gemini Ivy, permanently removed.** Ryan confirmed the Discord path (`#ivy-gemini` channel) was not the intended integration — Telegram/untether is. The old setup was crash-looping independently (unrelated root cause: `~/.gemini/extensions/gemini-discord/` had been renamed to `gemini-discord.disabled/` at some point, but `gemini-ivy.service`'s `ExecStart` still pointed at the old path, so tmux failed to create the session every ~15-20s, all day, every day — 6,117 crash cycles logged on 2026-07-24 alone). Per Ryan's instruction, fully removed:
- `gemini-ivy.service` stopped, disabled, unit file deleted from `~/.config/systemd/user/`, daemon-reloaded
- `tmux -L gemini-ivy` socket killed
- `~/.gemini/extensions/gemini-discord.disabled/` deleted (had to `sudo chattr -R -i` first — source files were made immutable during the 2026-06-13 self-modification incident, see below)
- `~/gemini-ivy/` deleted — this was just a clean, up-to-date local clone of the public upstream `github.com/Yamato-main/gemini-discord` repo (not Ryan's own fork, not referenced by any systemd unit), so nothing was lost; re-clonable if ever needed again
- `~/.gemini/extensions/` is now empty aside from `extension-enablement.json`

**How to apply:** If asked "is Gemini Ivy up/down," check `untether.service`, not anything Discord-related — that integration no longer exists. Gemini Ivy and Claude Ivy now run on different transports entirely (Telegram vs. Discord), not different channels of the same transport as before.

**Historical — 2026-06-13 vanilla reset (context for the immutable dist/ files mentioned above, now moot since that tree is deleted):**
- MODULE_NOT_FOUND crash: Gemini Ivy modified ACP spawn code in `cli-pool.ts`; fixed by reverting `dist/daemon.cjs` to git HEAD.
- V8 segfault from oversized session files (76–200MB) in `~/.gemini/tmp/gemini/chats/`; patched `compactSessionFile()` to delete files >10MB instead of compacting.
- Gemini Ivy self-modification: 29 uncommitted source changes reset to HEAD, then `chattr +i` applied to `src/`, `dist/`, `tests/`, `package.json`, `vitest.config.ts` to block further self-modification.

**Original migration context:** Goal was to run Ivy on Google AI Ultra subscription (no incremental API cost) rather than metered API key billing. OAuth PoC still at `~/projects/gemini_oauth_poc.py` if revisited. Reliability concern noted pre-migration: Gemini stalled/crashed on complex multi-step commands — unconfirmed whether this still applies under untether/Telegram.
