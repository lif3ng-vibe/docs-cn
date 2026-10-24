---
title: "Connect Kubernetes pods to your tailnet using a sidecar"
description: "Run the Tailscale container image as a sidecar in Kubernetes with persistent state, DNS configuration, authentication, and routing guidance."
---

Last validated Mar 28, 2026

Some Kubernetes workloads need their own identity on a network outside the cluster, where each pod is individually addressable, named, and governed by its own access rules. Standard Kubernetes networking gives pods ephemeral IPs behind service abstractions, so reaching specific pods from elsewhere usually means standing up VPN gateways, firewall rules, or ingress controllers that do not preserve per-pod identity. A Tailscale sidecar solves this by running the Tailscale client as a secondary container inside your pod. Containers in a pod share a network namespace and lifecycle, so the sidecar extends your application with tailnet connectivity without modifying the application itself, and the pod picks up a dedicated identity on your Tailscale network, known as a tailnet.

Use a sidecar when you need per-pod identity in the tailnet. Each replica becomes its own device, so you can write [access control rules][docs-access-control] that target specific pods, give individual workloads stable tailnet hostnames, or grant a pod outbound access to tailnet resources without exposing the rest of the cluster. Stateful workloads, jump hosts, and dedicated proxies are common cases. The trade-off is operational: at 1,000 pods you have 1,000 tailscaled instances, 1,000 device registrations, and 1,000 keepalive connections to manage. If your workloads only need shared connectivity into or out of the cluster, the [Tailscale Kubernetes Operator][docs-operator] runs shared proxies that handle [ingress][docs-cluster-ingress], [egress][docs-cluster-egress], lifecycle, state, and authentication for you.

This guide covers how to run the Tailscale container image as a sidecar in Kubernetes without the operator. It addresses state persistence, DNS, authentication, routing, and common failure modes. By the end, you'll have a production-ready sidecar deployment with stable identity, correct DNS resolution, and the security hardening needed to run at scale.

## Prerequisites

Before you begin, make sure you have the following:

* A Kubernetes cluster with role-based access control (RBAC) enabled.
* A Tailscale account with [Owner, Admin, or Network admin](/docs/reference/user-roles) permissions.
* An [OAuth client][docs-oauth-clients] or [auth key][docs-auth-keys] configured with appropriate [access control list (ACL) tags][docs-tags].
* A ServiceAccount with permissions to read and write Secrets in the sidecar's namespace (for Kubernetes Secret state storage).

## Step 1: Persist state to avoid re-registrations

State management is the most critical configuration decision for a Tailscale sidecar. When the Tailscale container starts, it generates a node key and registers with the control plane. If that key is not persisted, every container restart generates a new key and registers a new device. At scale, this can create a surge of registrations that overwhelms the control plane and triggers rate limits.

> **Warning:**
>
> Never use `--state=mem:` or leave state unconfigured in production. Each restart registers a new device and, under load, the resulting flood of registrations can cause sustained outages that do not self-heal.

### (Recommended) Use a Kubernetes Secret

Store state in a Kubernetes Secret using `TS_KUBE_SECRET`. When set, containerboot automatically passes `--state=kube:<secret_name>` to tailscaled, so you do not need to set a separate state flag. This is the most durable option because state survives both container restarts and pod restarts. Use a StatefulSet so each replica gets a stable pod name for its Secret.

```yaml
env:
  - name: TS_KUBE_SECRET
    value: $(POD_NAME)
```

When running in Kubernetes, `TS_KUBE_SECRET` defaults to `tailscale`. Set it explicitly to use per-replica Secrets with a StatefulSet, or set it to `""` to disable Kubernetes Secret storage entirely.

This requires the sidecar's ServiceAccount to have `get`, `create`, `update`, and `patch` permissions on Secrets. Refer to the [RBAC section][ar-rbac] below for the full Role definition.

### (Optional) Persistent volume

If your cluster restricts Secret write access, mount a PersistentVolumeClaim and use `TS_STATE_DIR`:

```yaml
env:
  - name: TS_STATE_DIR
    value: /var/lib/tailscale
  - name: TS_KUBE_SECRET
    value: ""
volumes:
  - name: tailscale-state
    persistentVolumeClaim:
      claimName: tailscale-state
```

### (Optional) Preserve container states

An `emptyDir` volume with `TS_STATE_DIR` preserves state across container crashes within the same pod, but state is lost on pod restarts. This is better than `mem:` but not suitable for workloads with frequent pod churn.

