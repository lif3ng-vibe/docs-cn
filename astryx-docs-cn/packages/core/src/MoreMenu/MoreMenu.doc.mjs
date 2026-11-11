// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentAnatomyElement[]} */
const anatomy = [
  {
    name: 'Trigger button',
    required: true,
    description:
      '提供可见溢出菜单入口的纯图标 Button。',
  },
  {
    name: 'Icon-resolved trigger icon',
    required: false,
    description:
      '由当前 Icon 注册表解析出的默认语义三点图形。',
  },
  {
    name: 'Caller-rendered trigger content',
    required: false,
    description:
      '直接作为触发器图标覆盖提供的任意 React 内容。',
  },
  {
    name: 'Menu surface',
    required: true,
    description:
      'DropdownMenu 面板，同时承载 MoreMenu 当前的公开目标。',
  },
  {
    name: 'Pointer action row',
    required: false,
    description:
      '锚定呈现下由 DropdownMenu 渲染的操作或嵌套操作触发行。',
  },
  {
    name: 'Touch action row',
    required: false,
    description:
      'BottomSheet 呈现下由 DropdownMenu 渲染的 ListItem 按钮。',
  },
];

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'MoreMenu',
  displayName: 'More Menu',
  category: 'Action',
  keywords: ["moremenu","overflow","kebab","dotmenu","threedot","ellipsis","dropdown","contextmenu","actionmenu","溢出菜单","更多操作","三点菜单"],
  props: [
    {
      name: 'items',
      type: 'DropdownMenuOption[]',
      description:
        '菜单项：由操作、分割线与分组组成的数据数组。类型与 DropdownMenu 的 items prop 相同。',
      required: true,
    },
    {
      name: 'label',
      type: 'string',
      description:
        '触发按钮的无障碍标签（aria-label）与工具提示文本。',
      default: "'More options'",
    },
    {
      name: 'variant',
      type: 'ButtonVariant',
      description: '触发按钮的视觉样式变体。',
      default: "'ghost'",
    },
    {
      name: 'size',
      type: 'ButtonSize',
      description: '触发按钮的尺寸。',
      default: "'md'",
    },
    {
      name: 'icon',
      type: 'ReactNode',
      description:
        '覆盖默认的三点图标。接受任意 ReactNode。',
      slotElements: [{__element: 'Icon', props: {icon: 'check', size: 'sm'}}],
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: '菜单触发器是否禁用。',
      default: 'false',
    },
    {
      name: 'placement',
      type: "'above' | 'below' | 'start' | 'end'",
      description:
        '菜单相对触发器的位置。逻辑方向：start/end 依据菜单自身继承的书写方向解析（RTL 自动镜像）。',
      default: "'below'",
    },
    {
      name: 'alignment',
      type: "'start' | 'center' | 'end'",
      description:
        "沿放置轴的对齐方式。用 'end' 让菜单与触发器的尾部边缘对齐，这通常是溢出菜单想要的效果。",
      default: "'start'",
    },
    {
      name: 'presentation',
      type: "'popover' | 'bottom-sheet' | 'adaptive'",
      description: '转发给 DropdownMenu 的呈现策略。`adaptive` 在指针布局中保持锚定浮层，在紧凑触屏上使用 BottomSheet：主指针为粗指针，且视口窄于主题 `md` 断点（默认 768px）或矮于 500px。省略时菜单为锚定浮层；且在任何设备上用手指操作时，打开菜单的那根手指移动 10 px 后才会选中某一行。传 \'popover\' 可在所有设备上保持指针行为，稳定规则也包括在内。',
    },
    {
      name: 'onOpenChange',
      type: '(isOpen: boolean) => void',
      description: '菜单打开或关闭时触发的回调。',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于布局定制（边距、定位、尺寸）的 StyleX 样式。必须是 stylex.create() 的值，不能是 style={{}} 这样的内联样式对象。',
    },
  ],
  playground: {
    defaults: {
      items: [
        {label: '编辑', value: 'edit'},
        {label: '复制', value: 'duplicate'},
        {label: '删除', value: 'delete'},
      ],
    },
  },
  theming: {
    targets: [
      {className: 'astryx-more-menu'},
    ],
  },
  usage: {
    anatomy,
    description:
      'MoreMenu 是一个打开操作列表的三点按钮。用于无需始终可见的次要操作，例如表格行、卡片头部或工具栏中。',
    bestPractices: [
      { guidance: true, description: '用于溢出或次要操作；主要操作保持在菜单之外直接可见。' },
      { guidance: true, description: '菜单项较多时，用分割线或分组把相关操作归为一组。' },
      { guidance: true, description: '当可见的溢出触发器需要在紧凑触屏设备上打开拇指可达的 BottomSheet 时，使用 `presentation="adaptive"`。' },
      { guidance: false, description: '不要把主要操作藏进 MoreMenu；它们应当直接可见。' },
    ],
  },
};
/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docsZh = {
  name: 'MoreMenu',
  displayName: 'More Menu',
  props: [
    {
      name: 'items',
      type: 'DropdownMenuOption[]',
      description:
        '菜单项，由操作、分割线和分组组成的数据数组。类型与 DropdownMenu 的 items 属性相同。',
      required: true,
    },
    {
      name: 'label',
      type: 'string',
      description:
        '触发按钮的无障碍标签（aria-label）和工具提示文本。',
      default: "'More options'",
    },
    {
      name: 'variant',
      type: 'ButtonVariant',
      description: '触发按钮的视觉样式变体。',
      default: "'ghost'",
    },
    {
      name: 'size',
      type: 'ButtonSize',
      description: '触发按钮的尺寸。',
      default: "'md'",
    },
    {
      name: 'icon',
      type: 'ReactNode',
      description:
        '覆盖默认的三点图标。接受任何 ReactNode。',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: '菜单触发器是否禁用。',
      default: 'false',
    },    {
      name: 'placement',
      type: "'above' | 'below' | 'start' | 'end'",
      description:
        '菜单相对于触发按钮的位置。逻辑方向：start/end 依据菜单自身继承的书写方向解析（RTL 自动镜像）。',
      default: "'below'",
    },
    {
      name: 'alignment',
      type: "'start' | 'center' | 'end'",
      description:
        "沿放置轴的对齐方式。使用 'end' 让菜单与触发器的尾部边缘对齐，这通常是溢出菜单所需的效果。",
      default: "'start'",
    },
    {
      name: 'presentation',
      type: "'popover' | 'bottom-sheet' | 'adaptive'",
      description: '菜单呈现策略。`adaptive` 在指针布局中使用锚定浮层，在主指针为粗略指针且视口宽度小于主题的 `md` 断点（默认 768px）或高度小于 500px 时使用 BottomSheet。省略时，菜单为锚定浮层；在任何设备上用手指操作时，打开菜单的手指移动 10 px 后才会选择菜单项。传入 \'popover\' 可在所有设备上保持指针行为，包括稳定规则。',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于布局自定义的 StyleX 样式（边距、定位、尺寸）。必须是 stylex.create() 的值，不能是内联样式对象如 style={{}}。',
    },
  ],
  theming: {
    targets: [
      {className: 'astryx-more-menu'},
    ],
  },
  usage: {
    description:
      'MoreMenu is a three-dot button that opens a list of actions. Use it for secondary actions that don\'t need to be always visible, like in table rows, card headers, or toolbars.',
    bestPractices: [
      { guidance: true, description: 'Use for overflow or secondary actions; keep primary actions visible outside the menu.' },
      { guidance: true, description: 'Use dividers or sections to group related actions when the menu has many items.' },
      { guidance: true, description: 'Use `presentation="adaptive"` when the visible overflow trigger should open a thumb-reachable BottomSheet on compact touch devices.' },
      { guidance: false, description: 'Hide primary actions inside a MoreMenu; they should be directly visible.' },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description:
    '带三点图标触发器的溢出菜单。便捷包装：把纯图标 Button 与下拉菜单组合起来，免去状态管理、定位与无障碍的样板代码。',
  usage: {
    anatomy,
    description:
      'MoreMenu 是一个打开操作列表的三点按钮。用于无需始终可见的次要操作，例如表格行、卡片头部或工具栏中。',
    bestPractices: [
      { guidance: true, description: '用于溢出或次要操作；主要操作保持在菜单之外直接可见。' },
      { guidance: true, description: '菜单项较多时，用分割线或分组把相关操作归为一组。' },
      { guidance: true, description: '当可见的溢出触发器需要在紧凑触屏设备上打开拇指可达的 BottomSheet 时，使用 `presentation="adaptive"`。' },
      { guidance: false, description: '不要把主要操作藏进 MoreMenu；它们应当直接可见。' },
    ],
  },
  propDescriptions: {
    items: '菜单项（操作、分割线、分组）。类型与 DropdownMenu items 相同。',
    label: '无障碍标签（aria-label）+ 工具提示文本。',
    variant: '触发按钮的视觉样式变体。',
    size: '触发按钮尺寸。',
    icon: '覆盖默认三点图标。接受任意 ReactNode。',
    isDisabled: '菜单触发器是否禁用。',
    placement: '菜单相对触发器的位置。逻辑方向（RTL 镜像）。',
    alignment:
      "沿放置轴的对齐方式。'end' 与触发器尾部边缘对齐。",
    presentation:
      'Popover、BottomSheet 或 adaptive 紧凑触屏呈现。',
    xstyle:
      '用于布局定制（边距、定位、尺寸）的 StyleX 样式。必须是 stylex.create() 值。',
  },
};
