---
title: 指南
sidebar_label: 概览
---

import NavigationCards from '@site/src/components/NavigationCards';

**指南**是围绕你用 LiteLLM 要完成的任务组织的专题参考：发起请求、使用工具、处理多媒体、管理上下文，以及安全地运维网关（gateway）。

> 刚接触 LiteLLM，还不确定该先走 SDK 还是网关路线？请从[入门 →](/docs/learn)开始

---

## 使用 LiteLLM 构建

<NavigationCards
columns={3}
items={[
  {
    icon: "⚡",
    title: "核心请求",
    description: "流式、批处理、结构化输出与推理行为。",
    to: "/docs/guides/core_request_response_patterns",
  },
  {
    icon: "🛠️",
    title: "工具调用",
    description: "函数调用、Web 工具、拦截模式、计算机使用、代码解释器与工具调用规范。",
    to: "/docs/guides/tools_integrations",
  },
  {
    icon: "🖼️",
    title: "多模态 I/O",
    description: "视觉、音频、PDF、图像生成与视频生成。",
    to: "/docs/guides/multimodal_io",
  },
  {
    icon: "📚",
    title: "检索与知识",
    description: "向量存储、文件搜索、引用标注与知识库路由。",
    to: "/docs/guides/retrieval_knowledge",
  },
  {
    icon: "🧠",
    title: "提示词与上下文",
    description: "提示词缓存、裁剪、格式化、助手预填充（prefill）与预测输出。",
    to: "/docs/guides/prompts_context",
  },
]}
/>

---

## 运维与扩展

<NavigationCards
columns={3}
items={[
  {
    icon: "🎛️",
    title: "兼容性与扩展性",
    description: "提供商专属参数、模型别名、微调模型与适配器。",
    to: "/docs/guides/compatibility_extensibility",
  },
  {
    icon: "🧪",
    title: "可靠性、测试与花费",
    description: "重试、回退、模拟响应与预算控制。",
    to: "/docs/guides/reliability_testing_spend",
  },
  {
    icon: "🔒",
    title: "安全与网络",
    description: "SSL、自定义 CA 证书包、HTTP 代理设置与分服务校验。",
    to: "/docs/guides/security_network",
  },
]}
/>
