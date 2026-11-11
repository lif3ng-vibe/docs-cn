// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentAnatomyElement[]} */
const anatomy = [
  {
    name: 'Menu',
    required: true,
    description:
      '导航标题操作的菜单容器，带菜单语义与键盘导航。',
  },
  {
    name: 'Item',
    required: true,
    description: 'Menu 内可选的操作或导航链接。',
  },
  {
    name: 'Icon',
    required: false,
    description: '显示在 Item 标签之前的可选 Icon 渲染图形。',
  },
  {
    name: 'Text-rendered item label',
    required: false,
    description: '经 Text 渲染的字符串 Item 标签。',
  },
  {
    name: 'Caller-rendered item label',
    required: false,
    description: '由调用方直接渲染的非字符串 Item 标签内容。',
  },
  {
    name: 'Item description',
    required: false,
    description: '经 Text 渲染的可选辅助描述。',
  },
];

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'NavHeadingMenu',
  displayName: 'Nav Heading Menu',
  group: 'Navigation',
  category: 'Navigation',
  isHiddenFromOverview: true,
  hidden: false,
  keywords: ['nav', 'menu', 'navigation', 'heading', 'menu-item', 'popover', '导航', '菜单', '标题菜单'],
  usage: {
    anatomy,
    description:
      '导航标题弹层用的无障碍菜单容器与菜单项。' +
      'NavHeadingMenu 提供带键盘导航的 role="menu"；' +
      'NavHeadingMenuItem 渲染单个可选菜单项。' +
      '作为 SideNavHeading 或 TopNavHeading 的 menu prop 传入。',
  },
  playground: {
    defaults: {
      children: [
        {__element: 'NavHeadingMenuItem', props: {label: '仪表板', href: '#'}},
        {__element: 'NavHeadingMenuItem', props: {label: '分析', href: '#'}},
        {__element: 'NavHeadingMenuItem', props: {label: '设置', href: '#'}},
      ],
    },
  },
  props: [
    {name: 'children', type: 'ReactNode', required: true, description: '菜单项。'},
    {name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: '控制最小宽度与菜单项内边距。'},
    {name: 'minWidth', type: 'number | string', description: '最小宽度覆盖。'},
    {name: 'xstyle', type: 'StyleXStyles', description: '用于布局定制（边距、定位、尺寸）的 StyleX 样式。必须是 stylex.create() 的值，不能是 style={{}} 这样的内联样式对象。'},
  ],
  theming: {
    targets: [
      {className: 'astryx-nav-heading-menu', visualProps: ['size']},
      {className: 'astryx-nav-heading-menu-item', visualProps: ['size']},
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description: '导航标题弹层用的无障碍菜单容器 + 菜单项。NavHeadingMenu = 带键盘导航的 role="menu"；NavHeadingMenuItem 渲染可选项。',
  usage: {
    anatomy,
    description:
      '导航标题弹层用的无障碍菜单容器 + 菜单项。NavHeadingMenu 提供带键盘导航的 role="menu"；NavHeadingMenuItem 渲染单个可选项。作为 SideNavHeading 或 TopNavHeading 的 menu prop 传入。',
  },
  propDescriptions: {
    size: '控制最小宽度 + 菜单项内边距',
    minWidth: '最小宽度覆盖',
  },
};
