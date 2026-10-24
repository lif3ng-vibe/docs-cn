---
title: "CoreWeave best practices"
description: "This document details best practices for using Tailscale with CoreWeave, particularly for connecting to [CoreWeave Kubernetes Service (CKS)][xt-coreweave-cks] clusters using the Tailscale Kubernetes O"
---

Last validated Aug 21, 2026

This document details best practices for using Tailscale with CoreWeave, particularly for connecting to [CoreWeave Kubernetes Service (CKS)][xt-coreweave-cks] clusters using the Tailscale Kubernetes Operator.

## Use the CoreWeave fork of the Tailscale Kubernetes Operator

CoreWeave maintains its own build of the [Tailscale Kubernetes Operator][docs-kubernetes-operator] so that it integrates cleanly with CKS: a purpose-built version of the `tailscale-operator` Helm chart, paired with a CoreWeave-specific container image. Deploy CoreWeave's fork rather than the upstream Helm chart when running on CKS.

> **Note:**
>
> For setup instructions, refer to CoreWeave's [`tailscale-operator`documentation][xt-coreweave-tailscale-operator].

For details on the chart's customizations, refer to [Deploy the `tailscale-operator` chart][xt-coreweave-deploy-chart].

## Networking and connectivity

CoreWeave nodes do not receive public IP addresses and are behind a [hard NAT][docs-device-connectivity-hard-nat], which can prevent [direct connections][docs-connection-types] between peers and reduce bandwidth and connection stability. To optimize connectivity:

* Add [CoreWeave's DERP servers][xt-coreweave-derpmap] to your tailnet's `derpMap` configuration alongside, or instead of, Tailscale's default relays for optimal connectivity into CoreWeave's networks.
* Deploy and configure [peer relays][docs-peer-relays] in your network, with a public IP address, and allow incoming UDP traffic to the relay port to support connections through CoreWeave's NAT gateway.

[docs-connection-types]: /docs/reference/connection-types

[docs-device-connectivity-hard-nat]: /docs/reference/device-connectivity#hard-nat

[docs-kubernetes-operator]: /docs/kubernetes-operator

[docs-peer-relays]: /docs/features/peer-relay

[xt-coreweave-cks]: https://docs.coreweave.com/products/cks

[xt-coreweave-deploy-chart]: https://docs.coreweave.com/products/cks/auth-access/tailscale-operator#install-the-tailscale-helm-chart

[xt-coreweave-derpmap]: https://docs.coreweave.com/products/cks/auth-access/tailscale-operator#combined-policy-example

[xt-coreweave-tailscale-operator]: https://docs.coreweave.com/products/cks/clusters/coreweave-charts/tailscale-operator
