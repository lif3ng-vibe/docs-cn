---
tagline: "点名一个元素，比较多个变体，留下你最满意的一个。"
---

当你明确知道自己想探索运行中网页的哪一部分时，用 `generate`。在 agent 聊天里点出元素和方向。Impeccable 找到它、滚动到它，并准备好多个备选方案供你在浏览器里比较。

## 试一试

```text
/impeccable generate 3 bold variants of the pricing cards
```

保持 agent 会话处于活跃状态。Impeccable 连接到你的开发服务器，可用时直接使用你的编码工具里已打开的页面，否则在浏览器里打开。比较控件会出现在被点名元素的旁边。

**Generate 使用 [Live Mode](/docs-cn/impeccable/docs/live))，包括其 beta 状态**。你可以从一句书面请求直达页面上的备选方案，无需自己选中元素。

## 给它一个方向

一条有用的请求会点明三件事：

- **元素**："定价卡片""hero 标题"或"结算摘要"。项目有多个页面时，把页面也说上。
- **方向**：bolder、quieter、simpler、polished、typography、color、layout、motion，或其他具体结果。
- **数量**：可以要 1 到 8 个备选。不写数量就默认给三个。

```text
/impeccable generate 2 quieter variants of the hero heading. Keep our font and colors.
```

Or describe the outcome you want:

```text
/impeccable generate layout variants of the checkout summary. Make the total and delivery date easier to find.
```

如果你只说要"更好"或"不一样"的版本，Impeccable 会问你想要哪个方向。如果元素可能指页面上好几处，它会先帮你收窄目标再动手。

**变体默认保留你现有的品牌识别**。它们基于当前页面以及已保存的产品与设计上下文。试用这条命令不需要先建好 `PRODUCT.md` 或 `DESIGN.md`。

## 比较与选择

用元素旁边的前进、后退箭头在备选方案之间切换。每个版本都出现在真实页面里，这样你可以判断它的层级、间距，以及与周围一切的关系。部分变体还提供 **Tune** 控件，可调整间距或强调程度等。

选 **Accept** 把当前版本保留进你的源码。丢弃整组备选则恢复原样。你做出选择后，Impeccable 会移除临时预览代码并关闭 Live Mode 连接；你的开发服务器继续运行。

检查源码改动，并在窄、宽两种宽度下试用结果。视觉对比没覆盖到的交互也要检查一遍。

## 什么时候改用 Live Mode

想自己挑选元素、添加评论或手绘标注、或在浏览时调控整个页面，就用 [live](/docs-cn/impeccable/docs/live))。[浏览器迭代教程](/docs-cn/impeccable/tutorials/iterate-live))会走一遍两个入口共用的比较与采纳控件。

Generate 适用于跑在开发服务器上的 Web 项目或本地静态 HTML。它不作用于原生 iOS 或 Android 界面。那些场景请用 [bolder](/docs-cn/impeccable/docs/bolder))、[quieter](/docs-cn/impeccable/docs/quieter)) 这类命令做针对性的源码修改。

## 相关命令

- **常与…搭配**：[live](/docs-cn/impeccable/docs/live))
- **可与…组合**：[bolder](/docs-cn/impeccable/docs/bolder))、[quieter](/docs-cn/impeccable/docs/quieter))、[layout](/docs-cn/impeccable/docs/layout))
