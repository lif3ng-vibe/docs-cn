---
title: "Filter devices in the admin console"
description: "Devices in the [Machines](https://console.tailscale.com/admin/machines) page of the admin console can be filtered to more easily find devices meeting certain criteria."
---

Last validated Jan 5, 2026

Devices in the [Machines](https://console.tailscale.com/admin/machines) page of the admin console can be filtered to more easily find devices meeting certain criteria.

*（图：Example of admin console with a filters for 'Attribute: Tailscale SSH', 'Managed by: tag:server', and 'Version: Older than 1.26.2'.）*

Filters are supported for the following criteria:

* **Property**: Whether a device is an [ephemeral node][docs-ephemeral-nodes], an [exit node][docs-exit-nodes], a [subnet router][docs-subnets], has [Tailscale SSH][docs-tailscale-ssh] enabled, or has [key expiry disabled][docs-key-expiry].

* **Last seen**: Whether a device is connected, not connected, last seen before a specified unit, or seen in the last specified unit. For last seen before and seen in the last, the unit can be minutes, hours, days, weeks, or years.

* **Managed by**: Whether a device is managed by a specified user or has a specified [tag][docs-tags].

* **Shared**: Whether a device is [shared][docs-sharing] with your tailnet, shared by your tailnet, or not shared at all.

* **Disabled**: Whether a device has an [expired key][docs-key-expiry], needs [approval][docs-device-approval], or is managed by a [suspended user][docs-remove-team-members-suspending-users].

* **Version**: Whether a device's Tailscale client is a specified [version][docs-versions], newer than a specified version, older than a specified version, or has a regular or security [update][docs-update] available.

* **OS**: Whether a device has a specific operating system (Windows, macOS, Linux, iOS, Android, tvOS, FreeBSD, Illumos, OpenBSD, NetBSD, Solaris, AIX, JS).

* **OS Version**: Whether a device has a specified operating system version, newer than a specified operating system version, or older than a specified operating system version.

* **Auto-update**: Whether a device's Tailscale client has auto-updates enabled or disabled.

* **Posture Identity**: Whether [device identity][docs-manage-identity] has been collected or not.

Additionally, the [Machines](https://console.tailscale.com/admin/machines) page search bar supports free form search for machine name, host name, Tailscale IP address, the managed by and created by user, operating system, and Tailscale client version, along with text-based equivalents for the filter criteria listed above.

## Filter URL queries

When you use a filter, the active URL for the [Machines](https://console.tailscale.com/admin/machines) page contains a query string. The string represents the filter parameters.

For example, opening the **Machines** page without applying any filters make this the active URL:

* `https://console.tailscale.com/admin/machines`

Adding a Managed by filter to find machines managed by either Alice or Bob adds a query string to the active URL:

* `https://console.tailscale.com/admin/machines?q=managedby%3Aalice%40example.com%2Cbob%40example.com`

You can save your filters by copying the active URL.

For a list of the text strings that can appear in a filter URL, refer to [Text filters][ar-text-filters].

## Filter AND logic and OR logic

Multiple filters are treated as an intersection. For example, applying a filter to find ephemeral nodes and a filter to find machines seen in the last 5 days will return the set of machines that are ephemeral nodes AND were last seen in the last 5 days (`property:ephemeral-node lastseen:<5d`).

A filter that supports multiple values is treated as a union. For example, applying a Managed by filter to find machines managed by Alice, Bob, or the tag `builder` will return the set of machines that are managed by Alice OR Bob OR the tag `builder` (`managedby:alice@example.com,bob@example.com,tag:builder`).

As another example, the following filter combination returns the set of machines that are managed by Alice OR Bob, AND have been seen with the last 5 days:

* `managedby:alice@example.com,bob@example.com lastseen:<5d`

## Use a filter

Filter devices in the [Machines](https://console.tailscale.com/admin/machines) page of the admin console by creating a query using the UI filters, the search bar, or both. You can also use multiple filters on the same query.

### Filter by Property

1. In the [Machines](https://console.tailscale.com/admin/machines) page of the admin console, select **Filters** and select **Property**.
2. Select one or more properties for your filter:

   * **Ephemeral node**: Matches devices that are [ephemeral nodes][docs-ephemeral-nodes].
   * **Exit node**: Matches devices that are [exit nodes][docs-exit-nodes].
   * **Subnet**: Matches devices that are [subnet routers][docs-subnets].
   * **Peer Relay**: Matches devices that are [peer relays][docs-peer-relay].
   * **Tailscale SSH**: Matches devices that have [Tailscale SSH][docs-tailscale-ssh] enabled.
   * **Tailscale Funnel**: Matches devices that are running a [Tailscale Funnel][docs-funnel] server.
   * **Expiry disabled**: Matches devices that have [key expiry disabled][docs-key-expiry].
   * **Signing node**: Matches devices that can [sign new nodes][docs-tailnet-lock-add-signing-node] to approve their access to the tailnet.

You cannot multi-select criteria within the **Property** filter.

### Filter by Last seen

1. In the [Machines](https://console.tailscale.com/admin/machines) page of the admin console, select **Filters** and select **Last seen**.
2. Select one of the connected state or last seen criteria for your filter:

   * **Currently connected**: Matches devices that are currently connected to your tailnet.
   * **Not currently connected**: Matches devices that are currently not connected to your tailnet.
   * **In the last**: Matches devices that were seen in the last specified number of units. Available units are **m**, **h**, **d**, **w**, or **y**, for minutes, hours, days, weeks, or years, respectively. For example, **3h**.
   * **Before the last**: Matches devices that were last seen before the specified number of units. Available units are **m**, **h**, **d**, **w**, or **y**, for minutes, hours, days, weeks, or years, respectively. For example, **5d**.

You cannot multi-select criteria within the **Last seen** filter.

### Filter by Managed by

1. In the [Machines](https://console.tailscale.com/admin/machines) page of the admin console, select **Filters** and select **Managed by**.
2. Select the users and/or tags for your filter. This filter matches devices that are managed by any of the selected users and tags.

You can multi-select criteria within the **Managed by** filter.

### Filter by Shared

1. In the [Machines](https://console.tailscale.com/admin/machines) page of the admin console, select **Filters** and select **Shared**.
2. Select one of the sharing states for your filter:

   * **Not shared**: Matches devices in your tailnet that are not [shared][docs-sharing].
   * **Shared with me**: Matches devices shared by others that have been shared to your tailnet.
   * **Shared by me**: Matches devices in your tailnet that are shared to users of other tailnets. Note that if you sent invitations to share a device but no one accepted the invitation, the device is not yet considered shared.

You cannot multi-select criteria within the **Shared** filter.

### Filter by Disabled

1. In the [Machines](https://console.tailscale.com/admin/machines) page of the admin console, select **Filters** and select **Disabled**.
2. Select the disabled states for your filter:

   * **Expired**: Matches devices that have an [expired key][docs-key-expiry].
   * **Needs approval**: Matches devices that need [approval][docs-device-approval].
   * **User suspended**: Matches devices that are managed by a [suspended user][docs-remove-team-members-suspending-users].
   * **User needs approval**: Matches devices that are managed by a [user that needs approval][docs-user-approval].
   * **Locked out**: Matches devices that need to be [signed][docs-tailnet-lock-add] in a tailnet that has [Tailnet Lock][docs-tailnet-lock] enabled.

You cannot multi-select criteria within the **Disabled** filter.

### Filter by Version

1. In the [Machines](https://console.tailscale.com/admin/machines) page of the admin console, select **Filters** and select **Version**.
2. Select the Tailscale client [version][docs-versions] criteria for your filter:

   * **Is**: Matches devices that have the specified version, including any patch versions. For example, a value of `1.32` matches `1.32` and `1.32.2`.
   * **Newer than**: Matches devices that have a version later than the specified version.
   * **Older than**: Matches devices that have a version older than the specified version.
   * **Update available**: Matches devices that have an [update][docs-update] available.
   * **Security update available**: Matches devices that have a security [update][docs-update] available.

You cannot multi-select criteria within the **Version** filter.

### Filter by OS

1. In the [Machines](https://console.tailscale.com/admin/machines) page of the admin console, select **Filters** and select **OS**.
2. Select the operating system criteria for your filter. This filter matches a pre-defined list of operating systems.

You can multi-select criteria within the **OS** filter.

### Filter by OS Version

1. In the [Machines](https://console.tailscale.com/admin/machines) page of the admin console, select **Filters** and select **OS Version**.
2. Select the operating system criteria for your filter:

   * **Is**: Matches devices that have the specified version.
   * **Newer than**: Matches devices that have a version later than the specified version.
   * **Older than**: Matches devices that have a version older than the specified version.

You cannot multi-select criteria within the **OS Version** filter.

## Filter by Auto-update

1. In the [Machines](https://console.tailscale.com/admin/machines) page of the admin console, select **Filters** and select **Auto-update**.
2. Select one of the sharing states for your filter:

   * **Enabled**: Matches devices that have auto-update enabled.
   * **Disabled**: Matches devices that have auto-updated disabled.

You cannot multi-select criteria within the **Auto-update** filter.

## Filter by Posture Identity

1. In the [Machines](https://console.tailscale.com/admin/machines) page of the admin console, select **Filters** and select **Posture Identity**.
2. Select the operating system criteria for your filter:

   * **Needs upgrade**: Tailscale client needs to be upgraded. Serial number collection was added in Tailscale v1.52.
   * **Not collected**: Posture identity has not been collected. If you have just enabled posture-checking, you may need to restart Tailscale for serial numbers to be collected.
   * **Not enabled on machine**: Posture check is disabled.
   * **Has posture identity**: Posture check returned a valid serial number.
   * **Empty posture identity**: Posture check returned an invalid serial number (for example, "default").

You cannot multi-select criteria within the **Posture Identity** filter.

## Filter with the search bar

1. In the [Machines](https://console.tailscale.com/admin/machines) page of the admin console, select inside the search bar.
2. Type in a text string and press Enter. The search text is not case-sensitive.

   The search returns the list of devices that contain the search text in at least one of the following fields:

   * Machine name
   * Host name
   * Tailscale IP address
   * Creator (the user that added the machine to the tailnet and manages the machine)
   * Operating system
   * Tailscale client version

The search text is not an exact string match—if a device contains the search text in one or more of the fields listed above, it is included in the search results. For example, using `1.10` in the search bar will match machines that contain `1.10` in the version number (such as `1.10.2`), and it will also match devices that have `1.10` in any of the other fields listed above. Similarly, using `Bob` in the search bar will match devices that contain `bob` (not case-sensitive) in any of the fields listed above.

You cannot combine multiple freeform text search filters at the same time. For example, searching with freeform text `1.32.2 alice` won't return any results even if you have machines running Tailscale v1.32.2 that are managed by Alice. However, you can apply text filters to create a search string like `version:=1.32.2 managedby:alice` to find those machines.

## Filter with text

The following table shows the URL query strings that result from using the filters in the [Machines](https://console.tailscale.com/admin/machines) page of the admin console. You can also enter these text strings directly into the search bar.

| Filter term                              | Description                                                                                                                                                                                                       |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `auto-update:enabled`                    | Matches devices that have their client set to auto-update.                                                                                                                                                        |
| `auto-update:disabled`                   | Matches devices that have their client set to not auto-update.                                                                                                                                                    |
| `property:ephemeral-node`                | Matches devices that are [ephemeral nodes][docs-ephemeral-nodes].                                                                                                                                                 |
| `property:exit-node`                     | Matches devices that are [exit nodes][docs-exit-nodes].                                                                                                                                                           |
| `property:expiry-disabled`               | Matches devices that have [key expiry disabled][docs-key-expiry].                                                                                                                                                 |
| `property:signing-node`                  | Matches devices that can [sign new nodes][docs-tailnet-lock-add-signing-node] to approve their access to the tailnet.                                                                                             |
| `property:subnet`                        | Matches devices that are [subnet routers][docs-subnets].                                                                                                                                                          |
| `property:tailscale-funnel`              | Matches devices that are running a [Tailscale Funnel][docs-funnel] server.                                                                                                                                        |
| `property:tailscale-ssh`                 | Matches devices that have [Tailscale SSH][docs-tailscale-ssh] enabled.                                                                                                                                            |
| `disabled:expired`                       | Matches devices that have an [expired key][docs-key-expiry].                                                                                                                                                      |
| `disabled:needs-approval`                | Matches devices that need [approval][docs-device-approval].                                                                                                                                                       |
| `disabled:user-suspended`                | Matches devices that are managed by a [suspended user][docs-remove-team-members-suspending-users].                                                                                                                |
| `lastseen:<value`                        | Matches devices that were last seen before the specified number of units. Available units are **m**, **h**, **d**, **w**, or **y**, for minutes, hours, days, weeks, or years, respectively. For example, **5d**. |
| `lastseen:>value`                        | Matches devices that were seen in the last specified number of units. Available units are **m**, **h**, **d**, **w**, or **y**, for minutes, hours, days, weeks, or years, respectively. For example, **3h**.     |
| `lastseen:connected`                     | Matches devices that are currently connected to your tailnet.                                                                                                                                                     |
| `lastseen:not-connected`                 | Matches devices that are currently not connected to your tailnet.                                                                                                                                                 |
| `managedby:value[,]`                     | Matches devices managed by a specified user or having a specified [tag][docs-tags]. List multiple values in a comma-separated string.                                                                             |
| `os:value[,]`                            | Matches devices with specified operating systems.                                                                                                                                                                 |
| `osversion:<value`                       | Matches devices that have an operating system version older than the specified version.                                                                                                                           |
| `osversion:=value`                       | Matches devices that have the specified operating system version.                                                                                                                                                 |
| `osversion:>value`                       | Matches devices that have an operating system version newer than the specified version.                                                                                                                           |
| `postureidentity:needs-upgrade`          | Matches devices that need a client upgrade to support collection.                                                                                                                                                 |
| `postureidentity:not-collected`          | Matches devices that have not provided a valid serial number.                                                                                                                                                     |
| `postureidentity:not-enabled`            | Matches devices that have posture checks disabled.                                                                                                                                                                |
| `postureidentity:has-posture-identity`   | Matches devices that have a valid serial number.                                                                                                                                                                  |
| `postureidentity:empty-posture-identity` | Matches devices that have an invalid serial number.                                                                                                                                                               |
| `shared:in`                              | Matches devices [shared][docs-sharing] by others that have been shared to your tailnet.                                                                                                                           |
| `shared:not-shared`                      | Matches devices in your tailnet that are not shared.                                                                                                                                                              |
| `shared:out`                             | Matches devices in your tailnet that are shared to users of other tailnets. Note that if you sent invitations to share a device but no one accepted the invitation, the device is not yet considered shared.      |
| `version:<value`                         | Matches devices that have a version older than the specified version.                                                                                                                                             |
| `version:=value`                         | Matches devices that have the specified version, including any patch versions. For example, a value of `1.32` matches `1.32` and `1.32.2`.                                                                        |
| `version:>value`                         | Matches devices that have a version newer than the specified version.                                                                                                                                             |
| `version:update-available`               | Matches devices that have an [update][docs-update] available.                                                                                                                                                     |
| `version:security-update-available`      | Matches devices that have a security [update][docs-update] available.                                                                                                                                             |

## Remove a filter

To remove an individual filter, below the search bar, select the **x** for the filter that you want to remove.

To remove all filters, within the search bar, select the **x**.

[ar-text-filters]: #filter-with-text

[docs-device-approval]: /docs/features/access-control/device-management/device-approval

[docs-ephemeral-nodes]: /docs/features/ephemeral-nodes

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-funnel]: /docs/features/tailscale-funnel

[docs-key-expiry]: /docs/features/access-control/key-expiry

[docs-manage-identity]: /docs/features/access-control/device-management/how-to/manage-identity

[docs-peer-relay]: /docs/features/peer-relay

[docs-remove-team-members-suspending-users]: /docs/features/sharing/how-to/remove-team-members#suspending-users

[docs-sharing]: /docs/features/sharing

[docs-subnets]: /docs/features/subnet-routers

[docs-tags]: /docs/features/tags

[docs-tailnet-lock-add-signing-node]: /docs/features/tailnet-lock#add-a-signing-node

[docs-tailnet-lock-add]: /docs/features/tailnet-lock#add-a-node-to-a-locked-tailnet

[docs-tailnet-lock]: /docs/features/tailnet-lock

[docs-tailscale-ssh]: /docs/features/tailscale-ssh

[docs-update]: /docs/features/client/update

[docs-user-approval]: /docs/features/access-control/user-approval

[docs-versions]: /docs/reference/tailscale-client-versions
