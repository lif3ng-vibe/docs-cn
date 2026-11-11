// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'CommandPaletteList',
  subComponentOf: 'CommandPalette',
  displayName: 'Command Palette List',
  isHiddenFromOverview: true,
  description: '可滚动的结果容器。独立使用时渲染为 listbox；在 CommandPalette 内且存在可选结果时同样如此。包含 CommandPaletteItem 与 CommandPaletteGroup 子元素。',
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: '条目、分组与空状态。',
      required: true,
    },
    {
      name: 'label',
      type: 'string',
      description: 'listbox 的无障碍标签。',
      default: "'Commands'",
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description: '用于布局定制的 StyleX 样式。必须是 stylex.create() 的值。',
    },
  ],
  playground: {
    defaults: {
      children: [
        {__element: 'CommandPaletteItem', props: {value: 'home', onSelect: undefined}, children: '回到首页'},
        {__element: 'CommandPaletteItem', props: {value: 'settings', onSelect: undefined}, children: '打开设置'},
        {__element: 'CommandPaletteItem', props: {value: 'profile', onSelect: undefined}, children: '查看个人资料'},
      ],
    },
  },
};

export const docsZh = {
  name: 'CommandPaletteList',
  isHiddenFromOverview: true,
  displayName: 'Command Palette List',
  description: '可滚动的结果容器。独立使用时，以及在 CommandPalette 中存在可选结果时，作为 listbox 渲染。',
  propDescriptions: {
    children: '条目、分组和空状态。',
    label: 'listbox 的无障碍标签。',
    xstyle: 'StyleX 布局自定义样式。必须是 stylex.create() 的值。',
  },
};

export const docsDense = {
  name: 'CommandPaletteList',
  isHiddenFromOverview: true,
  displayName: 'Command Palette List',
  description: '可滚动结果容器；独立时 role=listbox，CommandPalette 内仅在有结果时如此',
  propDescriptions: {
    children: '条目、分组、空状态',
    label: 'listbox 的无障碍标签',
    xstyle: 'StyleX 布局样式；必须是 stylex.create() 值',
  },
};
