// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'ChatSystemMessage',
  subComponentOf: 'Chat',
  displayName: 'Chat System Message',
  description:
    '居中的系统消息，用于日期分隔、成员变动、状态通知等非发送者内容。它不是聊天气泡：没有头像、没有对齐方式，也没有发送者上下文。时间上的分隔用 divider 变体，内联状态更新用默认变体。',
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description:
        '系统消息内容：事实性文本或 React 内容，如日期、加入/离开通知或状态变更。较长的 default 内容会在可用宽度内换行。',
      required: true,
    },
    {
      name: 'variant',
      type: "'default' | 'divider'",
      description:
        "视觉变体。'default' 渲染居中文本。'divider' 通过 Divider 在两侧添加水平线：用于日期分隔与段落分隔。",
      default: "'default'",
    },
    {
      name: 'icon',
      type: 'ReactNode',
      description:
        '可选的调用方提供的图标内容。default 变体中渲染在消息之前；divider 变体当前不渲染。请包裹在 Icon 中以获得一致的尺寸。',
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
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于布局定制的 StyleX 样式。必须是 stylex.create() 的值：不能是 style={{}} 这样的内联样式对象。',
    },
  ],
  theming: {
    targets: [
      {className: 'astryx-chat-system-message', visualProps: ['variant']},
    ],
  },
  usage: {
    description:
      '在聊天记录中使用 ChatSystemMessage 呈现简洁的非发送者内容。事实性状态通知用 default 变体，日期或段落分隔用 divider 变体。较长的 default 内容会在可用宽度内换行。它不带 live role：在 ChatMessageList 中，由日志播报新通知。divider 分支包含一个带标签的分隔符。',
    bestPractices: [
      {
        guidance: true,
        description:
          '保持可见消息简洁自足，即使没有图标也能理解。',
      },
      {
        guidance: true,
        description:
          '时间或段落边界用 divider 变体，事实性状态通知用 default 变体。',
      },
      {
        guidance: false,
        description:
          '不要用 ChatSystemMessage 呈现发送者创作的内容；请改用 ChatMessage 和 ChatMessageBubble。',
      },
      {
        guidance: false,
        description:
          '不要把调用方提供的图标当作唯一的含义来源；可见消息必须承载相同信息。',
      },
    ],
    anatomy: [
      {
        name: 'System message',
        required: true,
        description:
          '承载 chat-system-message 主题目标的非交互状态行。',
      },
      {
        name: 'Content',
        required: true,
        description: '调用方提供的简洁消息或分隔符标签。',
      },
      {
        name: 'Icon content',
        required: false,
        description:
          'default 变体中渲染在消息之前；divider 变体当前不渲染。',
      },
      {
        name: 'Divider',
        required: false,
        description:
          'divider 变体渲染的带标签水平 Divider。',
      },
    ],
  },
};

export const docsZh = {
  name: 'ChatSystemMessage',
  displayName: 'Chat System Message',
  description:
    '居中的系统消息，用于日期分隔、成员变更和状态通知等非发送者内容。没有头像、对齐或气泡。使用 divider 变体做时间分隔，default 做内联状态更新。',
  propDescriptions: {
    children:
      '事实性系统消息内容，如日期、加入/离开通知或状态变更；较长的 default 内容会在可用宽度内换行。',
    variant:
      "视觉变体。'default' 渲染居中文本。'divider' 通过 Divider 在两侧添加水平线，用于日期分隔和段落分隔。",
    icon: '可选的调用方图标内容。default 变体会在消息前渲染；divider 变体当前不会渲染。使用 Icon 包裹以获得一致的尺寸。',
    xstyle: '用于布局自定义的 StyleX 样式。',
  },
  theming: {
    targets: [
      {className: 'astryx-chat-system-message', visualProps: ['variant']},
    ],
  },
};

export const docsDense = {
  name: 'ChatSystemMessage',
  displayName: 'Chat System Message',
  description:
    '居中的非发送者消息；divider 变体做日期分隔，default 做状态通知；可接受可选图标内容',
  usage: {
    description:
      '用于聊天中简洁的非发送者内容。default 为事实性状态行；divider 为带标签的日期/段落分隔。',
    bestPractices: [
      {
        guidance: true,
        description: '保持可见内容简洁自足。',
      },
      {
        guidance: true,
        description:
          '时间/段落边界用 divider，事实性通知用 default。',
      },
      {
        guidance: false,
        description:
          '不要用于发送者创作的内容；改用 ChatMessage 和 ChatMessageBubble。',
      },
      {
        guidance: false,
        description: '不要把图标当作唯一的含义来源。',
      },
    ],
  },
  propDescriptions: {
    children:
      '事实性 React 内容：日期、加入/离开、状态变更；较长的 default 内容换行',
    variant:
      'default=居中文本，divider=经 Divider 加水平线，用于日期/段落分隔',
    icon: '可选调用方图标；渲染在 default 消息之前；divider 当前不渲染',
    xstyle: '额外 StyleX 布局样式',
  },
};
