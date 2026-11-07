---
id: kalshi-exchange-sharding-collateral
platform: kalshi
category: api-behavior
symptom: "404 insufficient_shard_balance / 'Exchange user not found' on every order despite a funded account"
tags: [orders, collateral, sharding, exchange-index, breaking-change, cancel]
discovered: 2026-11-07
verified: true
verified_by: "Reproduced live against a real funded account: GET /portfolio/balance showed the entire balance on exchange_index 0 and $0.00 on index 2, while KXBTC15M/KXETH15M markets report exchange_index: 2. After a UI transfer to shard 2 the same scripts placed orders successfully (4 resting orders confirmed, all exchange_index: 2). Field names and routing semantics cross-checked against the live OpenAPI spec at docs.kalshi.com/openapi.yaml (v3.36.0), not just the rendered docs."
severity: high
---

## Problem

Every order fails, while market discovery, auth and balance all work fine:

```
BUY KXETH15M-26NOV070830-30 [yes] failed: 404 {"error":{
  "code":"insufficient_shard_balance",
  "message":"insufficient shard balance",
  "details":"Exchange user not found. For Predictions: reference documentation
             Exchange Sharding documentation."}}
```

Three things make this misleading:

1. **The status is `404`, not `402`/`403`.** It reads like a wrong endpoint or a
   dead path — exactly what a recent order-endpoint migration would look like.
2. **"Exchange user not found"** reads like an auth or account-provisioning
   problem. It is not. Auth is fine.
3. **`GET /portfolio/balance` reports a healthy number.** The top-level
   `balance` field is a *cross-shard aggregate*, so the account looks funded.

## Root Cause

Kalshi split its matching engine into independent shards identified by
`exchange_index`, and **each shard holds its own collateral**. An order is paid
for out of its market's shard alone.

| `exchange_index` | Category |
|---|---|
| 0 | Default — everything not listed below |
| 1 | Exotics (combos) |
| 2 | **Crypto & commodities** |
| 3 | Sports (tennis, baseball, basketball) |

The Kalshi web app moves funds between shards automatically. **The API does
not.** So an account funded entirely through the UI, then traded through the
API, has all its cash on shard 0 while every crypto market lives on shard 2.

Diagnose it with the per-shard breakdown, which the same response already
carries:

```jsonc
{
  "balance": 4250,                 // aggregate — looks fine, is not spendable
  "balance_breakdown": [
    {"balance": "42.5000", "exchange_index": 0},   // all of it
    {"balance": "0.0000",  "exchange_index": 1},
    {"balance": "0.0000",  "exchange_index": 2},   // crypto — empty
    {"balance": "0.0000",  "exchange_index": 3}
  ]
}
```

Every market object also reports its own `exchange_index`. Compare the two and
the failure is obvious:

```
KXBTC15M-26NOV070830-30  →  exchange_index: 2
```

`GET /portfolio/balance?exchange_index=2` returns a *scoped* `balance` — use
that, not the aggregate, for any "do we have money?" guard.

## Fix

Move collateral onto the shard that holds the markets you trade.

**UI:** `/account/exchange-indexes`.

**API:** `POST /portfolio/intra_exchange_instance_transfer`

```jsonc
{
  "source": "event_contract",        // required: event_contract | margined
  "destination": "event_contract",   // required
  "amount": 250000,                  // required — CENTICENTS (= $25.00)
  "source_exchange_shard": 0,        // optional, default 0
  "destination_exchange_shard": 2,   // optional, default 0
  "source_subaccount": 0,            // optional, default 0 (primary)
  "destination_subaccount": 0        // optional, default 0 (primary)
}
```

Returns `{"transfer_id": "..."}`; the transfer is processed **asynchronously**.
History: `GET /portfolio/intra_exchange_instance_transfers`.

Two traps in that body:

- **`amount` is in centicents** — hundredths of a cent. $25.00 is `250000`,
  not `2500`. An easy 100× error in money-moving code.
- **`source`/`destination` are not the shard.** They are the exchange
  *instance* (`event_contract` vs `margined`); the shard is the separate
  `*_exchange_shard` pair. Setting only `source`/`destination` transfers
  nothing across shards.

## The second, quieter half: cancels route to shard 0

Order *placement* is safe — `CreateOrderV2Request.exchange_index`
"auto-routes when `ticker` is provided" if omitted, and the ticker is required
anyway. Nothing to change.

**Cancellation is not.** `DELETE /portfolio/events/orders/{order_id}` takes the
shard as a *query parameter*, and the spec is explicit:

> Auto-routing requires `market_ticker`. An `order_id` alone cannot identify
> the exchange shard.
>
> …If omitted, auto-routes when `market_ticker` is provided; **otherwise
> defaults to 0.**

So a cancel sent with just the order ID goes to shard 0, finds nothing, and
returns `404` **unconditionally** for any order resting on another shard. Pass
the ticker:

```python
def cancel_order(self, order_id: str, ticker: Optional[str] = None) -> dict:
    params = {"market_ticker": ticker} if ticker else None
    return self.delete(f"/portfolio/events/orders/{order_id}", params=params)
```

This is worse than a failed cancel, because of a very common idiom:

```python
except requests.HTTPError as ce:
    if ce.response.status_code == 404:
        log.info("  Cancel 404 → filled during wait")
        filled = True          # ← now always true. Phantom position.
```

A cancel-404 legitimately means "the order filled just before you cancelled,"
so treating it as a fill is reasonable — until sharding makes that 404
guaranteed. Then every cancel is recorded as a fill, the bot books positions it
does not hold, and any safeguard built on cancelling unfilled orders silently
stops working.

Verifying against `GET /portfolio/orders/{order_id}` before believing the 404
is a real improvement, and it is worth doing — but it is not sufficient, which
is the part worth knowing. Observed live:

```
Cancel 404 for 01a1b634… — checking if filled…
Order status='resting'  filled=0
WARNING  Cancel 404 but filled_count=0 — marking cancelled
Tracking 4 order(s) — 0 open buy(s)  0 filled
All orders settled — sleeping until next window…
```

The verification correctly refused to invent a fill. But the order was still
`resting` on the exchange, and the bot marked it cancelled and stopped
tracking it. So the bug converts from *phantom position* to *untracked live
order* — which for any strategy whose edge depends on rare fills (longshots,
tails) is the more expensive of the two, because the fill that pays for
everything else arrives on an order nobody is watching and no exit gets placed.

Treat a cancel-404 as **unknown**, not as a terminal state: re-query, and if
the order is still `resting`, keep tracking it and retry the cancel with the
ticker rather than marking it done.

**Unaffected:** the read endpoints. `GET /portfolio/orders/{order_id}` takes no
shard parameter, and `GET /portfolio/orders` uses a shard *filter* that
"returns results from all exchange shards" when omitted.

## Lesson

When an aggregate and a per-item breakdown disagree, the breakdown is the one
that spends. A single summary number that sums across independent collateral
pools will pass every balance check you write and fail every order you send.

And the HTTP status is a hint, not a diagnosis — this one is a funding problem
wearing a `404`.
