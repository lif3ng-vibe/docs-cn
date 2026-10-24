---
title: "Protect production PostgreSQL databases from unencrypted MacBooks"
description: "Use grants to automatically route PostgreSQL traffic based on MacBook encryption status, providing direct access for encrypted devices while monitoring unencrypted device connections."
---

Last validated Jan 13, 2026

Production database access typically requires encrypted devices, but development teams often include members whose MacBooks don't yet meet encryption requirements. Security policies force a binary choice: grant full access or deny it completely. Teams end up choosing between blocking critical work or creating security exceptions that undermine compliance.

Tailscale's [conditional routing][docs-via] solves this dilemma by routing database traffic [based on device encryption status][docs-device-posture]. Unencrypted MacBooks don't get denied access. Their [PostgreSQL][xt-postgresql] connections go through security gateways ([subnet routers][docs-subnets]) that can apply enhanced logging and controls. Encrypted devices connect directly for optimal performance, while unencrypted devices maintain connectivity through monitored paths.

When you finish this guide, you'll have an automatic PostgreSQL routing system that maintains connectivity for all developers while applying security controls proportional to device compliance status.

> **Tip:**
>
> The examples in this guide use a security gateway pattern for engineering teams using MacBooks to access production PostgreSQL databases. You can use this pattern to create other security gateway patterns for other teams or use cases.

## Prerequisites

Before you begin, make sure you have:

