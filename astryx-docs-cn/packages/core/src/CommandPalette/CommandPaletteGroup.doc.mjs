// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'CommandPaletteGroup',
  subComponentOf: 'CommandPalette',
  displayName: 'Command Palette Group',
  isHiddenFromOverview: true,
  description: '带标题标签的视觉分组。放置在 CommandPaletteList 内。',
  props: [
    {
      name: 'heading',
      type: 'string',
      description: '分组标题文本。',
      required: true,
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: 'CommandPaletteItem 子元素。',
      required: true,
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description: '用于布局定制的 StyleX 样式。必须是 stylex.create() 的值。',
    },
  ],
  playground: {
    defaults: {
      heading: 'Navigation',
      children: [
        {__element: 'CommandPaletteItem', props: {value: 'home', onSelect: undefined}, children: '回到首页'},
        {__element: 'CommandPaletteItem', props: {value: 'settings', onSelect: undefined}, children: '打开设置'},
        {__element: 'CommandPaletteItem', props: {value: 'profile', onSelect: undefined}, children: '查看个人资料'},
      ],
    },
  },
};

export const docsZh = {
  name: 'CommandPaletteGroup',
  isHiddenFromOverview: true,
  displayName: 'Command Palette Group',
  description: '带标题标签的视觉分组。放置在 CommandPaletteList 内。',
  propDescriptions: {
    heading: '分组标题文本。',
    children: 'CommandPaletteItem 子元素。',
    xstyle: 'StyleX 布局自定义样式。必须是 stylex.create() 的值。',
  },
};

export const docsDense = {
  name: 'CommandPaletteGroup',
  isHiddenFromOverview: true,
  displayName: 'Command Palette Group',
  description: '带标题标签的分组；位于 CommandPaletteList 内',
  propDescriptions: {
    heading: '分组标题文本',
    children: 'CommandPaletteItem 子元素',
    xstyle: 'StyleX 布局样式；必须是 stylex.create() 值',
  },
};
