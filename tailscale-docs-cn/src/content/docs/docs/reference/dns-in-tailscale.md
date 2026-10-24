---
title: "DNS in Tailscale"
description: "Optimize your Tailscale network for DNS management, including custom DNS servers, for seamless access and better control."
---

Last validated Dec 22, 2025

> **Note:** Managing DNS is available for [all plans](https://tailscale.com/pricing).

Tailscale provides each device on your Tailscale network (known as a tailnet) with [a unique IP address][docs-ip-and-dns-addresses] that stays the same no matter where your devices are. However, IP addresses aren't very memorable, and can be unwieldy to work with. You can map [Tailscale IP addresses][docs-tailscale-ip-addresses] to human-readable names using DNS.

## Manage DNS in Tailscale

> **Note:**
>
> Clients must be configured to [use Tailscale DNS settings][docs-client-preferences-use-tailscale-dns-settings] for the settings on this page to take effect.

You can manage DNS for your tailnet using [MagicDNS][ar-magicdns], your [tailnet DNS settings][ar-tailscale-dns-settings], or [public DNS records][ar-use-public-dns-records]. You can also use the [`tailscale dns`][docs-cli-dns] command.

### MagicDNS

You can leverage Tailscale's **MagicDNS** feature, which is enabled by default, to automatically assign DNS names for devices in your tailnet.

The MagicDNS setting determines whether your tailnet uses [MagicDNS][docs-magicdns] to automatically assign DNS names to devices in your tailnet. MagicDNS is optional and not required to use other DNS settings.

> **Warning:**
>
> It's not possible to add arbitrary records to MagicDNS. Subscribe to or comment on [this GitHub issue for updates][xt-gh-tailscale-issue-1543].

[Read more about MagicDNS →][docs-magicdns]

### Tailscale DNS settings

You can manage the DNS settings for your tailnet from the [DNS](https://console.tailscale.com/admin/dns) page of the admin console. This includes settings for [MagicDNS][ar-magicdns], nameservers, and search domains.

*（图：The DNS page of the admin console with the sections for MagicDNS and nameservers.）*

#### Nameservers

Nameservers are the IPv4 or IPv6 addresses of the DNS servers you want devices to use when connected to your tailnet. You can use public nameservers or private name servers that include mappings for devices in your private network.

There are two types of nameservers: [restricted nameservers][ar-the-order-of-dns-resolvers] and [global nameservers][ar-global-nameservers].

##### Restricted nameservers

A restricted nameserver only applies to DNS queries matching a specific search domain. Using a restricted nameserver is also known as split DNS.

An example of a split DNS scenario would be if you configure `1.1.1.1` as a nameserver for the domain `example.com`. This tells devices in your tailnet to only use the `1.1.1.1` name server to look up DNS queries that match `*.example.com` (such as `foo.example.com` and `bar.example.com`).

##### Global nameservers

A global nameserver handles DNS queries for any domain. You can use a public DNS nameserver or run your own that to include additional DNS mappings.

When you use a public global nameserver, such as Cloudflare or Google, Tailscale automatically uses DNS-over-HTTPS (DoH) to ensure your DNS queries are encrypted before traversing the internet.

Some [public global DNS nameservers][xt-wikipedia-public-recursive-name-server] include:

* [Quad9][xt-quad9-access-using-ssh]: `9.9.9.9`, `149.112.112.112`, `2620:fe::fe`, and `2620:fe::9`.
* [Google][xt-google-public-dns]: `8.8.8.8`, `8.8.4.4`, `2001:4860:4860::8888`, and `2001:4860:4860::8844`.
* [Cloudflare][xt-cloudflare-what-is-1.1.1.1]: `1.1.1.1`, `1.0.0.1`, `2606:4700:4700::1111`, and `2606:4700:4700::1001`.

You can also set a personalized DNS nameserver, such as [NextDNS][docs-nextdns] or [Control D][docs-control-d], as your global nameserver. These nameservers are available when you add a nameserver using the [DNS](https://console.tailscale.com/admin/dns) page of the admin console.

Tailscale considers each global DNS nameserver's list of addresses as one entity. For example, if you add one of Google's nameservers, Tailscale automatically includes all of Google's nameserver addresses. This is true whether you add the addresses manually or through the [DNS](https://console.tailscale.com/admin/dns) page of the admin console.

*（图：The DNS page of the admin console with the section for Nameservers. The 'Add nameservers' dropdown listing public global DNS options.）*

It's best practice to use more than one global nameserver (which can be from the same provider) to ensure redundancy. However, keep in mind that using multiple global nameservers can bypass explicit content restrictions if they aren't the same across all the nameservers.

By default, your tailnet's devices use their local DNS settings for all queries. To force clients to always use the nameservers you define, you can enable the **Override DNS servers** toggle.

> **Note:**
>
> Unless your nameservers are public, or using [Tailscale IP addresses][docs-ip-and-dns-addresses], you probably need to configure [subnet routing][docs-subnets] to allow your devices to reach the private DNS servers.

##### Nameservers and exit nodes

By default, when you configure a device to use an exit node, the device also uses the exit node as a DNS resolver for all domains, regardless of configuration of global and restricted (split DNS) nameservers.

You can override this behavior per nameserver through the admin console by configuring the nameserver to be included when devices are using an exit node.

To include a nameserver in DNS resolution for devices using an exit node:

1. Go to the [DNS](https://console.tailscale.com/admin/dns) of the admin console.
2. Locate the **Nameservers** section, then select the three dots next to the nameserver to enable. This opens the **Edit nameserver** options.
3. Enable the **Use with exit node** setting.
4. Select **Save**.

You can also enable this setting when adding a nameserver through the **Add nameserver** dialog.

#### Search domains

> **Warning:**
>
> Only devices running Tailscale v1.34 or later can use search domains.

Search domains provide a convenient way for users to access local network resources without having to specify the full domain path every time they connect to a resource. A user can specify a list of domain suffixes that are automatically appended to any domain name that is not a fully qualified domain name (FQDN).

For example, if a tailnet has `example.com` and `test.com` configured as search domains, and a user enters the phrase `server`, Tailscale uses the phrase to search for `server.example.com` against the tailnet's configured nameservers (such as `8.8.8.8` or `1.1.1.1`). If no match is returned, it searches for `server.test.com` against the tailnet's configured nameservers.

*（图：The DNS page of the admin console with the Search Domains section. Listing several example domains.）*

* When [MagicDNS][ar-magicdns] is enabled, it is always the first domain in the **Search Domains** list. This is not configurable by a user.
* You can add, reorder, modify, and remove your search domains.

### Public DNS records

If you prefer not to manage DNS settings through the admin console, you can instead publish records on your public-facing DNS server if you have one. The DNS names can be looked up (converted to a private IP address) by anyone on the internet, but because [Tailscale IP addresses][docs-tailscale-ip-addresses] are only accessible to users of your network, this is relatively harmless.

Almost every organization already has a public DNS server for routing email and publishing a website, so this is easier than setting up an internal private DNS server.

Tailscale does not offer a DNS server, so you need to use one you run yourself or one offered by your cloud, domain host, or DNS provider.

> **Note:**
>
> Public DNS names might take a while to propagate after you add them.

## Test DNS configurations

Traditionally, network admins use tools like `nslookup` to review DNS responses for various domains. However, on some platforms, `nslookup` doesn't use DNS information provided by the operating system, and returns incorrect results. You'll likely notice this issue when using split DNS or MagicDNS, which rely on advanced DNS features.

To test DNS settings on different platforms, Tailscale recommends the following approaches:

#### macOS

Use the native `dscacheutil` command:

```shell
dscacheutil -q host -a name <domain-or-magic-dns-hostname>
```

For example, searching for the IP address for a MagicDNS hostname:

```shell
dscacheutil -q host -a name my-server
```

This command will return information similar to the following:

```shell
name: my-server.example.ts.net
ip_address: 100.15.193.72
```

#### Windows

Use the Windows PowerShell `Resolve-DnsName` command:

```powershell
Resolve-DnsName -Name <domain-or-magic-dns-hostname>
```

> **Warning:**
>
> On Windows, avoid using `nslookup` for testing split DNS or MagicDNS. The `nslookup` command queries a single DNS server directly and doesn't honor Name Resolution Policy Table (NRPT) rules or other DNS policies that Tailscale uses for split DNS. This can cause `nslookup` to show incorrect results even when your actual applications (browsers, curl, ping) resolve DNS correctly.
>
> The `Resolve-DnsName` PowerShell cmdlet properly honors NRPT rules and provides accurate results for split DNS testing.

For example, searching for a MagicDNS hostname returns:

```powershell
PS C:\> Resolve-DnsName -Name my-server

Name                       Type   TTL   Section   IPAddress
----                       ----   ---   -------   ---------
my-server.example.ts.net   AAAA   600   Answer    fd7a:115c:a1e0:ab12:4843:cd96:6251:c348
my-server.example.ts.net   A      600   Answer    100.15.193.72
```

#### Linux

Linux implements its DNS support using a DNS server listening on `127.0.0.x`, so `nslookup` returns correct results in spite of its naive approach. Use `nslookup` to debug DNS responses on Linux.

## Override DNS servers

By default, devices in your tailnet prefer their local DNS settings and only use the tailnet's DNS servers when needed. However, you might want to prevent devices in your tailnet from using their local DNS settings. For example, you might want to:

* Ensure devices have access to private DNS records.
* Prevent devices from using untrusted nameservers.
* Require all traffic to go through a specific DNS server that filters traffic.

Tailscale lets you force any device in your tailnet to use your tailnet DNS settings instead of its local DNS settings. To force tailnet devices to use the tailnet-defined DNS settings, enable **Override DNS servers**. When enabled, devices connected to your tailnet ignore their local DNS settings and always use the global nameservers defined for the tailnet.

To override DNS server settings:

1. Go to the [DNS](https://console.tailscale.com/admin/dns) page of the admin console.
2. Under **Global nameservers**, enable **Override DNS servers**.

> **Note:**
>
> Make sure all devices in your tailnet have access to your global nameservers before you force them to use the tailnet DNS settings. If an [ACL][docs-acls] or [grant][docs-grants] prevents a device from accessing the global nameserver for the tailnet, the device won't be able to resolve DNS queries.

## The order of DNS resolvers

You might expect to be able to give an operating system a list of DNS nameservers in order, and that operating system will try each of those nameservers in sequence to find a given domain.

However, as increasingly more systems and software applications require a connection to the internet to function, even small delays or rare hiccups in DNS lookup can result in a degraded user experience. In response, many modern operating systems have adopted more complicated rules for how to optimize response time when multiple DNS nameservers are available.

For example, operating systems might:

* Query nameservers in order, with small delays in between each attempt.
* Query all nameservers in parallel.
* Change the order of nameservers based on past performance.
* Change the order of nameservers based on known geographic proximity.
* Load balance queries between nameservers.

Because each operating system handles resolver ordering a little differently, Tailscale cannot guarantee that the DNS resolvers you add to the [DNS](https://console.tailscale.com/admin/dns) page of the admin console will be queried in the exact order that you've specified. Depending on your DNS settings and your operating system, Tailscale either proxies all DNS requests (in which case Tailscale queries all nameservers in parallel and uses the quickest response) or defers to the operating system.

If you need nameservers to be in a specific order because you expect one of them (such as a private DNS service you run) to have different responses than the others. In that case, you're probably better off using the [split DNS feature][ar-split-dns] or setting up conditional forwarding on your private DNS service and only using that resolver in your settings.

[ar-global-nameservers]: #global-nameservers

[ar-magicdns]: #magicdns

[ar-split-dns]: #restricted-nameservers

[ar-tailscale-dns-settings]: #tailscale-dns-settings

[ar-the-order-of-dns-resolvers]: #the-order-of-dns-resolvers

[ar-use-public-dns-records]: #public-dns-records

[docs-acls]: /docs/features/access-control/acls

[docs-cli-dns]: /docs/reference/tailscale-cli#dns

[docs-client-preferences-use-tailscale-dns-settings]: /docs/features/client/manage-preferences#use-tailscale-dns-settings

[docs-control-d]: /docs/integrations/control-d

[docs-grants]: /docs/features/access-control/grants

[docs-ip-and-dns-addresses]: /docs/concepts/ip-and-dns-addresses

[docs-magicdns]: /docs/features/magicdns

[docs-nextdns]: /docs/integrations/nextdns

[docs-subnets]: /docs/features/subnet-routers

[docs-tailscale-ip-addresses]: /docs/concepts/tailscale-ip-addresses

[xt-cloudflare-what-is-1.1.1.1]: https://www.cloudflare.com/learning/dns/what-is-1.1.1.1

[xt-gh-tailscale-issue-1543]: https://github.com/tailscale/tailscale/issues/1543

[xt-google-public-dns]: https://developers.google.com/speed/public-dns/docs/using

[xt-quad9-access-using-ssh]: https://www.quad9.net/service/service-addresses-and-features

[xt-wikipedia-public-recursive-name-server]: https://en.wikipedia.org/wiki/Public_recursive_name_server
