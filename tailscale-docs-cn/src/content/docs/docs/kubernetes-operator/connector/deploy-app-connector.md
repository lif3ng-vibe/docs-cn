---
title: "Deploy app connectors on Kubernetes"
description: "In Tailscale v1.78 and later, you can deploy an [app connector][docs-app-connector] to your Kubernetes cluster using the Tailscale Kubernetes Operator and its [`Connector` custom resource definition]["
---

Last validated Jun 5, 2026

In Tailscale v1.78 and later, you can deploy an [app connector][docs-app-connector] to your Kubernetes cluster using the Tailscale Kubernetes Operator and its [`Connector` custom resource definition][xt-gh-tailscale-k8s-connector].

> **Note:**
>
> The only tested and supported use case is to deploy an app connector to access SaaS applications available on the public internet. Using the app connector to expose cluster workloads or other internal workloads might work, but this is not a use case that Tailscale has tested or optimized for.

> **Note:**
>
> If you are using the app connector to access SaaS applications because you need a predictable egress IP address that you can add to an allowlist, it's also your responsibility to ensure that cluster traffic from the connector flows through that predictable IP address. For example, route cluster egress through a NAT device with a static IP address.

## Prerequisites

Complete the following before deploying an app connector:

1. Set up the [Kubernetes operator][docs-operator].

2. (Optional) Create a [tag][docs-tags] (for example, `tag:github-connector`) to attach to the connector device.

   If you do not specify a custom tag, the operator tags the connector device with `tag:k8s`.

   Make sure the operator is one of the [tag owners][docs-acls-tag-owners] for the connector tag:

   ```json
   "tagOwners": {
     "tag:k8s-operator":     [],
     "tag:github-connector": ["tag:k8s-operator"],
   }
   ```

   \[Missing snippet: visual\_policy\_editor.mdx]

3. Configure the domains that route through the app connector in [Apps][docs-app-connector-apps].

4. Configure tailnet policy permissions to route traffic for the required domains using the app connector. Refer to [app connector policy configuration instructions][docs-app-connector-policy].

## Deploy the app connector

Follow these steps to deploy the app connector:

1. Create your `Connector` resource based on the following example and save it as `connector.yaml`:

   ```yaml
   apiVersion: tailscale.com/v1alpha1
   kind: Connector
   metadata:
     name: appc-github
   spec:
     appConnector: {}
   ```

2. (Optional) Add [preconfigured routes][docs-app-connector-preconfiguration]:

   ```yaml
   apiVersion: tailscale.com/v1alpha1
   kind: Connector
   metadata:
     name: appc-github
   spec:
     appConnector:
       routes:
       - 140.82.114.4/32
   ```

   You can find [all available `Connector` configuration options on GitHub][xt-gh-tailscale-k8s-connector].

3. Apply the file:

   ```shell
   kubectl apply -f connector.yaml
   ```

4. (Optional) Wait for the connector to become ready:

   ```shell
   kubectl wait --for condition=ConnectorReady=true Connector appc-github
   ```

   ```
   connector.tailscale.com/appc-github condition met
   ```

5. (Optional) [Add the app connector's egress IP address to an IP allowlist][docs-app-connector-ip-allowlist].

## Known issues and limitations

The following limitations apply:

* Configuring the app connector requires a significant amount of manual setup, including updates to the tailnet policy file and the applications that route traffic through the connector.
* The app connector's egress IP address cannot be discovered automatically. You can retrieve it from the [Machines](https://console.tailscale.com/admin/machines) page of the admin console.

[docs-acls-tag-owners]: /docs/reference/syntax/policy-file#tag-owners

[docs-app-connector-apps]: /docs/features/app-connectors/how-to/setup#configure-a-device-as-an-app-connector

[docs-app-connector-ip-allowlist]: /docs/features/app-connectors/how-to/setup#restrict-application-access-by-ip-address

[docs-app-connector-policy]: /docs/features/app-connectors/how-to/setup#update-the-tailnet-policy-file

[docs-app-connector-preconfiguration]: /docs/reference/best-practices/app-connectors#preconfiguration

[docs-app-connector]: /docs/features/app-connectors

[docs-operator]: /docs/kubernetes-operator/install-operator

[docs-tags]: /docs/features/tags

[xt-gh-tailscale-k8s-connector]: https://github.com/tailscale/tailscale/blob/main/k8s-operator/api.md#connector
