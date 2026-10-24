---
title: "Grants vs. ACLs"
description: "A comparison of grants and ACLs as access control mechanisms"
---

Last validated Aug 1, 2025

Tailscale offers two methods for defining access controls in your tailnet: Access control lists ([ACLs][docs-acls]) and [grants][docs-grants]. Both methods follow a deny-by-default principle and exist in the [tailnet policy file][docs-tailnet-policy-file] using a declarative [huJSON syntax][xt-wiki-json]. This document compares these two methods, exploring their capabilities, limitations, and appropriate use cases.

The following table provides a concise overview of the key differences between these two access control methods, highlighting how grants offer a more modern, flexible approach to security management. This comparison serves as a framework for the more detailed explanations that follow in subsequent sections.

| Feature                    | ACLs                                               | Grants                                           |
| :------------------------- | :------------------------------------------------- | :----------------------------------------------- |
| Access control methodology | Network layer only                                 | Network and application layers                   |
| Default action             | Always requires explicit "accept" `action`         | Implied accept                                   |
| Format                     | Separate fields for network destinations and ports | Cleaner separation of destinations and protocols |
| Application capabilities   | No                                                 | Yes                                              |
| Routing awareness          | No                                                 | Yes (with the `via` field)                       |
| Device posture support     | Yes                                                | Yes                                              |

> **Note:**
>
> Grants are *feature complete* with ACLs, which means they have all the capabilities of ACLs. The primary difference is that grants will continue to receive new features and improvements, while ACLs will not.

## Comparison

The evolution from ACLs to grants represents a shift in how Tailscale approaches [access control][docs-access-control]. This section explores the philosophical and architectural differences between these two methods, tracing how Tailscale's access control model has matured from a traditional network-centric approach to a more sophisticated system that bridges network and application security. Understanding these conceptual differences provides important context for appreciating why grants have become the recommended approach for modern tailnet deployments.

### ACLs

ACLs have been a foundation of Tailscale's access control methodology since the platform's inception. ACLs operate exclusively at the network layer, controlling which devices can communicate with each other and over which ports and protocols. The ACL system follows an explicit deny-by-default principle, requiring administrators to specifically allow each connection type.

As organizations increasingly need more nuanced access policies that extend beyond network connectivity, ACLs alone can become insufficient for modern access control requirements.

For more information, refer to the [ACL syntax reference][docs-policy-syntax].

### Grants

Grants represent an important evolution in Tailscale's access control capabilities, combining both network and application layer security into a unified, flexible [syntax][docs-grants-syntax]. Grants expand the security model from only controlling which devices can talk to each other to controlling what specific [capabilities][docs-grants-app-capabilities] devices and users can exercise when interacting with applications and services.

This evolution stems from recognizing a common pattern: both network permissions and application permissions essentially boil down to the same conceptual model: *a source has capabilities when communicating with a destination*. Grants formalize this concept, creating a concise, powerful way to define permissions. The grants system maintains the deny-by-default security model but removes redundant elements like the mandatory action field, as each grant inherently implies an `accept` action.

Grants also introduce more advanced access control parameters, including managing access to application features and controlling how a source accesses a destination (using [`via`][docs-via]).

For more information, refer to the [grants syntax reference][docs-grants-syntax].

## When to use each method

This section provides guidance on which access control method is most appropriate for different scenarios, explaining why grants are typically the preferred choice for new deployments while acknowledging the specific circumstances where ACLs might still be relevant. Understanding these considerations will help you make informed decisions about your tailnet configuration while planning for future security needs.

### Using grants (recommended)

Grants are the recommended approach for all new tailnets and for updating existing deployments. You should use grants when:

* Building new tailnet policies from scratch.
* Controlling application level permissions.
* Needing cleaner, more maintainable policy files.
* Using [route filtering][docs-via] with the `via` field.
* Implementing [device posture][docs-device-posture]-based access controls.
* Creating [Kubernetes][docs-kubernetes] impersonation rules.
* Building custom applications that integrate with Tailscale for authentication and authorization.

The grants system is actively developed and will continue to receive new features and improvements. Tailscale's internal tools and many open-source projects such as [TailSQL][xt-gh-tailsql], the [Kubernetes Operator][docs-kubernetes-operator], and [`golink`][xt-gh-golink] already leverage grants for fine-grained access control.

### Using ACLs

Tailscale will always support ACLs as the first iteration of access control policies. You may continue to use ACLs indefinitely.

You should only use ACLs when:

* Maintaining existing deployments that heavily rely on the ACL syntax.
* Working with tools or scripts that specifically expect the ACL format.
* Needing compatibility with older integrations.

Even in these cases, Tailscale recommends gradually [migrating toward grants][docs-grants-migration], as they offer superior capabilities and a cleaner syntax. Grants and ACLs can coexist in the same policy file during transition periods, allowing for a phased migration approach.

[docs-access-control]: /docs/features/access-control

[docs-acls]: /docs/features/access-control/acls

[docs-device-posture]: /docs/features/device-posture

[docs-grants-app-capabilities]: /docs/features/access-control/grants/grants-app-capabilities

[docs-grants-migration]: /docs/reference/migrate-acls-grants

[docs-grants-syntax]: /docs/reference/syntax/grants

[docs-grants]: /docs/features/access-control/grants

[docs-kubernetes-operator]: /docs/kubernetes-operator

[docs-kubernetes]: /docs/kubernetes

[docs-policy-syntax]: /docs/reference/syntax/policy-file

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file

[docs-via]: /docs/features/access-control/grants/grants-via

[xt-gh-golink]: https://github.com/tailscale/golink

[xt-gh-tailsql]: https://github.com/tailscale/tailsql

[xt-wiki-json]: https://en.wikipedia.org/wiki/JSON
