---
title: "IP sets"
description: "An IP set is a way to manage groups of IP addresses. It can encapsulate a collection of [targets][docs-targets], such as IP addresses, CIDRs, hosts, [autogroups][docs-targets-autogroups], and other IP"
---

Last validated Oct 29, 2025

An IP set is a way to manage groups of IP addresses. It can encapsulate a collection of [targets][docs-targets], such as IP addresses, CIDRs, hosts, [autogroups][docs-targets-autogroups], and other IP sets. Tailscale translates everything in the IP set to a list of IP address ranges. You can use the [`ipset` syntax][ar-syntax] to create IP sets within your [tailnet policy file][docs-tailnet-policy-file] and [reference][ar-references] them from [access control][docs-access-control] policies such as [ACLs][docs-access-control-policies] and [grants][docs-grants].

The primary benefit of IP sets is that they let you group multiple network parts into a single collection, enabling you to apply access control policies to the collection rather than the individual IP addresses, hosts, or subnets.

You can leverage IP sets in a variety of ways. For example, you can:

* Target and manage logical cross-sections of your tailnet independently of other groupings like [subnets][docs-subnets], [tags][docs-tags], and [groups][docs-acl-groups].
* Target a subnet in access control policies while excluding a few specific hosts.
* [Customize an autogroup][ar-customize-autogroup-Internet] to exclude some private or public subnets from global [exit node][docs-exit-node] access.
* Facilitate a more modular organization of your [tailnet policy file][docs-tailnet-policy-file].

## Limitations

IP sets have the following limitations:

* You can't include [tags][docs-tags], [users][docs-user-roles], or [groups][docs-acl-groups] in IP sets.
* You can't use circular references to IP sets.
* The only supported [autogroup][docs-autogroups] is `autogroup:internet`. This is because `autogroup:internet` is the only autogroup that refers to IP address ranges. The other autogroups refer to unsupported targets, such as tags, users, and dynamic sets of devices.

## Syntax

An `ipset` is an object within the tailnet policy file that defines one or more named `ipsets`. Each named `ipset` contains one or more [operations][ar-operations], each adding or removing a [target][ar-targets].

The following example demonstrates the basic syntax for creating an `ipset` in the tailnet policy file where `<name>` is the name of the IP set and `<target>` is a CIDR, IP address, host, autogroup, or IP set.

