// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').HookDoc} */
export const docs = {
  name: 'useLayer',
  displayName: 'useLayer',
  group: 'Utilities',
  keywords: [
    'layer',
    'overlay',
    'popover',
    'positioning',
    'anchor',
    'floating',
    'dropdown',
    'popper',
    'popup',
    'portal',
    '浮层',
    '定位',
    '锚点',
  ],
  params: [
    {
      name: 'mode',
      type: "'context' | 'fixed'",
      description:
        '定位策略：context 使用相对于触发器 ref 的 CSS anchor 定位；fixed 使用显式 x/y 坐标。',
      required: true,
    },
    {
      name: 'onShow',
      type: '() => void',
      description: 'layer 变为可见时触发的回调。',
    },
    {
      name: 'onHide',
      type: '() => void',
      description: 'layer 隐藏时触发的回调。',
    },
    {
      name: 'lightDismiss',
      type: 'boolean',
      description:
        '点击外部时是否使用原生 popover 轻触关闭行为关闭 layer。',
      default: 'false',
    },
    {
      name: 'lazyMount',
      type: 'boolean',
      description:
        '仅 context 模式。等到 show() 再解析行内/portal 位置并挂载内容；hide 时卸载内容，惰性标记保留。',
      default: 'false',
    },
  ],
  returns: [
    {
      name: 'ref',
      type: 'RefCallback<HTMLElement> | undefined',
      description: 'context 模式的触发器 ref。fixed 模式下为 undefined。',
    },
    {
      name: 'anchorId',
      type: 'string',
      description: '用于 context 模式定位的 CSS anchor 名称。',
    },
    {
      name: 'show',
      type: '() => void',
      description: '以命令式显示 layer。',
    },
    {
      name: 'hide',
      type: '() => void',
      description: '以命令式隐藏 layer。',
    },
    {
      name: 'isOpen',
      type: 'boolean',
      description: 'layer 当前是否打开。',
    },
    {
      name: 'id',
      type: 'string',
      description:
        '用于 aria-describedby 或其他 ARIA 关系的唯一 ID。',
    },
    {
      name: 'render',
      type: '(children: ReactNode, props: ContextRenderProps | FixedRenderProps) => ReactNode',
      description:
        'popover 元素的渲染函数。context 模式传 placement/alignment，fixed 模式传 x/y。placement/alignment 是逻辑值：映射到 self-* position-area 关键字族，按弹出层自身继承的方向解析，因此 RTL 上下文在纯 CSS 中自动镜像。context 模式传 `positioning: "custom"` 可自行通过 `style` 编写定位样式（如显式 anchor() 插卡或 anchor-size() 铺满）：Hook 保留 popover 行为和 position-anchor 接线，但不派生任何定位样式，包括自动 RTL 镜像——那部分改由你负责。context 模式传 `offset`（CSS 长度；数字为 px）获得与锚点的间距：它作用于放置轴的两侧，因此翻转时间距保持不变。layer 默认贴紧。context 模式先在匹配的服务端与客户端标记中渲染一个惰性 `<template>` 标记。父级安全时最终 layer 留在该 JSX 位置；否则 portal 到段落、链接、按钮、行内格式化和结构受限容器之外最近的祖先。最近的安全宿主保持 CSS 自定义属性继承不断，而 layer 保持其 JSX 位置上的方向和书写模式。默认该解析在水合后进行，关闭状态的 layer DOM 仍然可用，且只重渲染持有标记与 layer 的槽位，不重渲染调用 Hook 的组件（仅当已解析的挂载被移到其他宿主的 render 调用取代时才再次渲染）；`lazyMount` 把它推迟到 `show()`，hide 时再次卸载内容而标记保留。Popover API 在显示时把 layer 提升到顶层，因此无论宿主在哪都能逃出祖先裁剪与层叠。当 layer 会溢出视口时，position-try 回退会把它翻转到对侧；居中的 layer 还会沿对齐轴滑动（span 回退），在视口边缘附近保持可见。',
    },
  ],
  usage: {
    description:
      '使用 CSS Anchor Positioning 与 Popover API 渲染浮层内容的核心定位 Hook。当更高层组件不够用时，把它作为自定义 popover、悬浮卡片、tooltip 和固定定位 layer 的基础。两种模式都使用主题正文默认值，并整体退出祖先 surface/group 归属（包括组持有的状态）。显式 prop 与无关上下文保持不变。通过 render 的样式或内容施加有意的格式，并在渲染出的 layer 内建立完整的内容级 Provider。',
    bestPractices: [
      {
        guidance: true,
        description:
          '锚定于触发元素的浮层用 context 模式；在指定坐标手动定位的浮层用 fixed 模式。',
      },
      {
        guidance: true,
        description:
          '常见浮层模式构建在 Popover、HoverCard、Tooltip 等更高层组件之上。',
      },
      {
        guidance: true,
        description:
          '依靠 Popover API 顶层逃出祖先裁剪与层叠，并把 layer 宿主在触发器附近而不是 body，使其继承触发器的主题级联并保持自然的焦点顺序。',
      },
      {
        guidance: false,
        description:
          '不要在 Layer 中直接实现 ARIA 模式，除非你同时拥有完整的无障碍行为。',
      },
    ],
  },
  relatedComponents: ['LayerProvider', 'Popover', 'HoverCard', 'Tooltip'],
  relatedHooks: ['usePopover', 'useHoverCard', 'useTooltip'],
  importPath: '@astryxdesign/core/Layer',
  category: 'interaction',
};

