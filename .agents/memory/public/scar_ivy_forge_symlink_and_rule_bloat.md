---
name: Ivy Forge Symlink and Rule Bloat
description: "Updating Zero's `detached_runner.py` created a broken symlink dependency on Ivy's container (`/opt/z"
category: scar
source: scar_ivy_forge_symlink_and_rule_bloat.md
updated: 2026-10-23
---

Updating Zero's `detached_runner.py` created a broken symlink dependency on Ivy's container (`/opt/zero/workspace/tools/detached_runner.py`) that requires patching for FORGE v1.1 compatibility. Additionally, Ivy's `always_on` rules accumulated 55.4 KB of context bloat from monolithic projection and sabermetric invariant files needing conditional scoping.
