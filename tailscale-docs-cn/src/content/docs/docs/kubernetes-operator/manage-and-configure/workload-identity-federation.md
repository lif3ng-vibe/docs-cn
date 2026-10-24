---
title: "Configure workload identity federation for the Tailscale Kubernetes Operator"
description: "Tailscale supports [workload identity federation][docs-wif] for authenticating to a tailnet using provider-native identity tokens. The operator can use its ServiceAccount token as an OIDC identity and"
---

Last validated Jun 5, 2026

Tailscale supports [workload identity federation][docs-wif] for authenticating to a tailnet using provider-native identity tokens. The operator can use its ServiceAccount token as an OIDC identity and authenticate without requiring a long-lived OAuth client secret.

## Prepare the cluster

The Kubernetes cluster's OIDC discovery endpoints must be publicly accessible. Bind the `"unauthenticated"` group to the `"system:service-account-issuer-discovery"` `ClusterRole` to allow unauthenticated access:

```shell
kubectl create clusterrolebinding oidc-discovery \
  --clusterrole=system:service-account-issuer-discovery \
  --group=system:unauthenticated
```

## Get your cluster's issuer

> **Note:**
>
> The following command has a `jq` dependency. You may need to install `jq` on your device.

To get your cluster's issuer, run the following command:

```shell
ISSUER="$(kubectl get --raw /.well-known/openid-configuration | jq '.issuer')"
```

## Configure a federated identity

Follow the steps to [configure a federated identity][docs-wif-configure] in the admin console using the following values:

* Set the **Issuer** to **Custom issuer**.
* Set the **Issuer URL** to the value of `$ISSUER` from the previous step.
* Set the **Subject** to `system:serviceaccount:tailscale:operator`.
* Leave the **Audience** field blank.
* Create the client with `write` scope for:
  * `General/Services` (with the `tag:k8s-operator` tag)
  * `Devices/Core` (with the `tag:k8s-operator` tag)
  * `Keys/Auth Keys` (with the `tag:k8s-operator` tag)

## Install or upgrade the Tailscale Kubernetes Operator

> **Note:**
>
> Make note of the required changes for your installation method before proceeding to the [installation guide][docs-install-operator].

### Helm

* Replace `--set-string oauth.clientSecret="<OAuth client secret>"` with `--set-string oauth.audience="<OIDC Audience>"` when following the [Helm installation guide][docs-install-helm].

### Static manifests

Make the following changes in the manifest file when following the guide to [install using static manifests][docs-install-static-manifests]

* Remove the `operator-oauth` secret definition (not needed).
* Edit the Deployment:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: operator
  namespace: tailscale
spec:
  replicas: 1
  selector:
    matchLabels:
      app: operator
  strategy:
    type: Recreate
  template:
    metadata:
      labels:
        app: operator
    spec:
      containers:
        - env:
            - name: OPERATOR_INITIAL_TAGS
              value: tag:k8s-operator
            - name: OPERATOR_HOSTNAME
              value: tailscale-operator
            - name: OPERATOR_SECRET
              value: operator
            - name: OPERATOR_LOGGING
              value: info
            - name: OPERATOR_NAMESPACE
              valueFrom:
                fieldRef:
                  fieldPath: metadata.namespace
            - name: OPERATOR_LOGIN_SERVER
              value: null
            - name: OPERATOR_INGRESS_CLASS_NAME
              value: tailscale
            - name: CLIENT_ID
              value: "<OAuth client ID>"
            - name: PROXY_IMAGE
              value: tailscale/tailscale:stable
            - name: PROXY_TAGS
              value: tag:k8s
            - name: APISERVER_PROXY
              value: "false"
            - name: PROXY_FIREWALL_MODE
              value: auto
            - name: POD_NAME
              valueFrom:
                fieldRef:
                  fieldPath: metadata.name
            - name: POD_UID
              valueFrom:
                fieldRef:
                  fieldPath: metadata.uid
          image: tailscale/k8s-operator:stable
          imagePullPolicy: Always
          name: operator
          volumeMounts:
            - mountPath: /var/run/secrets/tailscale/serviceaccount
              name: oidc-jwt
              readOnly: true
      nodeSelector:
        kubernetes.io/os: linux
      serviceAccountName: operator
      volumes:
        - name: oidc-jwt
          projected:
            defaultMode: 420
            sources:
              - serviceAccountToken:
                  audience: "<OIDC Audience>"
                  expirationSeconds: 3600
                  path: token
```

After you have applied the manifest and verified that the `operator-oauth` secret is no longer being used, you can delete the secret.

## Further exploration

* Understand how [workload identity federation][docs-wif] works and how it integrates with Tailscale.
* [Install][docs-install-operator] the Tailscale Kubernetes Operator.

[docs-install-helm]: /docs/kubernetes-operator/install-operator#install-using-helm

[docs-install-static-manifests]: /docs/kubernetes-operator/install-operator#install-using-static-manifests-with-kubectl

[docs-install-operator]: /docs/kubernetes-operator/install-operator

[docs-release-stages]: /docs/reference/tailscale-release-stages#beta

[docs-wif]: /docs/features/workload-identity-federation

[docs-wif-configure]: /docs/features/workload-identity-federation#configure-federated-identities-in-the-admin-console
