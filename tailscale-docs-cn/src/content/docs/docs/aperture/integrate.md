---
title: "与外部工具集成"
description: "将 Aperture 与授权引擎、日志聚合器以及外部服务连接起来。"
---

最后验证于 Sep 29, 2026

Aperture 支持与外部工具集成，用于授权、可观测性和自定义自动化。当请求匹配授权（grant）条件时，可以使用 [Aperture 配置][docs-aperture-configuration]中的 hook 将事件数据发送到第三方服务。内置的可观测性功能请参阅[观察并导出 AI 用量][docs-observe-and-export]。

[**将 Cerbos 与 Aperture 集成**](/docs/aperture/integrate/cerbos)——将 AI 请求数据从 Aperture 发送到 Cerbos，对 LLM 访问做出细粒度授权决策。

[**将 Cribl 与 Aperture 集成**](/docs/aperture/integrate/cribl)——将 AI 用量数据从 Aperture 路由到 Cribl，由其处理并转发到你的可观测性目的地。

[**将 Highflame 与 Aperture 集成**](/docs/aperture/integrate/highflame)——将 Aperture 连接到 Highflame，对 LLM 请求执行同步的请求前强制管控与异步的响应后可观测。

[**管理现有 Oso 集成**](/docs/aperture/integrate/oso)——以 Aperture 管理员身份查看并更新现有 Oso 集成的 hook 与数据共享授权。

[**构建自定义 webhook**](/docs/aperture/how-to/build-custom-webhook)——创建自定义 webhook 集成，把 Aperture 事件数据发送到你自己的服务。

[**Aperture 配方（recipes）**](/docs/aperture/reference/recipes)——在开源 aperture-recipes 仓库中查找、使用并贡献集成指南与示例。

[docs-aperture-configuration]: /docs/aperture/configuration

[docs-observe-and-export]: /docs/aperture/observe-and-export
