# Contributing to Cairn

Thank you for considering a contribution. Cairn's value depends entirely on
the quality and trustworthiness of its entries. A wrong entry is worse than
no entry — it sends the next person down a false path.

Please read this before submitting.

---

## The bar for a good entry

An entry belongs in Cairn if:

- You **personally encountered** the problem and can describe exactly what you observed
- You **verified the fix works** and can describe how
- The problem is **non-obvious** — something a reasonable developer or AI system
  would not immediately know to look for
- The information is **not already clearly documented** by the platform

An entry does not belong if:

- You think it might work but haven't confirmed it
- It's a general tutorial or how-to (use official docs for that)
- The solution is obvious from the error message or documentation
- You are reproducing something you read elsewhere without verifying it yourself

---

## The verified_by field

This field is required and must be specific. It should answer:
*"How do I know this fix works?"*

**Acceptable:**
```yaml
verified_by: "Ran fix in production and confirmed correct P&L output on 2026-03-17.
  Previously calculations showed +$1.93 for a ~$0.01 trade; resolved after fix."
```

**Not acceptable:**
```yaml
verified_by: "Tested it"
verified_by: "Seems to work"
verified_by: "Based on documentation"
```

If you cannot write a specific `verified_by`, set `verified: false`. Unverified
entries are allowed but must be clearly marked and will receive additional
scrutiny in review.

---

## How to submit

1. **Fork** the repository
2. **Create a branch** named `entry/platform-short-description`
   (e.g. `entry/kalshi-rate-limit-behavior`)
3. **Add your entry** following the [schema](schema.md)
   - Place it in `entries/{platform}/` — create the folder if the platform is new
   - Update `INDEX.md` to include your entry
4. **Open a pull request** with a brief description of what you found and how you verified it

---

## Review process

All entries are reviewed before merging. Reviewers will check:

- Is the symptom clearly described?
- Is the root cause explained or honestly marked as unknown?
- Is `verified_by` specific enough to trust?
- Is the solution code correct and safe?
- Does the severity rating match the actual impact?

Reviewers may ask for clarification or additional verification detail.
Entries with `verified: false` require especially strong problem/symptom
descriptions to be accepted.

---

## Updating existing entries

If you find that an existing entry is wrong, outdated, or incomplete:

- Open a PR with the correction and explain what changed and why
- Update the `discovered` date only if the behavior itself changed
- Add a `## Notes` section if the original fix still works but has edge cases

Do not silently correct entries — the PR description is part of the trust record.

---

## A note on intent

Cairn exists to save people time. Every entry here represents hours someone
spent discovering something the hard way, offered freely so the next person
doesn't have to. Contribute in that spirit.
