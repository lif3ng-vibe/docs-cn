---
title: "Aperture 配方（recipes）"
description: "[Aperture recipes][xt-recipes] 是一个开源仓库，由 Tailscale 的 Aperture 团队维护，收录集成指南、示例和模板。它帮助你把第三方服务和工具连接到你的 Aperture 网关"
---

最后验证于 Sep 29, 2026

[Aperture recipes][xt-recipes] 是一个开源仓库，由 Tailscale 的 Aperture 团队维护，收录集成指南、示例和模板。它帮助你把第三方服务和工具连接到你的 Aperture 网关。合作伙伴、供应商和社区成员可以在同一个地方分享集成说明，让其他人无需从零开始就能采用他们的工具。

## 仓库里有什么

配方覆盖四种集成类型：

* **请求前 hook（pre-request hooks）**：在请求到达 LLM 提供商之前检查、修改或拦截请求。
* **响应后 hook（post-response hooks）**：处理已完成的请求，用于记录或审计。
* **提供商（providers）**：把 Aperture 连接到 LLM 提供商或转售商。
* **工具（tools）**：把 Aperture 与开发者工具、平台或工作流配合使用。

每个配方都有一个包含设置说明和示例的 `README.md`。配方可以附带配套脚本或配置文件，但这个仓库不是一组可部署的应用。

## 使用配方

要使用现有集成：

1. 浏览[集成目录][xt-integrations]，找到相关配方。
2. 阅读它的 `README.md`，包括前提条件和安全注意事项。
3. 按设置说明操作，并把配置示例调整到你的环境。
4. 按配方的验证步骤检查集成是否正常工作。

## 贡献配方

要分享一个集成：

1. Fork 该[仓库][xt-recipes]。
2. 把[集成模板][xt-template]复制到相应的类别目录。
3. 按照[贡献指南][xt-contributing]发起 pull request。

hook 类集成请从[协议快速参考][xt-protocol]开始。

Aperture 团队会在合并前审查提交内容。社区配方由其贡献者自行维护，不会自动成为 Aperture 官方文档的一部分。

[xt-recipes]: https://github.com/tailscale/aperture-recipes

[xt-integrations]: https://github.com/tailscale/aperture-recipes/tree/main/integrations

[xt-template]: https://github.com/tailscale/aperture-recipes/blob/main/templates/integration.md

[xt-contributing]: https://github.com/tailscale/aperture-recipes/blob/main/CONTRIBUTING.md

[xt-protocol]: https://github.com/tailscale/aperture-recipes/blob/main/docs/protocol-reference.md