```yaml
env:
  - name: TS_STATE_DIR
    value: /var/lib/tailscale
  - name: TS_KUBE_SECRET
    value: ""
volumes:
  - name: tailscale-state
    emptyDir: {}
```

## Step 2: Configure RBAC for Secret state storage

The Tailscale container needs permissions to manage its own state Secret. The Role definition in the [complete manifest][ar-manifest] grants the minimum required permissions:

```yaml
rules:
  - apiGroups: [""]
    resources: ["secrets"]
    verbs: ["get", "create", "update", "patch"]
```

For tighter security, pre-create the state Secrets and scope the Role to specific Secret names using `resourceNames`. With a StatefulSet named `my-app` and 2 replicas:

```yaml
rules:
  - apiGroups: [""]
    resources: ["secrets"]
    verbs: ["get", "update", "patch"]
    resourceNames: ["my-app-0", "my-app-1"]
```

> **Note:**
>
> Kubernetes RBAC cannot restrict `create` requests by `resourceNames`. If you need the sidecar to create state Secrets automatically, do not use `resourceNames`. To restrict Secret creation, use a `ValidatingAdmissionPolicy` or webhook.

## Step 3: Authenticate the sidecar

The deployment manifest uses an [OAuth client][docs-oauth-clients], which is the recommended authentication method for Kubernetes workloads.

OAuth client secrets register devices as [ephemeral nodes][docs-ephemeral-nodes] by default, which conflicts with the goal of stable per-pod identity across restarts. Because this guide uses persistent state (`TS_KUBE_SECRET`), append `?ephemeral=false&preauthorized=true` to the client secret so that devices are non-ephemeral and skip device approval on first registration:

```shell
kubectl create secret generic tailscale-oauth \
  --from-literal=TS_CLIENT_ID=<YOUR_CLIENT_ID> \
  --from-literal=TS_CLIENT_SECRET='tskey-client-<YOUR_SECRET>?ephemeral=false&preauthorized=true'
```

If you are not persisting state and want devices cleaned up automatically when pods are deleted, omit the `ephemeral` query parameter to keep the default ephemeral behavior.

### (Alternative) Use a static auth key

If you prefer a static [auth key][docs-auth-keys], replace the OAuth environment variables in the manifest with:

```yaml
- name: TS_AUTHKEY
  valueFrom:
    secretKeyRef:
      name: tailscale-auth
      key: TS_AUTHKEY
```

### (Alternative) Use workload identity federation

For environments with a supported identity provider, such as GitHub Actions, Amazon Web Services (AWS), Google Cloud Platform (GCP), or Azure, you can use [workload identity federation][docs-wif] to authenticate without storing long-lived secrets:

```yaml
- name: TS_CLIENT_ID
  value: <YOUR_CLIENT_ID>
- name: TS_AUDIENCE
  value: <YOUR_AUDIENCE>
```

Set `TS_AUDIENCE` to the audience value configured in your federated identity's trust configuration in the admin console. Containerboot automatically obtains an ID token from the environment and exchanges it for a Tailscale auth credential. Refer to the [workload identity federation documentation][docs-wif] for provider-specific setup.

## Step 4: Handle DNS in the pod

When `TS_ACCEPT_DNS` is set to `true`, tailscaled completely replaces `/etc/resolv.conf` with `nameserver 100.100.100.100` (the [Quad100][docs-quad100] [MagicDNS][docs-magicdns] resolver). Because all containers in a pod share `/etc/resolv.conf`, this affects DNS for the application container too, not just the sidecar.

This creates two problems:

* **During startup**, before Tailscale connects, `100.100.100.100` is not reachable. DNS queries from any container in the pod fail until the sidecar is fully connected.
* **After startup**, cluster-internal DNS names (like `kubernetes.default.svc`) are resolved through [MagicDNS][docs-magicdns] instead of CoreDNS. Whether these queries succeed depends upon your tailnet's [DNS configuration][docs-dns]. If your tailnet has upstream resolvers configured or [split DNS][docs-split-dns] routes that cover the query, it works. If not, cluster service lookups break.

### (Optional) Accept DNS using split DNS

Most sidecars need [MagicDNS][docs-magicdns] to resolve tailnet hostnames. Set `TS_ACCEPT_DNS=true` and add a [split DNS][docs-split-dns] route so that cluster service lookups still reach CoreDNS.

