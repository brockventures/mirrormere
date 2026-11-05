---
name: FastEmbed Detached Task Concurrency Collision
description: "Shipped local `fastembed` (`bge-small-en-v1.5`) ONNX runtime integration for corpus vector embedding"
category: scar
source: scar_fastembed_detached_task_concurrency_coll.md
updated: 2026-10-01
---

Shipped local `fastembed` (`bge-small-en-v1.5`) ONNX runtime integration for corpus vector embedding. Initial detached run collided with an orphaned indexing process from a prior session that was still writing to the channel history vector store, causing a task failure before being re-run cleanly.
