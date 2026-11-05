---
name: Decision Card Immediate Click Feedback
description: "Discord Decision Cards suffered from a lack of visual feedback when buttons were clicked because `in"
category: scar
source: scar_decision_card_immediate_click_feedback.md
updated: 2026-10-26
---

Discord Decision Cards suffered from a lack of visual feedback when buttons were clicked because `interaction.response.defer()` silently queued actions without updating component state. Resolved in build `fg-1792952486-instant-decision-c` by implementing immediate optimistic button state updates and increasing shell handler timeouts to 180s to prevent silent UX drops during asynchronous background actions.
