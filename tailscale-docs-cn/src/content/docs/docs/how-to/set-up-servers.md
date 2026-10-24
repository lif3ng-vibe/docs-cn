---
title: "Setting up a server on your Tailscale network"
description: "Set up a server in your tailnet, and use Tailscale SSH to manage authentication for those servers."
---

Last validated Dec 4, 2025

If you're setting up servers on Tailscale, we recommend you use an [auth key][docs-auth-keys] to provision the server, and a [tag][docs-tags] to restrict its access. You can also set up [Tailscale SSH][docs-tailscale-ssh] to access your servers.

Here's how to set up a server in Tailscale:

1. Create a new [tag][docs-tags] in your tailnet for the type of shared resource you are managing. For example, you can use the tag `server` for your servers, `prod` or `test` for your environments, and `front-end` for grouping of other resources that you maintain.

   To create a tag, modify the [tailnet policy file][docs-acls] to specify the owner of the tag, which is the team or user who can use that tag. You can use an existing tag for all servers. If you're also setting up Tailscale SSH, we recommend using a new tag.

   ```json
   {
     "tagOwners": {
       "tag:server": ["alice@example.com"]
     }
   }
   ```

   \[Missing snippet: visual\_policy\_editor.mdx]

2. Write [access rules][docs-policy-syntax-acls] in the tailnet policy file which:

   * Allow the desired sources to reach the tagged resources
   * If you're also setting up Tailscale SSH, allow the desired sources to reach the tagged resources using Tailscale SSH

   ```json
   {
     "grants": [
       {
         "src": ["group:sre"],
         "dst": ["tag:server"],
         "ip": ["*"]
       }
     ],
     "ssh": [
       {
         "action": "accept",
         "src": ["group:sre"],
         "dst": ["tag:server"],
         "users": ["ubuntu", "root"]
       }
     ]
   }
   ```

   \[Missing snippet: visual\_policy\_editor.mdx]

3. Generate an [authentication key][docs-auth-keys] to automatically connect servers to your network. Select the tag or tags you wish to use for your servers as part of this auth key.

   * If you're authenticating more than one server, use a reusable auth key. Or, for long-lived auth keys, set up an [OAuth client with the scope `auth_keys`][docs-oauth-clients-generate-long].
   * If you're authenticating ephemeral workloads like containers or functions, use an ephemeral key.
   * If your tailnet has [device approval][docs-device-approval] enabled, and you only intend to use that to approve end-user devices, use a pre-authorized auth key.

   *（图：Tailscale's auth key generation page）*

> **Note:**

> **Note:**
>
> Currently, if your client node is provisioned with an [authentication key][docs-auth-keys], you cannot use [check mode][docs-tailscale-ssh-check-mode] when
> establishing a Tailscale SSH connection using the node as a source.

4. When you provision a new server, [install][co-download] and connect to Tailscale manually or as part of your automation tooling. Make sure to specify the auth key including the tags you want, and to enable Tailscale SSH.

   ```shell
   tailscale up --auth-key=$TS_AUTHKEY
   ```

   If you want to specify a particular machine name for your server to use with [MagicDNS][docs-magicdns], then also specify `--hostname`:

   ```shell
   tailscale up --auth-key=$TS_AUTHKEY --hostname=$TS_HOSTNAME
   ```

   If the auth key was not generated with tags, then also specify `--advertise-tags`:

   ```shell
   tailscale up --auth-key=$TS_AUTHKEY --advertise-tags=<tags>
   ```

   If you want to enable Tailscale SSH, then also specify `--ssh`:

   ```shell
   tailscale up --auth-key=$TS_AUTHKEY --ssh
   ```

5. To access your servers over Tailscale, you can connect to them like any other device in your tailnet.

   If you have Tailscale SSH set up, you can connect to your servers using [Tailscale SSH][docs-tailscale-ssh] or [Tailscale SSH Console][docs-tailscale-ssh-console].

[co-download]: https://tailscale.com/download

[docs-policy-syntax-acls]: /docs/reference/syntax/policy-file#acls

[docs-tags]: /docs/features/tags

[docs-acls]: /docs/features/access-control/acls

[docs-auth-keys]: /docs/features/access-control/auth-keys

[docs-device-approval]: /docs/features/access-control/device-management/device-approval

[docs-magicdns]: /docs/features/magicdns

[docs-oauth-clients-generate-long]: /docs/features/oauth-clients#generating-long-lived-auth-keys

[docs-tailscale-ssh-check-mode]: /docs/features/tailscale-ssh#check-mode

[docs-tailscale-ssh-console]: /docs/features/tailscale-ssh/tailscale-ssh-console

[docs-tailscale-ssh]: /docs/features/tailscale-ssh
