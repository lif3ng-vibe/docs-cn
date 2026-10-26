---
title: "设置 Lens"
description: "在 LiteLLM 仪表板中使用 Lens，或将其部署为独立应用。"
slug: "/proxy/lens/deployment"
---

# 设置 Lens

Lens 让你查看智能体（agent）追踪记录、排查故障，并把有价值的运行保存为数据集。你可以在 LiteLLM 仪表板中打开它，也可以将其作为独立应用使用。

无论哪种方式，Lens 都以独立服务运行，数据存储在 ClickHouse 中。你的智能体可以继续使用现有的模型提供商。

## 选择你的起点 {#new-deployment}

| 你的起点 | 对应指南 |
| --- | --- |
| 你在用 LiteLLM，想把 Lens 加进它的侧边栏 | [将 Lens 加入 LiteLLM](./deployment/litellm.md) |
| 你已经在运行 Lens，想把它连接到网关 | [连接你现有的 Lens 部署](./deployment/litellm.md#1-获取-lens-地址) |
| 你想在没有网关的情况下运行 Lens | [启动独立 Lens](./deployment/local.md) |
| 你的团队已经搭好了 Lens | [发送你的第一条追踪记录](./first-trace.md) |

如需持久化的独立部署，可在[服务器上用 Docker Compose](./deployment/server.md)，或使用 [Kubernetes](./deployment/kubernetes.md)。本地快速上手从源码构建。发布状态见[版本与镜像](./deployment/releases.md)。

## 在 LiteLLM 中使用 Lens {#configure-an-existing-proxy}

网关管理员只需配置一次连接。之后，用户在 LiteLLM 侧边栏打开 **Lens**，沿用自己现有的 LiteLLM 会话即可，无需输入独立 Lens 的管理员令牌。LiteLLM 会把用户的身份和访问范围提供给 Lens。

如果尚未配置 Lens，仪表板会显示它的设置页面。接入这项服务并不会自动为你的智能体接入追踪。连接就绪后，再从智能体发送一条追踪记录。

按照 [将 Lens 加入 LiteLLM](./deployment/litellm.md) 操作。如果 Lens 已经在运行，就沿用它现有的地址、存储和凭据，不需要再安装一份副本，也不用迁移数据。

## 独立使用 Lens

启动 Lens 和 ClickHouse，然后在 Lens 的 URL 处用管理员令牌登录。这种模式既不需要 LiteLLM 网关，也不需要 PostgreSQL。在配置分析模型之前，你就可以记录并查看追踪记录。

按照[独立部署快速上手](./deployment/local.md)操作。需要进行排查分析时，再添加一个[分析模型](https://github.com/BerriAI/lens/blob/main/docs/analysis.md)。

## 检查首个结果 {#check-the-installation}

打开 Lens，生成一个追踪密钥（tracing key），然后按照 [发送你的第一条追踪记录](./first-trace.md) 操作。打开生成的这次运行，检查其中的内容。健康检查通过，说明服务已就绪；追踪记录成功入库，说明你的导出器（exporter）能正常发送数据，而你也能正常读到它。

如需编码智能体（coding agent）帮忙，可以复制 [Lens 设置指南](https://github.com/BerriAI/lens/blob/main/docs/setup-with-agent.md) 中的 **Set it up for me**（帮我完成设置）提示词。它覆盖独立部署、接入已有网关以及连接智能体这几类场景。
