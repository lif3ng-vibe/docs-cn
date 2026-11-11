// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'TopNavHeading',
  subComponentOf: 'TopNav',
  displayName: 'Top Nav Heading',
  isHiddenFromOverview: true,
  description: 'TopNav 标题插槽的产品/套件/账户标题。支持智能交互边界逻辑：logo、标题文本、带独立链接的上标题/下标题，以及带自动箭头指示器的可选菜单弹出层。',
  playground: {
    defaults: {superheading: 'Acme Suite', heading: 'Acme Console'},
  },
  props: [
    {
      name: 'logo',
      type: 'ReactNode',
      description: '显示在标题文本之前的 logo 元素。可以是图片、NavIcon 或任意 ReactNode。',
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
      name: 'heading',
      type: 'string',
      description: '作为主标题文本显示的产品/应用名称。',
    },
    {
      name: 'headingHref',
      type: 'string',
      description: '标题文本的链接 (如产品首页)。没有菜单且这是唯一 href 时，整个标题变为一个可点击链接。',
    },
    {
      name: 'superheading',
      type: 'string',
      description: '标题上方的文本 (如套件名称)。以较小的次要样式渲染。',
    },
    {
      name: 'superheadingHref',
      type: 'string',
      description: '上标题文本的链接 (如套件首页)。与菜单一起提供时，渲染为独立的内联链接。',
    },
    {
      name: 'subheading',
      type: 'string',
      description: '标题下方的文本 (如账户上下文)。以较小的次要样式渲染。',
    },
    {
      name: 'subheadingHref',
      type: 'string',
      description: '下标题文本的链接。与菜单一起提供时，渲染为独立的内联链接。',
    },
    {
      name: 'headerEndContent',
      type: 'ReactNode',
      description: '渲染在标题行尾部的内容 (如徽章或状态指示器)。',
      slotElements: [
        {
          __element: 'Button',
          props: {
            label: 'Action',
            variant: 'ghost',
            size: 'sm',
          },
        },
      ],
    },
    {
      name: 'menu',
      type: 'ReactNode',
      description: '在弹出层下拉菜单中显示的菜单内容。提供时自动出现箭头指示器。交互边界由 href 是否存在决定：没有 href 时整个标题为触发器；有 href 时链接各自独立，箭头区域为触发器。',
      slotElements: [
        {
          __element: 'Button',
          props: {
            label: 'Action',
            variant: 'ghost',
            size: 'sm',
          },
        },
      ],
    },
    {
      name: 'as',
      type: 'LinkComponentType',
      description: '替代 <a> 渲染的自定义组件。覆盖 LinkProvider 设置的提供方级默认值。必须接受 href、className、style 与 children prop。',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description: '用于布局自定义的 StyleX 样式。必须是 stylex.create() 的值。',
    },
  ],
};

export const docsZh = {
  name: 'TopNavHeading',
  isHiddenFromOverview: true,
  displayName: 'Top Nav Heading',
  description: 'TopNav 标题插槽的产品/套件/账户标题组件。支持智能交互边界逻辑：标志、标题文本、独立链接的上标题/下标题，以及带自动箭头指示器的可选菜单弹出层。',
  props: [
    {
      name: 'logo',
      type: 'ReactNode',
      description: '在标题文本前显示的标志元素。可以是图片、NavIcon 或任何 ReactNode。',
    },
    {
      name: 'heading',
      type: 'string',
      description: '作为主标题文本显示的产品/应用名称。',
    },
    {
      name: 'headingHref',
      type: 'string',
      description: '标题文本的链接（如产品首页）。当没有菜单且这是唯一的 href 时，整个标题变为一个可点击链接。',
    },
    {
      name: 'superheading',
      type: 'string',
      description: '标题上方的文本（如套件名称）。以较小的次要样式渲染。',
    },
    {
      name: 'superheadingHref',
      type: 'string',
      description: '上标题文本的链接（如套件首页）。与菜单一起提供时，渲染为独立的内联链接。',
    },
    {
      name: 'subheading',
      type: 'string',
      description: '标题下方的文本（如账户上下文）。以较小的次要样式渲染。',
    },
    {
      name: 'subheadingHref',
      type: 'string',
      description: '下标题文本的链接。与菜单一起提供时，渲染为独立的内联链接。',
    },
    {
      name: 'headerEndContent',
      type: 'ReactNode',
      description: '在标题行尾部渲染的内容（如徽章或状态指示器）。',
    },
    {
      name: 'menu',
      type: 'ReactNode',
      description: '在弹出层下拉菜单中显示的菜单内容。提供时自动显示箭头指示器。交互边界由 href 的存在决定：没有 href 时整个标题为触发器；有 href 时链接独立，箭头区域为触发器。',
    },
    {
      name: 'as',
      type: 'LinkComponentType',
      description: '用于替代 <a> 的自定义链接组件。覆盖 LinkProvider 设置的默认组件。必须接受 href、className、style 和 children 属性。',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description: '用于布局自定义的 StyleX 样式。必须是 stylex.create() 的值。',
    },
  ],
};

export const docsDense = {
  name: 'TopNavHeading',
  isHiddenFromOverview: true,
  displayName: 'Top Nav Heading',
  description: 'TopNav 的产品/套件标题：logo + 标题文本，带智能交互边界、可选菜单弹出层、带独立链接的上/下标题。',
  propDescriptions: {
    logo: '标题文本前的 logo。图片、NavIcon 或 ReactNode。',
    heading: '产品/应用名称。',
    headingHref: '标题链接 (产品首页)。唯一 href 且无菜单 → 整个标题为链接。',
    superheading: '标题上方文本 (套件名称)。较小次要样式。',
    superheadingHref: '上标题链接。有菜单时为独立内联链接。',
    subheading: '标题下方文本 (账户上下文)。较小次要样式。',
    subheadingHref: '下标题链接。有菜单时为独立内联链接。',
    headerEndContent: '尾部内容 (徽章、状态指示器)。',
    menu: '弹出层下拉内容。自动显示箭头。无 href → 整个标题为触发器；有 href → 箭头区域为触发器。',
    as: '自定义链接组件。覆盖 LinkProvider 默认值。必须接受 href、className、style、children。',
    xstyle: 'StyleX 布局样式。必须是 stylex.create() 值。',
  },
};
