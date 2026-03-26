---
id: kalshi-signing-path-prefix
platform: kalshi
category: authentication
symptom: "RSA-PSS signature rejected unless /trade-api/v2 prefix is included in the signed message"
tags: [authentication, signing, rsa-pss, headers]
discovered: 2026-03-01
verified: true
verified_by: "Confirmed working against both demo (demo-api.kalshi.co) and production (api.elections.kalshi.com) endpoints. Authenticated requests succeed consistently with prefix included; fail with 401 without it."
severity: high
---

## Problem

Kalshi API returns 401 Unauthorized when the RSA-PSS signature is computed
over just the endpoint path (e.g. `/portfolio/balance`). The signature is
silently invalid and the error message does not indicate what is wrong.

## Root Cause

The signed message must include the full base path prefix. The correct format is:

```
{timestamp_ms}GET/trade-api/v2/portfolio/balance
```

Not:
```
{timestamp_ms}GET/portfolio/balance
```

The `/trade-api/v2` prefix is part of the signed string even though it is
conceptually the base URL, not the path.

## Solution

```python
import base64
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding

def make_headers(method: str, path: str, private_key) -> dict:
    """path should be e.g. '/portfolio/balance' — prefix is added here."""
    ts = str(int(time.time() * 1000))
    msg = f"{ts}{method}/trade-api/v2{path}".encode()
    sig = private_key.sign(msg, padding.PSS(
        mgf=padding.MGF1(hashes.SHA256()),
        salt_length=hashes.SHA256().digest_size
    ), hashes.SHA256())
    return {
        "KALSHI-ACCESS-KEY": ACCESS_KEY,
        "KALSHI-ACCESS-TIMESTAMP": ts,
        "KALSHI-ACCESS-SIGNATURE": base64.b64encode(sig).decode(),
        "Content-Type": "application/json",
    }
```

Key details:
- Timestamp is milliseconds (not seconds)
- Salt length must be `hashes.SHA256().digest_size` (32), not `padding.PSS.MAX_LENGTH`
- Method is uppercase: `GET`, `POST`

## Verification

Confirmed working against both demo (`demo-api.kalshi.co`) and production
(`api.elections.kalshi.com`) endpoints.

## Notes

The Kalshi API docs describe the signing format but the `/trade-api/v2` inclusion
in the signed string is easy to miss. The base URL for requests is
`https://api.elections.kalshi.com/trade-api/v2` — the path after this base is
what you pass to the function, and the prefix is re-added during signing.
