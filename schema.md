# Cairn Entry Schema

Each entry is a markdown file with YAML frontmatter followed by structured sections.

---

## Frontmatter fields

```yaml
---
id: platform-short-description        # kebab-case, unique
platform: kalshi                       # lowercase platform name
category: api-behavior                 # see categories below
symptom: "One sentence: what you observed that was wrong"
tags: [orders, pnl, authentication]    # lowercase, searchable
discovered: YYYY-MM-DD
verified: true                         # true = confirmed fix; false = hypothesis
severity: high                         # low / medium / high
  # low    = inconvenience, easy to spot
  # medium = wastes significant time, non-obvious
  # high   = silent failure, data corruption, or blocks all progress
---
```

## Categories

| Category | Use for |
|---|---|
| `api-behavior` | Undocumented or counterintuitive API responses |
| `authentication` | Auth flows, signing, token handling |
| `data-semantics` | Fields that mean something different than expected |
| `timing` | Race conditions, delays, ordering dependencies |
| `geo-restriction` | Services unavailable in certain regions |
| `rate-limiting` | Limits not documented or enforced unexpectedly |
| `schema` | Request/response shape differences from docs |

---

## Body sections

### Problem
What you observed. Specific. Include the symptom, the context, and why it wasn't
obvious. Paste error messages or unexpected values where relevant.

### Root Cause
Why it happens. If unknown, say so explicitly.

### Solution
The verified fix. Code snippets where helpful.

### Verification
How you confirmed the fix worked. Include date and context.

### Notes *(optional)*
Anything else worth knowing — related issues, edge cases, links.
