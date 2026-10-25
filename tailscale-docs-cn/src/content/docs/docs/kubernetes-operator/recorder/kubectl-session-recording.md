---
title: "录制 kubectl 会话"
description: "本指南介绍如何在 tailnet 策略文件中配置[授权（grant）][docs-grants]来启用 kubectl 会话录制。授权决定哪些用户或设备的会话会被录制、由哪个 `t"
---

最后验证于 Jun 5, 2026

本指南介绍如何在 tailnet 策略文件中配置[授权（grant）][docs-grants]来启用 kubectl 会话录制。授权决定哪些用户或设备的会话会被录制、由哪个 `tsrecorder` 实例接收录制，以及是否强制录制。

## 前提条件

开始之前，请确保你具备以下条件：

* [安装 Tailscale Kubernetes Operator][docs-k8s-install]。
* [部署一个录制器][docs-deploy-tsrecorder]。
* 在你的集群中配置了 [API 服务器代理][docs-api-server-access]。

## 基本录制

录制 `group:engineering` 连接到任何打有 `tag:k8s-operator` 标签的代理的会话：

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

## 强制录制

把 `enforceRecorder` 设置为 `true`，在录制器不可达时阻止会话：

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

## 与身份模拟结合使用

在录制会话的同时授予 Kubernetes RBAC 权限：

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

## 启用 API 请求事件录制

> **注意：**
>
> API 请求事件录制目前处于测试阶段。

添加 `"enableEvents": true`，在 kubectl 会话之外同时录制所有 Kubernetes API 请求：

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

会话录制能捕获的不只是交互式 kubectl 会话。它还会记录所有经过代理的 API 请求，包括 `get`、`list`、`create` 和 `delete` 操作。

## 进一步探索

* [部署][docs-deploy-tsrecorder]一个录制器。
* 在[录制器概述][docs-recorder]中了解会话录制的工作原理。
* [配置][docs-auth-rbac]身份验证和 RBAC。

[docs-api-server-access]: /docs/kubernetes-operator/api-server-access

[docs-auth-rbac]: /docs/kubernetes-operator/api-server-access/auth-and-rbac

[docs-deploy-tsrecorder]: /docs/kubernetes-operator/recorder/deploy-tsrecorder

[docs-grants]: /docs/features/access-control/grants

[docs-k8s-install]: /docs/kubernetes-operator/install-operator

[docs-recorder]: /docs/kubernetes-operator/recorder
