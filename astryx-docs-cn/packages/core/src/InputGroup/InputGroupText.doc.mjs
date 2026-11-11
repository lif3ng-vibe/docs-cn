// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'InputGroupText',
  subComponentOf: 'InputGroup',
  displayName: 'Input Group Text',
  isHiddenFromOverview: true,
  description:
    '渲染在 InputGroup 内部的前缀/后缀文本元素。显示文本或图标。',
  usage: {
    description:
      "在 InputGroup 内使用 InputGroupText 放置简短的固定前缀或后缀——如货币符号、协议名或单位——或装饰性图标。它是纯文本，不是控件，也不属于输入框无障碍名称的一部分。",
    bestPractices: [
      {
        guidance: true,
        description:
          '文本保持简短，如 $、https:// 或 kg。它固定单行显示且不会收缩。',
      },
      {
        guidance: true,
        description:
          '把屏幕阅读器用户需要的信息放进输入框自己的 label，例如在 $ 前缀旁的 label 写 "Amount in USD"。该附件会按阅读顺序作为纯文本读出。',
      },
      {
        guidance: false,
        description:
          '不要把按钮、链接或其他控件放进 InputGroupText。需要操作请用 Button 附件。',
      },
      {
        guidance: false,
        description:
          '不要在 InputGroup 之外使用 InputGroupText。它的边框和圆角要与 InputGroup 行拼接。',
      },
    ],
    anatomy: [
      {
        name: 'Text cell',
        required: true,
        description:
          '容纳文本或图标的非交互单元格，与行内相邻元素的边框拼接。',
      },
    ],
  },
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: '文本或图标内容。',
      required: true,
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于布局自定义的 StyleX 样式（边距、定位、尺寸）。必须是 stylex.create() 的值：不能是 style={{}} 这样的内联样式对象。',
    },
    {
      name: 'className',
      type: 'string',
      description: 'CSS 类名（一个或多个）。',
    },
    {
      name: 'style',
      type: 'React.CSSProperties',
      description: '内联样式。',
    },
    {
      name: 'ref',
      type: 'React.Ref<HTMLDivElement>',
      description: '转发到文本单元格元素的 ref。',
    },
  ],
};

export const docsDense = {
  name: 'InputGroupText',
  isHiddenFromOverview: true,
  displayName: 'Input Group Text',
  description: '前缀/后缀文本/图标元素',
  propDescriptions: {
    children: '文本或图标内容',
    xstyle: 'StyleX 样式（stylex.create() 的值）',
    className: 'CSS 类名（一个或多个）',
    style: '内联样式',
    ref: '指向文本单元格的 ref',
  },
};
