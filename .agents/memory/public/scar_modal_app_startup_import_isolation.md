---
name: Modal App Startup Import Isolation
description: "Orphaned Modal jobs will crash-loop indefinitely if client scripts import local workspace modules at"
category: scar
source: scar_modal_app_startup_import_isolation.md
updated: 2026-10-21
---

Orphaned Modal jobs will crash-loop indefinitely if client scripts import local workspace modules at top-level without mounting them inside the remote image definition. Keep remote execution entry points self-contained or explicitly mount referenced local helper files to avoid cloud failure loops and alert emails.
