---
id: pubnub-set-channel-members-uuid-wrapper
platform: pubnub
category: schema
symptom: "set_channel_members() and remove_channel_members() reject plain string UUIDs — require a wrapper object with to_payload_dict()"
tags: [channel-members, uuid, membership, python-sdk, objects]
discovered: 2026-03-01
verified: true
verified_by: "Used in production in reflex-client.py for join/exit membership management on an availability monitoring channel. Both set_channel_members() and remove_channel_members() confirmed working with the wrapper."
severity: medium
---

## Problem

When calling `set_channel_members()` or `remove_channel_members()` in the
PubNub Python SDK, passing a plain string UUID raises an error or produces
an unexpected result. The `.uuids()` method expects objects, not strings.

```python
# This fails:
pubnub.set_channel_members() \
    .channel("my-channel") \
    .uuids(["my-uuid-string"]) \
    .sync()
```

## Root Cause

The PubNub Python SDK serializes the `uuids` list by calling `.to_payload_dict()`
on each item. Plain strings don't have this method, so the SDK either raises
an `AttributeError` or serializes incorrectly depending on the version.

The expected payload structure for each UUID entry is:
```json
{
  "uuid": {
    "id": "your-uuid-value"
  }
}
```

## Solution

Create a minimal wrapper class that implements `to_payload_dict()`:

```python
class MemberWrapper:
    def __init__(self, id_val):
        self.id_val = id_val

    def to_payload_dict(self):
        return {
            "uuid": {
                "id": self.id_val
            }
        }

# Usage:
member = MemberWrapper("my-uuid-string")

pubnub.set_channel_members() \
    .channel("my-channel") \
    .uuids([member]) \
    .sync()

pubnub.remove_channel_members() \
    .channel("my-channel") \
    .uuids([member]) \
    .sync()
```

The same wrapper works for both `set_channel_members()` and
`remove_channel_members()`.

## Verification

Used in production for channel membership management in a device monitoring
system. Both join and exit operations confirmed working reliably with the
wrapper pattern.

## Notes

This is not documented clearly in the PubNub Python SDK docs — the
`uuids()` parameter type is listed as a list but the expected object
interface is not described. The `to_payload_dict()` convention is used
elsewhere in the SDK for other object types (e.g. custom metadata).
