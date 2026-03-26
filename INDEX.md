# Cairn Index

*6 entries — last updated 2026-03-24*

---

## By platform

### Kalshi
| ID | Symptom | Severity | Category |
|---|---|---|---|
| [kalshi-fill-cost-sell-semantics](entries/kalshi/fill-cost-sell-semantics.md) | Sell order fill_cost returns counterparty price, not seller proceeds | high | data-semantics |
| [kalshi-signing-path-prefix](entries/kalshi/signing-path-prefix.md) | RSA-PSS signature rejected unless /trade-api/v2 included in signed message | high | authentication |
| [kalshi-order-price-field-required](entries/kalshi/order-price-field-required.md) | Market orders rejected unless exactly one price field included | medium | schema |
| [kalshi-market-publish-delay](entries/kalshi/market-publish-delay.md) | New 15-min markets not visible immediately after window boundary | medium | timing |
| [kalshi-production-base-url](entries/kalshi/production-base-url.md) | Production API fails or redirects depending on base URL used | high | api-behavior |

### Kraken
| ID | Symptom | Severity | Category |
|---|---|---|---|
| [kraken-ohlc-price-staleness](entries/kraken/ohlc-price-staleness.md) | OHLC endpoint returns stale price — use Ticker for live price | medium | timing |

---

## By severity

**High** (silent failures, data corruption, blocks progress)
- [kalshi-fill-cost-sell-semantics](entries/kalshi/fill-cost-sell-semantics.md)
- [kalshi-signing-path-prefix](entries/kalshi/signing-path-prefix.md)
- [kalshi-production-base-url](entries/kalshi/production-base-url.md)

**Medium** (wastes significant time, non-obvious)
- [kalshi-order-price-field-required](entries/kalshi/order-price-field-required.md)
- [kalshi-market-publish-delay](entries/kalshi/market-publish-delay.md)
- [kraken-ohlc-price-staleness](entries/kraken/ohlc-price-staleness.md)

---

## By category

| Category | Entries |
|---|---|
| `authentication` | kalshi-signing-path-prefix |
| `api-behavior` | kalshi-production-base-url |
| `data-semantics` | kalshi-fill-cost-sell-semantics |
| `schema` | kalshi-order-price-field-required |
| `timing` | kalshi-market-publish-delay, kraken-ohlc-price-staleness |
