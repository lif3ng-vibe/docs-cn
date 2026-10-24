---
title: "Monitoring and alerts for device postures"
description: "Tailnet admins can use the admin console or Tailscale API to check the device posture status of devices in their network, and configure alerts to help admins and end-users diagnose connectivity proble"
---

Last validated Oct 1, 2026

Tailnet admins can use the admin console or Tailscale API to check the device posture status of devices in their network, and configure alerts to help admins and end-users diagnose connectivity problems caused by failing posture.

## Check device posture status

Use the admin console or the Tailscale API to check a machine's device posture status.

### Check with the admin console

Within the Tailscale admin console, you can check the device posture status for any machine in your network.

To check the device posture status:

1. Open the [Machines](https://console.tailscale.com/admin/machines) page of the admin console.
2. Find the machine whose device posture you want to check. You can use the [search bar][docs-filter-devices-search-bar] or [filters][docs-filter-devices] to find a machine.
3. Select the machine.
4. Check the device posture status in the **Device Postures** section of the machine page.

You can view all postures, or choose between passing postures, failing postures, and failing postures that block access.

Select a posture to view its details. These details include the assertions required by this posture, the corresponding device attribute values on this machine, and a count of policy file rules that apply to this machine and require this posture.

Select the  to view the posture definition, search for grants that require the posture, and view other machines that fail the posture.

### Check with the Tailscale API

Using the Tailscale API, you can check the device posture status for any machine in your network.

To check the device posture status for every device in your network, use the devices API and pass `fields=postureStatus` as a URL query parameter. For example:

```shell
curl 'https://api.tailscale.com/api/v2/tailnet/-/devices?fields=id,postureStatus' \
  --header 'Authorization: Bearer <api-access-token>
```

To check the device posture status for a single device in your network, use the device API and pass `fields=postureStatus` as a URL query parameter. For example:

```shell
curl 'https://api.tailscale.com/api/v2/device/{deviceId}?fields=id,postureStatus' \
  --header 'Authorization: Bearer <api-access-token>
```

## Find devices that are failing a posture

Use the admin console or Tailscale API to find devices that are failing a posture.

### Find devices with the admin console

Within the Tailscale admin console, you can find devices that are failing a specific posture.

To find devices failing a specific posture:

1. Open the [Machines](https://console.tailscale.com/admin/machines) page of the admin console.
2. Select **Filters**.
3. Select **Failing posture**.
4. Select one or more postures.

The list of machines filters to show devices that are failing all selected postures.

### Find devices with the Tailscale API

Using the Tailscale API, you can find devices that are failing a specific posture. Use the devices API and pass `failingPostures={postureName}` as a URL query parameter.
The example below finds devices failing the `anyMac` posture.

```shell
curl 'https://api.tailscale.com/api/v2/tailnet/-/devices?failingPostures=posture:anyMac' \
  --header 'Authorization: Bearer <api-access-token>
```

To find devices that are failing multiple postures, pass the URL query parameter multiple times, one for each posture. For example:

```shell
curl 'https://api.tailscale.com/api/v2/tailnet/-/devices?failingPostures=posture:anyMac&failingPostures=posture:autoUpdateMac' \
  --header 'Authorization: Bearer <api-access-token>
```

## Enable console badges for devices

> **Note:** console badges for device posture failures is currently in beta.

You can enable badges that show in the Tailscale admin console for devices that fail a specific posture. This lets you quickly determine which devices are failing important postures.

You configure these badges in your policy file.

### Policy file syntax for console badges

To configure badges in the JSON, add `badge-in-console` to the `showAlerts` list in your `onFailure` config for a posture:

```json
"posture:anyMac": {
  "assertions": [
    "node:os == 'macos'",
    "node:tsReleaseTrack == 'stable'",
  ],
  "onFailure": {
    "showAlerts": ["badge-in-console"],
  },
},
```

> **Note:**
>
> If you have previously stored postures as a list of assertions, you must convert to the object syntax to get badges in the console.

### Enable badges in the visual policy editor

To configure badges in the visual policy editor:

1. Open the [Access controls](https://console.tailscale.com/admin/acls) page of the admin console.
2. Select **Definitions**.
3. Select **Device posture**.
4. Find the posture you want to edit, select the  menu, and select **Edit**.
5. Find the **Failure behavior** section, and select **Display badge in Machines view**.
6. Select **Save device posture**.

## Send warnings or notifications

> **Note:** send warnings or notifications for device posture failures is currently in beta.

You can configure postures to send warnings or notifications with a custom message to end-user clients when a device is failing a posture.
You can configure these messages in your policy file, on a per-posture basis.

These messages are only sent to clients when the failing posture affects their connectivity. If a device is failing a posture, but there are no grants targeting that device which require the posture, the device does not receive a message.

If a device is failing a posture, a warning shows on the Tailscale client icon. The device user can open the app to view the custom message.

You can additionally configure the message to be sent as a push notification, and the message shows even if the user does not open the Tailscale app.

> **Note:**
>
> The Tailscale client for Windows does not support displaying warnings or notifications about failing postures.

### Policy file syntax for warnings and notifications

You can configure messages and notifications in the posture's `onFailure` section.

To specify a message to send to users when a device fails the posture, add the `endUserMessage` key with your custom message.

To show a warning on the Tailscale client icon when a device fails the posture, add the `warn-in-client` value to the `showAlerts` key.

To send a push notification to a user when their device fails the posture, add the`notify-in-client` value to the `showAlerts` key.

The following example shows a warning in the Tailscale client icon and sends a custom message to the user when the device fails the `upToDateMac` posture.

```json
"posture:upToDateMac": {
  "assertions": [
    "node:os == 'macos'",
    "node:osVersion >= '26.7.0'",,
  ],
  "onFailure": {
    "showAlerts": ["warn-in-client"],
    "endUserMessage": "You need to update your Mac. Contact IT helpdesk for detailed instructions."
  },
},
```

> **Note:**
>
> If you have previously stored postures as a list of assertions, you must convert to the object syntax to configure messages and notifications.

### Configure messages with the visual policy editor

To configure end-user messages in the visual policy editor:

1. Open the [Access controls](https://console.tailscale.com/admin/acls) page of the admin console.
2. Select **Definitions**.
3. Select **Device posture**.
4. Find the posture you want to edit, select the  menu, and select **Edit**.
5. Find the **Failure behavior** section, and select **Display message**.
6. Enter a message to be shown to the user when their device fails posture
7. (Optional) Select **Push notification** to send a notification rather than a warning

[docs-filter-devices-search-bar]: /docs/features/access-control/device-management/how-to/filter#filter-with-the-search-bar

[docs-filter-devices]: /docs/features/access-control/device-management/how-to/filter
