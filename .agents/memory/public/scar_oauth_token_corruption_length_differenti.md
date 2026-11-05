---
name: OAuth Token Corruption Length Differential
description: "Two distinct OAuth token corruption incidents occurred within 48 hours, root-caused in part by an in"
category: scar
source: scar_oauth_token_corruption_length_differenti.md
updated: 2026-09-16
---

Two distinct OAuth token corruption incidents occurred within 48 hours, root-caused in part by an in-place write lacking truncation (`O_TRUNC`) when token string lengths changed. `tools/zero_mail_listener.py` previously crashed on invalid JSON during polling, requiring multi-tier fallback credential resolution and schema validation.
