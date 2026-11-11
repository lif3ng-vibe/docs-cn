// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'RadioListItem',
  subComponentOf: 'RadioList',
  displayName: 'Radio List Item',
  isHiddenFromOverview: true,
  description:
    '单个单选选项，包含标签、描述和内容插槽。在粗指针（触摸）下，已启用选项的可点击目标会借助不可见点击区域向 44 px 扩展。它不小于所在行，与更近的相邻项之间止于间距的一半；行本身尺寸不变。该点击区域是行的 `::after`，因此请用子元素装饰行。',
  // RadioListItem requires RadioList context; wrap it so the preview doesn't throw.
  playground: {
    defaults: {value: 'option-1', label: 'Option'},
    wrapper: {
      component: 'RadioList',
      props: {value: 'option-1', label: 'Radio list'},
    },
  },
  props: [
    {
      name: 'label',
      type: 'ReactNode',
      description:
        '单选选项的主标签。富内容标签可包含链接或按钮，它们保留自身行为且不会选中该选项。标签文本用于命名单选框；仅当该文本缺失时使用 aria-label，否则覆盖值必须保留全部可见文字。',
      required: true,
    },
    {
      name: 'aria-label',
      type: 'string',
      description:
        '单选框的纯文本无障碍名称，应用于控件本身而非整行。它会覆盖由标签推导出的名称。仅当富标签没有可见文本时使用；否则必须保留全部可见文字。',
    },
    {
      name: 'value',
      type: 'string',
      description: '此单选选项的值。',
      required: true,
    },
    {
      name: 'description',
      type: 'ReactNode',
      description:
        '显示在标签下方的次要内容。链接和按钮保留自身的点击行为——整行仅将非交互表面的点击委派给单选框。',
    },
    {
      name: 'align',
      type: "'center' | 'start' | 'first-line'",
      description:
        '起始与结束内容相对于标签的垂直对齐方式，原样传递给 Item。`first-line` 让小标记（单选按钮）与换行标签的第一行保持水平。参见 Item.align。',
      default: "'center'",
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: '是否禁用此单个单选选项。',
      default: 'false',
    },
    {
      name: 'startContent',
      type: 'ReactNode',
      description: '在单选圆圈前渲染的内容。',
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
      name: 'endContent',
      type: 'ReactNode',
      description: '在标签后渲染的内容。',
      slotElements: [
        {
          __element: 'Icon',
          props: {
            icon: 'chevronDown',
            size: 'sm',
          },
        },
        {
          __element: 'Badge',
          props: {
            label: '3',
          },
        },
      ],
    },
  ],
};

export const docsZh = {
  name: 'RadioListItem',
  isHiddenFromOverview: true,
  displayName: 'Radio List Item',
  description:
    '单个单选选项，包含标签、描述和内容插槽。在粗指针（触摸）下，已启用选项的目标通过不可见的点击区域向 44 px 扩展。它不小于所在行，与相邻控件较近时止于间距的一半；行尺寸不变。该点击区域是行的 `::after`，因此请用子元素装饰行。',
  props: [
    {
      name: 'label',
      type: 'ReactNode',
      description:
        '单选选项的主标签。富内容标签可包含链接或按钮，它们保留自身行为且不会选中该选项。标签文本用于命名单选框；仅当可见文本缺失时使用 aria-label，否则覆盖值必须保留全部可见文字。',
      required: true,
    },
    {
      name: 'aria-label',
      type: 'string',
      description:
        '单选框的纯文本无障碍名称，应用于控件本身而非整行。它会覆盖由标签推导出的名称。仅当富标签没有可见文本时才完全替代；否则必须保留全部可见文字。',
    },
    {
      name: 'value',
      type: 'string',
      description: '此单选选项的值。',
      required: true,
    },
    {
      name: 'description',
      type: 'ReactNode',
      description:
        '显示在标签下方的次要内容。链接和按钮保留自身的点击行为——整行仅将非交互区域的点击委派给单选框。',
    },
    {
      name: 'align',
      type: "'center' | 'start' | 'first-line'",
      description:
        '起始和结束内容相对于标签的垂直对齐方式，原样传递给 Item。`first-line` 让小标记（单选按钮）与换行标签的第一行保持水平。参见 Item.align。',
      default: "'center'",
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: '是否禁用此单个单选选项。',
      default: 'false',
    },
    {
      name: 'startContent',
      type: 'ReactNode',
      description: '在单选圆圈前渲染的内容。',
    },
    {
      name: 'endContent',
      type: 'ReactNode',
      description: '在标签后渲染的内容。',
    },
  ],
};

export const docsDense = {
  name: 'RadioListItem',
  isHiddenFromOverview: true,
  displayName: 'Radio List Item',
  description: '单个单选选项，含标签、描述与内容插槽。',
  propDescriptions: {
    align:
      "传给 Item 的起始/结束内容对齐方式：'center'（默认）、'start' 或 'first-line'（与标签首行居中对齐）。",
    label: '主标签。字符串或 ReactNode；嵌套控件保留自身行为。',
    'aria-label':
      '替代派生标签的单选框纯文本名称。仅在可见文本缺失时使用；否则必须保留全部可见文字。',
    value: '此单选选项的值。',
    description: '标签下方的次要内容。字符串或 ReactNode。',
    isDisabled: '是否禁用此单个单选选项。',
    startContent: '在单选圆圈前渲染的内容。',
    endContent: '在标签后渲染的内容。',
  },
};
