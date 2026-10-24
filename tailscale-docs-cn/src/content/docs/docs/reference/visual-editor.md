---
title: "Visual policy editor reference"
description: "Complete reference for the visual policy editor user interface."
---

Last validated Dec 2, 2025

The [Tailscale visual policy editor][docs-visual-editor] gives you an interactive graphical interface for managing access control policies in a Tailscale network (known as a tailnet). This reference documents all interface elements, forms, controls, and their associated help information to help you effectively use the visual editor. For a comprehensive understanding of the underlying policy syntax, refer to [Tailscale's policy syntax documentation][docs-policy-syntax].

> **Tip:**
>
> Refer to the [targets documentation][docs-targets] for detailed information about available targets for sources, destinations, and other fields.

## General access rules

*（图：General access rules tab with two rules: first allows all users and devices to access all destinations on all ports, second restricts tag:unraid access on all ports.）*

General access rules control network-level and application-level access between devices in your tailnet using [grants syntax][docs-grants]. These rules determine which sources can connect to which destinations on specified ports and protocols. The visual editor translates these rules into the underlying grant structure in your tailnet policy file.

The visual editor uses grants syntax on the backend. This means that if you create an access control policy using the ACL syntax in the JSON editor, it automatically converts to grants syntax when you edit the policy using the visual editor. Grants syntax supports all the same capabilities as ACL syntax with additional features like [route filtering][docs-via] and [app capabilities][docs-grants-app-capabilities]. Refer to [grants versus ACLs][docs-grants-vs-acls] for more information.

Each general access rule uses grants syntax, which consists of three main components: sources, destinations, and network restrictions. Grants also support additional components like the `via` field and app capabilities for more advanced access control scenarios. For a complete overview of grants syntax, refer to the [grants syntax reference][docs-grants-syntax].

The rules table displays all configured access rules with their sources, destinations, and network restrictions. The  menu for each rule lets you edit and delete operations. For examples of common access patterns, refer to the [grant examples][docs-grant-examples].

### Add a general access rule

*（图：Add general access rule form with fields for source, destination, and network restrictions (ports and protocols).）*

\[Missing snippet: general\_access\_rules\_add.mdx]

### Edit a general access rule

\[Missing snippet: general\_access\_rules\_edit.mdx]

### Delete a general access rule

\[Missing snippet: general\_access\_rules\_delete.mdx]

## Tailscale SSH

*（图：Tailscale SSH tab showing two SSH rules: first allows autogroup:member to access autogroup:self as autogroup:nonroot and root, second allows autogroup:member to access autogroup:self as sally, autogroup:nonroot, and root with 1m0s check mode.）*

[Tailscale SSH rules][docs-tailscale-ssh] control SSH access to devices in your tailnet. These rules work alongside general access rules to provide secure SSH connectivity without managing SSH keys. The SSH implementation leverages your existing identity provider for authentication, eliminating the traditional complexity of SSH key distribution and rotation.

SSH rules extend basic network access with SSH-specific controls that enhance security and ease of management. Understanding these components helps you create SSH policies that balance security with usability.

The **Source** field identifies who can start SSH connections. These typically include users or groups from your identity provider. The **Destination** field specifies which devices accept SSH connections, often identified by tags like `tag:server` or `tag:bastion`.

Destination [users][docs-policy-syntax-users] define which user accounts are accessible on the destination. You might specify `autogroup:nonroot` to prevent root access or use email-based matching to map identity provider users to local accounts. **Check mode** determines whether to require periodic re-authentication, adding an extra security layer for sensitive connections.

### Add an SSH rule

\[Missing snippet: tailscale\_ssh\_add.mdx]

#### Check mode best practices

Enable **Check mode** for rules that let humans start SSH connections. This adds an authentication layer that verifies user identity before granting access. The **Check period** determines how long connections remain authorized before requiring re-authentication. Setting appropriate **Check period** values balances security with user convenience.

For automated processes or service accounts, you might disable **Check mode** to prevent interruptions. However, these connections should have tightly scoped permissions and use [tag-based identities][docs-tags] rather than personal credentials.

### Edit an SSH rule

*（图：Edit SSH rule form showing fields for source, destination, destination users, and check mode settings.）*

\[Missing snippet: tailscale\_ssh\_edit.mdx]

### Delete an SSH rule

\[Missing snippet: tailscale\_ssh\_delete.mdx]

## Groups

*（图：Groups tab displaying User-defined groups section (empty) and Autogroups section showing built-in groups like autogroup:member (2 users), autogroup:owner (1 user), autogroup:admin (2 users), and various role-based autogroups with 0 members.）*

[Groups][docs-targets] organize users for simplified access control management. The **Groups** tab contains sections for user-defined groups, synced groups from identity providers, and built-in autogroups. Groups reduce policy complexity by letting you manage collections of users rather than individuals, making your policies more maintainable as your organization grows. For detailed information about group types and usage, refer to the [targets documentation][docs-targets].

### User-defined groups

Create and manage [custom user groups][docs-targets] to use in access control policies. Groups improve policy management by letting you reference collections of users rather than individuals. This abstraction makes policies more readable and reduces the maintenance burden when team membership changes.

> **Warning:**
>
> Changes to group membership immediately affect all policies referencing that group.

### Add a user-defined group

*（图：Create group form with fields for group name and members selection.）*

\[Missing snippet: user\_defined\_groups\_add.mdx]

### Edit a user-defined group

\[Missing snippet: user\_defined\_groups\_edit.mdx]

### Delete a user-defined group

\[Missing snippet: user\_defined\_groups\_delete.mdx]

### Synced groups

[Synced groups][docs-policy-syntax-synced-groups] automatically populate from your identity provider through SCIM integration. These groups are read-only in the visual editor. Membership changes must occur in your identity provider and syncs to Tailscale automatically. This integration ensures that your tailnet access control aligns with your organization's identity management processes. You can configure synced groups with your identity provider, including [Google SSO integration][docs-sso-google-sync].

The synchronization typically occurs within minutes of changes in your identity provider. You can reference synced groups in policies using the `group:` prefix followed by the group name from your identity provider.

### Autogroups

Tailscale offers built-in, dynamically generated groups called [autogroups][docs-targets-autogroups]. These groups automatically include users with specific roles or properties. Autogroups remove the need to manually maintain groups for role-based access control.

## Tags

*（图：Tags tab showing two defined tags: tag:example owned by autogroup:admin, and tag:mytag owned by autogroup:admin and ostrich.zebra@example.com.）*

[Tags][docs-tags] organize non-user devices like servers into functional groups for use in access control policies. Tags let you group devices by function, environment, or any other logical categorization. Unlike user-based groups, tags apply to devices and persist across authentication sessions.

The tags table displays all defined tags with their owners. You can use the search field above the table to filter the results by tag name or owner.

> **Note:**
>
> By default [Owners, Admins, and Network admins](/docs/reference/user-roles) are tag owners for all tags.properties.

### Add a tag

*（图：Create tag form with fields for tag name and tag owners selection.）*

\[Missing snippet: tags\_add.mdx]

### Edit a tag

*（图：Edit tag form showing fields for modifying tag name and owners.）*

\[Missing snippet: tags\_edit.mdx]

### Delete a tag

\[Missing snippet: tags\_delete.mdx]

> **Warning:**
>
> Deleting a tag removes it from all devices, potentially affecting access control rules that reference it.

## IP sets

*（图：IP sets tab displaying ipset:databases with three IP addresses added: 100.100.106.101, 100.100.106.103, and 100.100.106.104.）*

[IP sets][docs-ipsets] are collections of IP addresses, hosts, and subnets to use in access control policies. They improve policy management by letting you reference groups of network addresses with a single identifier. IP sets support composition, letting you build complex network definitions from simpler components.

IP sets support composition through **Add** and **Remove** operations. Start with broad inclusions using **Add**, then refine the set using **Remove** to exclude specific ranges. This approach lets you create flexible network segmentation without duplicating IP definitions.

For example, you might add `10.0.0.0/8` to include your entire private network, then remove `10.0.1.0/24` to exclude a specific subnet. This composition model helps maintain complex policies as your infrastructure evolves.

### Add an IP set

*（图：Create IP set form with fields for name and targets to add or remove from the set.）*

\[Missing snippet: ip\_sets\_add.mdx]

### Edit an IP set

\[Missing snippet: ip\_sets\_edit.mdx]

### Delete an IP set

\[Missing snippet: ip\_sets\_delete.mdx]

## Hosts

*（图：Hosts tab showing one host definition: 'ahost' mapped to IP address 100.100.100.105.）*

[Hosts][docs-policy-syntax-hosts] create friendly names for IP addresses and CIDR ranges. This improves policy readability by replacing numeric addresses with meaningful identifiers. Instead of remembering that `192.168.1.100` is your database server, you can reference it as `database-primary` throughout your policies.

You can use host definitions in access rules, IP sets, and other policy components that accept IP addresses. The hosts table displays all defined hosts with their associated IP addresses for quick reference. Host names make your policies self-documenting and reduce errors from mistyped IP addresses.

### Add a host

*（图：Create host form with fields for host name and IP address or CIDR range.）*

\[Missing snippet: hosts\_add.mdx]

### Edit a host

*（图：Edit host form showing fields for modifying host name and IP address.）*

\[Missing snippet: hosts\_edit.mdx]

### Delete a host

\[Missing snippet: hosts\_delete.mdx]

## Node attributes

*（图：Node attributes tab showing one attribute rule applying drive:share capability to all users and devices.）*

[Node attributes][docs-policy-syntax-nodeattrs] are device attributes and settings that you can use do things like control feature availability and device behavior across your tailnet. For example, you can use an attribute to enable [Tailscale Funnel][docs-funnel] or configure specialized behaviors without modifying individual device configurations.

Node attributes commonly enable features that extend device capabilities. Understanding these common patterns helps you implement similar configurations for your specific needs.

The `funnel` attribute lets devices use [Tailscale Funnel][docs-funnel] for public access. The `mullvad` attribute grants access to [Mullvad exit nodes][docs-mullvad-exit-nodes] for enhanced privacy. The `drive:share` and `drive:access` attributes enable [Taildrive][docs-taildrive] file sharing capabilities. The `disable-ipv4` attribute disables IPv4 addressing for IPv6-only deployments.

Each attribute applies immediately to matching devices without requiring device reconfiguration or restart.

### Add a node attribute

*（图：Add node attribute form with fields for selecting targets and defining attributes or capabilities.）*

\[Missing snippet: node\_attributes\_add.mdx]

### Edit a node attribute

*（图：Edit node attribute form showing fields for modifying targets and attributes.）*

\[Missing snippet: node\_attributes\_edit.mdx]

### Delete a node attribute

\[Missing snippet: node\_attributes\_delete.mdx]

## Device posture

*（图：Device posture tab displaying posture:recent\_windows rule requiring node:os == windows and node:osVersion >= 11.）*

[Device posture][docs-device-posture] rules define the requirements a device must meet for access control policies to prevent non-compliant devices from accessing sensitive resources. Posture rules can check for conditions like OS version, disk encryption status, and the presence of specific security software. You can create custom posture checks to enforce your organization's security policies.

Posture checks run continuously, revoking access if devices fall out of compliance.

You can reference posture rules in the `srcPosture` field of access rules to enforce device compliance. Devices must meet all specified posture requirements to establish connections. Update posture definitions as security requirements evolve.

Posture enforcement happens at connection time and periodically during active connections. If a device falls out of compliance, existing connections end and new connections fail until the device meets requirements again.

### Add a posture rule

*（图：Add device posture rule form with fields for rule name and device attribute conditions.）*

\[Missing snippet: device\_posture\_add.mdx]

For integration with enterprise device management systems, refer to the documentation for [Intune][docs-intune], [Jamf Pro][docs-jamf-pro], [Iru][docs-kandji] (formerly Kandji), [1Password XAM (Kolide)][docs-kolide], and [SentinelOne][docs-sentinelone].

### Edit a device posture rule

*（图：Edit device posture rule form showing fields for modifying posture requirements and conditions.）*

\[Missing snippet: device\_posture\_edit.mdx]

### Delete device posture rules

\[Missing snippet: device\_posture\_delete.mdx]

## Auto approvers

*（图：Auto approvers tab with Routes section showing 100.100.106.0/24 auto-approved for tag:mytag, and Exit nodes section showing tag:example as an auto-approved exit node.）*

[Auto approvers][docs-policy-syntax-autoapprovers] are policies that let you automatically approve specific operations, such as advertising subnet routes or exit nodes, without manual intervention.

### Routes

Automatically approve [subnet route][docs-subnets] advertisements from users, groups, and tags. This removes manual approval for subnet routers. Route auto approval lets you scale without administrative bottlenecks.

### Add a route auto approver

*（图：Add route auto approver form with fields for route CIDR and approvers selection.）*

\[Missing snippet: auto\_approvers\_routes\_add.mdx]

### Edit a route auto approver

\[Missing snippet: auto\_approvers\_routes\_edit.mdx]

### Delete a route auto approver

\[Missing snippet: auto\_approvers\_routes\_delete.mdx]

### Exit nodes

Automatically approve users, groups, and tags as [exit nodes][docs-exit-nodes]. This lets designated devices route internet traffic without manual approval. Exit node auto approval supports use cases like regional exit nodes or dedicated privacy infrastructure.

### Add an exit node auto approver

*（图：Add exit node auto approver form with field for selecting users, groups, or tags as exit node approvers.）*

\[Missing snippet: auto\_approvers\_exit\_nodes\_add.mdx]

### Edit an exit node auto approver

\[Missing snippet: auto\_approvers\_exit\_nodes\_edit.mdx]

### Delete an exit node auto approver

\[Missing snippet: auto\_approvers\_exit\_nodes\_delete.mdx]

## Tests

*（图：Tests tab with General tests section showing one test for alice@example.com with node:os macos accessing tag:example:80 with tcp or udp protocol, and SSH tests section showing crocus.cat@example.com can access 100.121.20.49 as root user.）*

For an overview of tests and how they work in the visual policy editor, refer to the [tests section][docs-visual-editor-tests] in the visual policy editor documentation. This reference documents the UI controls and procedures for managing tests.

The **Tests** tab contains sections for general access tests and SSH-specific tests. Tests act as regression protection, ensuring that policy modifications don't accidentally break existing access patterns.

### General tests

Create validation tests that access control changes must pass before saving. These tests ensure policy modifications don't accidentally revoke important permissions or expose critical systems. Well-designed tests catch configuration errors before they affect production access.

### Add a general test

*（图：Add general test form with fields for source, posture attribute, accepted destinations, denied destinations, and protocol selection.）*

\[Missing snippet: general\_tests\_add.mdx]

### Edit a general test

*（图：Edit general test form showing fields for modifying test conditions and assertions.）*

\[Missing snippet: general\_tests\_edit.mdx]

### Delete a general test

\[Missing snippet: general\_tests\_delete.mdx]

### SSH tests

[SSH tests][docs-policy-syntax-sshtests] let you write validation tests that Tailscale SSH policy changes must pass before you can save them. These tests verify SSH access rules work as intended. SSH tests validate both access permissions and authentication requirements. Tests run automatically when you save policy changes. Failed tests prevent the policy from saving and display error messages indicating which assertions failed.

#### Add an SSH test

*（图：Add SSH test form with fields for source, destination, accepted users, checked users, and denied destinations.）*

\[Missing snippet: ssh\_tests\_add.mdx]

### Edit an SSH test

\[Missing snippet: ssh\_tests\_edit.mdx]

### Delete an SSH test

\[Missing snippet: ssh\_tests\_delete.mdx]

[docs-device-posture]: /docs/features/device-posture

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-funnel]: /docs/features/tailscale-funnel

