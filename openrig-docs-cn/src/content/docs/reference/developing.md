---
title: "开发 OpenRig——门禁与通道"
---

本文面向贡献者，说明哪些检查会阻塞（BLOCK）一次变更、哪些仅供参考。在当前 tip 上没有外部 CI：根 `package.json` 的脚本链本身就是门禁（gate），发布清单调用的正是它。

## 阻塞门禁（候选变更推进前必须通过）

| 门禁 | 命令 | 覆盖范围 |
|---|---|---|
| 类型检查 | `npm run lint` | daemon + **ui** + cli + tui 的 tsconfig——UI 类型检查保持阻塞地位 |
| 构建 | `npm run build` | 所有 workspace——UI dist 随包分发，因此其构建保持阻塞地位 |
| 仓库脚本 | `npm run test:repo` | 脚本自测、文档守卫、skill 镜像检查 |
| 单元测试 | `npm run test:workspaces` | `packages/daemon` + `packages/cli` + `packages/tui` |

`npm test` 会运行 `test:repo` 与 `test:workspaces`——阻塞集合在脚本本身里可读。

## 参考通道

| 通道 | 命令 | 含义 |
|---|---|---|
| UI 单元测试 | `npm run test:ui` | 可随时运行 `packages/ui` 的 vitest；不属于 `npm test` |

## 现行约定（web UI 在 0.5.0 冻结）

守护进程 API 变更不再要求 UI 同步或 UI 验证；`packages/ui/src/hooks/` 下的契约镜像不再主动维护；新出现的 `test:ui` 失败表明 API 契约发生了变动，而不是门禁损坏。

web UI 的浏览器/交互测试不是贡献者门禁。（随包分发的、驱动 UI 的 starter-rig 智能体技能是面向用户 rig 的产品内容，不属于本仓库的门禁。）

## 措辞规则

web UI 是**实验性**的，处于**维护模式**，按**尽力而为**提供支持；**CLI 才是主体**。没有计划中的移除，欢迎 PR。描述 UI 时使用的终局（end-of-life）措辞不得强过本节的用词。
