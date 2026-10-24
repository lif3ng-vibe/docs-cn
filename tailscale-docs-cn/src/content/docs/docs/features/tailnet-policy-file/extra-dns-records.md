---
title: "Add custom extra DNS records to your tailnet"
description: "Tailscale provides DNS to the nodes in your Tailscale network (known as a tailnet) to support MagicDNS node names and custom DNS configuration. Using Tailscale's DNS infrastructure, you can configure "
---

Last validated Dec 10, 2025

Tailscale provides DNS to the nodes in your Tailscale network (known as a tailnet) to support MagicDNS node
names and custom DNS configuration. Using Tailscale's DNS infrastructure, you can
configure extra DNS records that will resolve on your nodes.

> **Note:** Custom extra DNS records are currently in alpha.

1. [Contact Tailscale support][co-contact-support-billing] and have the `extraDNSRecords` setting enabled in your tailnet.
2. Go to the [DNS](https://console.tailscale.com/admin/dns) page of the admin console. In the **Nameservers** section, go to **Global nameservers** and enable **Override DNS servers**.
3. After you've confirmed the steps above, go to the [Access controls](https://console.tailscale.com/admin/acls) page of the admin console, and edit your policy file to include an `extraDNSRecords` field:

   ```json
   {
     "grants": ["..."],
     "extraDNSRecords": [
       {"Name": "custom.record", "Value": "100.100.100.100"},
     ],
   }
   ```

   \[Missing snippet: visual\_policy\_editor.mdx]

This adds the domain name `custom.record` to each node in your tailnet,
which resolves an `A` record pointing to `100.100.100.100`.

[co-contact-support-billing]: https://tailscale.com/contact/support/?type=billing
