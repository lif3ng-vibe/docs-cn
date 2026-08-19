---
title: "在 10 个 worktree 之间跳转"
description: "在 10 个 worktree 之间跳转——Orca 文档。"
source: "https://www.onorca.dev/docs/recipes/jump-worktrees"
---

十个 worktree 管理起来不轻松。跳转面板 + Restart 微标 + 智能体状态圆点正是为这个规模而生。

## 步骤

1. `Cmd-J` 打开跳转面板。输入任务名的片段。Enter 跳转；Shift-Enter 在分屏中打开。列表很长时按 **Tab** 按主机或项目筛选。
2. 扫一眼侧边栏——有活跃智能体的 worktree 带绿点。先去那些需要输入的（黄点）。
3. 在每个 worktree 中，**Restart**（重启）微标可重新启动任何已退出的智能体。笔记本电脑睡醒后批量恢复特别好用。
4. 用[常驻铃铛](/notifications)清空"智能体完成"队列——点击一条通知，它就会把你跳到对应的 worktree。

## 日常清理

大胆删除已合并的 worktree。Orca 让这件事零成本——一次点击，worktree 和分支一并消失。留几十个已合并的 worktree 在身边，只会拖慢跳转面板。
