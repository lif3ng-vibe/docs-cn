---
title: "Share your machines with other users"
description: "Give a Tailscale user on another tailnet access to a private machine within your tailnet, without exposing the machine publicly."
---

Last validated Jan 5, 2026

> **Note:** Link-based sharing is currently in beta.

> **Note:** Sharing is available for [all plans](https://tailscale.com/pricing).

You can share access to specific machines with people outside your Tailscale network (known as a tailnet) without exposing them to the public internet. Sharing gives the recipient access to only the shared machine in your tailnet, and nothing else.

Users in your tailnet can access all machines as governed by [access control policies][docs-access-control]; sharing a machine is only required for allowing external users to access a machine.

Sharing respects the access control policies and [MagicDNS][ar-sharing-magic-dns] settings of both your tailnet and the recipient's tailnet. Sharing strips [tags][docs-tags], [groups][docs-policy-syntax-groups], and [subnet][ar-sharing-subnets] information from the recipient tailnet. A shared machine is visible only to the individual recipient user—it is not visible to the recipient user's entire tailnet.

## Ways to share resources

Tailscale supports two ways to share resources outside your tailnet:

* **Link-based node sharing** lets you share an individual machine with a specific Tailscale user on another tailnet. The user accepts an invitation to access the shared machine. The rest of this topic describes how to use link-based node sharing.
* **[Declarative node sharing][docs-declarative-node-sharing]** lets you share resources between trusted tailnets using policy instead of individual share invitations. Declarative node sharing is currently in alpha.

## Share a machine with another user

You need to be an [Owner, Admin, or IT admin](/docs/reference/user-roles) of a tailnet to share a machine.

To share a machine:

1. Open the [Machines](https://console.tailscale.com/admin/machines) page of the admin console and find the machine you'd like to share.
2. Send invites [by email][ar-share-by-email] or [manually by using links][ar-share-by-link].
3. [Wait for the recipient to accept][ar-wait-for-receipt].

After the recipient accepts the invite, they can access the shared machine from their Tailscale clients and admin console, as if it was on their own tailnet. For example, the macOS app will display it in the menu bar, and Linux apps will find it from `tailscale status`.

Notes about shared machines:

* Tailscale [quarantines][ar-quarantine] shared machines by default. A shared machine can receive incoming connections (from the other user's tailnet) but cannot start connections. This means users can accept shares without exposing their tailnet to risks.
* As of Tailscale v1.4, shared machines appear in the other tailnet as the sharer, not the owner of the machine. If Ross shares his co-worker Dave's machine to another tailnet, it will appear to be owned by Ross in the new tailnet.
* The IPv4 address of a shared machine in the recipient's tailnet will typically be the same as its IPv4 address in the sharer's tailnet. However, if that address is unavailable in the recipient's tailnet at the time the share is accepted (because another resource in the recipient's tailnet is using the address), then a different address will be assigned for the shared machine in the recipient's tailnet.
* Unused invite links expire after 30 days.

> **Warning:**
>
> A machine cannot be shared with a tag or accessed by tagged machines on another tailnet, as only users can accept machine shares.

### Share using email

When you send invites by email, each specified recipient receives a single-use invite link to your machine. The recipient does not need to have a Tailscale account with the same email address. They can log in and accept the share from any Tailscale account.

1. Select the  menu, then select **Share** to open the **Share** dialog.
2. Select the **Share by email** tab.
3. Add the email address for each user that you want to send invite links.
4. Select **Share** to send email invitations to each listed email address.

### Share using a link

For invite links you plan to share manually, you can choose to make a single-use or reusable invite link. A single-use invite link is a one-time use link. A reusable invite link can be used up to 1,000 times. Unused links expire in 30 days for both single-use and reusable invite links.

1. Select the  menu, then select **Share** to open the **Share** dialog.
2. Select **Copy invite link** tab.
3. (Optional): Toggle on **Reusable link** for a link that can be accepted more than once.
4. Select **Copy share link** to create the link and copy it to your clipboard.
5. Share the copied invite link to your intended recipient. Treat the invite link the way you would a password. It provides the ability to connect to a machine within your tailnet.

### Wait for the recipient to accept

A recipient needs to be an [Owner, Admin, or IT admin](/docs/reference/user-roles) of a tailnet to accept a shared machine invitation.

The recipient can visit the invite link to review your invitation. After they accept, you can find their profile picture and email address in the **Share** dialog. You'll also find an indicator in the **Machines** list on the admin console showing which machines have been shared to external users.

> **Note:**
>
> Unused invite links expire after 30 days.

## Revoke an invite

You need to be an [Owner, Admin, or IT admin](/docs/reference/user-roles) of a tailnet to revoke a share or share invite.

You can revoke a share or share invite from the [Machines](https://console.tailscale.com/admin/machines) page of the admin console. After you revoke an invite, the recipient user can no longer access the shared machine. To restore access, you must create a new invite and the recipient must accept that new invite.

To revoke an invite:

1. Go to the [Machines](https://console.tailscale.com/admin/machines) page of the admin console.
2. Select the **Share** option for the machine.
3. Select the  menu > **Revoke invite**.

## How sharing works

Sharing a machine exposes that machine to a user on another tailnet. Only that user is able to access your machine. It is invisible to other users on that tailnet.

*（图：In this example, only the shared machine from tailnet A and the share recipient's machines in tailnet B can talk across tailnet boundaries.）*

In this example, only the shared machine from tailnet A and the share recipient's machines in tailnet B can talk across tailnet boundaries.

When you accept an invite, Tailscale exposes the minimum set of information possible about your tailnet to that machine. Accepting an invite exposes:

* The email and avatar of the recipient (required to help confirm invites)
* Physical machine IPs of machines from your tailnet (required for connections)

### Quarantine

Shared machines are quarantined by default. They can respond to incoming connections from the tailnet they're shared to, but cannot start connections on their own. Quarantining helps sharing be "secure by default", since you can accept shares with no risk of exposing your tailnet.

### Sharing and MagicDNS

[MagicDNS][docs-magicdns] is a per-tailnet setting. If your tailnet has MagicDNS enabled, you can access machines over MagicDNS regardless of the other tailnet's settings.

Shared machines support MagicDNS in Tailscale v1.4 or later. Shared machines can only be reached by using their fully qualified domain name, which looks like `<hostname>.<tailnet-name>.ts.net`.

* `<hostname>` is the name of a machine.
* `<tailnet-name>` is the [tailnet name][docs-tailnet-name] of a tailnet.

For example, if your friend shares a machine named `minecraft-server` on the `yak-bebop` tailnet to your tailnet, you can reach it at `minecraft-server.yak-bebop.ts.net`. However, you can't reach it at `minecraft-server` from your tailnet.

> **Note:**
>
> Previously, you might have used a tailnet DNS name ending in `.beta.tailscale.net`. If so, migrate to the new tailnet DNS name that ends in `.ts.net`. Support for the `beta.tailscale.net` name ended on **September 13, 2024**.

These restrictions are necessary to prevent MagicDNS names from changing unexpectedly, and to support future features on top of sharing.

### Sharing and access control policies

When a user accepts a share, the user can make outbound requests to the shared machine, which will adhere to any [access control policies][docs-access-control] defined in the tailnet that owns the shared machine.

By default, the shared machine is quarantined and cannot make outbound requests to the user's machines. However, it's possible to "mutually share" machines, allowing the machines to make outbound connections to each other.

For example, if you have `workstation-1` (owned by `example-company-tailnet`) and `workstation-2` (owned by `sam@example.com`) and you want `workstation-1` and `workstation-2` to have access to each other, you would:

1. Share workstation-1 with `alice@example.com`.
2. Share workstation-2 with `alice@example-company.com`.

If you're [having trouble connecting to a shared machine][ar-troubleshooting], review your tailnet policy file for rules that might be blocking access.

To write [access rules][docs-policy-syntax-access-rules] that apply to a shared machine, you can use the email address of the recipient. For example, if you invite `alice@example.com` to share a machine at `100.74.78.2`, you can give Alice access to a particular host.

```json
"grants": [
  {
    "src": ["group:admins"],
    "dst": ["*"],
    "ip": ["*"]
  },
  {
    "src": ["alice@example.com"],
    "dst": ["100.74.78.2"],
    "ip": ["*"]
  }
]
```

\[Missing snippet: visual\_policy\_editor.mdx]

> **Warning:**
>
> Be careful of rules like `"src": ["*"]`, which apply to everyone who has access to your tailnet, including invited users. Consider making a group that includes all your tailnet users instead of `*`.

You can also write access rules by using the special `autogroup:shared` group. This group automatically includes all users invited to your tailnet, and lets you write rules without knowing email addresses in advance.

For example, to restrict invited users to only access web server ports `80` and `443`, you can write a rule like:

```json
"grants": [
  // Admins can access everything in the tailnet.
  {
    "src": ["group:admins"],
    "dst": ["*"],
    "ip": ["*"]
  },
  // Shared users can only access port 80 and 443 of machines they are invited to.
  {
    "src": ["autogroup:shared"],
    "dst": ["*"],
    "ip": ["80", "443"]
  }
]
```

\[Missing snippet: visual\_policy\_editor.mdx]

Remember: invited users are only able to access machines you've invited them to share. Access rules further limit what they can access. Although the rule `*:80,443` seems like it lets users access all machines, it only further restricts their access to the ports we've specified.

Sharing does not expose [tag][docs-tags] to the other tailnet. All tag information is stripped and cannot be used in the tailnet policy file of the other tailnet.

### Sharing and Subnets (subnet routers)

Shared machines do not advertise [subnets][docs-subnets] to the tailnets they're shared into, while [inviting][docs-invite-any-user] external users into your tailnet will give them access to subnet routers.

### Sharing and Exit Nodes

Sharing an [exit node][docs-exit-nodes] exposes it to the other tailnet.

To share an exit node, use the following sequence:

1. [Advertise the machine as an exit node][docs-exit-nodes-advertise-exit-node].

2. If you are not using [`autoApprovers`][docs-policy-syntax-autoapprovers], [allow the exit node from the admin console][docs-exit-nodes-allow-exit-node].

3. Share the machine per the instructions above, allowing the recipient to use it as an exit node. Ensure the **Allow use as an exit node** option is checked.

If a [user is deleted][docs-remove-team-members], the shared machines they manage will be deleted. If a user is suspended, the shared machines they manage will not be able to connect to other machines.

### Sharing and suspended or deleted users

When you [delete a user][docs-remove-team-members], it also deletes the shared machines they manage. If you suspend a user, Tailscale prevents the shared machines they manage from connecting to other machines.

### Sharing and Tailnet Lock

A node shared into a tailnet with [Tailnet Lock][docs-tailnet-lock] requires a signature before it is accessible.

To share nodes out of a tailnet with Tailnet Lock, the user who accepts the share invite needs to have their nodes signed in the locked tailnet before they can access the shared node.

### Troubleshooting

If you can find a machine that was shared with you, but you can't connect to it:

* If you're trying to access the machine by [machine name][docs-machine-names] (and not [100.x.y.z][docs-100.x-addresses] address), ensure you have [MagicDNS enabled][docs-magicdns]. You can enable MagicDNS from the [DNS](https://console.tailscale.com/admin/dns) page of the admin console.
* Review your tailnet's [access control policies][docs-access-control] to check if you have any rules that might disallow access. If you don't, it's possible the tailnet that shared it with you is restricting the traffic. Ask them to review their access control policies too.

[ar-quarantine]: #quarantine

[ar-share-by-email]: #share-using-email

[ar-share-by-link]: #share-using-a-link

[ar-sharing-magic-dns]: #sharing-and-magicdns

[ar-sharing-subnets]: #sharing-and-subnets-subnet-routers

[ar-troubleshooting]: #troubleshooting

[ar-wait-for-receipt]: #wait-for-the-recipient-to-accept

[docs-100.x-addresses]: /docs/concepts/tailscale-ip-addresses

[docs-access-control]: /docs/features/access-control

[docs-declarative-node-sharing]: /docs/features/declarative-node-sharing

[docs-policy-syntax-access-rules]: /docs/reference/syntax/policy-file#acls

[docs-policy-syntax-autoapprovers]: /docs/reference/syntax/policy-file#autoapprovers

[docs-policy-syntax-groups]: /docs/reference/syntax/policy-file#groups

[docs-exit-nodes-advertise-exit-node]: /docs/features/exit-nodes#advertise-a-device-as-an-exit-node

[docs-exit-nodes-allow-exit-node]: /docs/features/exit-nodes#allow-the-exit-node-from-the-admin-console

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-invite-any-user]: /docs/features/sharing/how-to/invite-any-user

[docs-machine-names]: /docs/concepts/machine-names

[docs-magicdns]: /docs/features/magicdns

[docs-remove-team-members]: /docs/features/sharing/how-to/remove-team-members

[docs-subnets]: /docs/features/subnet-routers

[docs-tags]: /docs/features/tags

[docs-tailnet-lock]: /docs/features/tailnet-lock

[docs-tailnet-name]: /docs/concepts/tailnet-name
