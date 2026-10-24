---
title: "Protect your SSH servers using Tailscale"
description: "Understand how Tailscale works well with SSH clients and SSH servers, improving security and offering a better user experience."
---

Last validated Jan 12, 2026

## What is Secure Shell (SSH)?

The secure shell protocol, or SSH, has been around now for over 25 years. It was designed to securely connect to a
server for remote access, directly running commands, or file transfers (using the `scp` or `sftp` applications). SSH is a
replacement for `telnet`, `rlogin`, `rcp`, `rsh` and `ftp`, which were used to perform similar tasks. Those protocols
are rarely used today even though some of them eventually added extensions for encryption. There are several open source
SSH clients available today for virtually every operating system.

Today, it's well known that unprotected data transfers over the public internet or open Wi-Fi networks are dangerous;
transmissions can be intercepted or modified. The SSH protocol is a useful tool for addressing this problem by creating
a secure remote access connection using encryption, but comes with some caveats.

### Why use SSH?

If you need to remotely access a server or transfer files, SSH encrypts what you need to send over a public network.
It's based on a rigorously tested protocol, while being highly user-friendly and configurable.

### What can SSH do?

An SSH client is a local application that is used to connect to a remote computer, typically for secure logins as well
as secure file transfers. This functionality is provided by the secure shell protocol, which is a cryptographic network
protocol.

SSH also has VPN-like capabilities built into it: SSH supports port forwarding (the client can ask the remote SSH server
to forward an outgoing connection), reverse port forwarding (the client can request that the remote SSH server forward
an incoming connection), dynamic port forwarding (the client creates port forwarding connections on-demand using the
SOCKS protocol) and tunnel device forwarding (the client and server can relay packets to each other, which when combined
with additional configuration can act as a VPN).

SSH has some less frequently used features that are sometimes disabled as they can be security concerns: it can forward
X11 connections (showing remote graphical applications on your client machine) and forward its authentication agent
(which permits connecting to other SSH servers using the saved credentials from your client machine).

All the SSH features can be used simultaneously, enabling the use of multiple sessions over one connection. If a new
session is desired (and the SSH client supports that feature), then it can attach to an existing connection without
needing to re-authenticate, which can be very convenient.

## How can I use SSH clients securely?

To use SSH securely, users first need to verify the host key of the server they're trying to reach. If the host key is
not checked, there is no proof that the user is connecting to the server that they expected. The SSH server then needs
to verify either the user's password or authentication key. If the SSH server only accepts connections from a private
network (either because the server is behind a NAT router or to improve security), the user also needs to connect
through another server connected to both the public internet and the private network, usually known as an SSH bastion but
sometimes called an SSH jump host, or SSH jump box.

Used alone, following SSH best practices can be difficult: host keys are often left unchecked, user keys and passwords
are rarely rotated, and connecting through an SSH bastion can be inconvenient. Tailscale can help mitigate the first two
issues and avoid the last issue entirely.

## How can I run SSH servers securely?

Although you can permit SSH connections from the public internet, any public SSH server will be subject to automated and
possibly targeted attacks. The automated login attempts often begin within minutes: there are many compromised servers
that are constantly scanning the public internet for SSH servers with oversimplified usernames and passwords. The
greatest risk comes from weak passwords, which is why the modern best practice is to disable passwords entirely.

There is also a smaller risk of compromise through bugs in the SSH server software. Known bugs in older versions of SSH
server software may allow unauthorized access, and there is always the risk of new bugs being discovered in up-to-date
software. An administrator must ensure that the server is kept up-to-date.

While authentication keys are a stronger alternative to passwords, SSH doesn't force users to ever rotate
keys. [In practice, almost no one does][bl-rotate-ssh-keys]. Worse, SSH authentication private keys are often stored as normal
files, which means someone can copy them. This puts many SSH servers at risk, as the possibility of an authentication key being
stolen increases over time as the server accumulates infrequently or never rotated authentication keys.

