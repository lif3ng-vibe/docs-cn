---
title: "Tailnet policy file"
description: "Understand the tailnet policy file."
---

Last validated May 21, 2025

The tailnet policy file is a centralized [human JSON (HuJSON)][xt-hujson] configuration file that stores parameters, policies, and settings for your Tailscale network (known as a tailnet). [Owners, Admins, and Network admins](/docs/reference/user-roles) can manage your tailnet policy file from the Tailscale admin console. You can also manage the tailnet policy file with [GitOps][docs-gitops] using GitHub, GitLab, or Bitbucket.

The tailnet policy file is organized into multiple top-level [sections][ar-sections], each offering different functionality. You can use the various sections of the tailnet policy file to:

* Define named groupings of users, devices, and network segments with [tags][docs-tags], [groups][docs-targets-groups], and [IP sets][docs-ipsets].
* Define access control policies at the [network layer][docs-osi-l3] using [ACLs][docs-acls].
* Define access control policies at the [network layer][docs-osi-l3] and [application layer][docs-osi-l7] using [grants][docs-grants].
* Assign aliases to IP addresses and [subnets][docs-subnets] (using the `hosts` section).
* Define [device posture][docs-device-posture] rules.
* Specify who can use [Tailscale SSH][docs-tailscale-ssh].

- Specify who can use which [tags][docs-tags] to authenticate devices.
- Specify who can bypass the approval process to advertise [subnet routers][docs-subnets] and [exit nodes][docs-exit-nodes].
- Apply additional attributes called [node attributes][docs-nodeattr-syntax] to devices and users.
- Write tests to make assertions about access policies ([ACLs][docs-acls] and [Tailscale SSH][docs-tailscale-ssh]) that should not change.
- Define tailnet-wide policy options (such as disabling IPv4).

Using the different sections of the tailnet policy file in unison lets you manage your tailnet in a modular and fine-grained manner. For example, you can define a custom group of users, then create an access control policy to specify how the users in that group can traverse the resources in your tailnet.

## Sections

The following table provides an overview of each top-level section of the tailnet policy file.

| Section         | Name                        | What it's for                                                                                                                                                          | Resources                                       |
| --------------- | --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| `acls`          | Access control lists (ACLs) | Create network-level access control policies.                                                                                                                          | [Syntax reference →][docs-acls-syntax]          |
| `autoApprovers` | Auto approvers              | Specify who can bypass the approval process to advertise [subnet routers][docs-subnets], and [exit nodes][docs-exit-nodes], and [app connectors][docs-app-connectors]. | [Syntax reference →][docs-autoapprovers-syntax] |
| `grants`        | Grants                      | Define network-level and application-level access control policies.                                                                                                    | [Syntax reference →][docs-grants-syntax]        |
| `groups`        | Groups                      | Define named groups of users, devices, and subnets to target in access control policies and other definitions.                                                         | [Syntax reference →][docs-groups-syntax]        |
| `hosts`         | Hosts                       | Define named aliases for devices and subnets.                                                                                                                          | [Syntax reference →][docs-hosts-syntax]         |
| `ipsets`        | IP sets                     | Define [named network segments][docs-ipsets] to target in access control policies and other definitions.                                                               | [Syntax reference →][docs-ipsets-syntax]        |
| `nodeAttr`      | Node attributes             | Apply additional attributes to devices and users.                                                                                                                      | [Syntax reference →][docs-nodeattr-syntax]      |
| `postures`      | Device posture policies     | Define [device posture][docs-device-posture] rules to target in access control policies.                                                                               | [Syntax reference →][docs-postures-syntax]      |
| `ssh`           | Tailscale SSH               | Specify who can use [Tailscale SSH][docs-tailscale-ssh].                                                                                                               | [Syntax reference →][docs-ssh-syntax]           |
| `sshTests`      | Tailscale SSH tests         | Write tests to make assertions about [Tailscale SSH][docs-tailscale-ssh] that should not change.                                                                       | [Syntax reference →][docs-ssh-tests-syntax]     |
| `tagOwners`     | Tag owners                  | Define who can assign which [tags][docs-tags] to devices in your tailnet.                                                                                              | [Syntax reference →][docs-tag-owners-syntax]    |
| `tests`         | Access control tests        | Write tests to make assertions about access policies ([ACLs][docs-acls] and network-level [grants][docs-grants]) that should not change.                               | [Syntax reference →][docs-acl-tests-syntax]     |

