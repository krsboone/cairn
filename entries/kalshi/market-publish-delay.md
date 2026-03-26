---
id: kalshi-market-publish-delay
platform: kalshi
category: timing
symptom: "New 15-minute markets not visible via API immediately after the window boundary"
tags: [markets, timing, 15-minute, discovery]
discovered: 2026-03-20
verified: true
severity: medium
---

## Problem

When polling for new 15-minute markets (e.g. `KXBTC15M`, `KXETH15M`) immediately
after a UTC time boundary (e.g. 16:00:00), the markets are not yet returned by
the API. A script that sleeps until the boundary and then immediately queries
for markets will find nothing and may sleep all the way to the next boundary —
missing the entire entry window.

## Root Cause

Kalshi takes approximately 30–60 seconds after each 15-minute boundary to
publish new markets to the API. This delay appears to be consistent.

## Solution

Poll with short retries during the first ~3 minutes of each window rather than
treating an empty result as definitive:

```python
POLL_INTERVAL = 15      # seconds between retries when no markets found
ENTRY_MINS_MAX = 13.5   # stop trying to enter after this many minutes remain

def is_within_entry_window():
    now = datetime.now(timezone.utc)
    mins_into_window = (now.minute % 15) + now.second / 60
    return mins_into_window <= (15 - ENTRY_MINS_MAX)

# In main loop — if no markets found:
if is_within_entry_window():
    # Still in entry window, Kalshi may not have published yet
    time.sleep(POLL_INTERVAL)   # retry in 15s
else:
    # Past entry window, sleep to next boundary
    time.sleep(secs_to_next_boundary())
```

Also handle partial results (e.g. ETH found but BTC not yet visible) by
continuing to retry missing series while still within the entry window.

## Verification

Confirmed 2026-03-20. Script started before window open, found no markets at
boundary, slept 883 seconds (to next boundary) instead of retrying. Fixed by
adding POLL_INTERVAL retry logic during first minutes of window.

## Notes

BTC and ETH markets may appear at slightly different times after the boundary.
Do not assume that finding one series means the other is also available.