Authentication keys stored on a hardware token (such as those sold by Yubikey, Touch ID, smart cards, and other FIDO2
tokens) cannot be copied, which significantly reduces the risk of the authentication key being stolen: the token must be
physically taken (making purely remote attacks difficult or impossible). Hardware tokens are an excellent choice when
available, but it can be expensive to supply them to all employees and provisioning them is extra administrative
overhead: each token generates its own authentication key and the tokens themselves can be misplaced, lost or stolen.
The price of these tokens has dropped over time but their use is still unfortunately not ubiquitous.

Some SSH servers can authenticate sessions using certificates from a trusted private certificate authority. Certificates
combine normal authentication keys with a signature from the certificate authority and an expiration time. The main
difference from normal authentication keys is that the server only needs to store the certificate authority's public key
and trusts that users' authentication keys are acceptable if the certificate authority has issued a certificate. This
solves the biggest usability issue of key rotation: updating the servers is no longer required. Additional security
comes from automatically enforced key rotation because the certificates expire. A certificate authority can also sign
SSH host keys, which addresses the problem of verifying the host key when a user connects, as long as the SSH client
trusts the certificate authority.

Setting up the certificate authority infrastructure required to grant, revoke and manage certificates is quite complex
and the certificate authority's private key must be very well protected. Today, certificates for SSH are not commonly
used outside of large enterprises.

An SSH bastion (sometimes called an SSH jump host or SSH jump box) is used by some organizations or users as a gateway to
a protected internal network. Users must connect to this bastion first before they can access the protected servers. The
bastion typically has extra monitoring in place to detect intrusions. Unfortunately, bastions are often inconvenient,
high-latency and cannot get at the root of the key rotation problem without additional administrative controls.

## Advantages of using SSH with Tailscale

Tailscale works well with SSH clients and SSH servers, improving security and offering a better user experience.

### Tailscale replaces the SSH bastion, reducing latency and avoiding bottlenecks

If you have a global footprint, your traffic might have to traverse a long distance to pass through the bastion before
reaching the SSH server, adding significant latency and sometimes limiting throughput as well. Alternatively, you can
operate multiple bastions, which adds complexity.

Tailscale removes the need for a bastion entirely by keeping SSH servers on a private mesh network that has
peer-to-peer connections and end-to-end encryption. Not only is SSH more secure this way, it's also typically faster
than using a bastion.

### Automatic key rotation for the private network

While Tailscale does not manage your SSH authentication keys, it does manage access to the private network that permits
access to the SSH servers. The Tailscale client [rotates its keys][bl-tailscale-key-management] according to a
configurable time interval.

If a client device is lost or stolen, the device can be immediately deleted from the admin console. If not deleted from
the admin console, then when the device's key expires, it can no longer access the Tailscale network. In either case, the
device loses access until an authorized user successfully logs back into the Tailscale client. Multifactor
authentication is required during login if enabled in your SSO configuration, providing additional security.

### Verify connections and users

Normally upon first connection to an SSH server you are shown the SSH host key and you are expected to verify that the
key is correct (most SSH clients save the host key after the first connection). If the key is not correct, that is an
indication that your connection was intercepted by some other server.

Tailscale's server distributes public Tailscale key information to all the Tailscale clients and ensures that if you
successfully connect to a Tailscale IP address, you are connected to the correct device, not an imposter. Therefore
although it is still best practice to verify the SSH host key, you can be assured that the connection is not being
intercepted.

Tailscale also helps the SSH server verify the identity of the user connecting to it. When a Tailscale IP address
appears in the server's logs, an administrator can later look up which user that IP address belongs to. For maximum
security, the SSH server can be configured to restrict which IP addresses a username can connect from. Since the
Tailscale IP address of a user's device remains fixed unless it is deleted from the Tailscale network, this can be used
as additional proof of the user's identity.

### Only authorized users can connect to the SSH server

