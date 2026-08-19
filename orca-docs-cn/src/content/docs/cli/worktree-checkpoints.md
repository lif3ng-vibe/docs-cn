---
title: "Worktree 检查点"
description: "Worktree 检查点——用 worktree 评论字段记录进度快照。"
source: "https://www.onorca.dev/docs/cli/worktree-checkpoints"
---

$undefined

每个 Orca worktree 都带一个轻量的自由文本**评论（comment）**字段，在 UI 中可见——它是 worktree 当前所做工作的状态快照。智能体可以从 CLI 更新它；这是我们把人类协作者保持在环内、又不必强求聊天的推荐模式。

## 这一模式

```
orca worktree set --worktree active --comment "reproduced auth failure; testing credential-chain fix" --json
```

## 卡片状态（可选）

除自由文本评论外，阶段变化时还可以设置工作区卡片状态：

```
orca worktree set --worktree active \
 --comment "fix implemented; running integration tests" \
 --workspace-status in-progress \
 --json
```

状态取值：`todo`、`in-progress`、`in-review`、`completed`（或你的工作区使用的自定义 ID）。

## 适合记录检查点的时机

- 完成了一块有意义的实现。
- 证实或推翻了一个假设。
- 完成了一次代码评审。
- 遇到阻塞（等待外部输入、上游 bug、缺少权限）。
- 从调查转入修复，或从修复转入验证。

## 格式

第一行写动作：刚发生了什么、在哪里、状态或下一步是什么。

```
orca worktree set --worktree active --comment "added debounce to SearchBar onChange (src/components/SearchBar.tsx); ready for review
goal: reduce redundant API calls per #298" --json
```

## 先读后写

如果评论里可能已有用户手写的内容，先读再写，避免覆盖目标或约束：

```
orca worktree current --json
```

保留仍然有效的部分，删掉过期的部分，把你的更新编织进去。
