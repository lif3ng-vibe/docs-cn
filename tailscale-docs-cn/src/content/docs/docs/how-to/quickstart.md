---
title: "Tailscale quickstart"
description: "Install Tailscale in minutes. Create your private network and manage any device, anywhere."
---

Last validated Jan 5, 2026

Welcome! Follow the steps in this topic to create your own private Tailscale network (known as a tailnet), or watch the following video to get started with Tailscale and set up some useful features.

> **Note:**
>
> The following related video provides additional context and examples.

[How to get started with Tailscale in under 10 minutes (video)](https://www.youtube.com/watch?v=sPdvyR7bLqI)

## Create a tailnet

1. Go to [`tailscale.com`][co-home] and select **Get Started**. Alternatively, you can [download and install][docs-installation] the Tailscale client on your device, then [sign up](https://login.tailscale.com/start).

2. On the **Sign up with your identity provider** page, log in using a [single sign-on (SSO) identity provider][docs-sso-providers] account.

   > **Note:**
   >
   > If you sign up using a custom-owned domain, you are automatically enrolled in the [Enterprise][co-pricing] plan for a 14-day trial. If you sign up using a public domain email account such as `@gmail.com`, you are automatically enrolled in the [Personal][co-pricing] plan, which entitles you to six free users and many of the features offered in the Enterprise plan. You can always change your plan. For more information, refer to [Manage your plan][docs-manage-plans].

3. On the **Welcome to Tailscale** page, select either **Business use** or **Personal use**.

4. On the **Let's add your first device** page, select the OS that corresponds to the device you are using to download and install the client. Authenticate the client using the same credentials that you used to create the tailnet in step 2.

   Once you are authenticated, the device will appear in the browser window.

5. On the **Next, add a second device** page, select the OS for another machine to add to the tailnet. Copy the link and send it to the second device. After the second device is authenticated, both devices will display.

6. Select **Take me home**. You will be redirected to the Tailscale [admin console](https://console.tailscale.com/admin). This interface lets you control most aspects of your tailnet including users, devices, DNS, permissions, authentication keys, and more.

## Rename devices

Every device added to a tailnet, including servers, nodes, phones, and personal computers is assigned a unique name generated from the device's OS hostname. This name is displayed in the [Machines](https://console.tailscale.com/admin/machines) page of the admin console. You can also [rename a device][docs-machine-names-rename] to help you locate and organize devices in the **Machines** page list.

## Use MagicDNS

[MagicDNS][docs-magicdns] makes communicating with devices across your tailnet easier by allowing you to use the name listed in the **Machines** page of the admin console instead of an IP address. This works using automatically assigned OS hostnames or renamed device names. MagicDNS is enabled by default, and we recommend you keep it enabled.

## Invite users

There are two types of tailnet user invites.

Team member invites are for users who will authenticate using the same identity provider you used when creating the tailnet.

External invites are for users who are not part of your custom domain, such as contractors, friends, and family.

### Team members

If your tailnet uses a custom domain (`example.com`), users with email addresses with the same domain can log in without needing an invite. Alternatively, you can send [team member invites][docs-invite-team-members] to notify them to join.

### External users

To invite external users to a tailnet, open the [Users](https://console.tailscale.com/admin/users) page of the admin console, select **Invite external users**, and choose one of the following options:

* **Invite via email** to send one or more invites.
* **Copy invite link** to share the invite link with others.

When users select the link, they will be directed to the Tailscale login page, where they can authenticate using a [supported single sign-on (SSO) identity provider][docs-sso-providers] account. Once they are authenticated, users are added on the **Users** page of the admin console.

For more information, refer to [Invite any user to your tailnet][docs-invite-any-user].

## Add devices

You can add more devices to your tailnet using one of the following methods:

* [Login](https://login.tailscale.com/login) to the tailnet from other devices using an existing user account.
* Add servers to a tailnet using a [tag][docs-tags] as the identity of the server, and provision the server using an [authentication key][docs-auth-keys]. For more information, refer to [Setting up a server on your Tailscale network][docs-set-up-servers].
* Incorporate your existing system policies such as mobile device management (MDM) to control device management. For more information, refer to [Integrate with an MDM solution][docs-mdm].

Tailscale automatically assigns each device on your network a [unique 100.x.y.z IP address][docs-ip-and-dns-addresses], to establish stable connections between machines no matter where they are in the world, even when they switch networks or are [behind a firewall][bl-how-nat-traversal-works].

For more about adding devices, refer to [Add a device][docs-device-add].

## Secure traffic using exit nodes

Keep your internet activity private on an untrusted network by designating devices in your tailnet as exit nodes, then configure your tailnet devices to use those exit nodes.

* For details on how to quickly configure and use exit nodes, refer to [Use exit nodes][docs-quick-guide-exit-nodes].
* For more in-depth information about exit nodes, refer to the main [Exit nodes][docs-exit-nodes] topic.

## Route traffic using subnets

You can provide tailnet access to existing resources in your network using a subnet router. This can be useful if you need to access devices on which the Tailscale client cannot be installed, such as printers.

* For details on how to quickly configure and use a subnet router, refer to [Configure a subnet router][docs-quick-guide-subnets].
* For more in-depth information about subnet routers, refer to the main [Subnet routers][docs-subnets] topic.

## Manage permissions with access control policies

You can define your own custom permission for the users and devices in your tailnet, using [access control policies][docs-access-control] (such as [ACLs][docs-acls] or [grants][docs-grants]). These permissions are configured in the tailnet policy file, which is located on the [Access controls](https://console.tailscale.com/admin/acls) page of the admin console.

## Monitor and log traffic

You can monitor and log tailnet activity such as network traffic, client activity, tailnet configuration changes, and SSH session recordings.

For more information, refer to [Logging, auditing, and streaming][docs-log-mesh-traffic].

## Use cases

Need some inspiration? Tailscale can be used for a wide variety of users and environments. This section provides guidance for some common scenarios that you may want to use in your tailnet.

### Developers

* Interact with tailnet resources from Visual Studio Code using our [Visual Studio Code extension][docs-vscode-extension].
* Deploy, scale, and manage containerized applications such as [Kubernetes][docs-kubernetes], [Docker][docs-docker], and [Proxmox][docs-proxmox].
* [Connect to serverless apps][docs-serverless] such as AWS App Runner, AWS Lambda, Google Cloud Run, and Heroku.
* [Connect to cloud services][docs-cloud-server] such as AWS, Azure, Google Compute Engine, Hetzner, and Oracle Cloud.
* Share local services on your machine such as web applications, accessible only from your tailnet using [Tailscale Serve][docs-serve] or share publicly over the internet using [Tailscale Funnel][docs-funnel].
* [Share prototype servers][docs-local-team-server] with other colleagues without needing to modify firewall settings.

### IT admins

* Manage the authentication and authorization of SSH connections in your tailnet using [Tailscale SSH][docs-tailscale-ssh].
* Integrate Tailscale deployments on [AWS][docs-aws-reference-architecture] and [Azure][docs-azure-reference-architecture].
* Control device and user access to your third-party applications without requiring any end-user configuration using [app connectors][docs-app-connectors].
* Control what users can access in their Tailscale client using [system policies][docs-mdm-keys].
* Use [Tailscale SSH session recording][docs-tailscale-ssh-session-recording] to stream recordings of Tailscale SSH sessions from the destination node to a recorder node in your tailnet.
* Automate aspects of your Tailscale network using the [Tailscale API][docs-api].
* Share resources with users or trusted tailnets outside your domain using [node sharing][docs-sharing].
* Administer a computer remotely and lock down your [connections to a Microsoft Remote Desktop Protocol (RDP) server][docs-secure-rdp-windows].

### Personal users

* Connect an [Apple TV][docs-appletv] to your tailnet for viewing your media server files, use your Apple TV as an [exit node][docs-exit-nodes] to route traffic through your home internet connection when you're away, or choose an exit node to route your Apple TV's traffic through.
* Receive files from a [network attached storage][docs-nas] (NAS) server using FTP, and access media files from players such as VLC, Plex, and JellyFin.
* Implement DNS-based ad blocking for your tailnet using [Control D][docs-control-d], [NextDNS][docs-nextdns] or a [Pi-hole][docs-pi-hole] server.
* Share files between your own devices, even across operating systems, with [Taildrop][docs-taildrop].
* Host a private server for you and your peers to play [Minecraft][docs-minecraft] or chat on IRC.

## Troubleshooting and support

Visit our [Support][co-support] page to read common questions and answers, file bugs, request new features, observe Tailscale's operational status, or engage directly with our Support team.

Here are some links that provide assistance for common inquiries:

* [Troubleshooting guide][docs-troubleshooting]
* [Production best practices][docs-production-best-practices]
* [Security best practices][docs-security-hardening]
* [Using Tailscale with your firewall][docs-firewalls]

[bl-how-nat-traversal-works]: https://tailscale.com/blog/how-nat-traversal-works

[co-home]: https://tailscale.com/

[co-pricing]: https://tailscale.com/pricing

[co-support]: https://tailscale.com/contact/support

[docs-access-control]: /docs/features/access-control

[docs-acls]: /docs/features/access-control/acls

[docs-api]: /docs/reference/tailscale-api

[docs-app-connectors]: /docs/features/app-connectors

[docs-appletv]: /docs/install/appletv

[docs-auth-keys]: /docs/features/access-control/auth-keys

[docs-aws-reference-architecture]: /docs/reference/reference-architectures/aws

[docs-azure-reference-architecture]: /docs/reference/reference-architectures/azure

[docs-cloud-server]: /docs/cloud-server

[docs-control-d]: /docs/integrations/control-d

[docs-device-add]: /docs/features/access-control/device-management/how-to/set-up

[docs-docker]: /docs/features/containers/docker

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-firewalls]: /docs/integrations/firewalls

[docs-funnel]: /docs/features/tailscale-funnel

[docs-grants]: /docs/features/access-control/grants

[docs-installation]: /docs/install

[docs-invite-any-user]: /docs/features/sharing/how-to/invite-any-user

[docs-invite-team-members]: /docs/features/sharing/how-to/invite-team-members

[docs-ip-and-dns-addresses]: /docs/concepts/ip-and-dns-addresses

[docs-kubernetes]: /docs/kubernetes

[docs-local-team-server]: /docs/concepts/local-team-server

[docs-log-mesh-traffic]: /docs/features/logging

[docs-machine-names-rename]: /docs/concepts/machine-names#renaming-a-machine

[docs-magicdns]: /docs/features/magicdns

[docs-manage-plans]: /docs/account/manage-plans

[docs-mdm-keys]: /docs/features/tailscale-system-policies

[docs-mdm]: /docs/mdm

[docs-minecraft]: /docs/solutions/set-up-minecraft

[docs-nas]: /docs/integrations/nas

[docs-nextdns]: /docs/integrations/nextdns

[docs-pi-hole]: /docs/solutions/block-ads-all-devices-anywhere-using-raspberry-pi

[docs-production-best-practices]: /docs/reference/best-practices/production

[docs-proxmox]: /docs/integrations/proxmox

[docs-quick-guide-exit-nodes]: /docs/features/exit-nodes/how-to/setup

[docs-quick-guide-subnets]: /docs/features/subnet-routers/how-to/setup

[docs-secure-rdp-windows]: /docs/solutions/access-remote-desktops-using-windows-rdp

[docs-security-hardening]: /docs/reference/best-practices/security

[docs-serve]: /docs/features/tailscale-serve

[docs-serverless]: /docs/integration-serverless-apps

[docs-set-up-servers]: /docs/how-to/set-up-servers

[docs-sharing]: /docs/features/sharing

[docs-sso-providers]: /docs/integrations/identity

[docs-subnets]: /docs/features/subnet-routers

[docs-tags]: /docs/features/tags

[docs-taildrop]: /docs/features/taildrop

[docs-tailscale-ssh-session-recording]: /docs/features/tailscale-ssh/tailscale-ssh-session-recording

[docs-tailscale-ssh]: /docs/features/tailscale-ssh

[docs-troubleshooting]: /docs/reference/troubleshooting

[docs-vscode-extension]: /docs/integrations/vscode-extension
