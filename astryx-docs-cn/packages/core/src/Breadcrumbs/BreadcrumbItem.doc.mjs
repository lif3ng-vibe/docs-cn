// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'BreadcrumbItem',
  subComponentOf: 'Breadcrumbs',
  displayName: 'Breadcrumb Item',
  isHiddenFromOverview: true,
  description: '单个面包屑项，提供 href 时渲染为链接，当前页面渲染为纯文本。',
  usage: {
    description:
      'BreadcrumbItem 表示面包屑路径中的一个目标页、操作、当前位置或同级菜单触发器。',
  },
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: '面包屑项的标签内容。',
      required: true,
    },
    {
      name: 'href',
      type: 'string',
      description: '面包屑链接的 URL；不可导航的项目请省略。',
    },
    {
      name: 'onClick',
      type: '(e: MouseEvent) => void',
      description: '面包屑项的点击处理函数。',
    },
    {
      name: 'isCurrent',
      type: 'boolean',
      description:
        '将此项标记为当前页面，应用 aria-current="page"。省略时，如果没有显式的当前项，则自动将最后一项标记为当前项；传入 false 可退出自动检测。',
    },
    {
      name: 'startIcon',
      type: 'ReactNode',
      description: '在项目标签前渲染的图标。',
      slotElements: [
        {
          __element: 'Icon',
          props: {
            icon: 'check',
            size: 'sm',
          },
        },
      ],
    },
    {
      name: 'menu',
      type: 'DropdownMenuOption[] | ReactNode',
      description:
        '激活项目时打开的菜单，使用与 DropdownMenu/MoreMenu/ContextMenu 相同的项目 API（DropdownMenuOption[] 数组或组合的 DropdownMenuItem 子元素）。渲染为带 chevron 和 aria-haspopup="menu" 的链接样式触发器。优先于 href/onClick。',
    },
    {
      name: 'menuSize',
      type: "'sm' | 'md' | 'lg'",
      description:
        "传递给菜单项的尺寸。默认根据面包屑变体推断（'supporting' → 'sm'，否则 'md'）。",
    },
    {
      name: 'as',
      type: 'LinkComponentType',
      description: '自定义链接组件，代替 <a> 渲染。覆盖 LinkProvider 设置的默认值。仅适用于非当前项。',
    },
  ],
};

export const docsZh = {
  name: 'BreadcrumbItem',
  isHiddenFromOverview: true,
  displayName: 'Breadcrumb Item',
  description: '单个面包屑项，提供 href 时渲染为链接，当前页面渲染为纯文本。',
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: '面包屑项的标签内容。',
      required: true,
    },
    {
      name: 'href',
      type: 'string',
      description: '面包屑链接的 URL；不可导航的项目请省略。',
    },
    {
      name: 'onClick',
      type: '(e: MouseEvent) => void',
      description: '面包屑项的点击处理函数。',
    },
    {
      name: 'isCurrent',
      type: 'boolean',
      description:
        '将此项标记为当前页面，应用 aria-current="page"。省略时，如果没有显式的当前项，则自动将最后一项标记为当前项；传入 false 可退出自动检测。',
    },
    {
      name: 'startIcon',
      type: 'ReactNode',
      description: '在项目标签前渲染的图标。',
    },
    {
      name: 'menu',
      type: 'DropdownMenuOption[] | ReactNode',
      description:
        '激活项目时打开的菜单，使用与 DropdownMenu/MoreMenu/ContextMenu 相同的项目 API（DropdownMenuOption[] 数组或组合的 DropdownMenuItem 子元素）。渲染为带 chevron 和 aria-haspopup="menu" 的链接样式触发器。优先于 href/onClick。',
    },
    {
      name: 'menuSize',
      type: "'sm' | 'md' | 'lg'",
      description:
        "传递给菜单项的尺寸。默认根据面包屑变体推断（'supporting' → 'sm'，否则 'md'）。",
    },
    {
      name: 'as',
      type: 'LinkComponentType',
      description: '自定义链接组件，代替 <a> 渲染。覆盖 LinkProvider 设置的默认值。仅适用于非当前项。',
    },
  ],
};

export const docsDense = {
  name: 'BreadcrumbItem',
  isHiddenFromOverview: true,
  displayName: 'Breadcrumb Item',
  description: '单个面包屑项；带 href 渲染为链接，当前页为纯文本',
  propDescriptions: {
    children: '标签内容',
    href: '链接 URL；不可导航项请省略',
    onClick: '点击处理函数',
    isCurrent:
      '以 aria-current="page" 标记当前页；省略时自动检测最后一项；false 退出自动检测',
    startIcon: '标签前的图标',
    menu: 'DropdownMenuOption[] | children；打开菜单触发器（aria-haspopup="menu"）；复用 DropdownMenu 项目 API',
    menuSize: '菜单项尺寸；按变体推断（supporting→sm，否则 md）',
    as: '自定义链接组件；覆盖 LinkProvider 默认值',
  },
};