```json
"ipsets": {
  "ipset:<name>": [
    "add <target>",
    "remove <target>"
  ]
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

### Operations

The `ipset` syntax supports two operations: `add` and `remove`. Each named IP set can have one or more operations, which are processed in order.

You must include the operation type before the [target][ar-targets] unless the named [IP set only uses `add` operations][ar-create-ipsets-with-only-add-operations].

| **Operation** | **Description**                       |
| ------------- | ------------------------------------- |
| `add`         | Adds a target to a named IP set.      |
| `remove`      | Removes a target from a named IP set. |

### Targets

A target is a [CIDR][xt-rfc-4632-cidrs], IP address, [host][docs-acl-hosts], autogroup, or IP set that you add to or remove from a named IP set. Each target must be preceded by an [operation][ar-operations] (`add` or `remove`) unless the named IP set only adds targets (and doesn't remove any IP addresses).

| **Target**       | **Syntax**                        | **Example**                                          |
| ---------------- | --------------------------------- | ---------------------------------------------------- |
| CIDR             | `<cidr>`                          | `192.0.2.0/24`, `2001:db8::/32`                      |
| IP address       | `<ip-address>`                    | `192.0.2.33`, `2001:db8::`                           |
| IP address range | `<ip-range-start>-<ip-range-end>` | `192.0.2.50-192.0.2.100` , `2001:db8::5-2001:db8::9` |
| Host             | `host:<name>`                     | `host:sql-server-1`                                  |
| Autogroup        | `autogroup:internet`              | `autogroup:internet`                                 |
| IP set           | `ipset:<name>`                    | `ipset:prod`                                         |

> **Note:**
>
> Hosts refers to the [hosts][docs-acl-hosts] section of the tailnet policy file, not MagicDNS names.

### References

You can reference named IP sets from specific parts of the tailnet policy file using the format `ipset:<name>` where `<name>` is the name of the IP set.

The following sections of the tailnet policy file support referencing IP sets:

* [ACLs][docs-access-control-policies] (sources and destinations)
* [Grants][docs-grants] (sources and destinations)
* IP sets

## Examples

The following examples illustrate how to leverage IP sets.

* [Create an IP set with only add operations][ar-create-ipsets-with-only-add-operations].
* [Create an IP set that contains several subnets and excludes a single IP address][ar-create-an-ipset-that-adds-several-subnets-and-excludes-a-single-ip-address].
* [Create an IP set that excludes another IP set][ar-create-an-ipset-that-excludes-another-ipset].
* [Reference IP sets in grants][ar-reference-ipsets-in-grants].
* [Reference IP sets in ACLs][ar-reference-ipsets-in-acls].
* [Customize `autogroup:internet`][ar-customize-autogroup-internet].

### Create IP sets with only add operations

The following IP sets don't remove any [targets][ar-targets]. As a result, they can use a simplified syntax that omits the [operation type][ar-operations] (because `add` is assumed).

```json
"ipsets": {
  "ipset:prod": ["192.0.2.0/24"],
  "ipset:dev": [
    "198.51.100.0/24",
    "203.0.113.0/24",
    "host:sql-server-1",
  ]
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

### Create an IP set that adds several subnets and excludes a single IP address

The following example shows how to create an IP set that includes several subnets and excludes a single IP address.

```json
"ipsets": {
  "ipset:prod": [
    "add 192.0.2.0/24",
    "add 2001:db8::/32",
    "add 198.51.100.0/24",
    "add 203.0.113.0/24",
    "remove 192.0.2.33",
  ],
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

### Create an IP set that excludes another IP set

The following example creates a `dev` IP set and a `prod` IP set. The `prod` IP set excludes anything in the `dev` IP set.

```json
"ipsets": {
  "ipset:dev": ["host:sql-server-1"],
  "ipset:prod": [
    "add 192.0.2.0/24",
    "add 198.51.100.0/24",
    "remove ipset:dev",
  ]
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

### Reference IP sets in grants

The following example shows how to create [grants][docs-grants] that [reference][ar-references] the `dev` IP set.

```json
"grants": [
  {
    "src": ["group:devops"],
    "dst": ["ipset:dev"],
    "ip": ["80","443","22"]
  },
  {
    "src": ["group:dev"],
    "dst": ["ipset:dev"],
    "ip": ["80","443"],
    "via": ["tag:office-routers"],
  },
]
```

\[Missing snippet: visual\_policy\_editor.mdx]

### Reference IP sets in ACLs

The following example shows how to create [ACLs][docs-access-control-policies] that [reference][ar-references] the `prod` IP set.

```json
"acls": [
  {
    "src":    ["group:devops"],
    "dst":    ["ipset:prod:*"],
    "action": "accept",
  },
],
```

\[Missing snippet: visual\_policy\_editor.mdx]

### Customize `autogroup:internet`

You can use IP sets to customize the traffic that flows through an exit node (when enabled) in the tailnet using [`autogroup:internet`][docs-autogroups].

The following example creates an IP set named `internet` that customizes `autogroup:internet` by doing the following:

* Adds `autogroup:internet`.
* Removes the production application gateways (`ipset:cdn-edge`).
* Removes the publicly accessible partner network (`ipset:partner-net`).
* [Grants][docs-grants] the `internet` IP set (a subset of internet-bound traffic) access to the Seattle and London office [exit nodes][docs-exit-node].

```json
"ipsets": {
  "ipset:internet": [
    "add autogroup:internet",
    "remove ipset:cdn-edge",
    "remove ipset:partner-net"
  ],
  "ipset:cdn-edge": ["8.21.9.6", "8.21.9.7", "8.21.9.13", "8.21.9.14"],
  "ipset:partner-net": ["52.23.40.0/24"]
},
"grants": [
  {
    "src": ["group:sea"],
    "dst": ["ipset:internet"],
    "ip":  ["*"],
    "via": ["tag:officerouter-sea"],
  },
  {
    "src": ["group:lhr"],
    "dst": ["ipset:internet"],
    "ip":  ["*"],
    "via": ["tag:officerouter-lhr"],
  }
]
```

\[Missing snippet: visual\_policy\_editor.mdx]

[ar-create-an-ipset-that-adds-several-subnets-and-excludes-a-single-ip-address]: #create-an-ip-set-that-adds-several-subnets-and-excludes-a-single-ip-address

[ar-create-an-ipset-that-excludes-another-ipset]: #create-an-ip-set-that-excludes-another-ip-set

[ar-create-ipsets-with-only-add-operations]: #create-ip-sets-with-only-add-operations

[ar-customize-autogroup-internet]: #customize-autogroupinternet

[ar-operations]: #operations

[ar-reference-ipsets-in-acls]: #reference-ip-sets-in-acls

[ar-reference-ipsets-in-grants]: #reference-ip-sets-in-grants

[ar-references]: #references

[ar-syntax]: #syntax

[ar-targets]: #targets

[docs-access-control-policies]: /docs/features/access-control/acls

[docs-access-control]: /docs/features/access-control

[docs-acl-groups]: /docs/reference/syntax/policy-file#groups

[docs-acl-hosts]: /docs/reference/syntax/policy-file#hosts

[docs-autogroups]: /docs/reference/syntax/policy-file#autogroups

[docs-exit-node]: /docs/features/exit-nodes

[docs-grants]: /docs/features/access-control/grants

[docs-subnets]: /docs/features/subnet-routers

[docs-tags]: /docs/features/tags

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file

[docs-targets-autogroups]: /docs/reference/targets-and-selectors#autogroups

[docs-targets]: /docs/reference/targets-and-selectors

[docs-user-roles]: /docs/reference/user-roles

[xt-rfc-4632-cidrs]: https://www.rfc-editor.org/rfc/rfc4632.html
