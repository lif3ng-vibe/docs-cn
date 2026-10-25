---
tagline: "先想清楚再动手。用需求澄清而非瞎猜，产出一份设计简报。"
---

<div class="docs-viz-hero">
  <div class="docs-viz-file">
    <div class="docs-viz-file-header">
      <span class="docs-viz-file-name">brief.md</span>
      <span class="docs-viz-file-status">/impeccable shape 的输出</span>
    </div>
    <div class="docs-viz-file-body">
      <div class="docs-viz-file-row">
        <span class="docs-viz-file-k">Purpose</span>
        <span class="docs-viz-file-v">让已订阅的用户调整订阅内容，而不是把他们推向退订。</span>
      </div>
      <div class="docs-viz-file-row">
        <span class="docs-viz-file-k">User</span>
        <span class="docs-viz-file-v">赶时间，在手机上，正在开会。快速扫读，耐心有限。</span>
      </div>
      <div class="docs-viz-file-row">
        <span class="docs-viz-file-k">Content</span>
        <span class="docs-viz-file-v">4 种摘要类型，2 种频率，底部一个全退订入口。</span>
      </div>
      <div class="docs-viz-file-row">
        <span class="docs-viz-file-k">Feeling</span>
        <span class="docs-viz-file-v">平静、可信，没有暗黑模式。</span>
      </div>
      <div class="docs-viz-file-row">
        <span class="docs-viz-file-k">Constraints</span>
        <span class="docs-viz-file-v">移动优先。WCAG AA 对比度。单栏，不用模态框。</span>
      </div>
    </div>
    <div class="docs-viz-file-footer">把它交给 <code>/impeccable</code>、<code>/impeccable craft</code>，或任何实现流程。</div>
  </div>
  <p class="docs-viz-caption">shape 简报是指南针，不是规格书。它记录意图，而不是 UI。实现类技能在写下第一行代码之前先读它。</p>
</div>

## 什么时候用

`/impeccable shape` 是一个功能的起点。在任何人写代码之前，在任何人争论 hero 怎么处理之前，在任何人挑字体之前。用它强制开启一场关于目的、用户、内容和约束的需求澄清（discovery）对话，再把答案沉淀成实现类技能可以依靠的设计简报。

功能即将启动、工单语焉不详，或者你发现自己正靠写 JSX 来搞清产品该是什么的时候，用它。

## 工作原理

大多数 AI 生成的 UI 之所以失败，不是因为代码差，而是因为跳过了思考。模型直接跳到"给你一个卡片网格"，却不问"用户到底想完成什么"。`/impeccable shape` 把这个顺序倒了过来。

技能以对话形式进行一场结构化的需求澄清访谈。这个阶段它不写代码。问题覆盖：

- **目的与语境**：这个功能为谁而做、谁在用、他们当时是什么状态
- **内容与数据**：展示什么、真实的数据范围、边界情况、哪些是动态的
- **设计目标**：唯一最重要的事、想传达的感受、参照案例
- **约束**：技术、内容、无障碍、本地化

你自然作答。技能追问的是对话，不是表单。最后它产出一份设计简报：一个结构化的产物，可以交给 `/impeccable` 或任何其他实现技能。

注意：想要完整流程（需求澄清访谈，然后直接开建），请改用 `/impeccable craft`。它内部会运行 `/impeccable shape`，然后带着视觉迭代一路进入实现。单独用 `/impeccable shape`，适合你只想要简报，之后带去任何你偏好的实现路径。

## 试一试

```
/impeccable shape a daily digest email preferences page
```

预计 5 到 10 个问题的对话。技能会问诸如"打开这个页面的人是谁，他们已是订户还是仍在观望"、"用户把所有订阅都退光之后会怎样，我们藏起这个功能还是展示点什么"。你作答，一份简报就成形了。

之后你可以把简报交给 `/impeccable`、`/impeccable polish` 或任何其他技能，或者只是手写代码时拿它当参考。

## 常见陷阱

- **嫌它慢而跳过**。访谈顶多 5 分钟。它能帮你省掉的重写，是以小时计的。
- **把简报当规格书**。它是指南针，不是核对清单。它记录意图，不是 UI。
- **回答"标准""普通"**。具体才是一切的关键。用户是"赶时间、在手机上、会议间隙"，就直说。这会改变下游的一切。
