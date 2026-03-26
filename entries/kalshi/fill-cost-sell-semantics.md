---
id: kalshi-fill-cost-sell-semantics
platform: kalshi
category: data-semantics
symptom: "Sell order fill_cost fields return the counterparty's price, not the seller's actual proceeds"
tags: [orders, pnl, fill-cost, sell, taker, maker]
discovered: 2026-03-17
verified: true
severity: high
---

## Problem

When calculating P&L from a completed SELL order, using `taker_fill_cost_dollars`
or `maker_fill_cost_dollars` directly as the sell price produces wildly incorrect
results — typically showing the complement price (e.g. 98¢) instead of the actual
sell price (e.g. 2¢).

For a YES sell order at 2¢ limit:
- `taker_fill_cost_dollars` returns ~0.98 (98¢)
- Direct use gives sell_pnl = (98 - 1) * qty = +$1.94 instead of ~$0.01

## Root Cause

Kalshi's `fill_cost` fields on SELL orders reflect what the **counterparty
(opposite-side buyer) paid**, not what the seller received. On a YES sell at 2¢,
the NO buyer pays 98¢ — so fill_cost = 98¢. This is the complement price.

Actual sell price = `100¢ − fill_cost_derived_price`

This applies consistently for both maker and taker fills:
- Maker sell at 2¢ → NO buyer pays 98¢ → fill_cost = 98¢ → actual = 100 - 98 = 2¢ ✓
- Taker sweep at 78.5¢ → NO buyer pays 21.5¢ → fill_cost = 21.5¢ → actual = 100 - 21.5 = 78.5¢ ✓

BUY orders are not affected — fill_cost for buys reflects what the buyer paid directly.

## Solution

```python
def _order_fill_price(order, side):
    """Returns fill cost in cents. For SELL orders this is the complement price.
    Caller must apply: actual_sell_price = 100 - complement"""
    fills = order.get("fills", [])
    count = sum(f.get("count", 0) for f in fills)
    if count == 0:
        return None
    total = sum(
        (f.get("taker_fill_cost_dollars", 0) + f.get("maker_fill_cost_dollars", 0))
        for f in fills
    )
    return round((total / count) * 100, 2)

# For a SELL order:
complement = _order_fill_price(sell_order, side)
if complement is not None and complement > 0:
    actual_sell_price = 100 - complement
```

## Verification

Confirmed 2026-03-17 by reconciling against known trade outcomes in trades.jsonl.
P&L calculations matched expected values after applying the complement transform.
Previously broken calculations (showing +$1.93 for a ~$0.01 trade) resolved correctly.

## Notes

The field name `fill_cost` is ambiguous — it sounds like "what the fill cost you"
but for sell orders it means "what the fill cost the other side." This is likely
intentional on Kalshi's end (they track cost to the liquidity taker) but is not
documented clearly.
