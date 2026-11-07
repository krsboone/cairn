# Cairn Index

*9 entries — last updated 2026-11-07*

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
| [kalshi-order-endpoint-v2-migration](entries/kalshi/order-endpoint-v2-migration.md) | 410 deprecated_v1_order_endpoint on every order placement | high | schema |
| [kalshi-exchange-sharding-collateral](entries/kalshi/exchange-sharding-collateral.md) | 404 insufficient_shard_balance / 'Exchange user not found' on every order despite a funded account | high | api-behavior |

### Kraken
| ID | Symptom | Severity | Category |
|---|---|---|---|
| [kraken-ohlc-price-staleness](entries/kraken/ohlc-price-staleness.md) | OHLC endpoint returns stale price — use Ticker for live price | medium | timing |

### PubNub
| ID | Symptom | Severity | Category |
|---|---|---|---|
| [pubnub-set-channel-members-uuid-wrapper](entries/pubnub/set-channel-members-uuid-wrapper.md) | set_channel_members() rejects plain string UUIDs — requires wrapper object | medium | schema |

---

## By severity

**High** (silent failures, data corruption, blocks progress)
- [kalshi-fill-cost-sell-semantics](entries/kalshi/fill-cost-sell-semantics.md)
- [kalshi-signing-path-prefix](entries/kalshi/signing-path-prefix.md)
- [kalshi-production-base-url](entries/kalshi/production-base-url.md)
- [kalshi-order-endpoint-v2-migration](entries/kalshi/order-endpoint-v2-migration.md)
- [kalshi-exchange-sharding-collateral](entries/kalshi/exchange-sharding-collateral.md)

**Medium** (wastes significant time, non-obvious)
- [kalshi-order-price-field-required](entries/kalshi/order-price-field-required.md)
- [kalshi-market-publish-delay](entries/kalshi/market-publish-delay.md)
- [kraken-ohlc-price-staleness](entries/kraken/ohlc-price-staleness.md)
- [pubnub-set-channel-members-uuid-wrapper](entries/pubnub/set-channel-members-uuid-wrapper.md)

---

## By category

| Category | Entries |
|---|---|
| `authentication` | kalshi-signing-path-prefix |
| `api-behavior` | kalshi-production-base-url, kalshi-exchange-sharding-collateral |
| `data-semantics` | kalshi-fill-cost-sell-semantics |
| `schema` | kalshi-order-price-field-required, kalshi-order-endpoint-v2-migration, pubnub-set-channel-members-uuid-wrapper |
| `timing` | kalshi-market-publish-delay, kraken-ohlc-price-staleness |