/** @type {import('@astryxdesign/cli/authoring').HookTranslationDoc} */
export const docsDense = {
  description:
    '经 CSS Anchor Positioning + Popover API 渲染浮层内容的核心定位 Hook。自定义 popover、悬浮卡片、tooltip、固定定位 layer 的基础。两种模式都使用主题正文默认值并整体退出祖先 surface/group 归属。显式 prop 与无关上下文不变；在渲染出的 layer 内建立有意的分组并补齐所需 Provider。',
  paramDescriptions: {
    mode: '定位策略：context = 相对触发器的 CSS anchor；fixed = 显式 x/y 坐标',
    onShow: 'layer 变为可见时触发。',
    onHide: 'layer 隐藏时触发。',
    lightDismiss: '是否启用原生点击外部轻触关闭。',
    lazyMount:
      '仅 context：推迟位置解析/内容挂载到 show；hide 时卸载。',
  },
  returnDescriptions: {
    ref: 'context 模式的触发器 ref；fixed 模式为 undefined。',
    anchorId: 'CSS anchor 名称。',
    show: '显示 layer。',
    hide: '隐藏 layer。',
    isOpen: 'layer 是否打开。',
    id: '唯一 ARIA id。',
    render:
      '渲染 popover 元素；传 placement/alignment 或 x/y。placement/alignment 为逻辑值：映射到 self-* position-area 关键字，按弹出层继承的方向解析（纯 CSS 中 RTL 镜像）。`positioning: "custom"`（context 模式）= 自行通过 `style` 编写定位样式；保留 popover 行为 + position-anchor 接线，不派生任何样式（含 RTL 镜像，改由你负责）。`offset`（context 模式）= 与锚点的间距，CSS 长度（数字 = px），作用于放置轴两侧，翻转时保持；layer 默认贴紧。context 模式先渲染惰性 `<template>` 标记以稳定 SSR/水合，然后把最终 layer 保留在安全的 JSX 位置或 portal 到最近的安全祖先；CSS 自定义属性从该宿主继续继承，方向与书写模式保持 JSX 位置的原值。`lazyMount` 等到 show，hide 时卸载内容而标记保留。Popover API 顶层无论宿主在哪都能逃出裁剪/层叠。视口溢出：翻转到对侧；居中 layer 还会沿对齐轴滑动（span 回退）。',
  },
  usage: {
    description:
      '经 CSS Anchor Positioning + Popover API 渲染浮层内容的核心定位 Hook。自定义 popover、悬浮卡片、tooltip、固定定位 layer 的基础。两种模式都使用主题正文默认值并整体退出祖先 surface/group 归属。显式 prop 与无关上下文不变；在渲染出的 layer 内建立有意的分组并补齐所需 Provider。',
    bestPractices: [
      {
        guidance: true,
        description:
          '触发器锚定的浮层用 context 模式；显式坐标用 fixed 模式。',
      },
      {
        guidance: true,
        description:
          '常见浮层模式构建在 Popover/HoverCard/Tooltip 之上。',
      },
      {
        guidance: true,
        description:
          '依靠 Popover API 顶层逃出裁剪/层叠；把 layer 宿主在触发器附近（不要放 body），以继承触发器主题级联和自然焦点顺序。',
      },
      {
        guidance: false,
        description:
          '不要在 Layer 中直接实现 ARIA，除非你拥有完整的无障碍行为。',
      },
    ],
  },
};