In the [DNS](https://console.tailscale.com/admin/dns) page of the admin console, add a split DNS entry:

* **Domain**: `svc.cluster.local`
* **Nameserver**: Your cluster's CoreDNS ClusterIP (for example, `10.96.0.10`)

You can find your cluster's CoreDNS IP with:

```shell
kubectl get svc -n kube-system kube-dns -o jsonpath='{.spec.clusterIP}'
```

With this configuration, when tailscaled replaces `/etc/resolv.conf` with `100.100.100.100`, queries for `*.svc.cluster.local` are forwarded from MagicDNS to your cluster's CoreDNS through the split DNS route. All other queries use your tailnet's DNS resolvers or MagicDNS as normal.

> **Note:**
>
> This approach works when all your sidecars run in a single cluster. If you run sidecars across multiple clusters, each cluster has a different CoreDNS ClusterIP, and a single split DNS entry for `svc.cluster.local` can only point to one of them. For multi-cluster environments, assign each cluster a unique DNS domain (for example, `cluster-a.k8s`) and configure per-cluster split DNS routes that resolve to each cluster's CoreDNS. Alternatively, configure [global nameservers][docs-dns] in your tailnet so that queries without a matching split DNS route fall back to a resolver that can handle them.

> **Warning:**
>
> With `TS_ACCEPT_DNS=true`, DNS in the pod is unavailable during the startup window before Tailscale connects. If the application container starts before the sidecar is ready, its DNS queries fail. Configure the application container to tolerate transient DNS failures, or use Kubernetes native sidecar containers so the Tailscale container can start before the application container.

### (Optional) Disable DNS takeover

If the sidecar does not need [MagicDNS][docs-magicdns] resolution and only needs to reach tailnet devices by IP, set `TS_ACCEPT_DNS=false` to prevent tailscaled from modifying `/etc/resolv.conf`. Cluster DNS works normally with no additional configuration.

```yaml
- name: TS_ACCEPT_DNS
  value: "false"
```

## Step 5: Harden the sidecar

Running a sidecar in every pod expands the surface area for misconfiguration. The following sections cover the security context the Tailscale container needs, how to use tags to scope access, and the routing and shields behavior to be aware of before exposing your pods to the tailnet.

### Security context

The deployment manifest uses `privileged: true` on both the initContainer and the Tailscale container. This matches the [operator's proxy template][docs-operator], which also runs the Tailscale container as privileged. Kernel networking mode needs to create tun devices, configure iptables/nftables rules, and modify routing tables, all of which require elevated privileges.

### Tag-based access control

Use `--advertise-tags` to assign [ACL tags][docs-tags] to sidecar nodes. Tags let you write access control rules for your Kubernetes workloads without managing individual device identities:

```yaml
- name: TS_EXTRA_ARGS
  value: "--advertise-tags=tag:k8s"
```

### Restrict inbound traffic

By default, ACL rules in your tailnet policy control which devices can reach the sidecar. Use [ACL tags][docs-tags] and [access control policies][docs-access-control] to restrict inbound traffic to specific sources and ports.

The `--shields-up` flag rejects all inbound connections at the WireGuard packet filter, regardless of ACLs. Only stateful return traffic for connections the sidecar initiated is allowed through. This makes the pod unreachable from other tailnet devices and defeats one of the main reasons to run a sidecar: bidirectional connectivity. Only use `--shields-up` if the pod never needs to accept inbound tailnet connections.

### Prevent route conflicts from breaking in-cluster networking

The `--accept-routes` flag is what gives the sidecar access to [subnet routes][docs-subnet-routers] advertised by other nodes in your tailnet, such as on-prem networks, other clusters, and cloud VPCs. This is core sidecar functionality and is included in the deployment manifest.

However, `--accept-routes` installs every advertised route into the pod's kernel routing table unconditionally. There is no overlap detection. If any node in your tailnet advertises a subnet route that overlaps with this cluster's pod or service classless inter-domain routing (CIDR) ranges, in-cluster traffic gets routed through the Tailscale tunnel instead of through the container network interface (CNI). This breaks pod-to-pod communication, service discovery, and DNS. Traffic to CoreDNS at the service ClusterIP gets hairpinned through Tailscale and rewritten by network address translation (NAT), and the response cannot route back.

#### How routing works

Tailscale installs accepted routes into a separate Linux routing table (table 52) and uses policy-based routing (`ip rule`) to direct unmarked packets through that table. Tailscale's own traffic is marked with fwmark `0x80000` to bypass table 52 and use the main routing table instead, preventing loops.

The problem is that IP rules route all unmarked pod traffic through table 52. If table 52 contains a route for your cluster's service CIDR because another node is advertising it, pod traffic to CoreDNS or other services matches that route and gets sent through the Tailscale tun device instead of the CNI.

#### Verify your tailnet before deploying

Before deploying sidecars with `--accept-routes`, check that no node in your tailnet is advertising your cluster's pod or service CIDRs. You can check advertised routes in the [Machines](https://console.tailscale.com/admin/machines) page of the admin console, or run:

```shell
tailscale status --json | jq '.Peer[] | select(.PrimaryRoutes) | {name: .HostName, routes: .PrimaryRoutes}'
```

Compare the output against your cluster's CIDRs:

```shell
kubectl cluster-info dump | grep -m 2 -E "service-cluster-ip-range|cluster-cidr"
```

If there is overlap, either remove the conflicting subnet route from the advertising node or avoid `--accept-routes` on sidecars in that cluster.

## Step 6: Deploy the sidecar

The following StatefulSet deploys a Tailscale sidecar alongside an nginx container. It uses Kubernetes Secret state storage, kernel networking mode, and metrics.

The initContainer sets IP forwarding sysctls, which requires `privileged: true`. This is needed when the sidecar uses `--accept-routes`, advertises subnet routes, or acts as a proxy.

Replace `tag:k8s` with your ACL tag and update the auth Secret name to match your configuration.

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: tailscale
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: tailscale
rules:
  - apiGroups: [""]
    resources: ["secrets"]
    verbs: ["get", "create", "update", "patch"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: tailscale
subjects:
  - kind: ServiceAccount
    name: tailscale
roleRef:
  kind: Role
  name: tailscale
  apiGroup: rbac.authorization.k8s.io
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: my-app
spec:
  replicas: 2
  serviceName: my-app
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      serviceAccountName: tailscale
      initContainers:
        - name: sysctl
          image: ghcr.io/tailscale/tailscale:latest
          command: ["/bin/sh", "-c"]
          args:
            - |
              sysctl -w net.ipv4.ip_forward=1
              if sysctl net.ipv6.conf.all.forwarding 2>/dev/null; then
                sysctl -w net.ipv6.conf.all.forwarding=1
              fi
          securityContext:
            privileged: true
      containers:
        - name: tailscale
          image: ghcr.io/tailscale/tailscale:latest
          env:
            - name: POD_NAME
              valueFrom:
                fieldRef:
                  fieldPath: metadata.name
            - name: POD_UID
              valueFrom:
                fieldRef:
                  fieldPath: metadata.uid
            - name: TS_KUBE_SECRET
              value: $(POD_NAME)
            - name: TS_CLIENT_ID
              valueFrom:
                secretKeyRef:
                  name: tailscale-oauth
                  key: TS_CLIENT_ID
            - name: TS_CLIENT_SECRET
              valueFrom:
                secretKeyRef:
                  name: tailscale-oauth
                  key: TS_CLIENT_SECRET
            - name: TS_HOSTNAME
              value: $(POD_NAME)
            - name: TS_USERSPACE
              value: "false"
            - name: TS_ACCEPT_DNS
              value: "true"
            - name: TS_EXTRA_ARGS
              value: "--advertise-tags=tag:k8s --accept-routes"
            - name: TS_ENABLE_METRICS
              value: "true"
            - name: TS_LOCAL_ADDR_PORT
              value: "0.0.0.0:9002"
          ports:
            - name: metrics
              containerPort: 9002
              protocol: TCP
          securityContext:
            privileged: true
        - name: app
          image: nginx:latest
          ports:
            - containerPort: 80
```

## Step 7: (Optional) Configure health checks and observability

The Tailscale Kubernetes Operator does not configure startup, liveness, or readiness probes on its proxy containers. It manages container lifecycle internally through the IPN bus. The manifest in this guide follows the same approach.

Setting `TS_ENABLE_METRICS=true` serves a Prometheus-compatible `/metrics` endpoint on the address configured by `TS_LOCAL_ADDR_PORT` (default `[::]:9002`). Use this for monitoring and alerting.

Setting `TS_ENABLE_HEALTH_CHECK=true` serves a `/healthz` endpoint on the same server. The endpoint returns HTTP 200 if the node has at least one tailnet IP address, and 503 otherwise. If you need a health endpoint for external load balancers or service mesh integration, enable this. The manifest above does not enable it by default.

> **Warning:**
>
> Avoid using `/healthz` as a Kubernetes `livenessProbe`. The endpoint returns 503 whenever the node temporarily loses its tailnet IPs, which can happen during transient network disruptions. A liveness probe failure triggers a container restart, which forces a re-registration. This is exactly the pattern that causes cascading failures at scale. Similarly, avoid liveness probes that use MagicDNS resolution (`nslookup` against `100.100.100.100`), as MagicDNS is unavailable during disconnections.

## Troubleshooting

| Issue                                                          | Impact                                                                                                                                                                                                                                        | Fix                                                                                                                                      |
| -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `--state=mem:` or no state configuration                       | Every restart registers a new device. Under load, this floods the control plane and triggers rate limits.                                                                                                                                     | Use `TS_KUBE_SECRET` with a StatefulSet or `TS_STATE_DIR` with a persistent volume.                                                      |
| `TS_ACCEPT_DNS=true` without split DNS for `svc.cluster.local` | tailscaled replaces `/etc/resolv.conf` for the entire pod. Cluster service lookups break because CoreDNS is no longer reachable through the default nameserver.                                                                               | Add a split DNS route for `svc.cluster.local` pointing to your cluster's CoreDNS IP in the admin console.                                |
| Deployment instead of StatefulSet                              | Pod names are not stable, so `TS_KUBE_SECRET=$(POD_NAME)` creates orphaned Secrets.                                                                                                                                                           | Use a StatefulSet for stable pod identities.                                                                                             |
| Liveness probe on `/healthz` or MagicDNS                       | Transient network disruptions cause the probe to fail, triggering a container restart and re-registration. This amplifies outages instead of recovering from them.                                                                            | Do not use `/healthz` or MagicDNS-based liveness probes. The operator does not configure probes on its proxy containers for this reason. |
| Subnet routes overlapping cluster CIDRs                        | If another node advertises your pod or service CIDR as a subnet route, `--accept-routes` installs those routes through the tun device. In-cluster traffic gets hairpinned through Tailscale, breaking DNS, pod-to-pod, and service discovery. | Before deploying, verify no node in your tailnet advertises routes that overlap with this cluster's pod or service CIDRs.                |
| `podManagementPolicy: Parallel` at high replica counts         | All pods start simultaneously, flooding the control plane with registrations.                                                                                                                                                                 | Use the default `OrderedReady` policy or scale incrementally.                                                                            |

## Further exploration

* For workloads where per-pod identity is not required, the [Tailscale Kubernetes Operator][docs-operator] manages shared proxies that serve multiple pods with less operational overhead than running a sidecar in every pod.
* To expose Kubernetes services to your tailnet without per-pod sidecars, configure [cluster ingress][docs-cluster-ingress] through the operator.
* To give cluster workloads outbound access to tailnet resources, configure [cluster egress][docs-cluster-egress] through the operator.
* To restrict which tailnet devices can reach your sidecar pods and on which ports, write [access control policies][docs-access-control] that reference the [ACL tags][docs-tags] you advertise from the sidecar.
* To resolve cluster services while keeping [MagicDNS][docs-magicdns] for tailnet hostnames, configure [split DNS][docs-split-dns] in the admin console.
* To authenticate sidecars without storing long-lived secrets in your cluster, configure [workload identity federation][docs-wif] with a supported identity provider.
* To let a sidecar reach networks that are not directly in the tailnet, advertise [subnet routes][docs-subnet-routers] from the pod.
* For other ways to run Tailscale in containers, refer to the [Tailscale containers overview][docs-containers].

[ar-manifest]: #step-6-deploy-the-sidecar

[ar-rbac]: #step-2-configure-rbac-for-secret-state-storage

[docs-access-control]: /docs/features/access-control

[docs-auth-keys]: /docs/features/access-control/auth-keys

[docs-cluster-egress]: /docs/kubernetes-operator/egress

[docs-cluster-ingress]: /docs/kubernetes-operator/ingress

[docs-containers]: /docs/features/containers

[docs-dns]: /docs/reference/dns-in-tailscale

[docs-ephemeral-nodes]: /docs/features/ephemeral-nodes

[docs-magicdns]: /docs/features/magicdns

[docs-oauth-clients]: /docs/features/oauth-clients

[docs-operator]: /docs/kubernetes-operator

[docs-quad100]: /docs/reference/quad100

[docs-split-dns]: /docs/reference/dns-in-tailscale#restricted-nameservers

[docs-subnet-routers]: /docs/features/subnet-routers

[docs-tags]: /docs/features/tags

[docs-wif]: /docs/features/workload-identity-federation
