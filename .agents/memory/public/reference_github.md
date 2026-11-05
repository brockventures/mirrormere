---
name: GitHub SSH access
description: SSH key is set up for GitHub — always use git@github.com, never HTTPS
type: reference
originSessionId: 55999605-12de-422d-b8fd-f433ea42c3ab
---
SSH key `~/.ssh/id_ed25519` (ivy@pixel-vm) is registered on the brockventures GitHub account.
Fingerprint: SHA256:n05BQwnFAnk1CpA4odIgz+es9gCcGLa++IS81kdk47w — added Apr 15, 2026.

**Always clone with SSH:**
`git clone git@github.com:brockventures/REPO.git`

Never use HTTPS (`https://github.com/...`) — it will fail with no credential prompt.

Test auth: `ssh -T git@github.com`
