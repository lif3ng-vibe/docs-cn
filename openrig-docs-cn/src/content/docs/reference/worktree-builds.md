---
title: "worktree 构建：每个 worktree 各自安装，绝不 symlink `node_modules`"
---

**登记为**构建摩擦（一次 TS2688 `@types/node` 失败）。**核实为**更糟糕的东西：那个绕过安装的 symlink 捷径，会让构建与类型检查静默消费另一棵树的源码——一个假绿生成器，不是小麻烦。

## 实际发生什么

在 worktree 里运行 `npm install` 会把 `node_modules/@openrig/<pkg>` 创建为相对 symlink（`-> ../../packages/<pkg>`）。相对链接按其所在目录解析，因此：

| 配置 | `@openrig/daemon` 解析到 | 结论 |
|---|---|---|
| 每个 worktree 各自 `npm install` | 该 worktree 自己的 `packages/daemon` | 正确 |
| `ln -s <primary>/node_modules node_modules` | **主树（PRIMARY）的** `packages/daemon` | **跨树（cross-tree）** |

以判别实验验证，而非凭推断：在 symlink 的 `node_modules` 下，一个故意引入 WORKTREE 的 `packages/daemon` 中的类型错误，会被该包自己的 `tsc` 看到，却不会被 `packages/cli` 的 `tsc` 看到——后者退出码为 0，因为它类型检查的是主树的 daemon。因此一个 worktree 可以对它并不包含的代码报绿。

## 规则

1. **在每个 worktree 里运行 `npm install`**，让工作区包解析到该 worktree 自己的源码。
2. **绝不从主检出 symlink `node_modules`**。它看起来能用——构建通过、类型检查通过——而这正是危险所在。
3. **没有 `node_modules` 时 `npx tsc` 会安装一个无关的 `tsc` 包**，并打印"This is not the tsc command you are looking for"。这条消息的意思是*没有安装*，而不是 TypeScript 错误。
4. **在新的 worktree 中，先构建 `@openrig/daemon` 再类型检查 `@openrig/cli`**：cli 导入 `@openrig/daemon/crash-cart` 等，它们解析到 daemon 的 `dist`。缺失 dist 会表现为 TS2307 "Cannot find module" 加上一连串 implicit-any——这是环境未备好的伪影，不是代码缺陷。

## 信任任何 worktree 构建之前的自检

    [ "$(readlink -f packages/daemon)" = "$(readlink -f node_modules/@openrig/daemon)" ] \
      || echo "CROSS-TREE: this worktree resolves @openrig/* into another tree"
