---
title: "版本发布与镜像"
description: "了解 Lens 与 LiteLLM 的配套发布、独立部署方式以及源码构建。"
slug: "/proxy/lens/deployment/releases"
---

# 版本发布与镜像

Lens 可以独立运行。若要手动搭建，请参考[源码快速上手](./local.md)，或构建[源码 Helm chart](./kubernetes.md#new-deployment)。

截至 2026 年 10 月 9 日，Lens 仓库还没有发布过任何 GitHub release。最新的 LiteLLM 预发布版本 `v1.106.0-dev.3` 发布于独立 Lens 集成合入 [PR #45529](https://github.com/BerriAI/litellm/pull/45529) 之前。网关连接相关步骤不要使用该版本，这些步骤需要一个包含该集成的构建。在准备好网关构建之前，独立运行的 Lens 仍然可用。

发布流水线会以相同版本号构建官方配套的 Lens 与 LiteLLM 产物，并对二者一起测试。这并不意味着这些产物已经发布。选定版本之前，请先查看 [Lens 发布页](https://github.com/BerriAI/lens/releases)和 [LiteLLM 发布页](https://github.com/BerriAI/litellm/releases)。

LiteLLM 内置的 Lens UI 属于网关构建的一部分。单独更新 Lens 后端不会替换这个内嵌 UI；升级 LiteLLM 时，已有的外部 Lens 部署也不会随之升级，需要走它自己的发布流程来部署。

## 容器镜像 {#container-images}

源码构建时，先克隆 [BerriAI/lens](https://github.com/BerriAI/lens)，记下所选的 commit，然后参照[从源码构建](./development.md#尝试后端改动)操作。当前的运行时 Dockerfile 是 `deploy/runtime/Dockerfile`，用 `LENS_VERSION` 提供开发版本号。官方配套构建使用 LiteLLM 计算出的发布版本号，包括其 dev 或 RC 后缀

使用已发布的产物之前，请到 [Lens 发布页](https://github.com/BerriAI/lens/releases)核对确切的镜像 digest 与签名的发布清单，并按该 release 页面的说明校验清单、来源身份和产物校验和。把选定的 digest 固定到部署配置中，并保留旧镜像以便回退。

已有安装可能仍保留着含 `litellm-lens-worker` 的部署名或镜像仓库名。沿用旧名称并不代表它与独立运行时兼容，请核查所选的源码与 release 元数据。

## Helm chart {#helm-charts}

独立版 chart 位于 [Lens 仓库](https://github.com/BerriAI/lens/tree/main/helm/lens)。正式发布后会使用 `oci://ghcr.io/berriai/charts/lens`，并附带确切的 chart 版本与经过校验的镜像 digest。在该 release 出现之前，请按照[源码 chart 安装](./kubernetes.md#new-deployment)的说明，使用自己构建并推送到可访问仓库的镜像。

要将 Lens 嵌入网关，请继续使用现有的 LiteLLM chart 系列，并选择包含兼容适配器和共享 Lens chart 的版本。配套发布会把 Lens 镜像 digest 和按该版本构建的 chart 固定下来。采用之前，先检查 chart 的实际 values 与该版本的发布验证情况。

## 源码 chart {#source-charts}

源码 chart 的默认镜像 tag 是开发用途的值，registry 中未必存在。请基于你构建的产物提供 `image.repository` 与 `image.tag`，或 `image.digest`。完整的源码构建与安装命令以 [Helm 指南](https://github.com/BerriAI/lens/blob/main/helm/lens/README.md)为准。

对已有的 Lens 部署来说，替换镜像或 chart 时同样需要执行[升级与迁移检查](./upgrades.md)，并保持存储、密钥、访问范围和 release 归属不变。
