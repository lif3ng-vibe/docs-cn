---
title: "用设计模式修复 UI bug"
description: "用设计模式修复 UI bug——Orca 文档。"
source: "https://www.onorca.dev/docs/recipes/design-mode-fix"
---

# 用设计模式修复 UI bug

设计模式把"这个按钮看着不对"到"提交修复"的回路压缩到一分钟以内。

## 步骤

1. 打开 worktree 的浏览器窗格。导航到出 bug 的页面。
2. 开启[设计模式](/browser/design-mode)。
3. 点击出问题的元素。它会以富附件的形式落入智能体聊天。
4. 输入你想修什么："这个 padding 太挤了，加大到和上面的卡片一致。"
5. 智能体修改源码。热重载刷新浏览器。
6. 再次点击该元素验证——还不对就重复。
7. 对了就提交。

## 为什么快

不用截图、不用翻 DOM、不用复制选择器。智能体拿到的是 HTML、计算后的 CSS 和你所指元素的裁剪图——正是人类评审者想要的那份上下文。