Normally when using SSH, anyone on a public or private network can try to connect to the SSH server. Using SSH with
Tailscale, only people who are part of your network and authorized by your network's access control policies can connect to the SSH server.
By [removing SSH access from the public internet][docs-secure-server-ubuntu], the risk posed by automated scanning attacks (or
random users trying to connect to your SSH server) is eliminated because there is nothing for them to connect to.

[Tailscale access control policies][docs-access-control] ensure that only authorized users have access to connect to the SSH server. By explicitly stating
which users are allowed to access the SSH server, it is significantly more difficult to be compromised by a stolen
authentication key or weak password (however this is not a substitute for managing authentication keys and passwords).

### Smoothly switch between networks

The Tailscale client is able to detect network changes and can switch which network connection it uses to reach other
Tailscale clients without affecting the applications using the Tailscale network. In other words, if you switch between
Ethernet and Wi-Fi, between Wi-Fi networks, or between Wi-Fi and a cellular network, then if your SSH client is
connected through Tailscale, it may pause briefly but will stay connected (assuming that the network switch occurs
reasonably quickly).

## Tailscale SSH

[Tailscale SSH][docs-tailscale-ssh] lets Tailscale manage the authentication and authorization of SSH connections in
your tailnet.

With Tailscale SSH, you can:

* **SSH as normal**, using Tailscale for authentication. With Tailscale SSH, Tailscale takes over port 22 for SSH connections incoming from the Tailscale network. Tailscale will authenticate and encrypt the connection over WireGuard, using Tailscale node keys. The SSH client and server will still create an encrypted SSH connection, but it will not be further authenticated.
* **Verify high-risk connections with [check mode][docs-tailscale-ssh-check-mode]**. Optionally require certain connections, or connections as certain users (for example, `root`), to re-authenticate before connecting. This lets the user access these high-risk applications for the next 12 hours or for a specified check period before re-authenticating again.

If you want to use Tailscale SSH for your SSH needs, follow the instructions at [Configure Tailscale SSH][docs-tailscale-ssh-configure-tailscale-ssh]. Otherwise, continue to the
next section.

## Getting started with SSH over Tailscale

These steps are an alternative to using [Tailscale SSH][docs-tailscale-ssh].

To get started:

### Step 1: Install and activate Tailscale on the SSH server

Tailscale is available for essentially any modern Linux distribution, though the installation instructions may vary slightly.

[Download Tailscale for Linux](https://tailscale.com/download/linux)

> **Note:**
>
> For more sophisticated [access controls][docs-access-control], consider using [ACLs][docs-acls] or [grants][docs-grants]. If desired,
> configure the SSH server with a [tag][docs-tags].

### Step 2: Install and activate Tailscale on the client machine

[Download Tailscale](https://tailscale.com/download)

### Step 3: Connect to the SSH server using Tailscale

On the SSH server, look up its Tailscale IP using `tailscale ip`. Assuming that your account name is `username` and the
IP address is `100.100.123.123`:

```shell
ssh username@100.100.123.123
```

> **Note:**
>
> If [MagicDNS][docs-magicdns] is enabled on your Tailscale network, simply connect to the SSH
> server's hostname. For example, for a server named `myserver`: `ssh username@myserver`

[bl-rotate-ssh-keys]: https://tailscale.com/blog/rotate-ssh-keys

[bl-tailscale-key-management]: https://tailscale.com/blog/tailscale-key-management

[docs-access-control]: /docs/features/access-control

[docs-acls]: /docs/features/access-control/acls

[docs-grants]: /docs/features/access-control/grants

[docs-magicdns]: /docs/features/magicdns

[docs-secure-server-ubuntu]: /docs/how-to/secure-ubuntu-server-with-ufw

[docs-tags]: /docs/features/tags

[docs-tailscale-ssh-check-mode]: /docs/features/tailscale-ssh#configure-tailscale-ssh-with-check-mode

[docs-tailscale-ssh-configure-tailscale-ssh]: /docs/features/tailscale-ssh#configure-tailscale-ssh

[docs-tailscale-ssh]: /docs/features/tailscale-ssh
