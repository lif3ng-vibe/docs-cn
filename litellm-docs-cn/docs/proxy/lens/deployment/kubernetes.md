---
title: "Kubernetes"
description: "独立部署 Lens：使用专属 Helm chart，并可选接入 LiteLLM。"
slug: "/proxy/lens/deployment/kubernetes"
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Kubernetes

[Lens Helm chart](https://github.com/BerriAI/lens/blob/main/helm/lens/README.md) 会部署完整的 Lens UI、Rust API 和后台处理，并附带 ClickHouse 与 Keeper。这种源码安装方式使用公开的 Lens 仓库，需要准备 Kubernetes 集群、Helm、kubectl，以及供持久卷使用的存储类。独立运行的 Lens 不需要网关，也不需要 PostgreSQL

如需编码代理（coding agent）协助，可使用[让它替你完成部署](https://github.com/BerriAI/lens/blob/main/docs/setup-with-agent.md)，并指定使用 Helm

## 新部署 {#new-deployment}

在独立发行版发布之前，需要自行构建源码镜像，并推送到集群可读取的镜像仓库。请使用与集群节点 Linux 架构匹配的原生构建器。在全新克隆的 [BerriAI/lens](https://github.com/BerriAI/lens) 中，把示例仓库与团队名替换掉：

```sh
LENS_IMAGE_REPOSITORY=registry.example.com/your-team/lens
LENS_IMAGE_TAG=$(git rev-parse HEAD)
docker build --build-arg LENS_VERSION="$LENS_IMAGE_TAG" -f deploy/runtime/Dockerfile \
  -t "$LENS_IMAGE_REPOSITORY:$LENS_IMAGE_TAG" .
docker push "$LENS_IMAGE_REPOSITORY:$LENS_IMAGE_TAG"
helm upgrade --install lens ./helm/lens --namespace lens --create-namespace \
  --set image.repository="$LENS_IMAGE_REPOSITORY" --set image.tag="$LENS_IMAGE_TAG"
kubectl --namespace lens port-forward service/lens 4318:4318
```

如果镜像仓库是私有的，请先配置镜像拉取凭证。然后打开 `http://localhost:4318/ui/`，并在本地获取生成的登录凭证：

```sh
kubectl --namespace lens get secret lens-admin \
  -o jsonpath='{.data.admin-token}' | base64 --decode
```

请妥善保管该凭证。升级时 Helm 会复用已生成的凭证，卸载时也会保留凭证和 ClickHouse 卷。在把 Lens 暴露给代理之前，请按照 [Helm 指南](https://github.com/BerriAI/lens/blob/main/helm/lens/README.md)配置 `publicUrl`、HTTPS ingress 以及可达的数据接入地址

如果使用[外部 ClickHouse](./storage.md#external-clickhouse)，需要提供一个稳定端点，指向启用了 KeeperMap 的单台服务器。多个 Lens 副本可以共用这台服务器。多服务器负载均衡，以及自动故障转移到另一台 ClickHouse 服务器，都不在受支持的范围之内

## 接入已有的 LiteLLM 部署 {#existing-deployment}

当 Lens 已经运行在自己的 release 中，或部署在 Render 这类平台上时，请使用 **external** 模式。这样可以让网关直接连接 Lens，而不必再部署一套 Lens 和 ClickHouse 实例。

先完成[在 LiteLLM 中添加 Lens 的第 1–3 步](./litellm.md#1-获取-lens-地址)。网关必须已具备该指南所述的适配器和 UI。现有的网关 chart 系列、release 名称、命名空间和模型配置都保持不变。

### 1. 保存连接密钥

使用你的 Kubernetes 密钥管理器，在**网关所在命名空间**创建 `lens-connection`，包含以下键：

| Secret 键 | 对应 Lens 中的值 |
| --- | --- |
| `service-token` | `LITELLM_LENS_SERVICE_TOKEN` |
| `gateway-secret` | `LENS_GATEWAY_SECRET` |

手动配置时，把两个值分别保存到名为 `service-token` 和 `gateway-secret` 的私密文件中，结尾不要带换行符。接着设置命名空间并创建 Secret：

```sh
export GATEWAY_NAMESPACE="YOUR_GATEWAY_NAMESPACE"
kubectl --namespace "$GATEWAY_NAMESPACE" create secret generic lens-connection \
  --from-file=service-token=./service-token \
  --from-file=gateway-secret=./gateway-secret
```

如果这个 Secret 已存在，确认取值与 Lens 一致后可直接复用。不要把这些文件提交进 Git。走 GitOps 流程时，通过现有的密钥管理控制器来声明该 Secret。

### 2. 添加 Lens 配置

把下面的内容保存为 `lens-connection.yaml`，并填入你现有 Lens 服务的地址：

```yaml
lensWorker:
  mode: external
  externalUrl: https://lens.example.com
  publicUrl: https://lens.example.com
  serviceTokenSecret:
    name: lens-connection
    key: service-token
  gateway:
    secretName: lens-connection
    secretKey: gateway-secret
```

`externalUrl` 必须是网关可访问的地址，`publicUrl` 必须是代理导出器可访问的地址。两个地址都不包含 `/ui/` 或 `/v1/traces`。

在同一个文件中添加追踪存储配置，按你使用的 chart 选择对应代码块：

<Tabs groupId="litellm-chart">
<TabItem value="combined" label="litellm-helm chart">

```yaml
proxy_config:
  general_settings:
    tracing:
      store:
        type: lens
```

</TabItem>
<TabItem value="split" label="组件化 litellm chart">

```yaml
gateway:
  config:
    proxy_config:
      general_settings:
        tracing:
          store:
            type: lens
```

</TabItem>
</Tabs>

如果你的部署改为从外部 ConfigMap 提供 `config.yaml`，则通过其现有归属方把 `general_settings.tracing.store.type: lens` 加入该文件。

### 3. 应用并验证

把 `GATEWAY_RELEASE` 设为现有的 Helm release 名称，把 `GATEWAY_CHART` 设为网关部署所用同一个兼容的 chart 包或本地 chart 目录。不要中途切换 chart 系列。想查看已安装的 release，可以运行：

```sh
helm list --namespace "$GATEWAY_NAMESPACE"
```

在保留 release 已保存配置的前提下，应用新增的配置：

```sh
export GATEWAY_RELEASE="YOUR_GATEWAY_RELEASE"
export GATEWAY_CHART="PATH_TO_YOUR_EXISTING_CHART_PACKAGE"
helm upgrade "$GATEWAY_RELEASE" "$GATEWAY_CHART" \
  --namespace "$GATEWAY_NAMESPACE" --reuse-values \
  -f lens-connection.yaml --wait
```

这一步会滚动重启网关 Pod，以加载连接配置。走 GitOps 流程时，改为通过常规的评审与同步流程提交配置值和 Secret 引用。

登录 LiteLLM，选择 **Lens**，完成[连接检查](./litellm.md#5-在网关中打开-lens)，然后[发送你的第一条追踪记录](../first-trace.md)。

如果 Lens 已经由网关的 Helm release 拥有，请不要用本流程把它改为 external 模式。先用[所有权转移指南](https://github.com/BerriAI/lens/blob/main/helm/lens/README.md#select-versions-independently)保住它的资源与存储。

## 验证安装结果

以独立部署的示例为例，运行：

```sh
kubectl get pods,services,pvc --namespace lens
kubectl logs --namespace lens deployment/lens --tail=100
```

在独立 Lens 或内嵌的网关页面中完成[首条追踪](../deployment.md#check-the-installation)流程，并使用代理可访问的端点。重启 Lens 后打开一条已存储的追踪记录；如果已配置分析，再验证调查范围是有边界的

请把 ClickHouse 数据与 Keeper 状态纳入同一个恢复计划。[备份指南](https://github.com/BerriAI/lens/blob/main/docs/backup.md)描述了所需的恢复边界；其中的 Compose 辅助工具并不管理 Kubernetes 备份。请使用集群自带的快照与恢复流程，并在恢复完成后核对数据
