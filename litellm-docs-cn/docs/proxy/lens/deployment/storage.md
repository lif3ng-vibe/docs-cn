---
title: "存储与密钥"
description: "配置受支持的 ClickHouse 存储、Lens 凭据与 GitOps。"
slug: "/proxy/lens/deployment/storage"
---

# 存储与密钥

独立版 Lens starter 和 Helm chart 都自带 ClickHouse 与 Keeper，并会生成私有凭据。如果需要接入外部存储或自行提供密钥，请使用本页。完整的存储要求以 [Lens Helm 指南](https://github.com/BerriAI/lens/blob/main/helm/lens/README.md#use-existing-clickhouse) 为准。

## ClickHouse 连接 {#clickhouse-connection}

使用 ClickHouse 的 HTTP(S) 端点（endpoint），凭据中的特殊字符需进行 URL 编码：

```text
https://lens_user:URL_ENCODED_PASSWORD@clickhouse.example.com:8443
```

私有 HTTP 端口通常是 8123；9000 端口走的是原生协议，并非 Lens 的 HTTP 连接。请将该 URL 保存在密钥管理器（secret manager）中。独立版 Lens 默认使用数据库 `lens`；已有的网关安装可以继续沿用 `litellm`。请保留存放记录的数据库。

Lens 在接收请求之前会先初始化自身的 schema 和应用状态。其凭据必须允许创建数据库、表和物化视图，并拥有读取、插入与变更（alter）权限，才能完成发布和清理。只读的分析账号无法运行 Lens。

## 外部 ClickHouse {#external-clickhouse}

受支持的外部存储形式是：一个稳定端点指向一台 ClickHouse 服务器，并由各个 Lens 副本共享。该服务器必须支持 KeeperMap，运行 Keeper 并配置好 `keeper_map_path_prefix`。单服务器场景请以[内置的 Keeper 配置](https://github.com/BerriAI/lens/blob/main/deploy/clickhouse/keeper.xml)为参考。

Lens 的负载（payload）表只存在于该服务器本地，共享的 Keeper 不会在 ClickHouse 节点之间复制它们。多服务器负载均衡（load balancing）、分布式表，以及自动故障转移到另一台 ClickHouse 服务器，均不受支持。在选择托管数据库之前，请先确认提供商（provider）实际支持的引擎、协调机制与权限。

对于独立的 Helm 安装，请新建一个包含带认证信息 URL 的 Kubernetes Secret，然后在顶层引用它：

```yaml
clickhouseSecret:
  name: lens-clickhouse
  key: url
clickhouseDatabase: lens
retentionDays: 14
```

这一引用会停用内置的 ClickHouse 资源，请填入你实际的 Secret 名和数据库名。当 Lens 由网关 chart 托管时，对应的配置项放在 `lensWorker` 之下。备份与恢复时，请将 ClickHouse 负载和 Keeper 元数据（metadata）放在一起处理。

## 服务与管理员凭据 {#service-token}

独立 chart 在拥有集群访问权限的 Helm 安装中可以自动生成管理员凭据。如果要自行提供，请新建一个 Secret 并设置：

```yaml
adminTokenSecret:
  name: lens-admin
  key: admin-token
```

接入网关还需要[服务与签名凭据](https://github.com/BerriAI/lens/blob/main/helm/lens/README.md#connect-a-gateway)。两个服务应复用同一组值，每个至少 32 个字符。这些凭据与管理员令牌、agent 追踪密钥以及模型提供商密钥相互独立。

升级时请保留现有密钥。旧的 worker 注册令牌属于上一个网关控制平面，无法为新的独立运行时授权。

## GitOps {#gitops}

没有集群访问权限的 Helm 渲染器无法借助 `lookup` 在多次渲染之间保留已生成的密钥。采用这种流程时，请在应用同步之前，先通过密钥管理器准备好 Lens 管理员凭据和外部 ClickHouse 连接；如果还要接入网关，也请一并准备好其服务与签名凭据。

请在 `adminTokenSecret`、`clickhouseSecret` 以及可选的网关配置项中引用已有的 Secret，不要把明文值提交进仓库。镜像或 chart 制品的挑选与版本固定应独立于网关进行，每个资源只保留一个 release 或应用所有者。

对于已有安装，在更换控制器之前，请先完成[写入端迁移](https://github.com/BerriAI/lens/blob/main/docs/migration.md)和[资源所有权转移](https://github.com/BerriAI/lens/blob/main/helm/lens/README.md#select-versions-independently)。交接完成后，请验证已存储的追踪记录（trace）、数据集和调查记录。
