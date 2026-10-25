---
tagline: "把界面推过常规极限。着色器、物理、60fps、电影感转场。"
---

## 什么时候用

`/impeccable overdrive` 用于你想让人眼前一亮的时刻。用 WebGL 的 hero。扛得住一百万行的表格。从触发元素里形变而出的对话框。带流式反馈、实时校验的表单。电影感的页面转场。项目预算容得下技术雄心、成果又必须超凡脱俗的时候，用它。

运维工具、仪表盘，以及任何可靠性重于炫技的东西，都别用它。Overdrive 用复杂度换效果，这笔交易只在关键时刻值得。

## 工作原理

技能会挑一个时刻做到超凡，并全力以赴，而不是把力气撒满整个界面。然后它祭出大多数 AI 生成 UI 从不触碰的技术：WebGL 着色器、弹簧物理、Scroll Timeline、View Transitions、canvas 动画、GPU 加速滤镜。一切都做预算、做性能剖析、按 60fps 测试，并内置 reduced-motion 兜底。

Overdrive 的输出会以 `──── ⚡ OVERDRIVE ────` 宣告开场，让你知道进入了野心更大的模式。预期更大的 diff、新的依赖，以及超出其他技能的实现深度。

## 试一试

```
/impeccable overdrive the landing hero
```

一次具体的运行，可能把静态 hero 换成由鼠标位置驱动的 WebGL 着色器背景，用 Scroll Timeline API 让大标题随滚动以遮罩方式揭示，再给 CTA 加一个形变进入下一页的 View Transition。外加一套 reduced-motion 兜底，把这一切换成干净的静态构图。

## 常见陷阱

- **到处都用它**。Overdrive 好使恰恰因为它稀有。每个页面都有电影感时刻，就没有页面有电影感。
- **不带 reduced-motion 兜底就上线**。没得商量。Overdrive 会自动加上；别删。
- **无视性能**。超凡时刻也得跑满 60fps。效果掉帧，就砍掉或优化。慢吞吞的炫技，不如把简单的事做好。
- **基础界面还没扎实就跑 overdrive**。破地基上的奇观只会让人分神，不会带来愉悦。
