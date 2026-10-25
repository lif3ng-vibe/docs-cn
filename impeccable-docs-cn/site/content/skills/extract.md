---
tagline: "把可复用的组件、令牌与模式收进设计系统。"
---

<div class="docs-viz-hero">
  <div class="docs-viz-flow">
    <div class="docs-viz-flow-step">
      <span class="docs-viz-flow-num">01</span>
      <span class="docs-viz-flow-name">发现漂移</span>
      <span class="docs-viz-flow-hint">重复的 hex 值、按钮变体、间距比例、文字样式。</span>
    </div>
    <div class="docs-viz-flow-step">
      <span class="docs-viz-flow-num">02</span>
      <span class="docs-viz-flow-name">提出原语</span>
      <span class="docs-viz-flow-hint">令牌命名、带变体 + 尺寸的组件 API、文字样式。</span>
    </div>
    <div class="docs-viz-flow-step docs-viz-flow-step--accent">
      <span class="docs-viz-flow-num">03</span>
      <span class="docs-viz-flow-name">迁移调用点</span>
      <span class="docs-viz-flow-hint">用新原语替换重复的 CSS。不留孤儿代码。</span>
    </div>
  </div>
  <p class="docs-viz-caption">这项技能只提取以相同意图使用三次及以上的东西。两次使用不构成模式，而且迁移总在同一轮里完成。</p>
</div>

## 什么时候用

`/impeccable extract` 用于代码库不知不觉长成设计系统的时刻。按钮样式在 12 处重复出现，同一张卡片有三种变体，hex 颜色散落各处，手写的间距恰好撞上一个比例。当你想把这种漂移收拢成可复用的原语时，用它。

在产品上线了足够多的功能、模式已经显形之后再使用。过早提取会造出与现实不符的抽象。

## 工作原理

这项技能先摸清设计系统的结构，再识别提取机会：

1. **令牌**：找出重复的字面值（颜色、间距、圆角、阴影、字号）。提出令牌命名，加入令牌系统，替换使用处。
2. **组件**：找出以微小差异重复出现的 UI 模式（按钮、卡片、输入框、模态框）。提取为带变体的单一组件，迁移调用方。
3. **组合模式**：找出重复出现的布局或交互模式（表单行、工具栏组、空状态）。提取为组合原语。
4. **文字样式**：找出重复的字号 + 字重 + 行高组合。提取为文字样式。
5. **动画模式**：找出重复的缓动、时长或关键帧组合。提取为动效令牌。

这项技能很谨慎。它只提取以相同意图使用三次及以上的东西，绝不"因为以后可能复用"而提取。过早的抽象比重复更糟。

## 试一试

```
/impeccable extract the button styles
```

预期输出：

- 在 8 个文件里找到 14 处按钮实例
- 4 种不同变体：primary（强调色实心）、secondary（描边）、ghost（纯文字）、destructive（红色实心）
- 4 种变体共用同一套尺寸（small、default、large）
- 提取为 `<Button variant="primary" size="default">`，样式由令牌驱动
- 迁移 14 处调用点，删掉约 180 行重复 CSS
- 补上 3 个缺失令牌：`--button-radius`、`--button-padding-y`、`--button-padding-x`

## 常见陷阱

- **提取得太早**。两次使用不构成模式，三次也许构成。等到模式显而易见再动手。
- **过度泛化**。提取出的组件应当紧贴当前用例，而不是预判未来所有可能。以后随时可以加变体。
- **忘了迁移**。只提取不迁移，旧的重复代码原地不动，同一件事凭空多出第三种做法。迁移永远放在同一轮里。
- **提取意图不同的东西**。两个长得像但用途不同的按钮（主操作与伪装成按钮的链接）大概率应该各自独立。
