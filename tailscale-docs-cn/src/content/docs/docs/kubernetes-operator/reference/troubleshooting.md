---
title: "Troubleshooting the Tailscale Kubernetes Operator"
description: "If you encounter issues with your installation, review the operator logs."
---

Last validated Jun 5, 2026

## Using logs

If you encounter issues with your installation, review the operator logs.

For [ingress][docs-operator-cluster-ingress] and [egress][docs-operator-cluster-egress] proxies and the `Connector`, the operator creates a single-replica `StatefulSet` in the `tailscale` namespace that proxies traffic to and from the tailnet. If the `StatefulSet` has been successfully created, also review the logs of its pod.

### Operator logs

You can increase the operator's log level to get debug logs.

To set the log level to `debug` for an operator deployed using Helm, run:

```shell
helm upgrade --install \
  operator tailscale/tailscale-operator \
  --set operatorConfig.logging=debug
```

If you deployed the operator using [static manifests][docs-operator-static-manifests-with-kubectl], set the `OPERATOR_LOGGING` environment variable for the operator's `Deployment` to `debug`.

To view the logs, run:

```shell
kubectl logs deployment/operator --namespace tailscale
```

### Proxy logs and events

To get logs and events for the proxy created for an [`Ingress`][docs-operator-cluster-ingress] resource, run:

```shell
pod_name=$(kubectl get pod --selector=tailscale.com/parent-resource-type=ingress,tailscale.com/parent-resource=<ingress-name>,tailscale.com/parent-resource-ns=<ingress-namespace> \
  --namespace tailscale -ojsonpath='{.items[0].metadata.name}')
kubectl logs ${pod_name} --namespace tailscale
kubectl describe pod ${pod_name} --namespace tailscale
```

To get logs and events for a proxy created for an [ingress][docs-operator-cluster-ingress] or [egress][docs-operator-cluster-egress] `Service`, run:

```shell
pod_name=$(kubectl get pod --selector=tailscale.com/parent-resource-type=svc,tailscale.com/parent-resource=<service-name>,tailscale.com/parent-resource-ns=<service-namespace> \
  --namespace tailscale -ojsonpath='{.items[0].metadata.name}')
kubectl logs ${pod_name} --namespace tailscale
kubectl describe pod ${pod_name} --namespace tailscale
```

To get logs and events for a proxy created for a [`Connector`][docs-connector], run:

```shell
pod_name=$(kubectl get pod --selector=tailscale.com/parent-resource-type=connector,tailscale.com/parent-resource=<connector-name> \
  --namespace tailscale -ojsonpath='{.items[0].metadata.name}')
kubectl logs ${pod_name} --namespace tailscale
kubectl describe pod ${pod_name} --namespace tailscale
```

To get logs and events for a proxy created for a [`ProxyGroup`][docs-proxygroup], run:

```shell
pod_name=$(kubectl get pod --selector=tailscale.com/parent-resource-type=proxygroup,tailscale.com/parent-resource=<proxy-group-name> \
  --namespace tailscale -ojsonpath='{.items[0].metadata.name}')
kubectl logs ${pod_name} --namespace tailscale
kubectl describe pod ${pod_name} --namespace tailscale
```

## Cluster egress and cluster ingress proxies

The proxy pod is deployed in the `tailscale` namespace and has a name of the form `ts-<annotated-service-name>-<random-string>`.

If you have trouble reaching the external service, verify that the proxy pod is properly deployed:

* Review the logs and events of the proxy pods.
* Review the operator logs by running `kubectl logs deployment/operator --namespace tailscale`. You can configure the log level using the `OPERATOR_LOGGING` environment variable in the operator's [manifest file][docs-operator-static-manifests-with-kubectl].
* Verify that the cluster workload can send traffic to the proxy pod in the `tailscale` namespace.

## TLS connection errors

If you are connecting to a workload exposed to the tailnet over `Ingress`, or to the Kubernetes API server over the operator's API server proxy, you might encounter TLS connection errors.

Check the following, in sequence:

