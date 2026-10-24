---
title: "Session recording with the Tailscale Kubernetes Operator"
description: "Deploy and configure session recording using the Tailscale Kubernetes Operator."
---

Last validated Jun 5, 2026

> **Deprecation:**
>
> Tailscale no longer offers session recording with the Tailscale Kubernetes Operator through `tsrecorder`. Support for existing users is scheduled to end on August 2027. For session recording and privileged access management, use [Tailscale PAM][docs-tailscale-pam] or contact [Tailscale Sales][co-contact-sales].

The [API server proxy][docs-api-server-access] can record kubectl sessions and Kubernetes API request events, giving you an audit trail of cluster interactions for security and compliance.

## kubectl session recording

The following kubectl commands can be recorded:

* `kubectl exec`
* `kubectl debug`
* `kubectl attach`
* `kubectl run`

A session recording includes the command sent, `stdout` and `stderr` output, pod and container context, and the Tailscale identity of the user. `stdin` is not recorded to protect sensitive data like passwords.

## API request event recordings

When enabled, all Kubernetes API requests passing through the proxy are recorded. Each event includes the API verb, targeted resource, HTTP details, client user agent, and the Tailscale identity of the requesting device or user.

## How recordings are routed

When a user connects to the API server proxy, the control plane determines which `tsrecorder` instances should receive recordings based on the user's [grants][docs-grants]. The proxy then streams session data to a `tsrecorder` instance over your tailnet, end-to-end encrypted using WireGuard.

The `tsrecorder` does not need to run in the same cluster as the API server proxy. It can be deployed anywhere in your tailnet. Any `tsrecorder` instance that matches the tags specified in the grant receives recordings.

## Failure policy

If the `tsrecorder` is unreachable, the proxy can either:

* **Fail open (default)**: Sessions proceed even if they cannot be recorded.
* **Fail closed**: Sessions are blocked if recording is not possible.

## The Recorder custom resource

The operator provides a `Recorder` custom resource as a convenience for deploying `tsrecorder` in-cluster. It manages the pod lifecycle and supports configurable storage backends:

* **Ephemeral filesystem (default)**: Recordings stored in an `emptyDir` volume. Suitable for testing, but lost if the pod is deleted.
* **S3-compatible object storage**: Recommended for production to ensure durable, long-term retention.

For more information, refer to [Deploy a recorder][docs-deploy-tsrecorder] for setup instructions.

## Further exploration

[Deploy][docs-deploy-tsrecorder] the session recorder.
[Record][docs-session-recording] kubectl sessions.
[Access][docs-api-server-access] the Kubernetes API over Tailscale.

[co-contact-sales]: https://tailscale.com/contact/sales

[docs-api-server-access]: /docs/kubernetes-operator/api-server-access

[docs-deploy-tsrecorder]: /docs/kubernetes-operator/recorder/deploy-tsrecorder

[docs-grants]: /docs/features/access-control/grants

[docs-session-recording]: /docs/kubernetes-operator/recorder/kubectl-session-recording

[docs-tailscale-pam]: /docs/privileged-access-management/session-logs
