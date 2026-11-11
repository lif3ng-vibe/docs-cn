// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'LayoutFooter',
  subComponentOf: 'Layout',
  displayName: 'Layout Footer',
  isHiddenFromOverview: true,
  description: '用于操作栏、分页与状态栏的底部栏。',
  playground: {
    defaults: {
      children: '页脚内容：状态栏或操作',
      hasDivider: true,
    },
    wrapper: {
      component: 'Layout',
      slotProp: 'footer',
      props: {
        content: {
          __element: 'LayoutContent',
          props: {},
          children: '主内容区域',
        },
      },
    },
  },
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: '页脚内容。',
    },
    {
      name: 'hasDivider',
      type: 'boolean',
      description:
        '顶边的边框。未设置时，由父级 Layout 的 defaultHasDividers 决定。',
      default: 'false',
    },
    {
      name: 'height',
      type: 'SizeValue',
      description:
        '页脚高度。数字按像素处理，字符串原样使用。',
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
      name: 'role',
      type: 'AriaRole',
      description: 'ARIA 地标角色。',
    },
    {
      name: 'ref',
      type: 'React.Ref<HTMLDivElement>',
      description: '转发到页脚元素的 ref。',
    },
  ],
};

export const docsZh = {
  name: 'LayoutFooter',
  isHiddenFromOverview: true,
  displayName: 'Layout Footer',
  description: '用于操作栏、分页和状态栏的底部栏。',
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: '页脚内容。',
    },
    {
      name: 'hasDivider',
      type: 'boolean',
      description:
        '顶部边缘的边框。未设置时，由父级 Layout 的 defaultHasDividers 决定。',
      default: 'false',
    },
    {
      name: 'height',
      type: 'SizeValue',
      description: '页脚高度。数字类型会被解释为像素值，字符串类型按原样使用。',
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
      name: 'role',
      type: 'AriaRole',
      description: 'ARIA 地标角色。',
    },
    {
      name: 'ref',
      type: 'React.Ref<HTMLDivElement>',
      description: '转发到页脚元素的 ref。',
    },
  ],
};

export const docsDense = {
  name: 'LayoutFooter',
  isHiddenFromOverview: true,
  displayName: 'Layout Footer',
  description: '用于操作栏、分页与状态栏的底部栏。',
  propDescriptions: {
    children: '页脚内容。',
    hasDivider: '顶边的边框；未设置时使用 Layout 默认值。',
    height: '页脚高度。',
    label: '地标元素的无障碍标签。',
    padding:
      '每条边的内边距；取代布局内缩。0 为通栏。',
    role: 'ARIA 地标角色。',
    ref: '转发到页脚元素的 ref。',
  },
};
