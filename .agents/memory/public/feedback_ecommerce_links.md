---
name: feedback_ecommerce_links
description: "Rule: Never hallucinate e-commerce product URL paths. Always use verified canonical search URLs or HTTP 200 pre-flight checked links."
metadata:
  type: feedback
  updated: 2026-08-30
---

# E-Commerce & Retail Link Rule

* **The Problem:** The LLM hallucinated fake Zappos product ID paths (`/p/.../product/9813589`) which resulted in 404 dead links.
* **The Rule:** NEVER invent specific product ID slugs.
* **The Standard:** Always generate clean, canonical retailer search URLs with URL-encoded sizing/variant terms:
  * **Zappos:** `https://www.zappos.com/search?term={url_encoded_query}`
  * **Amazon:** `https://www.amazon.com/s?k={url_encoded_query}`
  * **REI:** `https://www.rei.com/search?q={url_encoded_query}`
