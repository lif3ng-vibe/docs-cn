// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'SideNavHeading',
  subComponentOf: 'SideNav',
  displayName: 'Side Nav Heading',
  isHiddenFromOverview: true,
  description: '产品/套件/账户头部，具有智能交互边界逻辑，支持链接和菜单弹出框。',
  playground: {
    defaults: {heading: 'Acme 控制台', subheading: '生产环境'},
  },
  props: [
    {
      name: 'heading',
      type: 'string',
      description: '产品/应用名称。',
      required: true,
    },
    {
      name: 'icon',
      type: 'ReactNode',
      description: '产品/应用图标。',
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
      name: 'headingHref',
      type: 'string',
      description: '标题的链接。',
    },
    {
      name: 'superheading',
      type: 'string',
      description: '标题上方的文本。',
    },
    {
      name: 'superheadingHref',
      type: 'string',
      description: '上方标题的链接。',
    },
    {
      name: 'subheading',
      type: 'string',
      description: '标题下方的文本。',
    },
    {
      name: 'subheadingHref',
      type: 'string',
      description: '下方标题的链接。',
    },
    {
      name: 'menu',
      type: 'ReactNode',
      description: '在弹出框内渲染的菜单内容。',
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
      name: 'headerEndContent',
      type: 'ReactNode',
      description: '在标题行尾部渲染的内容，位于文本和箭头之间。适用于徽章、状态指示器或紧凑操作按钮。折叠时隐藏。',
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
  ],
};

export const docsZh = {
  name: 'SideNavHeading',
  isHiddenFromOverview: true,
  displayName: 'Side Nav Heading',
  description: '产品/套件/账户头部，具有智能交互边界逻辑，支持链接和菜单弹出框。',
  props: [
    {
      name: 'heading',
      type: 'string',
      description: '产品/应用名称。',
      required: true,
    },
    {
      name: 'icon',
      type: 'ReactNode',
      description: '产品/应用图标。',
    },
    {
      name: 'headingHref',
      type: 'string',
      description: '标题的链接。',
    },
    {
      name: 'superheading',
      type: 'string',
      description: '标题上方的文本。',
    },
    {
      name: 'superheadingHref',
      type: 'string',
      description: '上方标题的链接。',
    },
    {
      name: 'subheading',
      type: 'string',
      description: '标题下方的文本。',
    },
    {
      name: 'subheadingHref',
      type: 'string',
      description: '下方标题的链接。',
    },
    {
      name: 'menu',
      type: 'ReactNode',
      description: '在弹出框内渲染的菜单内容。',
    },
    {
      name: 'headerEndContent',
      type: 'ReactNode',
      description: '在标题行尾部渲染的内容，位于文本和箭头之间。适用于徽章、状态指示器或紧凑操作按钮。折叠时隐藏。',
    },
  ],
};

export const docsDense = {
  name: 'SideNavHeading',
  isHiddenFromOverview: true,
  displayName: 'Side Nav Heading',
  description: '产品/套件/账户头部，带智能交互边界逻辑，支持链接 + 菜单弹出框。',
  propDescriptions: {
    heading: '产品/应用名称。',
    icon: '产品/应用图标。',
    headingHref: '标题的链接。',
    superheading: '标题上方的文本。',
    superheadingHref: '上方标题的链接。',
    subheading: '标题下方的文本。',
    subheadingHref: '下方标题的链接。',
    menu: '在弹出框内渲染的菜单内容。',
    headerEndContent: '标题行尾部的内容。用于徽章、状态指示器、操作按钮。折叠时隐藏。',
  },
};
