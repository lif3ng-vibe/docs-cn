// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').HookDoc} */
export const docs = {
  name: 'useAnimatedLayout',
  displayName: 'useAnimatedLayout',
  keywords: [
    'animated layout',
    'layout shift',
    'glide',
    'expand',
    'collapse',
    'disclosure',
    'reflow',
    'jump',
    'motion',
    'transition',
    '布局动画',
    '平滑移动',
  ],
  params: [
    {
      name: 'options.containerRef',
      type: 'RefObject<HTMLElement | null>',
      description:
        '平滑移动保持在其中的区域：即你已传给滚动容器或面板的 ref。ScrollableArea 的 ref 指向其原生滚动视口，传那个即可。',
      required: true,
    },
  ],
  returns: [
    {
      name: 'animatedLayout',
      type: 'AnimatedLayout',
      description:
        '无公开成员的不透明句柄。传给尺寸会变化的组件的 animatedLayout prop，如 TreeList 或 Collapsible。',
    },
  ],
  usage: {
    description:
      '返回一个句柄，传给尺寸会变化的组件，如 TreeList 或 Collapsible。该组件尺寸变化时，它与 `containerRef` 内位于其后的内容以同一个共享动效角色一起动画。fixed 与粘住的 sticky 元素保持不动，平滑移动绝不滚动该区域，并遵循减弱动效。在任何指针下都生效，鼠标也不例外。不传句柄时组件保持跳动：其后内容立即就位。变化之后的内容可混用 Astryx 组件与你自己的元素；无需任何选择加入。',
    bestPractices: [
      {
        guidance: true,
        description:
          '每个滚动容器或面板创建一个句柄，并把它传给其中每个尺寸会变化的组件。',
      },
      {
        guidance: true,
        description:
          '把你已传给 ScrollableArea 的 ref 作为 containerRef 传入；ScrollableArea 不会自行注册。',
      },
      {
        guidance: false,
        description:
          '不要为让内容移动而把展开区之后的内容包进额外元素；容器内变化之后的一切都会自行移动。',
      },
      {
        guidance: false,
        description:
          '不要在其旁边自行对 height 做动画；平滑移动用合成器 translate 移动内容，从不对 height 做动画。',
      },
    ],
  },
  relatedComponents: ['TreeList', 'Collapsible', 'ScrollableArea'],
  importPath: '@astryxdesign/core/hooks',
  category: 'motion & gestures',
};

/** @type {import('@astryxdesign/cli/authoring').HookTranslationDoc} */
export const docsDense = {
  description:
    '供尺寸变化组件 (TreeList、Collapsible) 使用的句柄：它与 containerRef 内其后的内容以共享动效角色平滑移动。fixed/粘住的 sticky 不动；绝不滚动区域；遵循减弱动效；所有指针皆可。无句柄 = 跳变。',
  paramDescriptions: {
    'options.containerRef':
      '平滑移动保持在其中的区域；传你给滚动容器的 ref (ScrollableArea 的 ref 指向其视口)。',
  },
  returnDescriptions: {
    animatedLayout:
      '不透明句柄，无成员；传给组件的 animatedLayout prop。',
  },
  usage: {
    description:
      '每个滚动容器/面板一个句柄，传给其中每个尺寸变化的组件。变化之后的内容 (Astryx 或应用元素) 平滑移动；无需逐元素选择加入。省略句柄则保持跳变。',
    bestPractices: [
      {
        guidance: true,
        description:
          '每区域一个句柄，由其中尺寸变化的组件共享。',
      },
      {
        guidance: true,
        description:
          '把 ScrollableArea 的 ref 作为 containerRef；它不会自行注册。',
      },
      {
        guidance: false,
        description:
          '不要把后续内容包进额外元素来让它移动。',
      },
      {guidance: false, description: '不要在其旁自行对 height 做动画。'},
    ],
  },
};
