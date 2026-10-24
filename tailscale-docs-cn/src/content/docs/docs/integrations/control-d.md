---
title: "Use Control D"
description: "Use Control D with devices in your tailnet."
---

Last validated Dec 8, 2025

[Control D][xt-control-d] is a customizable anycast [DNS][docs-dns] service that blocks malicious threats, unwanted content, trackers, and ads. Tailscale uses Control D with [DNS over HTTPS][xt-wiki-dns-over-https] (DoH). You can configure Control D as a [global nameserver][docs-dns-global-nameservers] to leverage Control D throughout your tailnet. You cannot use Control D as a split DNS server (also known as a [restricted nameserver][docs-dns-restricted-nameservers]).

> **Note:**
>
> Currently, Tailscale only shares device hostnames with Control D.

## Prerequisites

Using Control D with Tailscale requires:

* Tailscale v1.70.0 or later
* A [Control D endpoint][xt-control-d-endpoint].

> **Note:**
>
> Don't have a Control D account? [Purchase Control D][co-contact-sales] directly from Tailscale.

## Use Control D as a global nameserver

Use Control D as a global nameserver to route DNS queries from all devices in your tailnet to Control D.

> **Note:**
>
> If you configure Control D as a global nameserver, avoid configuring another global nameserver for your tailnet, as this might circumvent privacy and content restrictions enforced by Control D.

To add Control D as a global nameserver:

1. Open the [DNS](https://console.tailscale.com/admin/dns) page of the admin console.
2. Go to **Nameservers**, then select **Add nameserver** > **Control D**.
3. Enter the [resolver ID][xt-control-d-resolver-id] for your Control D endpoint.
4. Select **Save** to save Control D endpoint as a global nameserver for your tailnet.
5. Select **Override DNS servers** to force devices to use Control D as a global nameserver instead of the locally configured DNS settings.

## Use different Control D profiles for different devices

Control D lets you create multiple profiles (also known as profile IDs) to control access for different types of devices. For example, you can create an administrator Control D profile and a user Control D profile for your devices.

> **Note:**
>
> You must be using Control D as a global nameserver to use different profiles for different devices.

To specify a different profile than the global profile for a specific Tailscale device:

1. Set up Control D as a global nameserver for your tailnet.
2. Add a `nodeAttrs` section to your [tailnet policy file][docs-tailnet-policy-file] and set a `target` for the devices that apply to the Control D profile. You can use tags, users, groups, or `*`.
3. Add an `attr` section with `controld:<resolver-uid>`, where `<resolver-uid>` is your Control D Endpoint's unique resolver ID.

For example, in your tailnet policy file:

```json
{
  "grants": ["..."],
  "nodeAttrs": [
    {
      "target": ["user@example.com", "tag:server"],
      "attr": [
        "controld:<resolver-uid>",
      ],
    },
  ],
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

## Priority for tagged devices

Since `nodeAttrs` are additive and can apply to multiple devices, you can use priority values to control which Control D profile takes precedence. For example, a single tailnet node might match multiple profiles. One targeting `tag:server`, and another targeting both `tag:server` and `tag:secure-server`.

If the `tag:server` profile includes a Control D override, but you want a more specific override for `tag:secure-server`, you can assign a higher priority to that profile. To do this, add a priority suffix `?priority=1` and `?priority=2` (and so on) to the `attr` entries. The higher the priority number, the higher the priority.

For example, in these `attr` entries:

```json
{
  "nodeAttrs": [
    {
      "target": ["tag:server"],
      "attr": [
        "controld:<resolver-uid-1>?priority=1",
      ],
    },
    {
      "target": ["tag:secure-server"],
      "attr": [
        "controld:<resolver-uid-2>?priority=2",
      ],
    },
  ],
}
```

\[Missing snippet: visual\_policy\_editor.mdx]

In the above example, devices with only `tag:server` match the lower priority `<resolver-uid-1>` profile. Devices with both `tag:server` and `tag:secure-server` match both profiles, but Tailscale prioritizes `<resolver-uid-2>` because of the higher priority.

Tailscale strips the priority suffix before sending the data to Control D.

[docs-dns]: /docs/reference/dns-in-tailscale

[docs-dns-global-nameservers]: /docs/reference/dns-in-tailscale#global-nameservers

[docs-dns-restricted-nameservers]: /docs/reference/dns-in-tailscale#restricted-nameservers

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file

[xt-control-d]: https://controld.com/

[xt-control-d-endpoint]: https://docs.controld.com/docs/devices

[xt-control-d-resolver-id]: https://docs.controld.com/docs/devices#setting-up

[xt-wiki-dns-over-https]: https://en.wikipedia.org/wiki/DNS_over_HTTPS

[co-contact-sales]: https://tailscale.com/contact/sales
