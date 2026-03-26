# Cairn

> *A cairn is a pile of stones left by travelers to mark the path for those who follow.*

Cairn is a structured, shareable knowledge base for hard-won technical discoveries —
API quirks, undocumented behaviors, verified workarounds — encountered by developers
and AI systems working together.

The goal is simple: problems that cost hours to solve should not cost the next
person the same hours.

---

## What belongs here

- API behaviors that contradict documentation or intuition
- Errors with non-obvious root causes
- Workarounds that were verified to work (and how)
- Geo-restrictions, rate limits, timing dependencies discovered in practice

## What does not belong here

- General tutorials or how-to guides (use official docs)
- Unverified guesses
- Problems with obvious solutions

---

## Structure

```
cairn/
├── README.md          ← this file
├── schema.md          ← entry format specification
├── INDEX.md           ← searchable index of all entries
└── entries/
    ├── kalshi/        ← entries by platform
    ├── kraken/
    └── ...
```

Each entry is a single markdown file. Frontmatter is machine-readable;
the body is written for humans.

---

## Trust model

Entries include a `verified` field and a `verified_by` description.
An entry marked `verified: false` is a hypothesis, not a solution.
Do not treat unverified entries as authoritative.

---

## License

This work is licensed under [Creative Commons Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/).
Use it freely. Credit the source.

---

*Started: 2026-03-24. Seeded from Kalshi/Kraken work by Kris and Meridian.*
