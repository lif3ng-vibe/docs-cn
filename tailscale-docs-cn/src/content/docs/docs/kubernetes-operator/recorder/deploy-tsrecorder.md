---
title: "Deploy a session recorder in your Kubernetes cluster"
description: "This guide explains how to deploy a `tsrecorder` instance in your cluster. The Operator uses the `Recorder` custom resource to configure and manage the lifecycle of the `tsrecorder` instance."
---

Last validated Jun 5, 2026

This guide explains how to deploy a `tsrecorder` instance in your cluster. The Operator uses the `Recorder` custom resource to configure and manage the lifecycle of the `tsrecorder` instance.

## Prerequisites

Before you begin, make sure you have the following:

* [Install][docs-k8s-install] the Tailscale Kubernetes Operator.
* The Operator's tag must own the recorder tag in your tailnet policy file. Refer to the following section for an example.
* (Optional) [Enable HTTPS][docs-enable-https] for your tailnet if you want to use the recorder's web UI.

## Configure tag ownership

The Operator's tag must own the recorder tag in your tailnet policy file. For example, if the Operator is tagged `tag:k8s-operator` and your recorder uses `tag:tsrecorder`, add the following to your tailnet policy file:

```json
"tagOwners": {
  "tag:k8s-operator": [],
  "tag:tsrecorder": ["tag:k8s-operator"]
}
```

## Create a recorder

Apply the following manifest to create a `Recorder` resource:

```yaml
apiVersion: tailscale.com/v1alpha1
kind: Recorder
metadata:
  name: my-recorder
spec:
  enableUI: true
  tags:
    - "tag:tsrecorder"
```

The `tags` field sets the Tailscale identity of the recorder device in your tailnet. When you [configure session recording][docs-kubectl-recording], your grants reference these tags to tell the control plane which `tsrecorder` instances should receive recordings.

Set `enableUI: true` to enable the recorder's web UI, which lets you browse and view recordings in a browser.

## Verify session recording

Wait for the recorder to become ready:

```shell
kubectl wait --for condition=RecorderReady=true Recorder my-recorder
```

Find the URL for the recorder's web UI:

```shell
kubectl get Recorder my-recorder
```

```
NAME          STATUS            URL
my-recorder   RecorderCreated   https://my-recorder.<tailnet>.ts.net
```

## Configure storage

### Ephemeral filesystem (default)

Recordings are stored in an `emptyDir` volume. This is suitable for testing, but logs are lost if the pod is deleted. No additional configuration is needed.

### S3-compatible object storage

For production, configure S3-compatible storage to ensure durable, long-term retention:

```yaml
apiVersion: tailscale.com/v1alpha1
kind: Recorder
metadata:
  name: my-recorder
spec:
  enableUI: true
  tags:
    - "tag:tsrecorder"
  storage:
    s3:
      endpoint: s3.us-east-1.amazonaws.com
      bucket: my-tsrecorder-bucket
      credentials:
        secret:
          name: s3-credentials-secret
```

The referenced `Secret` must contain the credentials required by your S3-compatible provider.

### IAM roles for service accounts (IRSA)

On EKS, you can use IAM roles for service accounts instead of static credentials. This avoids storing long-lived AWS credentials in a `Secret`.

1. Follow the [AWS instructions for IRSA][xt-aws-irsa]. When selecting the `ServiceAccount` name and namespace, use the operator's namespace (usually `tailscale`) and the recorder's name.

2. Use `.spec.statefulSet.pod.serviceAccount` to annotate the recorder's service account with the IAM role:

   ```yaml
   apiVersion: tailscale.com/v1alpha1
   kind: Recorder
   metadata:
     name: my-recorder
   spec:
     enableUI: true
     tags:
       - "tag:tsrecorder"
     storage:
       s3:
         endpoint: s3.us-east-1.amazonaws.com
         bucket: my-tsrecorder-bucket
     statefulSet:
       pod:
         serviceAccount:
           name: my-recorder
           annotations:
             eks.amazonaws.com/role-arn: arn:aws:iam::111122223333:role/my-s3-role
   ```

## Further exploration

* [Configure][docs-kubectl-recording] kubectl session recording.
* Understand how session recording works in the [recorder overview][docs-recorder].

[docs-enable-https]: /docs/how-to/set-up-https-certificates

[docs-k8s-install]: /docs/kubernetes-operator/install-operator

[docs-kubectl-recording]: /docs/kubernetes-operator/recorder/kubectl-session-recording

[docs-recorder]: /docs/kubernetes-operator/recorder

[xt-aws-irsa]: https://docs.aws.amazon.com/eks/latest/userguide/iam-roles-for-service-accounts.html