* A Tailscale account. [Create a free Personal account](https://login.tailscale.com/start) if you don't have one already.
* [Admin](/docs/reference/user-roles) privileges to modify the tailnet policy file and manage device tags.
* An understanding of [tailnet policy file syntax][docs-tailnet-policy-syntax], particularly the `grants`, `postures`, and `tagOwners` sections.
* At least one Linux server that can function as a [subnet router][docs-subnets] for your database monitoring gateway infrastructure.
* Production PostgreSQL databases.
* The Tailscale client is installed and running on your server. Follow the [Install Tailscale on Linux][docs-install-linux] instructions to install the Tailscale client.
* Test devices with different encryption characteristics (each with a Tailscale client installed and running):
  * At least one MacBook with [FileVault][xt-filevault] encryption enabled and macOS Ventura 13.4 or later.
  * At least one MacBook with FileVault encryption disabled for testing routing behavior.
* (Optional) PostgreSQL client tools are installed on your test devices for connection verification.

## Step 1: Define device encryption requirements

The first step is to define the device encryption requirements using [device posture policies][docs-device-posture]. These policies establish which MacBooks qualify for direct database access versus gateway routing by evaluating [FileVault][xt-filevault] encryption status (and other security attributes that Tailscale can detect on connected devices).

Disk encryption status relies on the [mobile device management (MDM) integration][docs-device-posture-mdm] you are using:

| Integration                     | Attribute key                       |
| ------------------------------- | ----------------------------------- |
| [Jamf Pro][docs-jamf-pro]       | `jamfPro:fileVaultStatus`           |
| [SentinelOne][docs-sentinelone] | `sentinelOne:encryptedApplications` |

To get started, open your [tailnet policy file][docs-tailnet-policy-file] from the admin console. Then, locate the `postures` section in your tailnet policy file (or create it if it doesn't exist) and add the posture definition that applies to your devices:

Jamf Pro example:

```json
"postures": {
  "posture:encryptedMacBook": [
    "node:os == 'macos'",
    "node:osVersion >= '13.4.0'",
    "node:tsReleaseTrack == 'stable'",
    "jamfPro:fileVaultStatus == 'ALL_ENCRYPTED'"
  ]
}
```

SentineOne example:

```json
"postures": {
  "posture:encryptedMacBook": [
    "node:os == 'macos'",
    "node:osVersion >= '13.4.0'",
    "node:tsReleaseTrack == 'stable'",
    "sentinelOne:encryptedApplications == true"
  ]
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

This `encryptedMacBook` posture policy validates that devices run macOS Ventura 13.4.0 or later, use stable [Tailscale releases][docs-tailscale-releases], and have FileVault disk encryption enabled. All conditions must evaluate to true for a MacBook to be compliant with this posture and qualify for direct database access. MacBooks that fail any condition in the posture definition will not match grants requiring that posture, causing them to fall through to other applicable grants that route through monitoring infrastructure.

Save the policy file to apply the posture definition to your tailnet.

After you define the encryption requirements, you can create a tag for the database monitoring gateway.

## Step 2: Create an identity for the security gateway and databases

In this step, you'll set up identifiers for the working parts of the system, including the security gateway, the developers using MacBooks, and the databases. You'll use [tags][docs-tags] for the database monitoring gateway and the databases because they're service-based. And you'll use a `group` for the developers.

First, create the tag-based identities for the security gateway and the databases. You do this by defining `tagOwners` in the tailnet policy file. Tag owners can apply tags to devices and manage the lifecycle of tagged infrastructure.

Locate the `tagOwners` section in your tailnet policy file (or create it if it doesn't exist) and define the tag for your database monitoring gateway:

```json
"tagOwners": {
  "tag:db-gateway": ["security-admin@yourcompany.com"]
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

Then, define the tag for the databases:

```json
"tagOwners": {
  "tag:prod-database": ["security-admin@yourcompany.com"]
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

> **Tip:**
>
> In this example, only the user with the email address `security-admin@yourcompany.com` can manage the `tag:db-gateway` and `tag:prod-database` tags. However, you can add multiple users, groups, or even other tags as tag owners depending on your needs.

Next, use the [Tailscale CLI][docs-cli] to assign the `tag:db-gateway` tag to the monitoring gateway server by running the following command from the monitoring gateway server:

```shell
sudo tailscale login --advertise-tags=tag:db-gateway
```

This command assigns the `tag:db-gateway` tag to the monitoring gateway server.

You've configured the tag. Now you'll create a group for your team so you can manage permissions for your developers from a single place.

## Step 3: Create an identity for your development team

In this step, you'll create a group for your development team that you can use to identify the developers in your tailnet without referencing each of their email addresses.

In the tailnet policy file, create a group named `group:developers` and add the email addresses of the developers to the group. This example uses two email addresses, but you can add as many as you need.

```json
"groups": {
  "group:developers": ["user1@yourcompany.com", "user2@yourcompany.com"]
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

Save the policy file to apply the group definition to your tailnet.

After you create the group, you can configure conditional database grants.

## Step 4: Set up conditional access policies

In this step, you will configure conditional grants that route database connections based on device encryption status.

[Grants][docs-grants] define access control policies that determine both what database resources developers can access and how their PostgreSQL traffic reaches those resources. By combining posture requirements with the `via` field, you can create grants that route database connections based on device encryption status.

First, locate the `grants` section in your tailnet policy file (or create it if it doesn't exist) and add the grant for encrypted MacBooks:

```json
"grants": [
  {
    "src": ["group:developers"],
    "dst": ["tag:prod-database"],
    "srcPosture": ["posture:encryptedMacBook"]
  }
]
```

\[Missing snippet: visual\_policy\_editor.mdx]

This grant provides direct PostgreSQL database access for development team members (`group:developers`) whose MacBooks meet the encrypted device posture requirements (`posture:encryptedMacBook`). The `srcPosture` field ensures only compliant devices match this grant, providing them with optimized routing that reduces latency and improves performance.

Then, add the fallback grant after the encrypted device grant:

```json
"grants": [
  {
    "src": ["group:developers"],
    "dst": ["tag:prod-database"],
    "srcPosture": ["posture:encryptedMacBook"]
  },
  {
    "src": ["group:developers"],
    "dst": ["tag:prod-database"],
    "via": ["tag:db-gateway"]
  }
]
```

\[Missing snippet: visual\_policy\_editor.mdx]

The second grant functions as a monitoring fallback that captures any development team PostgreSQL traffic not matched by the first grant. Because it lacks a `srcPosture` requirement, it matches devices regardless of encryption status. The [`via`][docs-via] field routes this traffic through the device tagged as the database gateway, where you can apply additional logging and controls.

Save and apply the policy changes to your tailnet.

After you configure the grants, you can deploy the database monitoring gateway.

## Step 5: Start the security gateway

The database monitoring gateway is a [subnet router][docs-subnets] that intercepts and routes PostgreSQL traffic from unencrypted MacBooks. You must configure this server as a subnet router to handle traffic forwarding and then assign the `tag:db-gateway` to enable it for routing duty. The monitoring gateway server receives all PostgreSQL traffic from unencrypted MacBooks attempting to access production databases. Consider the network positioning, performance requirements, and logging capabilities of this server when selecting hardware and deployment locations.

> **Note:**
>
> Database monitoring gateways require subnet router functionality because they must forward PostgreSQL traffic between your tailnet and production database networks. Regular tailnet devices can only send and receive their own traffic. Subnet routers advertise additional network routes, enabling them to forward traffic on behalf of other devices.

First, choose a Linux server to function as your database monitoring gateway based on your network topology and expected PostgreSQL traffic volume. This server should have sufficient network capacity and storage for comprehensive database connection logging. Then, on the selected monitoring gateway server, enable [subnet router][docs-subnets] functionality and assign the database gateway [tag][docs-tags] by running:

```shell
sudo tailscale up --advertise-routes=<subnet-range> --advertise-tags=tag:db-gateway
```

Replace `<subnet-range>` with the actual subnet range (such as `10.0.100.0/24`) that contains your production PostgreSQL databases. This advertises the database network to your tailnet and enables the server to forward traffic to those resources.

Then, approve the subnet routes in the admin console by navigating to the [Machines](https://console.tailscale.com/admin/machines) page, finding the monitoring gateway server, and enabling the advertised routes.

After you deploy the database monitoring gateway, you can verify that the database routing behavior is working as expected by testing the connection path from an encrypted and an unencrypted MacBook.

## Step 6: Verify database routing behavior

With the database monitoring gateway infrastructure deployed, when a developer's MacBook attempts to access production PostgreSQL databases, Tailscale checks device attributes against `posture:encryptedMacBook`. If the device uses encryption, the first grant matches, granting direct database access. If the device is unencrypted, the first grant fails, and the second grant matches, routing the traffic through the monitoring gateway. Let's test this behavior.

First, identify an encrypted MacBook that meets all requirements in your `posture:encryptedMacBook` definition. Verify its compliance status by running the [`tailscale status` command][docs-cli] directly from the MacBook:

```shell
tailscale status --json | grep -E "(OS|Version|DiskEncrypted)"
```

Confirm that the output shows `"OS": "macos"`, a version number of 13.4.0 or higher, and `"DiskEncrypted": true`.

Then, check the connection path to confirm it bypasses the monitoring gateway:

```shell
tailscale ping <database-name>.<tailnet-name>.ts.net
```

Replace `<database-name>` and `<tailnet-name>` with the actual values of your production database and tailnet name.

Look for direct connectivity to the production database without intermediate hops through the monitoring gateway server. The `tailscale ping` result should show a direct path to your database infrastructure.

Next, from an unencrypted MacBook (one with FileVault disabled), attempt to access the same production database, then verify that PostgreSQL traffic routes through your monitoring gateway infrastructure by checking the connection path:

```shell
tailscale ping <database-name>.<tailnet-name>.ts.net
```

The `tailscale ping` result should show connectivity through your monitoring gateway server rather than direct connectivity. This confirms that unencrypted MacBooks route through the monitoring infrastructure as intended.

## Conclusion

You've implemented device encryption-based database routing that automatically enforces security boundaries while maintaining PostgreSQL access for development teams. The system evaluates MacBook encryption status and routes traffic through appropriate network paths without manual intervention.

The final version of your tailnet policy file should look like this:

```json
"postures": {
  "posture:encryptedMacBook": [
    "node:os == 'macos'",
    "node:osVersion >= '13.4.0'",
    "node:tsReleaseTrack == 'stable'",
    "node:diskEncrypted == true"
  ]
}
"tagOwners": {
  "tag:db-gateway": ["security-admin@yourcompany.com"],
  "tag:prod-database": ["security-admin@yourcompany.com"]
}
"groups": {
  "group:developers": ["user1@yourcompany.com", "user2@yourcompany.com"]
}
"grants": [
  {
    "src": ["group:developers"],
    "dst": ["tag:prod-database"],
    "srcPosture": ["posture:encryptedMacBook"]
  },
  {
    "src": ["group:developers"],
    "dst": ["tag:prod-database"],
    "via": ["tag:db-gateway"]
  }
]
```

\[Missing snippet: visual\_policy\_editor.mdx]

## Further exploration

You can expand this solution to meet your specific security requirements. For example:

* Configure [logging][docs-logging] on security gateways and integrate with your SIEM system for anomaly detection.
* Add [just-in-time access][docs-just-in-time-access] workflows for emergency access from non-compliant devices with audit trails.
* Expand posture checks to include certificates, antivirus status, or [MDM][docs-mdm] integration.
* Deploy regional gateway infrastructure to reduce latency.
* Create tiered access levels based on compliance levels rather than binary decisions.

[docs-cli]: /docs/reference/tailscale-cli

[docs-device-posture-mdm]: /docs/features/device-posture/integrations

[docs-device-posture]: /docs/features/device-posture

[docs-grants]: /docs/features/access-control/grants

[docs-install-linux]: /docs/install/linux

[docs-jamf-pro]: /docs/integrations/jamf-pro

[docs-just-in-time-access]: /docs/features/tailscale-accessbot-jit

[docs-logging]: /docs/features/logging

[docs-mdm]: /docs/integrations/partners/mdm

[docs-sentinelone]: /docs/integrations/sentinelone

[docs-subnets]: /docs/features/subnet-routers

[docs-tags]: /docs/features/tags

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file

[docs-tailnet-policy-syntax]: /docs/reference/syntax/policy-file

[docs-tailscale-releases]: /docs/install/unstable

[docs-via]: /docs/features/access-control/grants/grants-via

[xt-filevault]: https://support.apple.com/guide/deployment/intro-to-filevault-dep82064ec40/web

[xt-postgresql]: https://www.postgresql.org/
