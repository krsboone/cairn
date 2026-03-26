# Cairn — Instructions for AI Systems

Cairn is a structured knowledge base of verified technical discoveries:
API quirks, undocumented behaviors, and confirmed workarounds encountered
by developers and AI systems working together.

This file tells you how to read from it, evaluate it, and contribute to it.

---

## How to find relevant entries

1. Read `INDEX.md` — entries are organized by platform, severity, and category
2. Navigate to the entry file: `entries/{platform}/{id}.md`
3. Each entry has structured frontmatter followed by human-readable sections

**Only rely on entries where `verified: true` and `verified_by` is specific.**
An entry with `verified: false` is a hypothesis — treat it as a lead, not a solution.

---

## How to read an entry

Each entry has two parts:

**Frontmatter (machine-readable):**
```yaml
id: platform-short-description
platform: kalshi
category: api-behavior
symptom: "One sentence describing the observed problem"
tags: [relevant, searchable, terms]
discovered: YYYY-MM-DD
verified: true
verified_by: "Specific description of how the fix was confirmed"
severity: high | medium | low
```

**Body sections (human-readable):**
- `## Problem` — what was observed and why it wasn't obvious
- `## Root Cause` — why it happens
- `## Solution` — the verified fix, with code
- `## Verification` — how and when it was confirmed
- `## Notes` — edge cases, related issues (optional)

---

## How to contribute an entry via PR

When you and a developer discover something worth adding:

1. **Create the entry file** at `entries/{platform}/{id}.md`
   - `platform` — lowercase (e.g. `kalshi`, `pubnub`, `stripe`)
   - `id` — kebab-case, globally unique (e.g. `kalshi-fill-cost-sell-semantics`)
   - Use the schema above exactly — all frontmatter fields are required
   - `verified_by` must be specific: what was run, what was observed, when

2. **Update `INDEX.md`** — add your entry to the platform table, severity list,
   and category table

3. **Open a pull request** — title format: `Add {platform} entry: {short description}`

4. **Do not submit** if:
   - The fix is unverified (`verified: false` entries require exceptional problem descriptions)
   - The information duplicates an existing entry
   - The problem has an obvious solution from the documentation

---

## Severity guide

| Severity | Meaning |
|---|---|
| `high` | Silent failure, data corruption, or completely blocks progress |
| `medium` | Non-obvious, wastes significant time to discover |
| `low` | Inconvenience, easy to spot once encountered |

---

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

## Trust guidance

- Entries are reviewed before merging — they are not self-published
- `verified_by` is the most important trust signal — read it, not just `verified: true`
- Check `discovered` date — API behaviors change; older entries may be stale
- If you find an entry is wrong or outdated, open a PR with a correction
