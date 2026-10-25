---
title: "在 Kubernetes 集群中部署会话录制器"
description: "本指南介绍如何在你的集群中部署 `tsrecorder` 实例。Operator 使用 `Recorder` 自定义资源来配置并管理该 `tsrecorder` 实例的生命周期。"
---

最后验证于 Jun 5, 2026

本指南介绍如何在你的集群中部署一个 `tsrecorder` 实例。Operator 使用 `Recorder` 自定义资源来配置并管理该 `tsrecorder` 实例的生命周期。

## 前提条件

开始之前，请确保你具备以下条件：

* [安装][docs-k8s-install] Tailscale Kubernetes Operator。
* Operator 的标签必须是你的 tailnet 策略文件中录制器标签的所有者。示例见下一节。
* （可选）如果你想使用录制器的 web UI，请为你的 tailnet [启用 HTTPS][docs-enable-https]。

## 配置标签所有权

Operator 的标签必须是你的 tailnet 策略文件中录制器标签的所有者。例如，如果 Operator 打有 `tag:k8s-operator` 标签，而你的录制器使用 `tag:tsrecorder`，请在 tailnet 策略文件中添加以下内容：

```json
"tagOwners": {
  "tag:k8s-operator": [],
  "tag:tsrecorder": ["tag:k8s-operator"]
}
```

## 创建录制器

应用以下清单来创建一个 `Recorder` 资源：

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

`tags` 字段设置录制器设备在你的 tailnet 中的 Tailscale 身份。当你[配置会话录制][docs-kubectl-recording]时，授权会引用这些标签，告诉控制平面哪些 `tsrecorder` 实例应接收录制。

设置 `enableUI: true` 可启用录制器的 web UI，让你能够在浏览器中浏览和查看录制内容。

## 验证会话录制

等待录制器就绪：

```shell
kubectl wait --for condition=RecorderReady=true Recorder my-recorder
```

查找录制器 web UI 的 URL：

```shell
kubectl get Recorder my-recorder
```

```
NAME          STATUS            URL
my-recorder   RecorderCreated   https://my-recorder.<tailnet>.ts.net
```

## 配置存储

### 临时文件系统（默认）

录制内容存储在 `emptyDir` 卷中。这适合测试，但 pod 被删除后日志会丢失。无需额外配置。

### S3 兼容对象存储

对于生产环境，请配置 S3 兼容存储以确保持久、长期的保存：

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

被引用的 `Secret` 必须包含你的 S3 兼容服务商所需的凭证。

### 服务账户的 IAM 角色（IRSA）

在 EKS 上，你可以使用服务账户的 IAM 角色（IRSA）来代替静态凭证，避免把长期有效的 AWS 凭证存进 `Secret`。

1. 按照 [AWS 的 IRSA 说明][xt-aws-irsa]操作。选择 `ServiceAccount` 名称和命名空间时，请使用 Operator 的命名空间（通常是 `tailscale`）和录制器的名称。

2. 使用 `.spec.statefulSet.pod.serviceAccount` 为录制器的服务账户注解 IAM 角色：

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

## 进一步探索

* [配置][docs-kubectl-recording] kubectl 会话录制。
* 在[录制器概述][docs-recorder]中了解会话录制的工作原理。

[docs-enable-https]: /docs/how-to/set-up-https-certificates

[docs-k8s-install]: /docs/kubernetes-operator/install-operator

[docs-kubectl-recording]: /docs/kubernetes-operator/recorder/kubectl-session-recording

[docs-recorder]: /docs/kubernetes-operator/recorder

[xt-aws-irsa]: https://docs.aws.amazon.com/eks/latest/userguide/iam-roles-for-service-accounts.html
