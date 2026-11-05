---
name: Gotchi E-Ink LUT Refresh Scar
description: "Setting the e-ink display's previous-frame memory buffer to white (`0xFF`) tricked the partial refre"
category: scar
source: scar_gotchi_e_ink_lut_refresh_scar.md
updated: 2026-10-29
---

Setting the e-ink display's previous-frame memory buffer to white (`0xFF`) tricked the partial refresh lookup table (LUT) into assuming new white text had zero state transition (`White -> White`), applying 0V and failing to render new characters. Preserving the true previous-frame buffer state is required for partial differential refreshes on the Gotchi hardware.
