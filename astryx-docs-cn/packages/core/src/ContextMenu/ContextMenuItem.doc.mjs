// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'ContextMenuItem',
  subComponentOf: 'ContextMenu',
  displayName: 'Context Menu Item',
  isHiddenFromOverview: true,
  description: '复合模式的菜单项组件。从 DropdownMenuItem 重新导出以便发现。',
  props: [
    {
      name: 'icon',
      type: 'IconType',
      description: '显示在标签前的图标。',
    },
    {
      name: 'label',
      type: 'ReactNode',
      description: '主标签文本。',
    },
    {
      name: 'description',
      type: 'ReactNode',
      description: '显示在标签下方的次要描述文本。',
    },
    {
      name: 'endContent',
      type: 'ReactNode',
      description: '在标签和描述之后渲染的附加内容。',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description: '用于布局定制的 StyleX 样式。',
    },
  ],
  playground: {
    defaults: {
      label: '编辑',
      description: '修改此项',
    },
  },
};

export const docsZh = {
  name: 'ContextMenuItem',
  isHiddenFromOverview: true,
  displayName: 'Context Menu Item',
  description: '复合模式的菜单项组件。从 DropdownMenuItem 重新导出以便发现。',
  props: [
    {
      name: 'icon',
      type: 'IconType',
      description: '显示在标签前的图标。',
    },
    {
      name: 'label',
      type: 'ReactNode',
      description: '主标签文本。',
    },
    {
      name: 'description',
      type: 'ReactNode',
      description: '显示在标签下方的次要描述文本。',
    },
    {
      name: 'endContent',
      type: 'ReactNode',
      description: '在标签和描述之后渲染的附加内容。',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description: '根容器的 StyleX 样式。',
    },
  ],
};

export const docsDense = {
  name: 'ContextMenuItem',
  isHiddenFromOverview: true,
  displayName: 'Context Menu Item',
  description: '复合模式的菜单项组件，自 DropdownMenuItem 重新导出',
  propDescriptions: {
    icon: '标签前的图标',
    label: '主标签文本',
    description: '标签下方次要文本',
    endContent: '标签+描述之后的附加内容',
    xstyle: '根容器的 StyleX 样式',
  },
};
