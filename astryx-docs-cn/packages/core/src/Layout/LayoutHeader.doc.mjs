// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'LayoutHeader',
  subComponentOf: 'Layout',
  displayName: 'Layout Header',
  keywords: ['pageheader', 'appheader', 'header', '页眉', '页头', '顶栏'],
  isHiddenFromOverview: true,
  description: '用于页面标题、应用栏与工具栏的顶部栏。',
  playground: {
    defaults: {
      children: '页面标题',
      hasDivider: true,
    },
    wrapper: {
      component: 'Layout',
    },
  },
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: '页眉内容。',
    },
    {
      name: 'hasDivider',
      type: 'boolean',
      description:
        '底边的边框。未设置时，由父级 Layout 的 defaultHasDividers 决定。',
      default: 'false',
    },
    {
      name: 'height',
      type: 'SizeValue',
      description:
        '页眉高度。数字按像素处理，字符串原样使用。',
    },
    {
      name: 'label',
      type: 'string',
      description: '地标元素的无障碍标签。',
    },
    {
      name: 'padding',
      type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
      description:
        '每条边的内部内边距，使用间距刻度。取代布局提供的内缩；0 为通栏。',
    },
    {
      name: 'paddingBlockEnd',
      type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
      description:
        '块结束方向（底部）的内边距，使用间距刻度。仅覆盖该边的 padding；paddingBlockEnd={0} 会将最后一个子元素停靠在页眉底边。',
    },
    {
      name: 'role',
      type: 'AriaRole',
      description: 'ARIA 地标角色。',
    },
    {
      name: 'ref',
      type: 'React.Ref<HTMLDivElement>',
      description: '转发到页眉元素的 ref。',
    },
  ],
};

export const docsZh = {
  name: 'LayoutHeader',
  isHiddenFromOverview: true,
  displayName: 'Layout Header',
  description: '用于页面标题、应用栏和工具栏的顶部栏。',
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: '页眉内容。',
    },
    {
      name: 'hasDivider',
      type: 'boolean',
      description:
        '底部边缘的边框。未设置时，由父级 Layout 的 defaultHasDividers 决定。',
      default: 'false',
    },
    {
      name: 'height',
      type: 'SizeValue',
      description: '页眉高度。数字类型会被解释为像素值，字符串类型按原样使用。',
    },
    {
      name: 'label',
      type: 'string',
      description: '地标元素的无障碍标签。',
    },
    {
      name: 'padding',
      type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
      description:
        '所有边的内边距，使用间距刻度。替换布局提供的内边距；0 表示全出血。',
    },
    {
      name: 'paddingBlockEnd',
      type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
      description:
        '块结束（底部）内边距，使用间距刻度。仅在该边上覆盖 padding；paddingBlockEnd={0} 将最后一个子元素停靠在页眉底边。',
    },
    {
      name: 'role',
      type: 'AriaRole',
      description: 'ARIA 地标角色。',
    },
    {
      name: 'ref',
      type: 'React.Ref<HTMLDivElement>',
      description: '转发到页眉元素的 ref。',
    },
  ],
};

export const docsDense = {
  name: 'LayoutHeader',
  isHiddenFromOverview: true,
  displayName: 'Layout Header',
  description: '用于页面标题、应用栏与工具栏的顶部栏。',
  propDescriptions: {
    children: '页眉内容。',
    hasDivider: '底边的边框；未设置时使用 Layout 默认值。',
    height: '页眉高度。',
    label: '地标元素的无障碍标签。',
    padding:
      '每条边的内边距；取代布局内缩。0 为通栏。',
    paddingBlockEnd:
      '块结束方向（底部）内边距的覆盖值；在该边上优先于 padding。设为 0 时最后一个子元素停靠在页眉底边。',
    role: 'ARIA 地标角色。',
    ref: '转发到页眉元素的 ref。',
  },
};
