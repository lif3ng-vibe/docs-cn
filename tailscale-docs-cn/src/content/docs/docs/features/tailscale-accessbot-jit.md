---
title: "Use device posture for just-in-time access"
description: "Use device posture for just-in-time access to resources in your tailnet."
---

Last validated Jan 19, 2026

> **Note:** Just-in-time access is available for [the Premium and Enterprise plans](https://tailscale.com/pricing).

As noted in [Just-in-time access][docs-just-in-time-access], Tailscale provides several ways for you to provide just-in-time (JIT) access to resources in your Tailscale network (known as a tailnet).

This topic describes usage of custom device posture attributes with expiry for JIT, and provides an example Slack workflow where users can request temporary access by using Slack.

Device attributes have an [optional `expiry` property][ar-expiry-property] that lets you set a time in the future to expire the attribute. When set, the device attribute automatically expires at the specified time. You can use this to provide just-in-time access to resources by assigning attributes like `custom:prodAccess` to a device for a given time.

## Tailscale Slack Accessbot

[Tailscale Access][xt-accessbot] is an open-source example [Slack Workflow App][xt-slack-automation] developed by Tailscale that lets users use Slack to request instantaneous, time-bound access, to Tailscale resources from other people in their organization.

Inside Slack, a user can use the Request Tailscale Access shortcut to Tailscale Access. This will prompt them for:

* what they want to access
* which device they want to access it from
* how long they need access for
* who should approve their access
* why they need the access

*（图：Tailscale Access request access form in Slack）*

If there are Tailscale devices owned by a user with an email address matching the Slack user who requested access, a list of those devices will be displayed. The user will also get prompted with a list of all devices in a tailnet.

When the request has been submitted, the selected approver will be notified and they can choose to approve or deny the request. Upon approval, the workflow will add the required attribute to the selected device with an expiry set to the selected time.

For detailed instructions to configure, deploy, or develop with Accessbot, refer to the [`tailscale/accessbot` repository][xt-accessbot] on GitHub.

## Posture attributes API with Expiry

If Tailscale Slack Accessbot does not suit your needs, you can use custom device posture attributes with expiry to build a similar tool for your organization. This section is an extended version of the [Posture attributes API][co-api-device-posture-attr] from the [device posture][docs-device-posture] topic that contains additional information about attribute expiry.

### Get posture attributes by using the API

```
GET /api/v2/device/{deviceID}/attributes
```

Retrieve all posture attributes for the specified device. This returns a JSON object of all the key-value pairs of posture attributes for the device.

#### Parameters

##### `deviceID` (required in URL path)

The ID of the device to fetch posture attributes for.

#### Request example

```shell
curl "https://api.tailscale.com/api/v2/device/11055/attributes" \
-u "tskey-api-xxxxx:"
```

#### Response

The response is `200` on success. The response body is a JSON object containing all the posture attributes assigned to the node. Attribute values can be strings, numbers, or booleans.

```json
{
  "attributes": {
    "custom:myScore": 87,
    "custom:diskEncryption": true,
    "custom:myAttribute": "my_value",
    "node:os": "linux",
    "node:osVersion": "5.19.0-42-generic",
    "node:tsReleaseTrack": "stable",
    "node:tsVersion": "1.40.0",
    "node:tsAutoUpdate": false
  },
  "expiries": {
    "custom:myScore": "2024-04-23T18:25:43.511Z",
  }
}
```

* `attributes`: a key-value map of all attributes associated with a given node. The values can be either a number, string, or boolean.

* `expiries`: a key-value map of attributes that has an expiry time, and when they will expire. Any attribute without an expiry is omitted. If there are no attributes with expiries, the entire `expiries` field is omitted.

### Set custom posture attributes by using the API

```
POST /api/v2/device/{deviceID}/attributes/{attributeKey}
```

Create or update a custom posture attribute on the specified device. User-managed attributes must be in the `custom` namespace, which is indicated by prefixing the attribute key with `custom:`.

#### Parameters

##### `deviceID` (required in URL path)

The ID of the device on which to set the custom posture attribute.

##### `attributeKey` (required in URL path)

The name of the posture attribute to set. This must be prefixed with `custom:`.

Keys have a maximum length of 128 characters including the namespace, and can only contain letters, numbers, underscores, and colon.

Keys are case-sensitive. Keys must be unique, but are checked for uniqueness in a case-insensitive manner. For example, `custom:MyAttribute` and `custom:myattribute` cannot both be set within a single tailnet.

All values for a given key need to be of the same type, which is determined when the first value is written for a given key. For example, `custom:myattribute` cannot have a numeric value (`87`) for one node and a string value (`"78"`) for another node within the same tailnet.

##### Posture attribute `value` (required in POST body)

```json
{
  "value": "foo"
}
```

A value can be either a string, number, or boolean.

A string value can have a maximum length of 255 characters, and can only contain letters, numbers, underscores, and periods.

A number value is an integer and must be a JSON safe number (up to 2^53 - 1).

##### Posture attribute `expiry` (optional in POST body)

```json
{
  "value": "foo",
  "expiry": "2024-04-23T18:25:43.511Z"
}
```

An expiry can be any time in the future, formatted as an [RFC3339][xt-rfc-3339] string. When set, the device attribute will automatically be removed at the time specified.

##### Posture attribute `comment` (optional in POST body)

```json
{
  "value": "foo",
  "expiry": "2024-04-23T18:25:43.511Z",
  "comment": "access needed to inspect logs on prod vm"
}
```

A comment can be added to give a reason why an attribute was added.

#### Request example

```shell
curl "https://api.tailscale.com/api/v2/device/11055/attributes/custom:my_attribute" \
-u "tskey-api-xxxxx:" \
--data-binary '{"value": "my_value", "expiry": "2024-04-23T18:25:43.511Z"}'
```

#### Response

The response is `2xx` on success. The response body is currently an empty JSON object.

[ar-expiry-property]: #posture-attribute-expiry-optional-in-post-body

[co-api-device-posture-attr]: https://tailscale.com/api#tag/devices/GET/device/%7BdeviceId%7D/attributes

[docs-device-posture]: /docs/features/device-posture

[docs-just-in-time-access]: /docs/features/access-control/just-in-time-access

[xt-accessbot]: https://github.com/tailscale/accessbot

[xt-rfc-3339]: https://www.rfc-editor.org/rfc/rfc3339.html

[xt-slack-automation]: https://api.slack.com/automation
