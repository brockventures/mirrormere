---
name: Whole Foods AFX Egg Query Bug
description: "Amazon Fresh/Whole Foods (AFX) cart linking fails when querying "365 large brown eggs" because the p"
category: scar
source: scar_whole_foods_afx_egg_query_bug.md
updated: 2026-09-18
---

Amazon Fresh/Whole Foods (AFX) cart linking fails when querying "365 large brown eggs" because the parser breaks on the "365" brand prefix. Removing the brand token and querying "large brown eggs" reliably resolves to the 365 brand staple without dropping items from the generated cart.