[docs-grant-examples]: /docs/reference/examples/grants

[docs-grants-app-capabilities]: /docs/features/access-control/grants/grants-app-capabilities

[docs-grants-syntax]: /docs/reference/syntax/grants

[docs-grants-vs-acls]: /docs/reference/grants-vs-acls

[docs-grants]: /docs/features/access-control/grants

[docs-intune]: /docs/integrations/mdm/intune

[docs-ipsets]: /docs/features/tailnet-policy-file/ip-sets

[docs-jamf-pro]: /docs/integrations/jamf-pro

[docs-kandji]: /docs/integrations/iru

[docs-kolide]: /docs/integrations/kolide

[docs-mullvad-exit-nodes]: /docs/features/exit-nodes/mullvad-exit-nodes

[docs-policy-syntax-autoapprovers]: /docs/reference/syntax/policy-file#autoapprovers

[docs-policy-syntax-hosts]: /docs/reference/syntax/policy-file#hosts

[docs-policy-syntax-nodeattrs]: /docs/reference/syntax/policy-file#nodeattrs

[docs-policy-syntax-sshtests]: /docs/reference/syntax/policy-file#sshtests

[docs-policy-syntax-synced-groups]: /docs/reference/syntax/policy-file#synced-groups

[docs-policy-syntax-users]: /docs/reference/syntax/policy-file#users

[docs-policy-syntax]: /docs/reference/syntax/policy-file

[docs-sentinelone]: /docs/integrations/sentinelone

[docs-sso-google-sync]: /docs/integrations/google-sync

[docs-subnets]: /docs/features/subnet-routers

[docs-tags]: /docs/features/tags

[docs-taildrive]: /docs/features/taildrive

[docs-tailscale-ssh]: /docs/features/tailscale-ssh

[docs-targets-autogroups]: /docs/reference/targets-and-selectors#autogroups

[docs-targets]: /docs/reference/targets-and-selectors

[docs-via]: /docs/features/access-control/grants/grants-via

[docs-visual-editor-tests]: /docs/features/visual-editor#tests

[docs-visual-editor]: /docs/features/visual-editor
