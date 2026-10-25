---
title: "发布阶段"
description: "了解 Tailscale 的发布阶段。"
---

最后验证于 Mar 25, 2025

Tailscale 的功能会经历多个发布阶段：Alpha、Beta 和正式发布（General Availability，GA）。使用这些功能须遵守我们的[服务条款][co-terms]。

## 发布阶段

### Alpha

该功能可供测试。Alpha 版发布可能是公开的，也可能是私有的。该功能的需求和范围可能发生变化，并需要收集反馈。Alpha 版发布不一定功能完备，可能无法在所有平台上运行，在 UI、CLI 或 API 中可能不具备完整功能，也可能没有文档。Alpha 版发布不承担技术支持义务。

### Beta

该功能公开可用于测试环境。该功能需要打磨和更广泛的测试，以确认它满足用户需求。Beta 版发布配有文档，其中会说明功能或平台支持方面的已知缺口。Beta 版发布不承担技术支持义务。

### 正式发布（GA）

该功能已公开可用，可投入生产使用。GA 功能适用技术支持义务。

## 对比矩阵

|                    | **Alpha**                                           | **Beta**                                                                                                                               | **GA**                               |
| ------------------ | --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| 可用性             | 可能公开或私有                                      | 公开                                                                                                                                   | 公开                                 |
| 破坏性变更         | 是                                                  | 是，但会提前告知                                                                                                                       | 否                                   |
| 已知问题           | 重大                                                | 轻微                                                                                                                                   | 一般缺陷                             |
| 平台支持           | 可能仅支持一个平台                                  | 默认在所有受支持的平台上可用。任何限制都会写入文档，以便在未来更新中解决。                                                              | 可在所有目标平台上运行               |
| UI/CLI/API 支持    | 用户体验可能受限                                    | 用户体验可能受限                                                                                                                       | 在所有目标交互界面中均可用           |
| 文档               | 不公开，或非常有限                                  | 有，但可能不完整                                                                                                                       | 有                                   |
| 服务保证           | 受[现有服务条款][co-terms]约束                      | 不适用                                                                                                                                 | 不适用                               |
| 默认开启           | 否                                                  | 对新 tailnet 可能默认开启                                                                                                              | 对新旧 tailnet 都可能默认开启        |

## Alpha 和 Beta 发布阶段标识

### Tailscale 管理控制台

在 Tailscale [管理控制台][docs-terminology-admin-console]中，对于处于 Alpha 或 Beta 阶段的功能，UI 会显示一个发布阶段标识。

*（图：某功能的发布阶段标识。）*

### Tailscale CLI

在 [Tailscale CLI][docs-cli] 中，对于处于 Alpha 或 Beta 阶段的命令或子命令，`--help` 文本会显示其发布阶段。

### Tailscale 文档

在 [Tailscale 文档][docs-docs]中，对于处于 Alpha 或 Beta 阶段的功能，其主题页面会显示表明发布阶段的文字。

*（图：文档中某功能的发布阶段标识。）*

对于处于 Alpha 或 Beta 阶段的 Tailscale CLI 命令或子命令，其文档同样会显示发布阶段。

## Tailscale Community Projects

[Tailscale Community Projects][docs-community-projects] 是一个经过精选的集合，收录基于 Tailscale 平台构建、由社区支持的开源项目。这些项目展示了如何利用 Tailscale 的网络与身份原语，为组织和社区构建安全、私密的工具。

有关 Tailscale Community Projects [目录][co-community-projects]中各项目的支持情况，请参阅我们特别条款中的 [Tailscale Community Projects][co-special-terms-community-projects] 部分。

[co-community-projects]: https://tailscale.com/community/community-projects

[co-special-terms-community-projects]: https://tailscale.com/special-terms#community-projects

[co-terms]: https://tailscale.com/terms

[docs-cli]: /docs/reference/tailscale-cli

[docs-community-projects]: /docs/reference/tailscale-community-projects

[docs-docs]: /docs

[docs-terminology-admin-console]: /docs/reference/glossary#管理控制台
