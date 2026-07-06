---
id: kalshi-order-endpoint-v2-migration
platform: kalshi
category: schema
symptom: "410 deprecated_v1_order_endpoint on every order placement"
tags: [orders, v2, migration, schema, breaking-change]
discovered: 2026-07-06
verified: true
verified_by: "Cross-checked against Kalshi's live OpenAPI spec at docs.kalshi.com/openapi.yaml (v3.23.0), not just the error message/docs summary. Confirmed old POST/DELETE paths have no operation defined at all in the spec. Applied to kalshi-moon.py, kalshi-drop.py, kalshi-bull.py; kalshi-bull.py --dry-run verified clean end-to-end after the fix (auth + balance + market scan)."
severity: high
---

## Problem

All order placement started failing with:
```
410 {"error":{"code":"deprecated_v1_order_endpoint","message":"Please switch to the V2 endpoints",...}}
```

This is not a simple path rename — Kalshi moved order creation/cancellation to
new endpoints with a materially different request/response schema. Reading the
error's linked doc page alone (or a single WebFetch summary of it) is not
enough to trust blindly; confirm against the actual OpenAPI spec, since order
placement is real-money code.

## Root Cause

Per `https://docs.kalshi.com/openapi.yaml` (fetch the raw spec, not just the
rendered doc page — it's linked from the HTML as `/openapi.yaml`):

- `POST /portfolio/orders` (create) is **removed**. Only `GET` remains on that
  path now (for listing/reading orders — unaffected).
- `DELETE /portfolio/orders/{order_id}` (cancel) is **removed** too.
- New endpoints: `POST /portfolio/events/orders` (create), `DELETE
  /portfolio/events/orders/{order_id}` (cancel).
- New request body drops `side: yes/no` + `action: buy/sell` + integer-cents
  `yes_price`/`no_price` in favor of a single-book model:
  - `side`: `bid` (buy YES) or `ask` (sell YES) — **always quoted from the
    YES side of the book**, even when your intent is a NO-side order.
    Selling YES at price P is economically the same as buying NO at `1-P`.
  - `price`: fixed-point **dollar string**, e.g. `"0.5600"` — not integer
    cents.
  - `count`: fixed-point string, e.g. `"10.00"` — not a plain int.
  - `time_in_force` (required): `fill_or_kill` | `good_till_canceled` |
    `immediate_or_cancel`. There is no more explicit `type: limit|market` —
    a "market order" is emulated as `immediate_or_cancel` with an aggressive
    price (the old slippage-cap price still works as the IOC price).
  - `self_trade_prevention_type` (required): `taker_at_cross` | `maker`.
- Response shape also changed: `CreateOrderV2Response` returns
  `{order_id, client_order_id, fill_count, remaining_count,
  average_fill_price, average_fee_paid, ts_ms}` flat — **no nested `"order"`
  key** like the old `CreateOrderResponse` had. Any code doing
  `res["order"]["id"]` needs a fallback to `res["order_id"]` directly, or it
  silently gets `None`/`"?"`.
- `average_fill_price` is quoted from the YES side too, matching `price`.
- The `Order` object returned by the still-live `GET /portfolio/orders(/{id})`
  dropped the plain-cents `yes_price`/`no_price` fields entirely — only
  `yes_price_dollars`/`no_price_dollars` remain. `side`/`action` are still
  present but deprecated (removal "not before May 14, 2026"); prefer
  `outcome_side`/`book_side` going forward.

## Solution

Map old params to new body inside the client, so calling code (`place_order(side, action, yes_price=..., no_price=...)`) doesn't need to change:

```python
def place_order(self, ticker, side, action, count, order_type,
                yes_price=None, no_price=None) -> dict:
    price_cents = no_price if no_price is not None else yes_price
    book_side     = "bid" if (side == "yes") == (action == "buy") else "ask"
    price_dollars = (price_cents if side == "yes" else 100 - price_cents) / 100
    body = {
        "ticker": ticker,
        "side": book_side,
        "count": f"{count:.2f}",
        "price": f"{price_dollars:.2f}",
        "time_in_force": "good_till_canceled" if order_type == "limit"
                         else "immediate_or_cancel",
        "self_trade_prevention_type": "taker_at_cross",
    }
    return self.post("/portfolio/events/orders", body)

def cancel_order(self, order_id: str) -> dict:
    return self.delete(f"/portfolio/events/orders/{order_id}")
```

And fix any response parsing that assumed a nested `"order"` object:
```python
order_id = (res.get("order", {}).get("order_id")  # old shape, harmless if absent
            or res.get("order_id") or "?")          # new flat shape
```

## Verification

Confirmed via the actual OpenAPI spec (`operationId: CreateOrderV2` /
`CancelOrderV2` at `/portfolio/events/orders`), not just the deprecation
message or a summarized doc fetch. `kalshi-bull.py --dry-run` ran multiple
cycles cleanly post-fix (auth signing unaffected — GET endpoints didn't move).
Live order placement not yet confirmed by an actual fill at time of writing;
Kris restarted all three scripts (moon/drop/bull) to monitor.
