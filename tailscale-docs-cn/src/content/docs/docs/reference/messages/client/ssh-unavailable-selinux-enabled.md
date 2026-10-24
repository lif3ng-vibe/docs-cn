---
title: "Tailscale SSH and SELinux"
description: "This topic explains a message that might appear in the Tailscale client and the actions you can take to address it. For a list of currently documented messages in the Tailscale admin console and clien"
---

Last validated Jan 30, 2026

This topic explains a message that might appear in the Tailscale client and the actions you can take to address it. For a list of currently documented messages in the Tailscale admin console and client, refer to the main [Messages][docs-messages] topic.

## Message displayed in the client

Tailscale SSH and SELinux
SELinux is enabled; Tailscale SSH may not work.

## Message ID

`ssh-unavailable-selinux-enabled`

## Why you're seeing this message

This message appears on devices running Security-Enhanced Linux (SELinux). SELinux is a Linux security system that enforces strict rules about which programs can run and which resources they can access. Tailscale detects that its built-in SSH feature runs inside the [`tailscaled`][docs-tailscaled] process rather than the system's standard SSH daemon, and SELinux policies can restrict those SSH-related actions. Because of this, Tailscale warns that its SSH feature might not work as expected when SELinux is enforcing.

## What to do

Here are some things you can try to resolve this issue:

* To use [Tailscale SSH][docs-tailscale-ssh] with SELinux, allow the `tailscaled` process to perform SSH-related actions. You can do this by running SELinux in permissive mode or creating custom SELinux policies that let `tailscaled` act as an SSH service.
* If you don't need to use Tailscale SSH, ignore the warning. It does not interfere with Tailscale networking, which will continue to work as expected.
* Use the standard OpenSSH server and connect to it over Tailscale instead of using Tailscale SSH.

[docs-messages]: /docs/reference/messages

[docs-tailscale-ssh]: /docs/features/tailscale-ssh

[docs-tailscaled]: /docs/reference/tailscaled
