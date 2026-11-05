---
name: Baseball data — normalize diacritics on name joins
description: Always strip diacritics when joining player names across baseball data sources (roster JSON vs projection CSV etc.)
type: feedback
originSessionId: 807f42e9-51b2-4a3f-b7e8-4810505c5c12
---
Always normalize Unicode diacritics before joining player names across baseball data sources.

**Why:** Fantrax roster JSON uses plain ASCII names ("Jose Soriano", "Eury Perez") while projection CSVs and actuals use accented names ("José Soriano", "Eury Pérez"). Case-sensitive or accent-sensitive matching silently misses rostered players, making them appear as free agents.

**How to apply:** Whenever joining/matching player names across any two baseball data sources, normalize both sides first:

```python
import unicodedata
def normalize(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn').lower()
```

Apply this to every name lookup — roster checks, waiver analysis, dollar value comparisons, email digest lookups, etc.
