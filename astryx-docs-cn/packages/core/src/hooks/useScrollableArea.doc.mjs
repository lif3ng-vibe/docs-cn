// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useScrollableArea.doc.mjs
 * @input Shared scroll hook's fixed and entry-time keyboard policies
 * @output Consumer guidance for named viewports and safe focus delegation
 * @position Hook documentation consumed by the CLI and docsite
 */

/** @type {import('@astryxdesign/cli/authoring').HookDoc} */
export const docs = {
  name: 'useScrollableArea',
  displayName: 'useScrollableArea',
  keywords: [
    'scroll',
    '滚动',
    'overflow',
    '溢出',
    'logical axis',
    '逻辑轴',
    'keyboard',
    '键盘',
    'overscroll',
    'sticky',
    'resize',
  ],
  params: [
    {
      name: 'options',
      type: 'UseScrollableAreaOptions',
      description:
        '逻辑滚动意图、固定或自动的键盘归属、过度滚动策略，以及恰当的 Sticky 包容。',
      required: true,
    },
  ],
  returns: [
    {
      name: 'getViewportProps',
      type: '<E extends HTMLElement>(props?: ScrollableElementProps<E>) => ScrollableElementProps<E>',
      description:
        '接收调用方的视口 props、xstyle 与 ref；组合恰当/生效的 overflow、Sticky 包容、无障碍、链式调用与归属注册。',
    },
    {
      name: 'getContentProps',
      type: '<E extends HTMLElement>(props?: ScrollableElementProps<E>) => ScrollableElementProps<E>',
      description:
        '组合调用方的内容盒 props、xstyle 与 ref，并附带内容观察。',
    },
    {
      name: 'state',
      type: 'ScrollableAreaState',
      description:
        '稳定的行内与块向生效滚动及逻辑边缘状态。',
    },
  ],
  usage: {
    description:
      '为调用方自有的结构添加规范的轴向感知滚动行为。只有当某轴的计算 overflow 具备滚动能力且几何尺寸超过共享的 1px 容差时，该轴才视为生效。视口盒与内容盒都会被观察。',
    bestPractices: [
      {
        guidance: true,
        description:
          '把已解析的 props 和 ref 传入两个 prop getter，然后将每个返回对象展开一次。',
      },
      {
        guidance: true,
        description:
          '仅当视口本身应进入 Tab 焦点顺序时才使用视口键盘归属；并提供简洁的无障碍标签。',
      },
      {
        guidance: true,
        description:
          '当 contentOrViewport 能保留原生滚动按键时，用它把正向 Tab 进入委托给内容里第一个原生链接或按钮。输入框、组合部件与嵌套滚动区域保留视口停留点。从被委托的第一个子元素 Shift+Tab 会跳过视口；指针与程序化聚焦仍停留在视口上。',
      },
      {
        guidance: true,
        description:
          '当你的集成已为完整滚动范围提供键盘访问时使用内容键盘归属。自动委托会在每次键盘进入时检查当前内容，而不会持续跟踪其可聚焦性。',
      },
      {
        guidance: true,
        description:
          '把调用方的 `xstyle` 通过 `getViewportProps` 传入；getter 会将它与恰当的裁剪、生效的 overflow 和 Sticky 包容组合。',
      },
      {
        guidance: true,
        description:
          '给视口拥有的 tab 停留点提供可见焦点指示；像 ScrollableArea 那样把 `focusOutlineStyles.focusVisible`（或等价物）组合进视口 `xstyle`。',
      },
      {
        guidance: false,
        description:
          '不要只挂视口 getter。实时的 overflow 变化需要一个真实被观察的内容盒。',
      },
      {
        guidance: false,
        description:
          '不要通过调用方 props 在视口上声明 overflow；getter 负责 overflow 声明并剥离冲突的内联值。',
      },
    ],
  },
  relatedComponents: ['ScrollableArea'],
  relatedHooks: ['useScrollOverflow'],
  importPath: '@astryxdesign/core/hooks',
  category: 'layout',
};

/** @type {import('@astryxdesign/cli/authoring').HookTranslationDoc} */
export const docsDense = {
  description:
    '把逻辑轴滚动组合进调用方自有的视口/内容元素，并附带稳定的生效轴与边缘状态。',
  paramDescriptions: {
    options:
      '轴、固定/自动键盘归属、允许/包容过度滚动策略，以及恰当的 Sticky 包容。',
  },
  returnDescriptions: {
    getViewportProps:
      '安全的视口 prop/ref/xstyle 组合，附带行为自有的 overflow、无障碍与链式调用。',
    getContentProps: '安全的被观察内容盒 prop/ref/xstyle 组合。',
    state: '行内/块向的 isScrollable、atStart 与 atEnd 状态。',
  },
  usage: {
    description:
      '用于需要 ScrollableArea 行为但又不想多加一层包裹的既有结构。',
    bestPractices: [
      {
        guidance: true,
        description:
          '把每个 prop getter 的结果在其所属元素上展开一次。',
      },
      {guidance: false, description: '不要省略真实内容盒 getter。'},
    ],
  },
};
