// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'ChatMessageMetadata',
  subComponentOf: 'Chat',
  displayName: 'Chat Message Metadata',
  description:
    '可组合的聊天消息元数据行。在单行内渲染时间戳、页脚内容与送达状态。用户发送者时方向反转。当两个插槽均未提供或为不渲染的标量值、且未提供 status 时，整行省略。',
  props: [
    {
      name: 'timestamp',
      type: 'ReactNode',
      description: '时间戳内容：字符串或 Timestamp 组件。',
      slotElements: [
        {
          __element: 'Text',
          props: {
            type: 'body',
          },
          children: '刚刚',
        },
      ],
    },
    {
      name: 'footer',
      type: 'ReactNode',
      description: '页脚内容：模型信息、回应按钮、复制按钮。',
      slotElements: [
        {
          __element: 'Text',
          props: {
            type: 'body',
          },
          children: '页脚内容',
        },
      ],
    },
    {
      name: 'status',
      type: "'sending' | 'sent' | 'delivered' | 'read' | 'error'",
      description: '消息送达状态。显示图标 + 标签。',
    },
  ],
  usage: {
    description:
      '将 ChatMessageMetadata 放在消息下方，或放入最后一个 ChatMessageBubble 的 metadata 插槽，以显示时间戳、页脚内容和可选的送达状态。不渲染的标量插槽（布尔值和空字符串）不会生成分隔符；数字 0 仍然可见。复合 React 内容由调用方自行负责。',
    bestPractices: [
      {
        guidance: true,
        description:
          '消息使用气泡时，将元数据放入最后一个气泡的 metadata 插槽，使其紧跟气泡内容。',
      },
      {
        guidance: true,
        description:
          '独立传入时间戳与页脚内容；不渲染的标量插槽会省略分隔符。复合 React 节点按传入原样使用。',
      },
      {
        guidance: false,
        description:
          '不要提供缺少自身无障碍名称与交互行为的页脚操作；元数据行不负责这些控件。',
      },
      {
        guidance: false,
        description:
          '不要在气泡与其外层消息上放置相同的元数据。',
      },
    ],
    anatomy: [
      {
        name: 'Metadata row',
        required: true,
        description: '包含可见元数据项的行，随发送者方向调整。',
      },
      {
        name: 'Timestamp',
        required: false,
        description:
          '位于逻辑序列开头、由调用方提供的时间内容。',
      },
      {
        name: 'Footer',
        required: false,
        description:
          '位于时间与状态之间、由调用方提供的信息或操作。',
      },
      {
        name: 'Status',
        required: false,
        description:
          '提供 status 时显示的本地化送达图标与文字。',
      },
    ],
  },
};

export const docsZh = {
  name: 'ChatMessageMetadata',
  displayName: 'Chat Message Metadata',
  description:
    '可组合的消息元数据行。渲染时间戳、页脚内容和发送状态。用户消息方向反转。',
  propDescriptions: {
    timestamp: '时间戳内容，字符串或 Timestamp 组件。',
    footer: '页脚内容：模型信息、反应按钮、复制按钮。',
    status: '消息发送状态。显示图标和标签。',
  },
};

export const docsDense = {
  name: 'ChatMessageMetadata',
  displayName: 'Chat Message Metadata',
  description:
    '可组合元数据行；渲染时间戳 · 页脚 · 状态；用户发送者时反转',
  propDescriptions: {
    timestamp: '时间戳内容；字符串或 Timestamp',
    footer: '页脚内容；模型信息、回应按钮、复制按钮',
    status: '送达状态；显示图标+标签',
  },
};
