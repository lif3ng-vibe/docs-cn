---
tagline: "五维度技术质量检查，按 P0 到 P3 分级。"
---

<div class="docs-viz-hero">
  <div class="docs-viz-report">
    <div class="docs-viz-report-head">
      <div>
        <div class="docs-viz-report-title">/impeccable audit the checkout flow</div>
        <div class="docs-viz-report-target">src/checkout/**</div>
      </div>
      <div class="docs-viz-report-score">
        <span class="docs-viz-report-score-num">2.6</span>
        <span class="docs-viz-report-score-out">/ 4</span>
      </div>
    </div>
    <div class="docs-viz-report-dims">
      <div class="docs-viz-report-dim">
        <span class="docs-viz-report-dim-name">无障碍</span>
        <span class="docs-viz-report-dim-bar"><span class="docs-viz-report-dim-fill docs-viz-report-dim-fill--fail" style="width:50%"></span></span>
        <span class="docs-viz-report-dim-score">2 / 4</span>
      </div>
      <div class="docs-viz-report-dim">
        <span class="docs-viz-report-dim-name">性能</span>
        <span class="docs-viz-report-dim-bar"><span class="docs-viz-report-dim-fill" style="width:75%"></span></span>
        <span class="docs-viz-report-dim-score">3 / 4</span>
      </div>
      <div class="docs-viz-report-dim">
        <span class="docs-viz-report-dim-name">主题化</span>
        <span class="docs-viz-report-dim-bar"><span class="docs-viz-report-dim-fill docs-viz-report-dim-fill--warn" style="width:62%"></span></span>
        <span class="docs-viz-report-dim-score">2.5 / 4</span>
      </div>
      <div class="docs-viz-report-dim">
        <span class="docs-viz-report-dim-name">响应式</span>
        <span class="docs-viz-report-dim-bar"><span class="docs-viz-report-dim-fill" style="width:75%"></span></span>
        <span class="docs-viz-report-dim-score">3 / 4</span>
      </div>
      <div class="docs-viz-report-dim">
        <span class="docs-viz-report-dim-name">反模式</span>
        <span class="docs-viz-report-dim-bar"><span class="docs-viz-report-dim-fill docs-viz-report-dim-fill--warn" style="width:70%"></span></span>
        <span class="docs-viz-report-dim-score">2.8 / 4</span>
      </div>
    </div>
    <div class="docs-viz-report-issues">
      <span class="docs-viz-report-sev docs-viz-report-sev--p0">P0<span class="docs-viz-report-sev-n">2</span></span>
      <span class="docs-viz-report-sev docs-viz-report-sev--p1">P1<span class="docs-viz-report-sev-n">5</span></span>
      <span class="docs-viz-report-sev docs-viz-report-sev--p2">P2<span class="docs-viz-report-sev-n">8</span></span>
      <span class="docs-viz-report-sev docs-viz-report-sev--p3">P3<span class="docs-viz-report-sev-n">14</span></span>
    </div>
  </div>
  <p class="docs-viz-caption">五个维度按 0 到 4 打分，每条发现标记 P0（阻塞上线）到 P3（打磨）。audit 只记录，不修复。把发现分流给 <code>/impeccable harden</code>、<code>/impeccable polish</code> 或 <code>/impeccable optimize</code>。</p>
</div>

## 什么时候用

`/impeccable audit` 是 `/impeccable critique` 的技术版对照。critique 问的是"这个感觉对不对"，audit 问的是"这个撑不撑得住"。它对实现运行无障碍、性能、主题化、响应式和反模式检查，给每个维度打 0 到 4 分，产出一份带 P0 到 P3 严重度分级的计划。

上线前、质量冲刺期间，或者技术负责人说出"我们真该好好看看无障碍了"的时候，都用它。

## 工作原理

这项技能从五个维度扫描你的代码：

1. **无障碍**：WCAG 对比度、ARIA、键盘导航、语义化 HTML、表单标签。
2. **性能**：布局抖动、高开销动画、缺失懒加载、包体积。
3. **主题化**：硬编码颜色、深色模式覆盖、令牌一致性。
4. **响应式**：断点表现、触控目标、移动端视口处理。
5. **反模式**：与 [Detector CLI](/docs-cn/impeccable/docs/detector)) 运行的同一套确定性检查。

每个维度得到 0 到 4 的分数。每条发现得到一个严重度：P0 阻塞发布，P1 应在本冲刺修掉，P2 排下个周期，P3 属于打磨。你会拿到一份可以直接粘贴进工单系统的文档。

audit 不修复任何东西。它只做记录。按类别把发现分流给 `/impeccable polish`、`/impeccable harden` 或 `/impeccable optimize`。

## 试一试

```
/impeccable audit the checkout flow
```

预期输出：

```
Accessibility: 2/4 (partial)
  P0: Missing form labels on 4 inputs
  P1: Contrast 3.1:1 on disabled button state
  P2: No visible focus indicator on custom dropdown

Performance: 3/4 (good)
  P1: Hero image not lazy-loaded (340KB)
  ...
```

把 P0 交给 `/impeccable harden`，主题化和排版的 P1 交给 `/impeccable typeset` 和 `/impeccable polish`，其余交给 `/impeccable polish`。

## 常见陷阱

- **把它和 `/impeccable critique` 混淆**。audit 看实现质量，critique 看设计质量。两个都跑才能看到全貌。
- **先修 P3 再修 P0**。严重度量表的存在是有原因的。从最高的开始。
- **跳过你以为没问题的维度**。主题化和响应式正是大多数人都默认没问题、直到出问题的那两个。