1. HTTPS is not enabled for the tailnet.

   To use Tailscale `Ingress` or the API server proxy, ensure that [HTTPS is enabled for your tailnet][docs-enabling-https].

2. The Let's Encrypt certificate has not yet been provisioned.

   If HTTPS is enabled, the errors are most likely related to the Let's Encrypt certificate provisioning flow.

   For each Tailscale `Ingress` resource, the operator deploys a Tailscale node that runs a TLS server. This server is provisioned with a Let's Encrypt certificate for the MagicDNS name of the node. For the API server proxy, the operator also runs an in-process TLS server that proxies tailnet traffic to the Kubernetes API server. This server is provisioned with a Let's Encrypt certificate for the MagicDNS name of the operator.

   In both cases, the certificates are provisioned lazily the first time a client connects to the server. Provisioning takes time, so TLS timeout errors might appear.

   To follow the certificate provisioning process, review the logs:

   * For the API server proxy, review the [operator logs][ar-operator-logs].
   * For `Ingress`, review the [proxy logs][ar-operator-proxy-logs].

   The first client connection can error while certificates provision; this is a known limitation. If it affects your workflow, [open an issue on GitHub][xt-gh-tailscale-issue-types].

3. You have hit Let's Encrypt rate limits.

   If the connection does not succeed after the first attempt, verify that you have not hit [Let's Encrypt rate limits][xt-letsencrypt-rate-limit]. If a limit has been hit, the error returned from Let's Encrypt appears in the logs.

   For ongoing work to reduce the likelihood of hitting Let's Encrypt rate limits, refer to the related discussion in [`tailscale/tailscale#11119`][xt-gh-tailscale-issue-11119].

## Shared ACME accounts Secret stuck in Terminating

If you delete the `tailscale-acme-accounts` `Secret`, it remains in a `Terminating` state because the `tailscale.com/acme-account-protection` finalizer blocks the deletion. To complete the deletion, back up the `Secret` data if you haven't already, then remove the finalizer.

The `Secret` holds [shared Let's Encrypt account keys][docs-lets-encrypt-rate-limits], and losing them removes the rate limit exemption for certificate renewals in your tailnet. For an explanation of the finalizer and how to back up the account key, refer to [Let's Encrypt rate limits][docs-lets-encrypt-rate-limits].

## OAuth client and tagging issues

If the operator is not properly tagged or has permission issues, check the following:

1. **OAuth client scopes.** Ensure your OAuth client has both the `devices:core` and `auth_keys` scopes with write permissions.

2. **OAuth client tag permissions.** The OAuth client must have permission to use all tags you want to apply to the operator. For example, if your `operatorConfig.defaultTags` specifies multiple tags such as `tag:k8s-operator,tag:k8s-test`, your OAuth client must have permission to use `tag:k8s-operator`.

3. **Tag ownership in your tailnet policy file.** Check that your tag ownership is properly configured in your tailnet policy file:

   ```json
   "tagOwners": {
     "tag:k8s-operator": [],
     "tag:k8s-test": ["tag:k8s-operator"],
   }
   ```

4. **Refresh operator state.**

   * If you updated your tailnet policy file, the changes apply automatically and do not require a restart.
   * If you created a new OAuth client to replace the previous one, reinstall the operator to ensure a new key is created. Follow the [installation instructions][docs-kubernetes-operator-setup] again with the new OAuth client credentials.

5. **Check OAuth client in the admin console.** Verify in the Tailscale admin console that your OAuth client has the exact tags you want to apply to the operator. Each tag's permissions are evaluated independently.

6. **Inspect operator logs.** Look for authorization errors or tag-related messages in the [operator logs][ar-operator-logs].

## Tailscale Ingress troubleshooting

This topic contains additional information for troubleshooting Tailscale `Ingress`.

Check that the operator has configured the ingress proxy correctly. For example, if you have a Tailscale `Ingress` with a backend `Service` similar to the following:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: my-app
spec:
  ingressClassName: tailscale
  rules:
    - http:
        paths:
          - backend:
              service:
                name: my-app
                port:
                  number: 80
            path: /login
            pathType: Prefix
  tls:
    - hosts:
        - my-app
---
apiVersion: v1
kind: Service
metadata:
  name: my-app
spec:
  clusterIP: 192.0.2.9
  ports:
    - port: 80
```

Validate that the ingress proxy's configuration matches the resource:

```shell
INGRESS_NAME=<ingress-resource-name>
INGRESS_NAMESPACE=<ingress-resource-namespace>
secret_name=$(kubectl get secret --selector=tailscale.com/parent-resource-type=ingress,tailscale.com/parent-resource=${INGRESS_NAME},tailscale.com/parent-resource-ns=${INGRESS_NAMESPACE} \
  --namespace tailscale -ojsonpath='{.items[0].metadata.name}')
kubectl get secret ${secret_name} -n tailscale -ojsonpath={.data.serve-config} | base64 -d
```

The command output looks similar to the following:

```json
{"TCP":{"443":{"HTTPS":true}},"Web":{"${TS_CERT_DOMAIN}:443":{"Handlers":{"/login":{"Proxy":"http://192.0.2.9:80/"}}}}}
```

If the configuration is incorrect, check the operator logs for errors related to configuring the `Ingress`.

Check that the ingress proxy has loaded the configuration by inspecting the current proxy configuration:

```shell
INGRESS_NAME=<ingress-resource-name>
INGRESS_NAMESPACE=<ingress-resource-namespace>
pod_name=$(kubectl get pod --selector=tailscale.com/parent-resource-type=ingress,tailscale.com/parent-resource=${INGRESS_NAME},tailscale.com/parent-resource-ns=${INGRESS_NAMESPACE} \
  --namespace tailscale -ojsonpath='{.items[0].metadata.name}')
kubectl exec ${pod_name} --namespace tailscale -- tailscale serve status
```

The command output looks similar to the following:

```
https://my-app.<tailnet>.ts.net (tailnet only)
|-- / proxy http://192.0.2.9:80/
```

If the configuration is incorrect, check the proxy pod logs.

Verify that the `Service` backend is reachable from the ingress proxy pod:

```shell
INGRESS_NAME=<ingress-resource-name>
INGRESS_NAMESPACE=<ingress-resource-namespace>
pod_name=$(kubectl get pod --selector=tailscale.com/parent-resource-type=ingress,tailscale.com/parent-resource=${INGRESS_NAME},tailscale.com/parent-resource-ns=${INGRESS_NAMESPACE} \
  --namespace tailscale -ojsonpath='{.items[0].metadata.name}')
kubectl exec -it ${pod_name} -n tailscale -- sh
apk add curl
curl http://192.0.2.9:80/
```

If the backend cannot be reached, the issue is likely related to cluster connectivity from the `tailscale` namespace. Verify that you do not have a `NetworkPolicy` in place that prevents pods in the `tailscale` namespace from communicating with the `Ingress` backend.

[ar-operator-logs]: #operator-logs

[ar-operator-proxy-logs]: #proxy-logs-and-events

[docs-connector]: /docs/kubernetes-operator/connector

[docs-enabling-https]: /docs/how-to/set-up-https-certificates

[docs-kubernetes-operator-setup]: /docs/kubernetes-operator/install-operator

[docs-lets-encrypt-rate-limits]: /docs/kubernetes-operator/manage-and-configure/lets-encrypt-rate-limits

[docs-operator-cluster-egress]: /docs/kubernetes-operator/egress

[docs-operator-cluster-ingress]: /docs/kubernetes-operator/ingress

[docs-operator-static-manifests-with-kubectl]: /docs/kubernetes-operator/install-operator#install-using-static-manifests-with-kubectl

[docs-proxygroup]: /docs/kubernetes-operator/concepts/proxygroup

[xt-gh-tailscale-issue-11119]: https://github.com/tailscale/tailscale/issues/11119

[xt-gh-tailscale-issue-types]: https://github.com/tailscale/tailscale/issues/new/choose

[xt-letsencrypt-rate-limit]: https://letsencrypt.org/docs/rate-limits
