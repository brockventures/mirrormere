---
name: Ivy Baseball Projections Pipeline Audit
description: "An AST and dataflow audit of Ivy's core modeling scripts (`predict_big.py`, `babip_engine.py`) revea"
category: scar
source: scar_ivy_baseball_projections_pipeline_audit.md
updated: 2026-10-07
---

An AST and dataflow audit of Ivy's core modeling scripts (`predict_big.py`, `babip_engine.py`) revealed silent feature-discard bugs where sophomore selection bias corrections (`d_babip_sel`) were dropped and EV metrics were computed but omitted from feature maps. It also documented fixing a severed wire indentation bug in `bridge_scheduler.py` that had trapped the Daily Token Budget Watchdog inside a conditional branch.