There's also additional sections for [network policy options][docs-network-policy-options], such as disabling IPv4 and customizing the [DERP][docs-derp-servers] map. In most cases, these settings are unnecessary.

| Section               | What it's for                                                                                     | Resources                                                             |
| --------------------- | ------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `derpMap`             | Customize the DERP servers that a tailnet uses.                                                   | [Syntax reference →][docs-network-policy-options-derpmap]             |
| `disableIPv4`         | Disable using IPv4 in a tailnet.                                                                  | [Syntax reference →][docs-network-policy-options-disableipv4]         |
| `OneCGNATRoute`       | Modify the routes the Tailscale clients generate.                                                 | [Syntax reference →][docs-network-policy-options-onecgnatroute]       |
| `randomizeClientPort` | Control whether devices prefer a random port number or the default `41641` for WireGuard traffic. | [Syntax reference →][docs-network-policy-options-randomizeclientport] |

[ar-sections]: #sections

[docs-acl-tests-syntax]: /docs/reference/syntax/policy-file#tests

[docs-acls-syntax]: /docs/reference/syntax/policy-file#acls

[docs-acls]: /docs/features/access-control/acls

[docs-app-connectors]: /docs/features/app-connectors

[docs-autoapprovers-syntax]: /docs/reference/syntax/policy-file#auto-approvers

[docs-derp-servers]: /docs/reference/derp-servers

[docs-device-posture]: /docs/features/device-posture

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-gitops]: /docs/gitops

[docs-grants-syntax]: /docs/reference/syntax/policy-file#grants

[docs-grants]: /docs/features/access-control/grants

[docs-groups-syntax]: /docs/reference/syntax/policy-file#groups

[docs-hosts-syntax]: /docs/reference/syntax/policy-file#hosts

[docs-ipsets-syntax]: /docs/reference/syntax/policy-file#ip-sets

[docs-ipsets]: /docs/features/tailnet-policy-file/ip-sets

[docs-network-policy-options-derpmap]: /docs/reference/syntax/policy-file#derpmap

[docs-network-policy-options-disableipv4]: /docs/reference/syntax/policy-file#disableipv4

[docs-network-policy-options-onecgnatroute]: /docs/reference/syntax/policy-file#onecgnatroute

[docs-network-policy-options-randomizeclientport]: /docs/reference/syntax/policy-file#randomizeclientport

[docs-network-policy-options]: /docs/reference/syntax/policy-file#network-policy-options

[docs-nodeattr-syntax]: /docs/reference/syntax/policy-file#node-attributes

[docs-osi-l3]: /docs/concepts/tailscale-osi#network-layer

[docs-osi-l7]: /docs/concepts/tailscale-osi#application-layer

[docs-postures-syntax]: /docs/reference/syntax/policy-file#postures

[docs-ssh-syntax]: /docs/reference/syntax/policy-file#ssh

[docs-ssh-tests-syntax]: /docs/reference/syntax/policy-file#ssh-tests

[docs-subnets]: /docs/features/subnet-routers

[docs-tag-owners-syntax]: /docs/reference/syntax/policy-file#tag-owners

[docs-tags]: /docs/features/tags

[docs-tailscale-ssh]: /docs/features/tailscale-ssh

[docs-targets-groups]: /docs/reference/targets-and-selectors#groups

[xt-hujson]: https://github.com/tailscale/hujson
