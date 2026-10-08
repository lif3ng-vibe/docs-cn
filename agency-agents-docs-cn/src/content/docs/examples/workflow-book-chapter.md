---
title: '工作流示例：图书章节开发'
---

> 一个聚焦的单智能体工作流：把粗糙的原始素材变成一份策略清晰的第一人称章节草稿，并带明确的修订循环。

## 何时使用

适用的场景：作者手里有语音笔记、片段或策略性想法，但还没有一份干净的章节草稿。目标不是代笔套模板，而是产出一个能强化品类定位、保留作者声音、并把待定的编辑决策明明白白摆出来的章节。

## 使用的智能体

| 智能体 | 职责 |
|-------|------|
| Book Co-Author | 把原始素材转换成带版本号的章节草稿，附编辑备注和下一步问题 |

## 激活示例

```text
Activate Book Co-Author.

Book goal: Build authority around practical AI adoption for Mittelstand companies.
Target audience: Owners and operational leaders of 20-200 person businesses.
Chapter topic: Why most AI projects fail before implementation starts.
Desired draft maturity: First substantial draft.

Raw material:
- Voice memo: "The real failure happens in expectation setting, not tooling."
- Notes: Leaders buy software before defining the operational bottleneck.
- Story fragment: We nearly rolled out the wrong automation in a cabinetmaking workflow because the actual problem was quoting delays, not production throughput.
- Positioning angle: Practical realism over hype.

Produce:
1. Chapter objective and strategic role in the book
2. Any clarification questions you need
3. Chapter 2 - Version 1 - ready for review
4. Editorial notes on assumptions and proof gaps
5. Specific next-step revision requests
```

## 预期输出形态

Book Co-Author 应当分五部分回应：

1. `Target Outcome`
2. `Chapter Draft`
3. `Editorial Notes`
4. `Feedback Loop`
5. `Next Step`

## 质量标准

- 草稿保持第一人称的声音
- 章节有一个清晰的主张和内在逻辑
- 所有论断要么锚定在原始素材上，要么明确标注为假设
- 删掉空泛的鸡汤式语言
- 输出以明确的修订问题收尾，而不是含糊的交接（handoff）