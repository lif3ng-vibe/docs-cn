// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'SelectorOption',
  subComponentOf: 'Selector',
  displayName: 'Selector Option',
  isHiddenFromOverview: true,
  description:
    '用于在 Selector 的 renderOption 渲染函数中自定义选项渲染的辅助组件。',
  props: [
    {
      name: 'label',
      type: 'ReactNode',
      description: '选项的主标签文本。',
      required: true,
    },
    {
      name: 'icon',
      type: 'IconType',
      description:
        '显示在标签前的图标。有效的语义名称见 `astryx docs icons`。',
    },
    {
      name: 'description',
      type: 'ReactNode',
      description: '显示在标签下方的次要描述文本。',
    },
    {
      name: 'layout',
      type: "'stacked' | 'inline'",
      description:
        "标签与描述的排布方式。'stacked' 让描述独占一行；'inline' 让两者同行，使该行适配固定高度的宿主。在 Selector 触发器内，触发器的内边距会随所选布局自适应，两种布局都能落在 4px 节奏上；InputGroup 会固定行高并强制 'inline'。",
      default: "'stacked'",
    },
    {
      name: 'endContent',
      type: 'ReactNode',
      description:
        '在标签和描述之后渲染的附加内容。',
    },
  ],
};

export const docsZh = {
  name: 'SelectorOption',
  isHiddenFromOverview: true,
  displayName: 'Selector Option',
  description:
    '用于在 Selector 的 renderOption 渲染函数中自定义选项渲染的辅助组件。',
  props: [
    {
      name: 'label',
      type: 'ReactNode',
      description: '选项的主标签文本。',
      required: true,
    },
    {
      name: 'icon',
      type: 'IconType',
      description: '显示在标签前的图标。',
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
  ],
};

export const docsDense = {
  name: 'SelectorOption',
  isHiddenFromOverview: true,
  displayName: 'Selector Option',
  description:
    '用于在 Selector 的 renderOption 渲染函数中自定义选项渲染的辅助组件。',
  propDescriptions: {
    label: '选项的主标签文本。',
    icon: '显示在标签前的图标。',
    description: '标签下方的次要描述文本。',
    endContent: '标签和描述之后的附加内容。',
  },
};
