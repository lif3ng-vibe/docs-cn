---
tagline: "从良好到卓越之间，那一次细致入微的终检。"
---

## 什么时候用

`/impeccable polish` 是上线前你跑的最后一件东西。它专猎那些区分"能用的功能"和"打磨过的功能"的小细节：半像素的错位、不一致的间距、被遗忘的焦点状态、一闪而过的加载过渡、语调跑偏的文案。它还把功能对齐到你的设计系统：把硬编码的值换成令牌、把自制组件换成共享组件、修掉一切偏离既有模式的漂移。

功能已功能完备、什么都没坏、却仍觉得哪里不对时，用它。功能偏离了设计系统、需要拉回正轨时，也用它。

## 工作原理

Polish 先探测你的设计系统（令牌、间距刻度、共享组件），然后有条不紊地过六个维度：

1. **视觉对齐与间距**：像素级贴合网格、一致的间距刻度、图标的光学对齐。
2. **字体排印**：层级一致性、行长、孤行孤字、标题字距。
3. **颜色与对比度**：令牌使用、主题对等、WCAG 比率、焦点指示。
4. **交互状态**：hover、focus、active、disabled、loading、error、success。一个状态都不落下。
5. **过渡与动效**：平滑的缓动、没有布局卡顿、尊重 `prefers-reduced-motion`。
6. **文案**：语调一致、时态正确、没有占位字符串、没有乱入的 TODO。

技能在一点上说得很明白：polish 是最后一步，不是第一步。功能还没做完就打磨，纯属白干。

## 试一试

```
/impeccable polish the pricing page
```

一次健康的运行长这样：

```
Visual alignment: fixed 3 off-grid elements (8px baseline)
Typography: tightened h1 kerning, fixed widow on testimonial
Interaction: added hover state on FAQ items, focus ring on email input
Motion: softened modal entrance, added reduced-motion fallback
Copy: removed one "Lorem ipsum" stray, aligned button voice
```

五个小修复，没有重写。这就是一次好的 polish pass 该有的样子。

## 常见陷阱

- **打磨还没做完的活**。代码里还有 TODO，就说明没到时候。`/impeccable polish` 只用于已完成的功能。
- **把 polish 当重设计**。Polish 精修已有的东西。如果你发现自己开始重构布局，那你需要的是 `/impeccable critique` 或 `/impeccable layout`。
- **不先跑 `/impeccable audit` 就跑 `/impeccable polish`**。Polish 抓感觉上的问题，Audit 抓可测量的问题。两个都用。
