// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'ChatLayoutScrollButton',
  subComponentOf: 'Chat',
  displayName: 'Chat Layout Scroll Button',
  isHiddenFromOverview: true,
  description: '用户滚离最新消息时出现的浮动滚动到底部按钮。以紧凑图标按钮淡入，有新消息时展开显示标签。ChatLayout 默认渲染它：向 scrollButton prop 传自定义元素可覆盖，传 null 完全隐藏。',
  props: [
    {
      name: 'isVisible',
      type: 'boolean',
      description: '按钮是否可见。绑定到滚动位置检查，使用户向上滚动时才显示。',
      required: true,
    },
    {
      name: 'label',
      type: 'string',
      description: '展开按钮的可选标签（如 "新消息"）。用于提示下方有未读内容。',
    },
    {
      name: 'onClick',
      type: '() => void',
      description: '点击处理器：通常滚动到底部并清除新消息指示。',
      required: true,
    },
  ],
};

export const docsZh = {
  name: 'ChatLayoutScrollButton',
  isHiddenFromOverview: true,
  displayName: 'Chat Layout Scroll Button',
  description: '可组合的滚动到底部按钮。可见时淡入，提供标签时展开。',
  propDescriptions: {
    isVisible: '按钮是否可见。',
    label: '可选标签，展开按钮（如"新消息"）。',
    onClick: '点击处理器。',
  },
};

export const docsDense = {
  name: 'ChatLayoutScrollButton',
  isHiddenFromOverview: true,
  displayName: 'Chat Layout Scroll Button',
  description: '浮动滚动到底部按钮；向上滚动时淡入，有新消息时带标签展开。ChatLayout 默认；经 scrollButton prop 覆盖。',
  propDescriptions: {
    isVisible: '按钮可见性：绑定到滚动位置检查',
    label: '可选标签；展开按钮（如 "新消息"）',
    onClick: '点击处理器',
  },
};
