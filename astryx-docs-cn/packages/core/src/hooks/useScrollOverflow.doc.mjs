// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').HookDoc} */
export const docs = {
  name: 'useScrollOverflow',
  displayName: 'useScrollOverflow',
  keywords: ['scroll', 'overflow', '溢出', 'carousel', 'fade', '淡出', 'edge', '边缘', 'horizontal', '横向', 'scrollable', 'resize'],
  params: [],
  returns: [
    {
      name: 'scrollRef',
      type: 'React.RefCallback<HTMLElement>',
      description: '挂到横向可滚动容器元素上的 ref 回调。',
    },
    {
      name: 'overflowStart',
      type: 'boolean',
      description: '内容是否溢出起始边缘（LTR 下为左，RTL 下为右）。',
    },
    {
      name: 'overflowEnd',
      type: 'boolean',
      description: '内容是否溢出结束边缘（LTR 下为右，RTL 下为左）。',
    },
    {
      name: 'hasOverflow',
      type: 'boolean',
      description: '容器是否存在任何滚动溢出（scrollWidth > clientWidth）。',
    },
  ],
  usage: {
    description:
      '跟踪横向可滚动容器的滚动溢出状态。返回一个 ref 回调和若干状态布尔值，随用户滚动、容器缩放或内容变化（子元素增删、尺寸变化，或新增间距/内边距）而更新。使用 scroll 事件监听器、ResizeObserver 与 MutationObserver 实现响应式更新。应用 1px 容差以避免亚像素误报。',
    bestPractices: [
      { guidance: true, description: '用于在轮播与横向列表上显示/隐藏滚动导航按钮或边缘淡出效果。' },
      { guidance: true, description: '把 scrollRef 应用到设置了 overflow-x: auto 或 overflow-x: scroll 的容器。' },
      { guidance: false, description: '不要用于垂直滚动跟踪；本 hook 只测量横向溢出。' },
    ],
  },
  relatedComponents: ['Carousel'],
  relatedHooks: ['useOverflow'],
  importPath: '@astryxdesign/core/hooks',
  category: 'layout',
};

/** @type {import('@astryxdesign/cli/authoring').HookTranslationDoc} */
export const docsDense = {
  description:
    '跟踪横向可滚动容器的滚动溢出状态。返回 ref 回调 + 状态布尔值，随用户滚动/容器缩放而更新。使用 scroll 事件监听器 + ResizeObserver 实现响应式更新。应用 1px 容差以避免亚像素误报。',
  returnDescriptions: {
    scrollRef: '横向可滚动容器元素的 ref 回调。',
    overflowStart: '内容是否溢出起始边缘（LTR 下为左，RTL 下为右）。',
    overflowEnd: '内容是否溢出结束边缘（LTR 下为右，RTL 下为左）。',
    hasOverflow: '容器是否存在任何滚动溢出（scrollWidth > clientWidth）。',
  },
  usage: {
    description:
      '跟踪横向可滚动容器的滚动溢出状态。返回 ref 回调 + 状态布尔值，随用户滚动/容器缩放而更新。使用 scroll 事件监听器 + ResizeObserver 实现响应式更新。应用 1px 容差以避免亚像素误报。',
    bestPractices: [
      { guidance: true, description: '用于在轮播 + 横向列表上显示/隐藏滚动导航按钮/边缘淡出效果。' },
      { guidance: true, description: '把 scrollRef 应用到带 overflow-x: auto / overflow-x: scroll 的容器。' },
      { guidance: false, description: '不要用于垂直滚动跟踪；本 hook 只测量横向溢出。' },
    ],
  },
};
