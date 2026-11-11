// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docs = {
  name: 'Layer',
  displayName: 'Layer',
  group: 'Utilities',
  category: 'Utility',
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
  usage: {
    description:
      'Layer 工具提供浮层系统使用的应用级 Provider。在应用根部用 LayerProvider 做 toast/layer 配置；大多数浮层 UI 使用更高层的 Popover、HoverCard 或 Tooltip API。渲染出来的 layer 内容（不是 Provider 的应用子树）使用主题正文默认值，并退出祖先 surface/group 归属。在每个 layer 内建立有意的分组并补齐所需 Provider。每个锚定浮层与每个视口边缘保持边距——取 spacing-4 步进与设备安全区插卡的较大者——且以视口为上限，从不超过触发器旁边的空间：显式宽度按其尺寸渲染，放不下时翻转，两侧都放不下时滑入视野。在视口边缘悬浮常驻栏的应用，把它一次性声明为 LayerProvider 的 inset（blockStart、blockEnd、inlineStart、inlineEnd）；每条边都会加到所有锚定浮层与该边的边距上，并把 toast 视口移动相同距离，默认为零。inset 是应用配置，不是主题值。',
    bestPractices: [
      {
        guidance: true,
        description:
          '把悬浮在视口上的常驻栏一次性声明为 LayerProvider 的 inset；之后每个锚定浮层和 toast 都会避开它。',
      },
      {
        guidance: true,
        description:
          '需要共享 toast/layer 配置时，在应用根部附近使用一次 LayerProvider。',
      },
      {
        guidance: true,
        description:
          '常见浮层模式构建在 Popover、HoverCard、Tooltip 等更高层组件之上。',
      },
      {
        guidance: false,
        description:
          '不要嵌套 LayerProvider 来改 toast 设置：嵌套的 Provider 保留外层 toast 配置，不会挂载第二个 toast 视口。',
      },
    ],
  },
  components: [
    {
      name: 'LayerProvider',
      displayName: 'Layer Provider',
      description:
        '面向 toast 和视口 inset 的应用级配置。嵌套的 Provider 不会挂载第二个 toast 视口，并保留外层 toast 配置；声明了 inset 的 Provider 会把声明的边缘应用到其子树内的锚定浮层。',
      props: [
        {
          name: 'children',
          type: 'ReactNode',
          description:
            '可以使用共享 layer 上下文的应用子树。',
          required: true,
        },
        {
          name: 'toast',
          type: 'LayerToastConfig',
          description:
            'Toast 视口配置。控制 position、maxVisible，以及仅作用于 toast 的 inset——对通过 useToast 显示的 toast，按边覆盖 Provider 的 inset。',
        },
        {
          name: 'inset',
          type: 'LayerInset',
          description:
            '悬浮在视口边缘的常驻栏，一次性声明：blockStart、blockEnd、inlineStart、inlineEnd 为像素数字或 CSS 长度。每条边都会加到所有锚定浮层与该边保持的边距上，并把 toast 视口移动相同距离。每条边默认为零。',
        },
      ],
    },
  ],
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  usage: {
    description:
      '浮层系统的应用级 Provider。应用根部用 LayerProvider 做 toast/layer 配置；大多数浮层 UI 用 Popover/HoverCard/Tooltip。layer 内容使用主题正文默认值并退出祖先 surface/group 归属；在其中建立有意的分组并补齐所需 Provider。应用子树不变。',
    bestPractices: [
      {
        guidance: true,
        description:
          '在应用根部附近使用一次 LayerProvider，共享 toast/layer 配置。',
      },
      {
        guidance: true,
        description:
          '常见浮层模式用 Popover/HoverCard/Tooltip。',
      },
      {
        guidance: false,
        description:
          '不要嵌套 LayerProvider 改 toast 配置：嵌套 Provider 保留外层 toast 配置。',
      },
    ],
  },
  components: [
    {
      name: 'LayerProvider',
      description: 'toast/layer 系统的应用级 Provider。',
      propDescriptions: {
        children: '使用共享 layer 上下文的应用子树',
        toast: 'toast 视口配置：position、maxVisible、inset',
        inset:
          '悬浮在视口边缘的常驻栏，为浮层与 toast 一次性声明',
      },
    },
  ],
};
