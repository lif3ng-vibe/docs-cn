---
title: "Record kubectl sessions"
description: "This guide explains how to configure [grants][docs-grants] in your tailnet policy file to enable kubectl session recording. Grants control which users or devices have their sessions recorded, which `t"
---

Last validated Jun 5, 2026

This guide explains how to configure [grants][docs-grants] in your tailnet policy file to enable kubectl session recording. Grants control which users or devices have their sessions recorded, which `tsrecorder` instance receives the recordings, and whether recording is enforced.

## Prerequisites

Before you begin, make sure you have the following:

* [Install the Tailscale Kubernetes Operator][docs-k8s-install].
* [Deploy a recorder][docs-deploy-tsrecorder].
* An [API server proxy][docs-api-server-access] configured in your cluster.

## Basic recording

Record sessions for `group:engineering` connecting to any proxy tagged `tag:k8s-operator`:

```json
"grants": [
  {
    "src": ["group:engineering"],
    "dst": ["tag:k8s-operator"],
    "app": {
      "tailscale.com/cap/kubernetes": [{
        "recorder": ["tag:tsrecorder"]
      }]
    }
  }
]
```

## Enforced recording

Block sessions if the recorder is unreachable by setting `enforceRecorder` to `true`:

```json
"grants": [
  {
    "src": ["group:engineering"],
    "dst": ["tag:k8s-operator"],
    "app": {
      "tailscale.com/cap/kubernetes": [{
        "recorder": ["tag:tsrecorder"],
        "enforceRecorder": true
      }]
    }
  }
]
```

## Combining with impersonation

Record the session while also granting Kubernetes RBAC permissions:

```json
"grants": [
  {
    "src": ["group:engineering"],
    "dst": ["tag:k8s-operator"],
    "app": {
      "tailscale.com/cap/kubernetes": [{
        "impersonate": { "groups": ["system:masters"] },
        "recorder": ["tag:tsrecorder"]
      }]
    }
  }
]
```

## Enable API request event recording

> **Note:**
>
> API request event recording is in beta.

Add `"enableEvents": true` to record all Kubernetes API requests in addition to kubectl sessions:

```json
"acls": [
  {
    "action": "accept",
    "src": ["group:engineering"],
    "dst": ["tag:k8s-operator:443"]
  }
],
"grants": [
  {
    "src": ["group:engineering"],
    "dst": ["tag:k8s-operator"],
    "app": {
      "tailscale.com/cap/kubernetes": [{
        "recorder": ["tag:tsrecorder"],
        "enableEvents": true
      }]
    }
  }
]
```

Session recording captures more than interactive kubectl sessions. It also records all API requests that pass through the proxy, including `get`, `list`, `create`, and `delete` operations.

## Further exploration

* [Deploy][docs-deploy-tsrecorder] a recorder.
* Understand how session recording works in the [recorder overview][docs-recorder].
* [Configure][docs-auth-rbac] authentication and RBAC.

[docs-api-server-access]: /docs/kubernetes-operator/api-server-access

[docs-auth-rbac]: /docs/kubernetes-operator/api-server-access/auth-and-rbac

[docs-deploy-tsrecorder]: /docs/kubernetes-operator/recorder/deploy-tsrecorder

[docs-grants]: /docs/features/access-control/grants

[docs-k8s-install]: /docs/kubernetes-operator/install-operator

[docs-recorder]: /docs/kubernetes-operator/recorder
