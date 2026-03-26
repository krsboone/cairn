---
id: kalshi-order-price-field-required
platform: kalshi
category: schema
symptom: "Market orders rejected unless exactly one price field is included"
tags: [orders, market-order, price, schema]
discovered: 2026-03-05
verified: true
verified_by: "Confirmed across multiple production scripts (kalshi-edge, kalshi-moon, kalshi-straddle). Orders without a price field consistently return 400. Orders with correct field and slippage cap fill reliably."
severity: medium
---

## Problem

Kalshi order placement rejects requests for market orders when no price field
is included, even though a "market order" conceptually means "fill at whatever
price is available." The API returns a 400 error.

## Root Cause

Kalshi requires **exactly one** price field on every order, including market
orders. This serves as a slippage cap — the order will not fill beyond the
specified price.

Valid price fields (use exactly one):
- `yes_price` — price in cents (integer)
- `no_price` — price in cents (integer)
- `yes_price_dollars` — price in dollars (float)
- `no_price_dollars` — price in dollars (float)

## Solution

For market orders, send the current ask price plus a slippage buffer:

```python
SLIPPAGE_CAP = 5  # cents

# Market BUY YES side
order_body = {
    "ticker": ticker,
    "side": "yes",
    "action": "buy",
    "type": "market",
    "count": qty,
    "yes_price": ask_price + SLIPPAGE_CAP,
}

# Market BUY NO side
order_body = {
    ...
    "no_price": ask_price + SLIPPAGE_CAP,
}

# Limit SELL YES side (use yes_price, not no_price)
order_body = {
    ...
    "action": "sell",
    "type": "limit",
    "yes_price": sell_price_cents,
}
```

Side/price field pairing:
- YES side (buy or sell) → use `yes_price`
- NO side (buy or sell) → use `no_price`

## Verification

Confirmed across multiple scripts (kalshi-edge, kalshi-moon, kalshi-straddle).
Orders without a price field consistently return 400. Orders with the correct
field and slippage cap fill reliably at current market prices.
