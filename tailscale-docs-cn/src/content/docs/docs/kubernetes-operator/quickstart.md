---
title: "Quickstart tutorial for the Tailscale Kubernetes Operator"
description: "A hands-on guide to the Tailscale Kubernetes Operator and its key features."
---

Last validated Jul 28, 2026

This topic covers various scenarios that demonstrate the [Tailscale Kubernetes Operator][docs-kubernetes-operator]. You securely expose services, connect multiple clusters, and set up high-availability services, all using Tailscale.

## What the Tailscale Kubernetes Operator does

The Tailscale Kubernetes Operator provides secure connectivity for your Kubernetes clusters. Here are some use cases.

* **Secure access**: Securely access the [Kubernetes API server][xt-k8s-api-server] over Tailscale, without exposing it to the public internet.
* **Expose services**: Expose services deployed in your cluster to your tailnet, and optionally to the public internet through [Tailscale Funnel][docs-funnel].
* **Connect to other services**: Enable pods in your cluster to connect to services in your tailnet, including services in other clusters.
* **Subnet routers and exit nodes**: The Operator can also act as a [subnet router][docs-subnet-routers] or an [exit node][docs-exit-nodes].

## Prerequisites

Before you begin, make sure you have the following:

* A [Tailscale account](https://login.tailscale.com/start).
* [`kubectl`][xt-kubectl] installed and configured.
* [`helm`][xt-helm] installed.
* [`kind`][xt-kind] installed. This is optional for local clusters.

## Setup

This section covers the initial setup. Start by downloading the getting-started scripts and manifests:

```shell
curl -sL https://tailscale.com/k8s/getting-started.tar.gz | tar xz
cd getting-started
```

This downloads and extracts a `getting-started/` directory containing the step scripts and Kubernetes manifests used throughout this topic.

### Enable HTTPS for your tailnet

Refer to [Enabling HTTPS][docs-enabling-https] for instructions.

### Configure Tailscale ACLs

The Operator requires specific [ACLs][docs-acls] to manage devices and services in your tailnet. This is also where you create the `tag:k8s-operator` that you need in the [next section][ar-create-oauth].

1. Go to the [Access controls](https://console.tailscale.com/admin/acls) in the admin console.
2. Add the following to your ACLs:

   ```json
   {
     "tagOwners": {
       "tag:k8s-operator": ["autogroup:admin"],
       "tag:k8s":          ["tag:k8s-operator"],
     },
     "autoApprovers": {
       "services": {
         "tag:k8s": ["tag:k8s"],
       },
     },
     "acls": [
       // Allow everything to talk to everything in the tailnet. This should
       // be used on personal and test tailnets only.
       {"action": "accept", "src": ["*"], "dst": ["*:*"]},
     ],
     "grants": [
       // Allow everything in the tailnet to talk to the API Server Proxy. This should
       // be used on personal and test tailnets only.
       {
         "src": ["*"],
         "dst": ["tag:k8s-operator"],
         "ip": ["tcp:443"]
       }
     ],
     "nodeAttrs": [
       // Let the Kubernetes operator use Tailscale Funnel
       {
         "target": ["tag:k8s"], // tag that the Tailscale operator uses to tag proxies; defaults to 'tag:k8s'
         "attr":   ["funnel"],
       },
     ],
   }
   ```

   > **Note:**
   >
   > If you already have a `tagOwners`, `grants`, `nodeAttrs`, `autoApprovers` or `acls` section, merge these rules into your existing configuration.

### Create OAuth credentials and configure secrets

The Tailscale Kubernetes Operator needs [OAuth credentials][docs-oauth-clients] to interact with the Tailscale API on your behalf. For this topic, you need to create two separate OAuth clients and configure the corresponding Kubernetes secrets.

**Cluster 1:**

1. Go to the [Trust credentials](https://console.tailscale.com/admin/settings/trust-credentials) page of the admin console.
2. Select **+ Credential**.
3. Give the client a description, for example, `cluster-1-operator`.
4. Add the following scopes:
   * **General > Services**: `Read` and `Write`
   * **Devices > Core**: `Read` and `Write`
   * **Keys > Auth Keys**: `Read` and `Write`
5. In the **Tags** box, select **Add tags** and select **tag:k8s-operator**. If you cannot find this tag in the list, refer to the [previous section][ar-configure-acls].
6. Select **Generate credential**.
7. Copy the **Client ID** and **Client secret**.
8. Open `cluster-1-oauth.yaml` and enter the **Client ID** and **Client secret** in the corresponding fields. The credentials should be in **plaintext**.

   ```yaml
   apiVersion: v1
   kind: Secret
   metadata:
     name: operator-oauth
     namespace: tailscale
   stringData:
     client_id: "your-client-id-for-cluster-1"
     client_secret: "your-client-secret-for-cluster-1"
   ```

**Cluster 2:**

Repeat the process above to generate and populate the credentials in the `cluster-2-oauth.yaml` secret. Be sure to give the OAuth client a unique description, for example `cluster-2-operator`.

### Run the setup script

Now you are ready to set up the Kubernetes clusters and install the Tailscale operator on them. The `00-setup.sh` script handles this for you. You have two options for which clusters to use:

**Option 1: Use `kind` to create local clusters**

If you have `kind` installed, you can have the script create two local clusters for you.

Run the script from the root of the repository:

```shell
./00-setup.sh
```

The script:

* Creates two `kind` clusters named `cluster-1` and `cluster-2`.
* Installs the Tailscale Kubernetes Operator in each cluster using [Helm][xt-helm].
* Applies the OAuth secrets you created.
* Configures the Operator for each cluster.

**Option 2: Bring your own clusters**

If you want to use your own existing Kubernetes clusters, specify their `kubectl` contexts as environment variables.

If you choose this option, Tailscale recommends consulting the Operator documentation to check [Kubernetes version][docs-k8s-compatibility] and [CNI][docs-cni-compatibility] compatibility.

> **Warning:**
>
> To enable the first section (Secure API Server Access), the setup script creates a [`ClusterRoleBinding`][xt-k8s-clusterrolebinding] that grants your tailnet user `cluster-admin` on the cluster. Do not run this against production clusters.

When you're ready, run the script with the `CLUSTER_1` and `CLUSTER_2` environment variables set to your cluster contexts:

```shell
CLUSTER_1=<your-cluster-1-context> CLUSTER_2=<your-cluster-2-context> ./00-setup.sh
```

The script then performs the same operator installation and configuration steps on your specified clusters.

After the script finishes, you have two Kubernetes clusters ready to go.

## Use cases

Now that the setup is complete, try out some use cases for the Tailscale Kubernetes Operator.

### Access the API server securely

Use the Tailscale Kubernetes Operator to securely access your cluster's [API server][xt-k8s-api-server] over your tailnet.

When the Operator was installed by the `00-setup.sh` script, it was configured with the `--set-string apiServerProxyConfig.mode="true"` flag. This enables the [**API server proxy**][docs-api-server-proxy] feature, which runs a proxy in the Operator's pod that lets you securely access the Kubernetes API server over the tailnet.

To access the API server over Tailscale, update your [`kubeconfig`][xt-k8s-kubeconfig] to point at the proxy. Use the [`tailscale configure kubeconfig`][docs-api-server-proxy] command, which adds a new context to your `kubeconfig` that routes through the Tailscale proxy:

```shell
tailscale configure kubeconfig <operator-hostname>
```

To make things faster, the `01-api-access.sh` script does this for you. It waits for the API server proxy to be ready, then runs `tailscale configure kubeconfig` for both clusters.

1. Run the script:

   ```shell
   ./01-api-access.sh
   ```

2. After the script completes, you can access your clusters using the new `kubeconfig` entries. Try running a `kubectl` command against one of the clusters:

   ```shell
   kubectl get nodes
   ```

You are now accessing your cluster's API server securely over Tailscale, without exposing it to the public internet.

**What about RBAC?**

You might be wondering how [Role-Based Access Control (RBAC)][xt-k8s-rbac] works with the API server proxy. The `00-setup.sh` script creates a `ClusterRoleBinding` to grant your Tailscale user `cluster-admin` privileges:

```shell
kubectl --context ${CLUSTER_1} create clusterrolebinding ts-cluster-admin --clusterrole=cluster-admin --user=${ts_user}
```

The Tailscale API Server Proxy embeds the user's identity into the request headers. This means you can use standard Kubernetes RBAC to control access based on Tailscale identities.

You can inspect the `ClusterRoleBinding` by running:

```shell
kubectl describe clusterrolebinding ts-cluster-admin
```

The output displays your Tailscale user identity (typically your email address) in the `Subjects` field.

```
Name:         ts-cluster-admin
Labels:       <none>
Annotations:  <none>
Role:
 Kind:  ClusterRole
 Name:  cluster-admin
Subjects:
 Kind  Name                  Namespace
  ----  ----                  ---------
  User  alice@example.com
```

For more information, refer to [Access the Kubernetes API server over Tailscale][docs-api-server-proxy].

### Expose a service with a Tailscale Ingress

Next, expose a workload running in your cluster to your tailnet by using a [Tailscale Ingress][docs-ingress]. This section uses a Tailscale-themed demo web app.

1. Deploy the "Tailnet Connect" game to `cluster-1`:

   ```shell
   ./02-tailnet-connect-game.sh
   ```

   This script applies the `ingress/deploy.yaml` manifest, which creates a standard Kubernetes [`Deployment`][xt-k8s-deployment] and [`Service`][xt-k8s-service] for the application.

2. Expose the game to your tailnet using a Tailscale Ingress:

   ```shell
   ./03-tailnet-connect-game-ingress.sh
   ```

   This script applies the `ingress/ingress.yaml` manifest. The key parts of this file are:

   ```yaml
   # ingress/ingress.yaml
   apiVersion: networking.k8s.io/v1
   kind: Ingress
   metadata:
     name: tailnet-connect-game
   spec:
     defaultBackend:
       service:
         name: tailnet-connect-game
         port:
           number: 80
     ingressClassName: tailscale
     tls:
       - hosts:
           - tailnet-connect-game
   ```

   By setting `spec.ingressClassName` to `tailscale`, you are asking the Tailscale Kubernetes Operator to handle this `Ingress`. The Operator provisions a new Tailscale node in your tailnet and proxies traffic to the backend service.

3. It may take a minute or two for the `Ingress` to be fully configured and for the TLS certificates to be issued and configured. You can check its status by running:

   ```shell
   kubectl get ingress tailnet-connect-game
   ```

   After the `ADDRESS` field is populated with a [MagicDNS][docs-magicdns] name, copy it and open it in your web browser to play the game.

### Expose a service with Funnel

Now, expose the same service to the public internet using [Tailscale Funnel][docs-funnel].

1. Enable Funnel for the `Ingress`:

   ```shell
   ./04-tailnet-connect-game-funnel.sh
   ```

   This script applies the `ingress/ingress-funnel.yaml` manifest, which adds a `tailscale.com/funnel: "true"` [annotation][xt-k8s-annotations] to the `Ingress` created in the previous step. This tells the Operator to expose the service publicly through Funnel.

   The resulting `Ingress` looks like this:

   ```yaml
   # ingress/ingress-funnel.yaml
   apiVersion: networking.k8s.io/v1
   kind: Ingress
   metadata:
     name: tailnet-connect-game
     annotations:
       tailscale.com/funnel: "true"
   spec:
     defaultBackend:
       service:
         name: tailnet-connect-game
         port:
           number: 80
     ingressClassName: tailscale
     tls:
       - hosts:
           - tailnet-connect-game
   ```

2. You can find the public URL in the `ADDRESS` field of the `Ingress` using `kubectl get ingress tailnet-connect-game`.

3. Access the game from your browser using the public URL. You can also try turning Tailscale off on your device to confirm it's accessible from the public internet.

For more information, refer to [Expose cluster workloads to your tailnet with Ingress][docs-ingress].

### Multi-cluster connectivity

This section covers how to connect services running in different clusters. Deploy the demo application to both clusters and configure them to communicate with each other. The demo application has two modes: "game" mode, which you've seen, and "visualizer" mode. In visualizer mode, it attempts to connect to a peer service. You should observe some interesting behavior from it as it tries to connect to the peer service.

1. Deploy the application to both clusters:

   ```shell
   ./05-multi-cluster-deploy.sh
   ```

   This script deploys the application to both clusters. Examine `cross-cluster/tailnet-connect-1.yaml`:

   ```yaml
   # cross-cluster/tailnet-connect-1.yaml
   apiVersion: v1
   kind: Service
   metadata:
     name: tailnet-connect-1
   spec:
     type: LoadBalancer
     loadBalancerClass: tailscale
   ...
   ---
   apiVersion: apps/v1
   kind: Deployment
   ...
         env:
           - name: PEER_URL
             value: "http://tailnet-connect-2-egress.default.svc.cluster.local"
   ```

   Setting `spec.type` to `LoadBalancer` and `spec.loadBalancerClass` to `tailscale` tells the Operator to expose this `Service` to the tailnet with a MagicDNS name. The `Deployment` is configured to talk to a service named `tailnet-connect-2-egress`, which you set up next. A similar configuration is applied for `cluster-2`.

2. Access the web UI. You can access the web UI of the application running in either cluster on the MagicDNS name:

   ```shell
   http://default-tailnet-connect-1.<your-tailnet>
   ```

   or

   ```shell
   http://default-tailnet-connect-2.<your-tailnet>
   ```

   After a few seconds, the web UI indicates that it was unable to connect to the peer service over the tailnet.

3. Configure cross-cluster communication:

   ```shell
   ./06-multi-cluster-connect.sh
   ```

   This script enables pods in one cluster to talk to a service in another cluster. It does this in two steps for each direction. First, it creates a Kubernetes `Service`:

   ```yaml
   # cross-cluster/tailnet-connect-2-egress.yaml (applied to cluster-1)
   apiVersion: v1
   kind: Service
   metadata:
     name: tailnet-connect-2-egress
   spec:
     type: ExternalName
     externalName: placeholder # This will be ignored
   ```

   This Kubernetes `Service` is of type [`ExternalName`][xt-k8s-externalname], as the Operator needs this to route traffic to the Tailscale-managed proxy.

   Second, it annotates this service with the MagicDNS name of the service in the other cluster:

   ```shell
   kubectl annotate service tailnet-connect-2-egress \
     tailscale.com/tailnet-fqdn="default-tailnet-connect-2.${magic_dns}"
   ```

   The `tailscale.com/tailnet-fqdn` annotation tells the Tailscale Kubernetes Operator's egress proxy to resolve requests for `tailnet-connect-2-egress.default.svc.cluster.local` to the specified MagicDNS name in the tailnet. This lets the application in `cluster-1` connect to the application in `cluster-2` using a standard Kubernetes service name.

4. Now, if you go back to one of your browser tabs for either cluster (using the MagicDNS names `default-tailnet-connect-1.<your-tailnet>` or `default-tailnet-connect-2.<your-tailnet>`), Tailscale logo displays in the UI go from random flashing dots to the dots arranging into a Tailscale logo, and a green "online" indicator below it. The applications are talking to each other across clusters.

For more information, refer to [Access tailnet resources from your cluster with Egress][docs-egress].

### High availability

You can set up a high-availability service with replicas in both clusters. Tailscale's [multi-cluster ingress][docs-multi-cluster] capabilities let you load balance traffic across services in different clusters.

1. Deploy the HA service. To make it easier to distinguish between the clusters, set the `CLUSTER_1_COLOR` and `CLUSTER_2_COLOR` environment variables to a color of your choice when running the script. For example:

   ```shell
   CLUSTER_1_COLOR=orange CLUSTER_2_COLOR=purple ./07-tailnet-connect-game-ha.sh
   ```

   This script applies two key manifests to each cluster. First, `multi-cluster-replica/proxy-group.yaml` defines a [`ProxyGroup`][docs-proxygroup], which is a custom resource that deploys a group of Tailscale proxies in the Tailscale namespace. This `ProxyGroup` has a `spec.type` of `ingress`, so it is configured to be used for ingress. This `spec.type` field can also be set to `egress` or `kube-apiserver` depending on how you plan to use the `ProxyGroup`.

   > **Note:**
   >
   > You can also use `spec.replicas` to deploy replicas for high availability.

   ```yaml
   # multi-cluster-replica/proxy-group.yaml
   apiVersion: tailscale.com/v1alpha1
   kind: ProxyGroup
   metadata:
     name: ingress-proxies
   spec:
     type: ingress
   ```

   Second, `multi-cluster-replica/service.yaml` creates a [`LoadBalancer`][xt-k8s-loadbalancer] service that uses those `ProxyGroup` proxies (through the `tailscale.com/proxy-group` annotation) to make the backend accessible to the tailnet.

   ```yaml
   # multi-cluster-replica/service.yaml
   apiVersion: v1
   kind: Service
   metadata:
     name: tailnet-connect-game
     annotations:
       tailscale.com/proxy-group: ingress-proxies # Assigns this service to the ProxyGroup
       tailscale.com/hostname: tailnet-connect-game-multi-cluster # Sets the MagicDNS name for the HA service
   spec:
     type: LoadBalancer
     loadBalancerClass: tailscale # Specifies that Tailscale should manage this LoadBalancer
   ...
   ```

   By applying these manifests to both clusters, you are telling the Tailscale Kubernetes Operator in each cluster to configure the `ProxyGroup` to advertise the hostname `tailnet-connect-game-multi-cluster` on the `ProxyGroup` `ingress-proxies`. The Kubernetes `Service` in each cluster is now available at the same MagicDNS name `tailnet-connect-game-multi-cluster.<your-tailnet>`.

   > **Note:**
   >
   > The `ProxyGroup` feature uses [Tailscale Services][docs-tailscale-services]. Refer to the documentation for more information.

2. Access the application using the MagicDNS name `http://tailnet-connect-game-multi-cluster.<your-tailnet>`. The "Tailnet Connect" game will display with the color of the dots indicating which cluster is serving the request.

3. The same colored dots might display on every refresh, which might not be what you'd expect from regular round-robin load balancing. This is because your Tailscale client tries to find the optimal route to the backend, and it might prefer one destination over the other.

   To simulate a failure and watch the failover in action, scale down the deployment in the cluster whose color you are currently seeing.

   ```shell
   # For cluster-1
   kubectl scale deployment tailnet-connect-game --replicas=0

   # For cluster-2
   kubectl scale deployment tailnet-connect-game --replicas=0
   ```

4. Refresh the page in your browser. After a few seconds, you can observe the game is still running, but now with different colored dots. You are now being served from the other cluster. The `ProxyGroup` automatically detected the failure and unadvertised itself for this MagicDNS name, causing all traffic to be routed to the healthy replica.

For more information, refer to [Connect services across clusters][docs-connect-services].

## Further exploration

* [Understand the Tailscale Kubernetes Operator][docs-concepts] to learn about its architecture and the custom resources it manages.
* [Manage and configure the Tailscale Kubernetes Operator][docs-manage-and-configure] to operate and tune your deployment.
* [Tailscale Kubernetes Operator reference][docs-reference] for detailed reference documentation.

\[Missing snippet: tailscale\_skill.mdx]

[ar-configure-acls]: #configure-tailscale-acls

[ar-create-oauth]: #create-oauth-credentials-and-configure-secrets

[docs-acls]: /docs/features/access-control#access-control-lists-acls

[docs-api-server-proxy]: /docs/kubernetes-operator/api-server-access/setup-api-over-tailscale

[docs-cni-compatibility]: /docs/kubernetes-operator/reference/compatibility

[docs-concepts]: /docs/kubernetes-operator/concepts

[docs-connect-services]: /docs/kubernetes-operator/ingress/multi-cluster-service-mirroring

[docs-egress]: /docs/kubernetes-operator/egress

[docs-enabling-https]: /docs/how-to/set-up-https-certificates

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-funnel]: /docs/features/tailscale-funnel

[docs-ingress]: /docs/kubernetes-operator/ingress

[docs-k8s-compatibility]: /docs/kubernetes-operator/reference/compatibility#kubernetes-versions

[docs-kubernetes-operator]: /docs/kubernetes-operator

[docs-magicdns]: /docs/features/magicdns

[docs-manage-and-configure]: /docs/kubernetes-operator/manage-and-configure

[docs-multi-cluster]: /docs/kubernetes-operator/ingress/multi-cluster

[docs-oauth-clients]: /docs/features/oauth-clients

[docs-proxygroup]: /docs/kubernetes-operator/concepts/proxygroup

[docs-reference]: /docs/kubernetes-operator/reference

[docs-subnet-routers]: /docs/features/subnet-routers

[docs-tailscale-services]: /docs/features/tailscale-services

[xt-helm]: https://helm.sh/docs/intro/install/

[xt-k8s-annotations]: https://kubernetes.io/docs/concepts/overview/working-with-objects/annotations/

[xt-k8s-api-server]: https://kubernetes.io/docs/concepts/architecture/#kube-apiserver

[xt-k8s-clusterrolebinding]: https://kubernetes.io/docs/reference/access-authn-authz/rbac/#rolebinding-and-clusterrolebinding

[xt-k8s-deployment]: https://kubernetes.io/docs/concepts/workloads/controllers/deployment/

[xt-k8s-externalname]: https://kubernetes.io/docs/concepts/services-networking/service/#externalname

[xt-k8s-kubeconfig]: https://kubernetes.io/docs/concepts/configuration/organize-cluster-access-kubeconfig/

[xt-k8s-loadbalancer]: https://kubernetes.io/docs/concepts/services-networking/service/#loadbalancer

[xt-k8s-rbac]: https://kubernetes.io/docs/reference/access-authn-authz/rbac/

[xt-k8s-service]: https://kubernetes.io/docs/concepts/services-networking/service/

[xt-kind]: https://kind.sigs.k8s.io/docs/user/quick-start/

[xt-kubectl]: https://kubernetes.io/docs/tasks/tools/
