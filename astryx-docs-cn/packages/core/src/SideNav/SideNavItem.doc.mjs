// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'SideNavItem',
  subComponentOf: 'SideNav',
  displayName: 'Side Nav Item',
  isHiddenFromOverview: true,
  description: '导航项，支持图标、选中状态、可选尾部内容，以及通过 children 实现嵌套。',
  playground: {
    defaults: {label: '仪表盘', icon: 'viewColumns', isSelected: true},
  },
  props: [
    {
      name: 'label',
      type: 'string',
      description: '项目标签。',
      required: true,
    },
    {
      name: 'as',
      type: 'LinkComponentType',
      description: '自定义链接组件。',
    },
    {
      name: 'icon',
      type: 'IconType',
      description: '轮廓（未选中）变体中显示的图标。有效的语义名称见 `astryx docs icons`。',
    },
    {
      name: 'selectedIcon',
      type: 'IconType',
      description: '选中时显示的图标（填充变体）。有效的语义名称见 `astryx docs icons`。',
    },
    {
      name: 'isSelected',
      type: 'boolean',
      description: '将此项标记为当前页面。',
      default: 'false',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: '禁用状态。',
      default: 'false',
    },
    {
      name: 'href',
      type: 'string',
      description: '导航 URL。',
    },
    {
      name: 'onClick',
      type: '(e: MouseEvent) => void',
      description: '点击处理函数。',
    },
    {
      name: 'endContent',
      type: 'ReactNode',
      description: '仅用于被动右侧内容（徽章、计数）。交互控件请使用 actions。',
      slotElements: [
        {
          __element: 'Icon',
          props: {
            icon: 'chevronDown',
            size: 'sm',
          },
        },
        {
          __element: 'Badge',
          props: {
            label: '3',
          },
        },
      ],
    },
    {
      name: 'actions',
      type: 'ReactNode',
      description:
        '行级次要控件（图标按钮、菜单），作为主元素的同级节点渲染在行尾——位于展开/折叠切换按钮之后、任何嵌套子项之前（DOM 与焦点顺序一致）。每个控件自行负责其无障碍名称与行为。控件通过 SizeContext 继承行内控件尺寸，因此未指定尺寸的图标按钮会与内置的展开/折叠切换按钮保持同一尺寸；显式指定的 size 优先。侧边栏折叠为图标栏时隐藏。被动内容（徽章、计数）请使用 endContent；交互内容请使用 actions。',
      slotElements: [
        {
          __element: 'Button',
          props: {label: 'Rename', variant: 'ghost', size: 'sm'},
        },
      ],
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: '用于嵌套的子项。嵌套项与顶层项一样横跨导航列表全宽；其内容按嵌套层级逐级缩进。',
      slotElements: [
        {
          __element: 'SideNavItem',
          props: {
            label: 'Sub Item',
          },
        },
      ],
    },
    {
      name: 'collapsible',
      type: 'boolean | { defaultIsCollapsed?: boolean, isCollapsed?: boolean, onCollapsedChange?: (isCollapsed: boolean) => void }',
      description: '启用带子项的折叠行为。传 true 为非受控模式（默认展开），或传对象用于受控模式。',
      default: 'false',
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: '导航项行的尺寸变体。',
      default: "'md'",
    },
  ],
};

export const docsZh = {
  name: 'SideNavItem',
  isHiddenFromOverview: true,
  displayName: 'Side Nav Item',
  description: '导航项，支持图标、选中状态、可选尾部内容，以及通过 children 实现嵌套。',
  props: [
    {
      name: 'label',
      type: 'string',
      description: '项目标签。',
      required: true,
    },
    {
      name: 'as',
      type: 'LinkComponentType',
      description: '自定义链接组件。',
    },
    {
      name: 'icon',
      type: 'IconType',
      description: '轮廓（未选中）变体中显示的图标。',
    },
    {
      name: 'selectedIcon',
      type: 'IconType',
      description: '选中时显示的图标（填充变体）。',
    },
    {
      name: 'isSelected',
      type: 'boolean',
      description: '将此项标记为当前页面。',
      default: 'false',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: '禁用状态。',
      default: 'false',
    },
    {
      name: 'href',
      type: 'string',
      description: '导航 URL。',
    },
    {
      name: 'onClick',
      type: '(e: MouseEvent) => void',
      description: '点击处理函数。',
    },
    {
      name: 'endContent',
      type: 'ReactNode',
      description: '仅用于被动右侧内容（徽章、计数）。交互控件请使用 actions。',
    },
    {
      name: 'actions',
      type: 'ReactNode',
      description:
        '行级次要控件（图标按钮、菜单），作为主元素的同级节点渲染在行尾——位于展开/折叠切换按钮之后、任何嵌套子项之前（DOM 与焦点顺序一致）。每个控件自行负责其无障碍名称与行为。控件通过 SizeContext 继承行内控件尺寸，因此未指定尺寸的图标按钮会与内置的展开/折叠切换按钮保持同一尺寸；显式指定的 size 优先。侧边栏折叠为图标栏时隐藏。被动内容（徽章、计数）请使用 endContent；交互内容请使用 actions。',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: '用于嵌套的子项。',
    },
    {
      name: 'collapsible',
      type: 'boolean | { defaultIsCollapsed?: boolean, isCollapsed?: boolean, onCollapsedChange?: (isCollapsed: boolean) => void }',
      description: '启用带子项的折叠行为。传 true 为非受控模式（默认展开），或传对象用于受控模式。',
      default: 'false',
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: '导航项的尺寸变体。',
      default: "'md'",
    },
  ],
};

export const docsDense = {
  name: 'SideNavItem',
  isHiddenFromOverview: true,
  displayName: 'Side Nav Item',
  description: '导航项，带图标、选中状态、可选尾部内容，经 children 嵌套。',
  propDescriptions: {
    label: '项目标签。',
    as: '自定义链接组件。',
    icon: '轮廓（未选中）变体中显示的图标。',
    selectedIcon: '选中时显示的图标（填充变体）。',
    isSelected: '将此项标记为当前页面。',
    isDisabled: '禁用状态。',
    href: '导航 URL。',
    onClick: '点击处理函数。',
    endContent:
      '仅用于被动右侧内容（徽章、计数）。交互控件请放 actions。',
    actions:
      '行级次要控件（图标按钮、菜单），作为主元素的同级节点渲染，在 DOM/焦点顺序中位于展开/折叠切换按钮之后、嵌套子项之前。经 SizeContext 继承行内控件尺寸（显式 size 优先）。图标栏折叠时隐藏。被动内容放 endContent；交互内容放这里。',
    children: '用于嵌套的子项。嵌套行保持全宽；内容按层级逐级缩进。',
    collapsible: '为带子项的条目启用折叠。true=非受控，对象=受控模式。',
    size: "行尺寸变体：'sm' | 'md' | 'lg'。",
  },
};
