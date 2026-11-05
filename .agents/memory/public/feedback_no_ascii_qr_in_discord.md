---
name: feedback-no-ascii-qr-in-discord
description: "Never output giant ASCII art QR code blocks into Discord chat — Discord automatically attaches image artifacts as clean scan-ready files"
metadata:
  type: feedback
  originSessionId: 0b8eebe0-5f7b-4c41-8297-db2c09e250de
  created: 2026-08-30
---

**Rule:** Never dump giant ASCII art blocks (especially QR codes) directly into Discord chat.

**Why:**
Ryan noted this was weird, ugly, and unnecessary. The Antigravity bridge automatically finds and attaches new image files from the artifact directory as rich Discord file attachments.

**How to apply:**
When generating QR codes (or charts/visual diagrams):
1. Save the file directly as a PNG in `/workspace/data/` or the artifact directory.
2. Embed the image via markdown or let the bridge attach it.
3. Keep the chat response text clean, brief, and actionable without monospace text art clutter.
