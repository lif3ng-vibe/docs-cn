---
title: "Tailscale Funnel"
description: "Securely route internet traffic to local services using Tailscale Funnel."
---

Last validated Jan 20, 2026

> **Note:** Tailscale Funnel is currently in beta.

> **Note:** Tailscale Funnel is available for [all plans](https://tailscale.com/pricing).

Tailscale Funnel lets you route traffic from the broader internet to a local service running on a device in your Tailscale network (known as a tailnet). You can use it to share a local service, like a web app, for anyone to access—even if they don't use Tailscale.

> **Tip:**
>
> If you'd like to share local services only with other devices in your tailnet, use [Tailscale Serve][docs-serve] instead. Also check out [Funnel vs. sharing][docs-funnel-vs-sharing].

> **Note:**
>
> The following related video provides additional context and examples.

[Serve and Funnel | Tailscale Explained (video)](https://www.youtube.com/watch?v=MpxmfpCl20c)

Explore the following topics to find more information about Tailscale Funnel:

* [Get started with Funnel][ar-get-started]
* [How Funnel works][ar-how-funnel-works]
* [The `tailscale funnel` command][docs-tailscale-funnel]
* [Troubleshoot Funnel][ar-troubleshoot-funnel]
* [Funnel examples][docs-funnel-examples]

## How Funnel works

Funnel exposes a local resource to the internet through a unique Funnel URL. Using Funnel to share a local resource creates an encrypted tunnel from the internet to a specific resource on your device. Tailscale does this using a TCP proxy and Funnel relay servers.

*（图：Diagram showing how Tailscale Funnel works）*

When you share a local resource with Funnel, it creates a unique Funnel URL that you can share. When someone uses your Funnel URL, their device sends a request to the Funnel relay server. After receiving the request, the Funnel relay server will establish a TCP proxy to your device using Tailscale. This proxy is an encrypted tunnel between the local resource and the device accessing the Funnel URL that points to it. Using a TCP proxy protects the shared data and lets Tailscale hide the IP address of your local device. The Funnel relay server cannot decrypt data sent over this proxy.

Where to go next

The process, from creating a Funnel to accessing a resource shared through it, involves:

* [Creating and sharing the Funnel URL][ar-creating-funnel].
* [Resolving the Funnel URL to an IP address][ar-resolving-funnel-url].
* [Establishing an encrypted proxy][ar-establishing-encrypted-proxy].
* [Serving the shared resource through the proxy][ar-serving-shared-resource].

### Creating and sharing the Funnel URL

When you share a local resource with Funnel, it creates a unique Funnel URL that you can share. The generated URL points only to the specific resource you used Funnel to share. So, if you share a local web server, the Funnel only shares that specific web server. Likewise, if you share a file or directory, the Funnel only shares the specific file or directory.

### Resolving the Funnel URL to an IP address

When a device tries to access a Funnel URL, it first contacts public DNS servers to resolve the URL to an IP address. These DNS servers respond with the IP address of a Funnel relay server, not your device's IP address. This step hides your device's location from the public internet. After resolving the URL to an IP address, the device sends a request to the Funnel relay server.

### Establishing an encrypted proxy

After receiving the request, the Funnel relay server creates a TCP proxy to your device over Tailscale. This proxy acts as an encrypted relay between the Funnel relay server and your device. It ensures that your device's IP address is never exposed to the internet.

Funnel relay servers do not decrypt the traffic between public devices and your device. This ensures that Tailscale cannot access or read any content. It maintains end-to-end [encryption][docs-encryption] and privacy.

The Tailscale server running on your device receives the encrypted request from the TCP proxy. It then terminates the [TLS][xt-wiki-tls] connection and passes the decrypted request to the local service you exposed through Funnel. The local service processes the request and generates a response.

### Serving the shared resource through the proxy

After the local server on your device processes the request, it sends the response to the Tailscale server on your device. The Tailscale server then encrypts the response and sends it back to the Funnel relay server over the established TCP proxy.

Upon receiving the encrypted response, the Funnel relay server forwards it to the user's device. It does not decrypt its contents; it maintains the end-to-end encryption of the data. Finally, the user's device ends the TLS connection. It then decrypts the response and shows the requested information to the user accessing the Funnel URL.

## Get started with Funnel

Tailscale Funnel is disabled by default, but you can use the [Tailscale CLI][docs-cli] to enable the Funnel service and create Funnels.

### Requirements and limitations

Funnel requires the following to work:

* Tailscale v1.38.3 or later.
* [MagicDNS][docs-magicdns] enabled for your tailnet.
* [HTTPS][docs-enabling-https] enabled and valid HTTPS certificates for your tailnet.
* A funnel [node attribute][docs-node-attribute] in your tailnet policy file. This attribute tells Tailscale which tailnet users can use Funnel.

Additionally, Funnel has the following limitations:

* Funnel can only use DNS names in your [tailnet's domain][docs-tailnet-name] (`tailnet-name.ts.net`).
* Funnel can only listen on ports `443`, `8443`, and `10000`.
* Funnel only works over [TLS][xt-wiki-tls]-encrypted connections.
* Traffic sent over a Funnel is subject to non-configurable bandwidth limits.
* Funnel only works on platforms that can run the Tailscale CLI.
* To use Funnel on macOS, you must use one of the [open source variants of the Tailscale application for macOS][docs-macos-variants].
* The same port number cannot be used for Serve (available only within the tailnet) and Funnel (available within the tailnet and to the public) at the same time.
  * If the most recent command to configure the port was `serve`, then the port will be completely private.
  * If the most recent command to configure the port was `funnel`, then the port will be completely public.

When you enable Funnel using the Tailscale CLI, Tailscale automatically creates valid HTTPS certificates and updates your tailnet policy file. By default, it lets any users in the `autogroup:member` [autogroup][docs-policy-syntax-autogroups] to use Funnel. You can adjust this by manually updating your tailnet policy file.

> **Warning:**
>
> It is possible to frequently request a new certificate and exceed Let's Encrypt's rate limits. As a result, you may find yourself waiting 34 hours until you can try again. For more information, refer to Let's Encrypt's [rate limits documentation][xt-letsencrypt-rate-limits].

### Enable Funnel

Use the [`tailscale funnel`][docs-tailscale-funnel] command to enable Funnel. The command triggers a web interface that prompts you to approve enabling Funnel. After you approve it, Tailscale will create valid HTTPS certificates for your tailnet and add a funnel node attribute to your tailnet policy file.

### Create a Funnel

To create a Funnel, use the `tailscale funnel` command and pass the target you want to share. You can share a service, a file, or a directory. You can also optionally pass any of the [available flags][docs-tailscale-funnel-flags].

```shell
tailscale funnel 3000
Available on the internet:
https://amelie-workstation.pango-lin.ts.net

|-- / proxy http://127.0.0.1:3000

Press Ctrl+C to exit.
```

When you use Tailscale Funnel, the Funnel relay servers show up in your device's list of Tailscale peers. All peers using the command [`tailscale status --json`][docs-cli-status] display.

> **Warning:**
>
> Sharing files and directories with Funnel only works with the [open source variants][docs-macos-variants] of the Tailscale client for macOS. Other variants have sandbox limitations.
>
> You can only use Funnel to share ports if you installed Tailscale for macOS from the App Store or as a Standalone variant system extension.

## Resources

* Explore the collection of [Funnel use case examples][docs-funnel-examples] for inspiration and ideas.
* [Use the PROXY protocol][docs-tailscale-funnel-proxy-protocol].
* [Use the TCP forwarder][docs-tailscale-funnel-tcp-forwarder].
* [Reset the Funnel configuration][docs-tailscale-funnel-reset-funnel].
* [Disable Funnel][docs-tailscale-funnel-disable-funnel].

## Troubleshooting

Trouble with Funnels is usually related to one of the following issues:

* [Funnel node attribute][ar-funnel-node-attribute]
* [HTTPS certificates][ar-https]
* [Access controls][ar-access-controls]
* [DNS propagation][ar-dns]

### Funnel node attribute

Tailscale Funnel requires a [node attribute][docs-node-attribute] (`nodeAttrs`) of `funnel` in your tailnet policy file to tell Tailscale who can use Funnel. If you use the Tailscale CLI to enable Funnel, Tailscale ensures this requirement is met. Alternatively, you can manually add the node attribute for Funnel. You need to be an [Owner, Admin, or Network admin](/docs/reference/user-roles) of a tailnet to modify a tailnet policy file.

1. Open the [Access controls](https://console.tailscale.com/admin/acls) page of the admin console.
2. Expand the Funnel section and select **Add Funnel to policy**.

This adds the default `nodeAttrs` section and saves the tailnet policy file automatically.

```json
"nodeAttrs": [
  {
    "target": ["autogroup:member"],
    "attr":   ["funnel"],
  },
],
```

\[Missing snippet: visual\_policy\_editor.mdx]

### HTTPS certificates

Tailscale Funnel requires valid [HTTPS certificates][docs-enabling-https] for your tailnet to automatically provision TLS certificates for your unique tailnet DNS name. If you use the Tailscale CLI to enable Funnel, Tailscale ensures this requirement is met.

### Access controls

If the funnel node attribute in your tailnet policy file doesn't permit you to use Funnel, you won't be able to. The default node attribute to enable Funnel includes all tailnet members by default, but [Owners, Admins, and Network admins](/docs/reference/user-roles) can modify this to further restrict access.

### DNS propagation

Public DNS records can take up to 10 minutes to show up for your tailnet domain. This delay might prevent someone from using a Funnel URL until the public DNS records are updated.

[ar-access-controls]: #access-controls

[ar-creating-funnel]: #creating-and-sharing-the-funnel-url

[ar-dns]: #dns-propagation

[ar-establishing-encrypted-proxy]: #establishing-an-encrypted-proxy

[ar-funnel-node-attribute]: #funnel-node-attribute

[ar-get-started]: #get-started-with-funnel

[ar-how-funnel-works]: #how-funnel-works

[ar-https]: #https-certificates

[ar-resolving-funnel-url]: #resolving-the-funnel-url-to-an-ip-address

[ar-serving-shared-resource]: #serving-the-shared-resource-through-the-proxy

[ar-troubleshoot-funnel]: #troubleshooting

[docs-cli-status]: /docs/reference/tailscale-cli#status

[docs-cli]: /docs/reference/tailscale-cli

[docs-enabling-https]: /docs/how-to/set-up-https-certificates

[docs-encryption]: /docs/concepts/tailscale-encryption

[docs-funnel-examples]: /docs/reference/examples/funnel

[docs-funnel-vs-sharing]: /docs/reference/funnel-vs-sharing

[docs-macos-variants]: /docs/concepts/macos-variants

[docs-magicdns]: /docs/features/magicdns

[docs-node-attribute]: /docs/reference/syntax/policy-file#node-attributes

[docs-policy-syntax-autogroups]: /docs/reference/syntax/policy-file#autogroups

[docs-serve]: /docs/features/tailscale-serve

[docs-tailnet-name]: /docs/concepts/tailnet-name

[docs-tailscale-funnel-disable-funnel]: /docs/reference/tailscale-cli/funnel#turn-tailscale-funnel-off

[docs-tailscale-funnel-flags]: /docs/reference/tailscale-cli/funnel#funnel-command-flags

[docs-tailscale-funnel-proxy-protocol]: /docs/reference/tailscale-cli/funnel#use-the-proxy-protocol

[docs-tailscale-funnel-reset-funnel]: /docs/reference/tailscale-cli/funnel#reset-tailscale-funnel

[docs-tailscale-funnel-tcp-forwarder]: /docs/reference/tailscale-cli/funnel#use-a-tcp-forwarder

[docs-tailscale-funnel]: /docs/reference/tailscale-cli/funnel

[xt-letsencrypt-rate-limits]: https://letsencrypt.org/docs/rate-limits/

[xt-wiki-tls]: https://en.wikipedia.org/wiki/Transport_Layer_Security
