---
title: "逐行评审 AI diff"
description: "逐行评审 AI diff——Orca 文档。"
source: "https://www.onorca.dev/docs/recipes/review-ai-diff"
---

认真评审 AI diff，是快速发布与发布 bug 之间的分水岭。流程如下。

## 步骤

1. 打开 worktree 的 diff 视图。
2. 用 `j` / `k` 逐文件推进。对每个 hunk 自问：这个变更是必要的吗？是最小化的吗？与文件其余部分一致吗？
3. 对任何想改的地方用 `c` 留评论——完整句子效果最好。
4. 过完整份 diff 后，点击 **Send to agent**（发送给智能体）。Orca 会把所有评论打包成一个提示词。
5. 看着智能体修改。状态圆点会变黄（等待更多输入）或变绿（工作中）。
6. 它空闲后重新打开 diff。你的评论都还固定在原处；把已修复的标记解决，其余的留下跟进备注。
7. 如此往复直到干净，然后提交。
