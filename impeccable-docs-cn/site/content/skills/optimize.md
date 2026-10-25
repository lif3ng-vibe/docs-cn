---
tagline: "诊断并修复 UI 性能，从 LCP 到包体积。"
---

## 什么时候用

`/impeccable optimize` 针对感觉慢的界面。首次渲染半天出不来、滚动卡顿、图片迟迟不出现、交互拖泥带水、bundle 里塞着 800KB 的 JavaScript。Web Vitals 很难看，或者用户抱怨一切都很肉的时候，用它。

别把它当过早优化来用。LCP 是 1.1s、INP 是 80ms 的话，停。设计工作更重要。

## 工作原理

这项技能过一遍五个性能维度：

1. **加载与 Web Vitals**：LCP、INP、CLS。找出什么在阻塞首次渲染、什么在推迟可交互、什么在挤动布局。
2. **渲染**：不必要的重渲染、缺失的记忆化、昂贵的协调过程、循环里的布局抖动。
3. **动画**：有没有东西在动 layout 属性；是否只碰 transform 和 opacity；`will-change` 在这里是帮忙还是帮倒忙。
4. **图片与资源**：懒加载、响应式图片（`srcset`、`sizes`）、现代格式（WebP、AVIF）、设置好尺寸以防 CLS。
5. **包体积**：未使用的导入、臃肿的依赖、缺失的代码分割、死代码。

技能会测改动前后。每个修复都被量化。改动若带不动任何指标，就回滚。

## 试一试

```
/impeccable optimize the homepage
```

预期形态：

```
LCP: 3.2s → 1.4s
  - Hero image preloaded (-800ms)
  - Removed render-blocking font stylesheet (-240ms)
  - Deferred analytics script (-180ms)

INP: 240ms → 90ms
  - Debounced scroll handler
  - Memoized expensive list render
  - Removed synchronous layout read in event loop

CLS: 0.18 → 0.02
  - Set dimensions on hero image and logo
  - Reserved space for async header badge

Bundle: 340KB → 180KB
  - Removed unused lodash import (52KB)
  - Code-split the playground route (78KB)
  - Dropped deprecated icon set (30KB)
```

## 常见陷阱

- **没测量就优化**。没有基线指标，你判断不了什么起了作用。带着具体的 Web Vitals 数字去跑 `/impeccable optimize`，别凭感觉。
- **追着蝇头小利不放**。花一周换来 INP 改善 20ms，多半不值。optimize 的收益递减，要知道什么时候收手。
- **每次改动后忘记复测**。构建可能以技能没预料到的方式把事情弄糟。要验证。
