---
id: bitunix-auth-query-param-serialization
platform: Bitunix
category: authentication
symptom: Signature Error (code 10007) despite correct API key and double SHA256 logic
tags: [auth, signature, query-params, sha256]
discovered: 2026-04-03
verified: 2026-04-03
verified_by: krsboone
severity: HIGH
---

# Bitunix Auth — Query Parameter Serialization

## Problem

Requests to the Bitunix Futures REST API return `{"code":10007,"msg":"Signature Error"}`
despite using the correct API key and implementing the documented double SHA256 signature scheme.

## Root Cause

The Bitunix documentation shows the query parameter serialization format as `"id1uid200"` for
params `{id: 1, uid: 200}`. This is ambiguous — it could be read as values-only concatenation
(`1200`) or key+value concatenation (`id1uid200`).

The correct format is **key+value concatenated with no separator, sorted by key name ascending**.

- `{marginCoin: "USDT"}` → `"marginCoinUSDT"`
- `{id: 1, uid: 200}` → `"id1uid200"`

The docs example is literal. Standard `urlencode` (`key=value&key2=value2`) and values-only
concatenation both produce `10007 Signature Error`.

## Solution

```python
def _serialize_params(params: dict) -> str:
    """Sort params by key, concatenate key+value with no separator."""
    if not params:
        return ""
    return "".join(str(k) + str(v) for k, v in sorted(params.items()))
```

Full signature construction:

```python
import hashlib

def sign(nonce, timestamp, api_key, secret_key, query_params, body=""):
    param_str = _serialize_params(query_params)
    digest = hashlib.sha256(
        (nonce + timestamp + api_key + param_str + body).encode()
    ).hexdigest()
    return hashlib.sha256(
        (digest + secret_key).encode()
    ).hexdigest()
```

Note: `timestamp` is **milliseconds** UTC for REST (different from WebSocket, which uses seconds).

## Verification

`GET /api/v1/futures/account` with `marginCoin=USDT` returns `{"code":0,"msg":"Success"}`.
