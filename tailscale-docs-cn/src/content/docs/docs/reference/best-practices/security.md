---
title: "Best practices to secure your tailnet"
description: "Tailscale has many security features you can use to increase your network security. This page provides best practices for using these features to harden your Tailscale deployment."
---

Last validated Jan 20, 2026

Tailscale has many security features you can use to increase your network security. This page provides best practices for using these features to harden your Tailscale deployment.

Refer to an [overview of Tailscale's security][co-security], including how Tailscale builds in security by design, and internal controls we use to help keep your information safe.

## Baseline practices

*Baseline practices are widely applicable and high-value steps to improve security.*

### Upgrade Tailscale clients in a timely manner

**Upgrade Tailscale clients regularly, in a timely manner.** Tailscale frequently introduces new features and [patches existing versions][docs-versions-version-support], including security patches.

[Check for updates][docs-update-check-for-updates] to find the version of the Tailscale client installed on every device in your tailnet and use [auto-updates][docs-update-auto-updates] to keep Tailscale clients updated automatically.

### Subscribe to security bulletins

**Subscribe to [Tailscale's security bulletins][co-security-bulletins]** (by using [RSS][co-security-bulletins-index.xml]). Tailscale publishes security bulletins to disclose security issues affecting Tailscale. If you're directly affected by a security issue, and we have your contact information, we will contact you.

### Set a contact for security issue emails

**Set a [contact for security issue emails][docs-contact-preferences-security-issues-email]**. If you're directly affected by a security issue, and we have your contact information, we will contact you. If no email is set for a security contact, Tailscale uses the default behavior, which is to send security issue emails to the tailnet owner email address.

If you want multiple users to be notified, consider using an email group. For example, use `security@example.com`, instead of `alice@example.com`, for security issue notifications.

> **Note:**
>
> If you are using GitHub as your identity provider, we have no contact email information unless you add an email address
> to your [contact preferences][docs-contact-preferences].

### Enable MFA in your identity provider

**Enable multifactor authentication in your identity provider for authenticating to Tailscale, ideally using a hardware token**. Tailscale relies on your existing [identity provider][docs-sso-providers] to authenticate users. Any authentication settings from your identity provider are automatically used by Tailscale, including MFA and context-aware access.

Follow your [identity provider's documentation][docs-multifactor-auth] for how to enable multifactor authentication.

### Define access control policies

**Use access controls to define the connections you want to allow in your network, based on job function and following the principle of least privilege.** Tailscale's [access control policies][docs-access-control] let you define what users, groups, IP addresses, CIDRs, hosts, and tags can connect to each other in your network. Using access control policies, you can define [role-based access controls][bl-rbac-meant-to-be] for users accessing services in your network in terms of user identities, rather than in terms of IP addresses. Follow the [principle of least privilege][ln-principle-of-least-privilege] to ensure users are only granted access to the intended resources.

Restrict access to users based on job function and what they need to access. Refer to [grant examples][docs-grant-samples] for common scenarios.

### Use groups in access control policies

**Use groups to manage your users.** Using groups lets identities be controlled based on job function. If someone leaves an organization or changes roles, you can adjust the group membership rather than update all of their access control policies.

Define [groups][docs-policy-syntax-groups] in access control policies for sets of users, and use these as part of access rules. Enable [user & group provisioning][docs-user-group-provisioning] to sync users and groups from your identity provider, to automatically add or suspend users, and use synced groups in access control policies.

### Use tags in access control policies

**Use tags to manage devices.** Using tags lets you define access to devices based on purpose, rather than based on owner. If someone leaves an organization or changes roles, common devices they have set up, like a server, will not need to be reconfigured.

Define [tags][docs-tags] in access control policies, and use these as part of access rules. Use an [auth key with a tag][docs-tags-auth-key] so that a device is automatically tagged when it is authenticated.

### Use check mode for Tailscale SSH

**Verify high-risk Tailscale SSH connections with check mode.** Check mode requires certain connections, or connections as certain users (such as `root`), to re-authenticate before connecting. This lets the user access these high-risk applications for the next 12 hours or for a specified check period before re-authenticating again. Check mode is only available for [Tailscale SSH][docs-tailscale-ssh] connections.

In an access control policy's `ssh` rule, [set the `action` field to `check`][docs-tailscale-ssh-check-mode] to configure check mode for your high-risk Tailscale SSH connections.

### Use session recording for Tailscale SSH

**Set up session recording to log the contents of Tailscale SSH sessions.** Session recording for Tailscale SSH streams these recordings to special recorder nodes in your tailnet, and Tailscale never has access to these recordings. You can deploy the recorder nodes as Docker containers, and configure recordings to be stored on the Docker host's disk or in Amazon S3 (and other S3-compatible object storage services). Session recording is only available for [Tailscale SSH][docs-tailscale-ssh] connections.

Follow [these instructions][docs-tailscale-ssh-session-recording] to deploy the recorder nodes and update your access control policies to require session recording.

### Review configuration audit logs

**Review who did what, and when, in your tailnet.** [Configuration audit logs][docs-audit-logging] record actions that modify a tailnet's configuration, including the type of action, the actor, the target resource, and the time.

Regularly review the logs, and if needed, use the Tailscale API to [export the logs][docs-audit-logging-access-via-api] for long term storage.

### Get notified about events in your tailnet

**Use webhooks to subscribe to events.** [Webhooks][docs-webhooks] let you subscribe to certain events on your Tailscale network and process the event notifications through an integration or app. For example, you can subscribe to events like adding a node or updating your [tailnet policy file][docs-policy-syntax], and then receive the event notifications in a Slack channel or other app.

Subscribe to tailnet management events to be notified of changes to your tailnet policy file, new nodes, new users, and more.

### Offboard users when they leave

**Suspend or delete users as part of your offboarding process**. Offboarding Tailscale users ensures that they no longer have access to resources including machine authorization, API keys, and auth keys.

Automatically or manually suspend users when they leave. This process can vary depending on your identity provider and whether or not you use user & group provisioning (SCIM).

For more information, refer to [Offboarding users][docs-offboarding-users].

## Advanced practices

*Advanced practices may not be widely applicable. They may also include features which require more configuration or a more advanced knowledge of security and networking.*

### Use tests

**Write tests to ensure access controls don't change unexpectedly**. Access control policy tests let you ensure that your access controls are as expected, so that after making a change, an important permission isn't accidentally revoked, or a critical system accidentally exposed.

Define [access control policy tests][docs-policy-syntax-tests] in access control policies. These are automatically validated when an access control policy is updated.

### Assign Admin roles

**Assign user roles for managing Tailscale as appropriate, based on job function and for separation of duties.** Tailscale provides multiple user roles that restrict who can modify your tailnet's configurations. These allow for separation of duties between admins who can modify users and devices, such as IT administrators, and those who can modify network configurations, such as the networking team.

[Assign the roles][docs-changing-user-roles] of [Admin, Network admin, IT admin, Billing admin, and Auditor][docs-user-roles] in the [Users](https://console.tailscale.com/admin/users) page of the admin console.

### Enable device approval

**Require devices to be approved before they join your network**. You can require that new devices be manually reviewed and approved by an Admin before they can join the network. This can be used to ensure only trusted devices, such as workplace-managed laptops and phones, can access a network.

[Enable device approval][docs-device-approval] from the [Device management](https://console.tailscale.com/admin/settings/device-management) page of the admin console.

### Customize node key expiry

**Require users to rotate keys by re-authenticating their devices to the network regularly**. Devices connect to your tailnet using a public [node key][bl-tailscale-key-management-node-keys] which expires automatically after a period of time, forcing keys to rotate. By default, Tailscale requires devices to re-authenticate every 180 days, but some organizations may have a need for stricter controls.

[Modify key expiry][docs-key-expiry] from the [Device management](https://console.tailscale.com/admin/settings/device-management) page of the admin console.

### Protect your network boundary

**Restrict access to your private network, for example, using a firewall**. Tailscale lets you easily connect your devices no matter their local area network, and ensures that traffic between your devices is end-to-end encrypted. However, Tailscale does not protect your devices from any other traffic.

Set up a firewall for your network or [for your device][docs-secure-server-ubuntu]. Refer to [Using Tailscale with your firewall][docs-firewalls] for additional configuration information.

### Enable HTTPS

**Obtain public TLS certificates for internal web tools hosted on your network**. Connections between Tailscale nodes are already secured with end-to-end [encryption][docs-encryption]. However, browsers are not aware of that because they rely on verifying the TLS certificate of a domain. By getting a TLS certificate from a public CA for your internal web tool, you avoid confusing your users with browser security warnings.

[Configure HTTPS][docs-enabling-https] for your tailnet from the [DNS](https://console.tailscale.com/admin/dns) page of the admin console. Note that certificates are added to the Certificate Transparency log, so machine names should not contain private information.

### Use On-Demand Access

**Leverage just-in-time access requests to limit access to network resources**. This lets access be granted and revoked on a just-in-time basis, and can be used to manage temporary access to resources that are managed by Tailscale. Tailscale integrates with a [variety][docs-jit-access-integrations] of on-demand access products.

### Remove unused OAuth clients

**Regularly remove OAuth clients that are no longer needed for your network**. This prevents leaked OAuth clients being used for Tailscale API access to your network.

Find existing OAuth clients from the [Trust credentials](https://console.tailscale.com/admin/settings/trust-credentials) page of the admin console, and remove those you no longer need.

### Remove unused API and auth keys

**Regularly remove API and auth keys that are no longer needed for your network**. This prevents leaked keys being used to add unauthorized users or devices to your network.

Find existing API and auth keys from the [Keys](https://console.tailscale.com/admin/settings/keys) page of the admin console, and remove those you no longer need. If you are using an auth key to only authenticate a single device, consider using a [one-time auth key][docs-auth-keys].

### Prevent DNS rebinding attacks

**Ensure a Host header is present for HTTP services**. Web services available in a tailnet over HTTP (not HTTPS) may be susceptible to [DNS rebinding][xt-wikipedia-dns-rebinding] attacks, where a Tailscale node visiting a malicious web page can be triggered to run a client-side script and attack other nodes in the tailnet. HTTP services can detect DNS rebinding attacks by validating the Host header of incoming HTTP requests is allowlisted.

Set a Host header field in HTTP request messages sent to an HTTP service running in your tailnet. For example, in the HTTP request message, set:

```
GET /resource HTTP/1.1
Host: www.example.com
```

This could also be a MagicDNS fully qualified domain name, for example:

```
Host: webserver.example2.ts.net
```

### Manage access control policy updates with GitOps

**Use GitOps to keep the source of truth for your [tailnet policy file][docs-policy-syntax] in code, outside of the Tailscale admin console, and use features in a code repository tool to manage and version access control policies.** Use GitOps for Tailscale with [GitHub Actions][docs-gitops-acls] or [GitLab CI][docs-gitops-acls-gitlab] to manage your tailnet policy file in a code repository, and use protected branches and required reviews to manage changes. Using GitOps also enables versioning and an audit trail of changes to your tailnet policy file.

For example, you can require approvals by specific individuals, or enforce tests pass successfully before merging a change.

### Set up Tailscale with infrastructure as code

**Use infrastructure as code tools to deploy Tailscale infrastructure programmatically.** By using an infrastructure as code tool for deployment, you can deploy (or redeploy) a consistent or prior version of a configuration in case of an issue.

Set up the [Terraform][docs-terraform-provider] or [Pulumi][docs-pulumi-provider] Tailscale providers to interact with the Tailscale API. Supported features include the ability to define your [tailnet policy file][docs-policy-syntax], set DNS settings, generate [auth keys][docs-auth-keys], and manage device properties. Restrict access to the Tailscale API to your infrastructure as code tools, so that all configuration changes are centrally managed.

### Use device postures

**Use [device postures][docs-device-posture] to measure how secure or trustworthy a device is.** Restrict access based on device attributes that signal security issues. For example, you can require specific Tailscale client versions, specific operating systems, or disk encryption. The [Enterprise plan][co-pricing] can also restrict access with geolocation. Useful for remote work security, Bring Your Own Device (BYOD) policies, and [Zero Trust][docs-zero-trust] enforcement.

### Use Network flow logs

**Use [Network flow logs][docs-network-flow-logs] to determine how nodes are connecting on your Tailscale network.** When Network flow logs are enabled and clients are running a sufficient client version, and when not using [`tailscaled --no-logs-no-support`][docs-log-mesh-traffic-opt-out], nodes report their network activity to the Tailscale logs service. These logs can be accessed using the Tailscale API.

Regularly review the logs, and if needed, export the logs for long term storage.

### Restrict multi-user systems

Users that share a device with multiple user accounts can potentially allow other users to access resources in the tailnet when they switch to another account without logging out. This applies to Linux, Windows, and macOS.

Use of Tailscale is not recommended on devices used by multiple people, unless shared tailnet access between them is acceptable to your security policies.

[bl-rbac-meant-to-be]: https://tailscale.com/blog/rbac-like-it-was-meant-to-be

[bl-tailscale-key-management-node-keys]: https://tailscale.com/blog/tailscale-key-management#node-keys

[co-pricing]: https://tailscale.com/pricing

[co-security-bulletins-index.xml]: https://tailscale.com/security-bulletins/index.xml

[co-security-bulletins]: https://tailscale.com/security-bulletins

[co-security]: https://tailscale.com/security

[docs-policy-syntax-groups]: /docs/reference/syntax/policy-file#groups

[docs-policy-syntax-tests]: /docs/reference/syntax/policy-file#tests

[docs-policy-syntax]: /docs/reference/syntax/policy-file

[docs-access-control]: /docs/features/access-control

[docs-audit-logging-access-via-api]: /docs/features/logging/audit-logging#accessing-configuration-audit-logs-using-the-tailscale-api

[docs-audit-logging]: /docs/features/logging/audit-logging

[docs-auth-keys]: /docs/features/access-control/auth-keys

[docs-changing-user-roles]: /docs/features/sharing/how-to/change-role

[docs-contact-preferences-security-issues-email]: /docs/reference/contact-preferences#setting-the-security-issues-email

[docs-contact-preferences]: /docs/reference/contact-preferences

[docs-device-approval]: /docs/features/access-control/device-management/device-approval

[docs-device-posture]: /docs/features/device-posture

[docs-enabling-https]: /docs/how-to/set-up-https-certificates

[docs-encryption]: /docs/concepts/tailscale-encryption

[docs-firewalls]: /docs/integrations/firewalls

[docs-gitops-acls-gitlab]: /docs/integrations/gitlab/gitops

[docs-gitops-acls]: /docs/gitops

[docs-grant-samples]: /docs/reference/examples/grants

[docs-jit-access-integrations]: /docs/integrations/jit-access

[docs-key-expiry]: /docs/features/access-control/key-expiry

[docs-log-mesh-traffic-opt-out]: /docs/features/logging#opt-out-of-client-logging

[docs-multifactor-auth]: /docs/multifactor-auth

[docs-network-flow-logs]: /docs/features/logging/network-flow-logs

[docs-offboarding-users]: /docs/features/sharing/how-to/offboard

[docs-pulumi-provider]: /docs/integrations/pulumi-provider

[docs-secure-server-ubuntu]: /docs/how-to/secure-ubuntu-server-with-ufw

[docs-sso-providers]: /docs/integrations/identity

[docs-tags-auth-key]: /docs/features/tags#best-practices

[docs-tags]: /docs/features/tags

[docs-tailscale-ssh-check-mode]: /docs/features/tailscale-ssh#configure-tailscale-ssh-with-check-mode

[docs-tailscale-ssh-session-recording]: /docs/features/tailscale-ssh/tailscale-ssh-session-recording

[docs-tailscale-ssh]: /docs/features/tailscale-ssh

[docs-terraform-provider]: /docs/integrations/terraform-provider

[docs-update-auto-updates]: /docs/features/client/update#auto-updates

[docs-update-check-for-updates]: /docs/features/client/update#check-for-updates

[docs-user-group-provisioning]: /docs/features/user-group-provisioning

[docs-user-roles]: /docs/reference/user-roles

[docs-versions-version-support]: /docs/reference/tailscale-client-versions

[docs-webhooks]: /docs/features/webhooks

[docs-zero-trust]: /docs/concepts/zero-trust

[ln-principle-of-least-privilege]: https://tailscale.com/learn/principle-of-least-privilege

[xt-wikipedia-dns-rebinding]: https://en.wikipedia.org/wiki/DNS_rebinding
