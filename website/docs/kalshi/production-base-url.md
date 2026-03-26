---
id: kalshi-production-base-url
platform: kalshi
category: api-behavior
symptom: "Production API calls fail or redirect depending on which base URL is used"
tags: [authentication, base-url, production, dns]
discovered: 2026-03-01
verified: true
verified_by: "Confirmed api.elections.kalshi.com working in production as of 2026-03. Crypto 15-minute markets successfully discovered and traded. trading-api.kalshi.co confirmed NXDOMAIN via DNS lookup."
severity: high
---

## Problem

Multiple base URLs exist or are referenced in documentation and community posts
for the Kalshi production API. Some do not work:

- `trading-api.kalshi.com` — redirects with a message pointing elsewhere
- `trading-api.kalshi.co` — NXDOMAIN (does not resolve)
- `api.elections.kalshi.com` — **correct, works**

Additionally, `api.elections.kalshi.com` serves elections/political markets
through the general `/events` endpoint. Crypto series (e.g. `KXBTC15M`) are
not returned by `/events` and must be queried directly by `series_ticker`.

## Root Cause

Kalshi appears to have reorganized their API domain structure. The `.co` domain
variant was used historically and is no longer valid.

## Solution

```python
# Demo environment
DEMO_BASE = "https://demo-api.kalshi.co/trade-api/v2"

# Production environment
PROD_BASE = "https://api.elections.kalshi.com/trade-api/v2"

# Crypto markets — query by series, not by /events
resp = session.get(f"{BASE}/series/{series_ticker}/markets", headers=headers)
```

## Verification

Confirmed working against production as of 2026-03. Crypto 15-minute markets
(`KXBTC15M-*`, `KXETH15M-*`) successfully discovered and traded via
`api.elections.kalshi.com`.

## Notes

Demo environment only contains end-of-day price-level markets (`KXBTCD`, `KXETHD`).
The 15-minute up/down series only exist in production.
