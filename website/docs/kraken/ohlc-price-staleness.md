---
id: kraken-ohlc-price-staleness
platform: kraken
category: timing
symptom: "OHLC endpoint returns stale price data — current candle may be minutes old"
tags: [price-feed, ohlc, real-time, ticker]
discovered: 2026-03-10
verified: true
verified_by: "Ticker endpoint confirmed returning live price consistent with exchange display. Used in production for time-sensitive Kalshi straddle entry decisions without observed staleness issues. 2026-03-10."
severity: medium
---

## Problem

When using the Kraken OHLC endpoint (`/0/public/OHLC`) to get the current
BTC or ETH price for a time-sensitive decision (e.g. options entry within a
2-minute window), the returned price may reflect the open of the current candle
rather than the live market price. For a 1-minute candle, the price can be up
to 60 seconds stale.

## Root Cause

OHLC candles represent a completed or in-progress time window. The `close`
price of the current (incomplete) candle is the last trade price *within that
candle*, which may not reflect the most recent trade.

## Solution

Use the Kraken Ticker endpoint for live price instead of OHLC:

```python
import requests

def get_kraken_price(pair: str = "XBTUSD") -> float:
    """Returns current last trade price. pair examples: XBTUSD, ETHUSD"""
    url = "https://api.kraken.com/0/public/Ticker"
    resp = requests.get(url, params={"pair": pair}, timeout=5)
    data = resp.json()
    result = data["result"]
    key = list(result.keys())[0]
    return float(result[key]["c"][0])  # 'c' = last trade closed [price, lot volume]
```

Use OHLC for historical/volatility calculations where a few seconds of staleness
is acceptable. Use Ticker for the current price when timing matters.

## Verification

Confirmed 2026-03-10. Ticker endpoint returns live price consistent with
exchange display. Used in production for Kalshi straddle entry decisions.

## Notes

Binance is geo-blocked from at least some US residential IPs and should not be
used as a primary price feed in those environments. Kraken is a reliable
alternative with no observed geo-restrictions.

CoinGecko simple price (`/api/v3/simple/price`) is a viable fallback but
updates less frequently (~30-60s delay).
