---
title: "wait-what：没听懂就喊停"
source: "https://www.aihero.dev/skills-wait-what"
---

## 它做什么

`wait-what` 是你在一条消息没讲明白时敲的东西。然后[智能体](https://www.aihero.dev/ai-coding-dictionary/agent)把它刚说的重新讲一遍。它补上你缺的上下文，用平实的英文写，并使用你项目 `CONTEXT.md` 里的词汇。

这个技能只有三行。那是设计，不是没写完的草稿。与啰嗦搏斗的技能会因膨胀而败：一个四百行的简洁技能仍然让[模型](https://www.aihero.dev/ai-coding-dictionary/model)啰嗦，因为模型读到的是体量，不是恳求。这一个只携带一个精确的引导词，别无其他。

## 什么时候该用它

输入 `/wait-what` 调用。智能体不会自己够到它，也不该。只有你知道你什么时候跟丢了。

发现自己开始扫读的那一秒就用它。智能体漂进了它自己发明的行话、堆了五个缩写、或在解释一个你没见过其前提的决策。它修复你正身处的那场对话。要让行话压根不来，用 [grill-with-docs](/engineering/grill-with-docs)，它预先建立共享语言。

## 名字即机制

引导词是 **wait（等一下）**。"要简洁"是一条关于智能体输出的指令，模型服从它的方式是削词，让你更跟不上。**Wait** 说的是*你的*状态。它说的是理解在这里失败了。听到"简短点"的智能体写电报体。听到"等一下，你把我讲丢了"的智能体退回去解释。

这个差别就是技能的全部。流行的治啰嗦方案全都命名*输出*：`/tldr`、`/no-fluff`、`/talk-normal`。模型矫枉过正，落进一种更短但一点不清楚的原始人腔调。命名*听者*一次要到两半：更少的词，**加上**你缺的上下文。

技能说的是重新讲**那个**，不是"上一条消息"。让你跟丢的通常比一段大，所以由智能体决定退多远。

## 它插进你已有的语言

正文复用你全局 `CLAUDE.md` 和项目 `CONTEXT.md` 里已有的引导词。ASD-STE100 简化技术英语定下语域。统一语言供应名词。技能、`CLAUDE.md` 和 `CONTEXT.md` 够向同一批[token](https://www.aihero.dev/ai-coding-dictionary/token)，所以调用它不是一条新指令，而是对智能体已答应过的一条的提醒。

你没有 `CONTEXT.md`（也没有指向当前上下文那份的 `CONTEXT-MAP.md`）时，技能照样工作。你只丢掉领域词汇那一半。

## 正常工作的标志

- 重讲**更短也更清楚**，不是更短也更生硬。
- 它补上你缺的前提，而不是只删词。
- 项目名词替换掉发明的名词。你 `CONTEXT.md` 里的术语回来了。
- 你可以连用两次，它不退化为电报腔。

## 它在全局中的位置

`wait-what` 可以在任何时点、任何对话、任何其他技能内部使用。它事后修复一条消息。真正的解药是预先谈定的共享语言，那是 [grill-with-docs](/engineering/grill-with-docs)：一场边走边运行 [domain-modeling](/engineering/domain-modeling) 的[追问（grilling）](https://www.aihero.dev/ai-coding-dictionary/grilling)会话，让你们双方都在用的词落进你的 `CONTEXT.md`。拿不准当下哪个技能合适时，[ask-matt](/engineering/ask-matt) 为你路由。
