// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'TypeaheadItem',
  subComponentOf: 'Typeahead',
  displayName: 'Typeahead Item',
  description:
    'typeahead 结果的默认下拉项渲染器。显示标签及可选图标、描述与头像。导出供自定义 renderItem 实现使用。',
  props: [
    {
      name: 'item',
      type: 'SearchableItem',
      description: '要渲染的搜索结果项。',
      required: true,
    },
    {
      name: 'icon',
      type: 'ReactNode',
      description: '显示在标签之前的图标或头像。',
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
      name: 'description',
      type: 'string',
      description: '显示在标签下方的描述文本。',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: '此项是否在视觉上禁用。',
      default: 'false',
    },
    {
      name: 'group',
      type: 'string',
      description:
        '此 prop 无效果。在搜索源结果项上设置 `item.auxiliaryData.group`，即可在 Typeahead 或 BaseTypeahead 中分组结果。',
    },
  ],
};

export const docsZh = {
  name: 'TypeaheadItem',
  displayName: 'Typeahead Item',
  description:
    '预输入结果的默认下拉项渲染器。显示标签以及可选的图标、描述和头像。导出供自定义 renderItem 实现使用。',
  props: [
    {
      name: 'item',
      type: 'SearchableItem',
      description: '要渲染的搜索结果项。',
      required: true,
    },
    {
      name: 'icon',
      type: 'ReactNode',
      description: '在标签前显示的图标或头像。',
    },
    {
      name: 'description',
      type: 'string',
      description: '显示在标签下方的描述文本。',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: '此项是否在视觉上被禁用。',
      default: 'false',
    },
    {
      name: 'group',
      type: 'string',
      description:
        '此属性不影响渲染。要在 Typeahead 或 BaseTypeahead 中分组，请在搜索源返回的结果项上设置 `item.auxiliaryData.group`。',
    },
  ],
};

export const docsDense = {
  name: 'TypeaheadItem',
  displayName: 'Typeahead Item',
  description:
    '默认下拉项渲染器：标签 + 可选图标、描述、头像。导出供自定义 renderItem。',
  propDescriptions: {
    item: '要渲染的搜索结果项。',
    icon: '标签前的图标/头像。',
    description: '标签下方文本。',
    isDisabled: '视觉禁用。',
    group:
      '无效果。在搜索源中经 `item.auxiliaryData.group` 分组结果。',
  },
};
