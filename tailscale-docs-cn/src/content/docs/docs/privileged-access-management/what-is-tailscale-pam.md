---
title: "What is Tailscale PAM?"
description: "Tailscale PAM provides privileged and auditable access to resources like Linux servers, databases, and Kubernetes clusters in your Tailscale network."
---

Last validated Aug 17, 2026

> **Note:** Tailscale PAM is currently in beta.

Organizations struggle to answer two questions about their modern infrastructure: *Who has access to what?* and *What did they do?* Traditional Privileged Access Management (PAM) solutions tried to solve this with credential vaulting, password rotation, and activity recording. Modern infrastructure makes that model increasingly untenable: cloud, Kubernetes, databases, ephemeral developer environments, AI agents, and CI/CD all create privileged pathways that are not just "admin passwords in a vault".

Tailscale PAM is a next-generation PAM solution that provides application-aware access to your critical resources in your Tailscale network (known as a tailnet). It provides secure access to Linux servers, databases, Kubernetes clusters, and more. Tailscale PAM eliminates the risks of shared and static credentials. It governs privileged sessions at the moment access happens, with complete session auditing and session recording, where applicable.

Tailscale PAM uses the same [identity layer][docs-tailscale-identity] and underlying [WireGuard][docs-wireguard] encryption protocol as Tailscale, because it is built on the Tailscale platform. You don't need to add new identity providers or passwords to manage privileged pathways to resources in your tailnet.

## Use cases

Tailscale PAM addresses common challenges organizations face when providing privileged access.

* **Eliminating static and shared credentials**:

  Distributing credentials to developers and admins creates security risks and an administrative burden. Credentials get shared insecurely, persisted without password rotation, or forgotten when employees leave.

  Tailscale PAM eliminates shared credentials. User identity comes from Tailscale's identity layer, which automatically identifies users based on their device and Tailscale login, with continuous authentication and authorization on every connection.

* **Preventing long-standing and overly broad privilege**:

  In many organizations, developers and admins accumulate broad, persistent access "just in case". This is a security risk and violates the [principle of least privilege][ln-polp].

  Tailscale PAM enables just-in-time, scoped, and time-bound access. Access is granted when needed, for the right user, to the right resource, and under the right policy.

* **Making network access application-aware**:

  Legacy access controls are often based on IP address, making it difficult to secure access to an application. IP-based access to a resource like a server is too broad for many modern workloads. There is no need to provide complete server access if a user only needs to access an SSH session, query a database, or use Kubernetes resources.

  Tailscale PAM lets you manage application-aware access. Instead of asking *Can this IP address reach this server?*, Tailscale PAM asks *Can this person run this SSH command, query this database, or interact with this Kubernetes resource?* This granular control reduces your attack surface and ensures only authorized users have access to sensitive data.

* **Providing auditability and session evidence**:

  Security teams, auditors, and incident responders need to know not just that someone connected, but what they did. Without an adequate audit system, they often cannot prove what happened or quickly detect bad changes. They might also be unable to satisfy auditors or meet compliance goals.

  Tailscale PAM provides [session logs][docs-session-logs], recordings, approvals, and traceability so privileged activity is reviewable after the fact.

* **Preventing brittle access patterns**:

  Organizations rely on hybrid and distributed infrastructure. Disparate access mechanisms for different types of infrastructure increase complexity, reduce efficiency, and can lead to security risks.

  Tailscale PAM provides privileged access to cloud, on-premises, hybrid environments, private infrastructure, and browser-based workflows, all from a single platform.

## Requirements

Before setting up Tailscale PAM, confirm you have the following:

* A tailnet. If you do not have a tailnet, [sign up](https://login.tailscale.com/start).
* A Tailscale account with [Owner, Admin, or IT admin](/docs/reference/user-roles) permissions, so you can use the Tailscale admin console to enable Tailscale PAM for your tailnet.

## Get started

If you want to try Tailscale PAM for free, [join the waitlist][co-pam-waitlist]. If you want to learn more about Tailscale PAM for your organization, contact [Tailscale Sales][co-contact-sales-border0].

Once you have access to Tailscale PAM, refer to [Get started with Tailscale PAM][docs-pam-get-started].

## Common scenarios

The following sections describe common tasks related to providing privileged access.

* **SSH into Linux servers without shared keys**: Let an engineer connect to servers through Tailscale PAM using their Tailscale identity. Each session is authorized, logged, and available as a recording to replay.
* **Grant database access to an on-call engineer**: Issue time-bound, identity-based access to a production database without distributing credentials. Revoke automatically when the session ends.
* **Control access to Kubernetes clusters**: Apply application-aware policies to `kubectl` operations so a user can run only the commands and reach only the resources their role permits.
* **Onboard a new team member**: Add a user to your identity provider and automatically provision access to applications and services based on group membership. No per-app provisioning and no shared credentials.
* **Connect to a home lab or self-hosted service**: Reach private resources securely without exposing them publicly, modifying firewalls, or running a traditional VPN.
* **Produce a compliance-ready audit trail**: Hand auditors identity-based [session logs][docs-session-logs] and recordings showing who accessed a resource, when it was accessed, and what they did.

## Resources

* For information about the Tailscale PAM architecture, refer to [Tailscale PAM architecture and core concepts][docs-pam-architecture-and-concepts].
* For information about using Tailscale PAM for your tailnet, refer to [Getting started with Tailscale PAM][docs-pam-get-started].
* For information about accessing resources in your tailnet, refer to [Tailscale PAM how-to guides][docs-pam-how-to].

[co-contact-sales-border0]: https://tailscale.com/contact/sales-border0

[co-pam-waitlist]: https://tailscale.com/pam-selfserve-waitlist

[docs-pam-architecture-and-concepts]: /docs/privileged-access-management/architecture-and-concepts

[docs-pam-get-started]: /docs/privileged-access-management/get-started

[docs-pam-how-to]: /docs/privileged-access-management/how-to

[docs-session-logs]: /docs/privileged-access-management/session-logs

[docs-tailscale-identity]: /docs/concepts/tailscale-identity

[docs-wireguard]: /docs/concepts/wireguard

[ln-polp]: https://tailscale.com/learn/principle-of-least-privilege
