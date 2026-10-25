---
tagline: "带评分、角色测试与自动检测的设计评审。"
---

<div class="docs-viz-hero">
  <div class="docs-viz-critique">
    <div class="docs-viz-critique-head">
      <div class="docs-viz-critique-verdict">
        <span class="docs-viz-critique-verdict-label">AI slop 判定</span>
        <span class="docs-viz-critique-verdict-value">未通过</span>
      </div>
      <span class="docs-viz-report-target">gradient-text &middot; ai-color-palette &middot; nested-cards</span>
    </div>
    <div class="docs-viz-critique-cols">
      <div>
        <div class="docs-viz-critique-col-title">启发式原则（Nielsen）</div>
        <div class="docs-viz-critique-heuristics">
          <div class="docs-viz-critique-heur">
            <span>状态可见性</span>
            <span class="docs-viz-critique-heur-score docs-viz-critique-heur-score--good">3</span>
          </div>
          <div class="docs-viz-critique-heur">
            <span>贴近真实世界</span>
            <span class="docs-viz-critique-heur-score docs-viz-critique-heur-score--ok">2</span>
          </div>
          <div class="docs-viz-critique-heur">
            <span>一致性与标准</span>
            <span class="docs-viz-critique-heur-score docs-viz-critique-heur-score--ok">2</span>
          </div>
          <div class="docs-viz-critique-heur">
            <span>预防错误</span>
            <span class="docs-viz-critique-heur-score docs-viz-critique-heur-score--good">3</span>
          </div>
          <div class="docs-viz-critique-heur">
            <span>识别而非回忆</span>
            <span class="docs-viz-critique-heur-score docs-viz-critique-heur-score--bad">1</span>
          </div>
        </div>
      </div>
      <div>
        <div class="docs-viz-critique-col-title">人物角色</div>
        <div class="docs-viz-critique-personas">
          <div class="docs-viz-critique-persona">
            <div>
              <span class="docs-viz-critique-persona-name">评估者</span>
              <span class="docs-viz-critique-persona-note">周二晚上把我们和两个竞品放在一起比较。</span>
            </div>
            <span class="docs-viz-critique-persona-score">2 / 4</span>
          </div>
          <div class="docs-viz-critique-persona">
            <div>
              <span class="docs-viz-critique-persona-name">回访用户</span>
              <span class="docs-viz-critique-persona-note">了解产品，用手机，赶时间。</span>
            </div>
            <span class="docs-viz-critique-persona-score">3 / 4</span>
          </div>
          <div class="docs-viz-critique-persona">
            <div>
              <span class="docs-viz-critique-persona-name">怀疑者</span>
              <span class="docs-viz-critique-persona-note">看过所有 SaaS 落地页，已经麻木。</span>
            </div>
            <span class="docs-viz-critique-persona-score">1 / 4</span>
          </div>
        </div>
      </div>
    </div>
  </div>
  <p class="docs-viz-caption">两轮评估（LLM 设计评审加确定性检测器）合并成一份按优先级排序的清单：哪些有效、哪些要修，以及上线前值得回答的那些尖锐问题。</p>
</div>

## 什么时候用

当你想对已建好的东西听一个诚实的第二意见时，用 `/impeccable critique`。它回答的不是"能不能用"，而是"好不好"。这项技能按尼尔森 10 条启发式原则给你的界面打分，运行认知负荷检查，透过人物角色视角做测试，并交叉引用一台自动检测器来查 25 种具体反模式。

当页面功能上已经完成、你想知道它给人的感觉是"有意图的设计"还是"AI slop"时，用它。

## 工作原理

`/impeccable critique` 并行运行两套彼此独立的评估，避免互相污染。

第一个是 **LLM 设计评审**：模型阅读你的源码，若浏览器自动化可用还会视觉检查真实页面，并逐条过一遍 impeccable 技能完整的 DO/DON'T 清单。它给尼尔森启发式原则打分，统计认知负荷不达标项，追踪整个流程中的情绪曲线，并标记 AI slop。

第二个是**自动检测器**（`npx impeccable detect`），以确定性方式找出渐变文字、紫色配色、侧边页签描边、嵌套卡片、行长问题，以及其他一眼可辨的通用 AI 产物指纹。

两份报告合并成一份按优先级排序的清单：哪些有效，三到五件需要修的事，以及上线前值得回答的尖锐问题。

## 试一试

把它指向一个页面：

```
/impeccable critique the homepage hero
```

你会拿到一份带评分的报告。典型结构：

- **AI slop 判定**：通过 / 未通过，附具体特征
- **启发式评分**：10 个数字，0 到 4
- **认知负荷**：8 项中的不达标数
- **优先问题**：三到五条，每条说明是什么、为什么、怎么修
- **待回答的问题**：那些界面本身替你决定不了的问题

接下来搭配 `/impeccable polish` 或 `/impeccable distill` 落实修复。

## 常见陷阱

- **对未完成的工作运行**。critique 面向完成的页面。一个带着三个 TODO 的空状态会得低分，是因为它没做完，不是因为它差。
- **无视结尾的问题**。它们通常才是最能改变设计的修复。
- **把启发式评分当成成绩单**。它们是诊断，不是评判。某条对你情境影响较小的启发式拿到 3/4 没问题。
