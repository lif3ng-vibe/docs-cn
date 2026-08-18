---
title: 解析与框架
description: CodeGraph 如何连接引用，以及如何把路由链接到处理器。
---

提取产出节点和原始边；**引用解析**负责把名字变成真正的连接。

## 引用解析

解析完成后，CodeGraph 会落实以下引用：

- **导入** → 它们指向的源文件（包括 tsconfig 路径别名和 cargo workspace 成员）。
- **调用** → 凭借导入解析与名称匹配，找到各自的定义。
- **继承** → 类型之间的 `extends` / `implements` 关系。

## 框架感知

CodeGraph 能识别 Web 框架的路由文件，生成 `route` 节点，并用 `references` 边把它们链接到对应的处理器类或函数——因此查询某个视图或控制器的调用方时，绑定它的 URL 模式会直接浮现。受支持框架的完整列表见[框架路由](/guides/framework-routes/)。

## 动态派发覆盖

静态解析抓不住计算出来的调用和间接调用，流程容易在动态派发处断开。CodeGraph 用合成器桥接了其中若干边界，让流程端到端连通：

- 回调 / 观察者注册
- `EventEmitter` 通道
- React 重渲染（`setState` → `render`）
- JSX 子组件（`render` → 子组件）
- 接口 → 实现派发

每条合成边都标记了 `provenance: 'heuristic'` 及其接线点；凡有路径经过，都会内联展示。
