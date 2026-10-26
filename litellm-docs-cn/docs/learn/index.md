---
title: 学习 LiteLLM
sidebar_label: 学习
slug: /learn
---

import NavigationCards from '@site/src/components/NavigationCards';
import {IconCourse, IconEnterprise, IconGateway, IconGuides, IconKey, IconLogs, IconProviders, IconRoute, IconSdk, IconSteps, IconStream, IconTools} from '@site/src/components/Conversion/icons';

LiteLLM 为 100 多家 LLM 提供商（provider）提供一个 OpenAI 兼容接口。从最贴合你当前环境的路径开始。

<NavigationCards
columns={1}
items={[
  {
    title: "LiteLLM Academy",
    description: "从互动课程开始，掌握每位平台管理员都需要的基础知识：从网关（gateway）配置、访问控制，到路由与可观测性。",
    ctaLabel: "开始使用",
    to: "https://litellm.ai/course",
  },
]}
/>

---

## 从这里开始

先选定一条路径。

<NavigationCards
columns={3}
items={[
  {
    icon: <IconSdk />,
    title: "SDK 快速上手",
    description: "在应用代码中直接使用 LiteLLM。",
    listDescription: [
      "安装",
      "首个请求",
      "更多 SDK 功能",
    ],
    to: "/docs/learn/sdk_quickstart",
  },
  {
    icon: <IconGateway />,
    title: "网关快速上手",
    description: "将 LiteLLM 作为共享网关运行。",
    listDescription: [
      "启动代理",
      "添加模型与密钥",
      "连接客户端",
    ],
    to: "/docs/learn/gateway_quickstart",
  },
  {
    icon: <IconEnterprise />,
    title: "企业版快速上手",
    description: "LiteLLM 企业版快速上手指南：LLM、MCP（Model Context Protocol）与 Agent 网关。",
    listDescription: [
      "凭许可证部署",
      "验证三大网关",
      "启用企业版管控",
    ],
    to: "/docs/learn/enterprise_quickstart",
  },
]}
/>

---

## 常见任务

直接跳转到具体任务。

<NavigationCards
columns={3}
items={[
  {
    icon: <IconStream />,
    title: "流式响应",
    description: "令牌边生成边返回。",
    to: "/docs/guides/core_request_response_patterns",
  },
  {
    icon: <IconTools />,
    title: "使用工具",
    description: "为应用接入函数调用（function calling）。",
    to: "/docs/guides/tools_integrations",
  },
  {
    icon: <IconRoute />,
    title: "添加路由",
    description: "重试、回退与负载均衡。",
    to: "/docs/routing-load-balancing",
  },
  {
    icon: <IconKey />,
    title: "配置密钥",
    description: "网关认证、虚拟密钥（virtual key）与访问控制。",
    to: "/docs/proxy/virtual_keys",
  },
  {
    icon: <IconLogs />,
    title: "添加日志",
    description: "记录请求日志与花费数据。",
    to: "/docs/proxy/logging",
  },
  {
    icon: <IconProviders />,
    title: "选择提供商",
    description: "查找各提供商的认证方式与参数。",
    to: "/docs/providers",
  },
]}
/>

---

## 文档地图

已经清楚自己要找哪类文档时，看这里。

<NavigationCards
columns={3}
items={[
  {
    icon: <IconCourse />,
    title: "LiteLLM Academy",
    description: "引导式课程，讲解网关如何处理请求、路由、访问与成本。",
    to: "https://litellm.ai/course",
  },
  {
    icon: <IconGuides />,
    title: "指南",
    description: "功能参考。",
    to: "/docs/guides",
  },
  {
    icon: <IconSteps />,
    title: "教程",
    description: "分步集成实操。",
    to: "/docs/tutorials",
  },
]}
/>

不知道从哪开始？写应用代码看 [SDK 快速上手](/docs/learn/sdk_quickstart)，搭建共享基础设施看 [网关快速上手](/docs/learn/gateway_quickstart)，试用或做 PoC 评估看 [企业版快速上手](/docs/learn/enterprise_quickstart)。
