// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'CommandPaletteEmpty',
  subComponentOf: 'CommandPalette',
  displayName: 'Command Palette Empty',
  isHiddenFromOverview: true,
  description:
    '结果区域的空状态展示。当搜索无结果，或没有查询且 bootstrap() 未返回内容时，由 CommandPalette 自动渲染。',
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: '要显示的消息或内容。',
      required: true,
    },
  ],
  playground: {
    defaults: {
      children: '未找到结果。请尝试其他搜索。',
    },
  },
};

export const docsZh = {
  name: 'CommandPaletteEmpty',
  isHiddenFromOverview: true,
  displayName: 'Command Palette Empty',
  description:
    '结果区域的空状态展示。当搜索没有结果，或没有查询且 bootstrap() 未返回任何内容时，由 CommandPalette 自动渲染。',
  propDescriptions: {
    children: '要显示的消息或内容。',
  },
};

export const docsDense = {
  name: 'CommandPaletteEmpty',
  isHiddenFromOverview: true,
  displayName: 'Command Palette Empty',
  description:
    '空状态；搜索无结果、或无查询且 bootstrap() 无返回时由 palette 自动渲染',
  propDescriptions: {
    children: '要显示的消息或内容',
  },
};
