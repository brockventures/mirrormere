---
name: Mealie Password Reset Lockout Quirk
description: "Mealie lacks outbound SMTP configuration in Docker, requiring manual token retrieval from the DB for"
category: scar
source: scar_mealie_password_reset_lockout_quirk.md
updated: 2026-09-12
---

Mealie lacks outbound SMTP configuration in Docker, requiring manual token retrieval from the DB for password resets. Additionally, failed login attempts trigger an account lockout flag (`locked_at`) that Mealie's password reset endpoint fails to clear automatically, requiring direct database intervention to unlock.
