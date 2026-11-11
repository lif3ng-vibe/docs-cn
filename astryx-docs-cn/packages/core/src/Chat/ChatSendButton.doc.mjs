// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'ChatSendButton',
  subComponentOf: 'Chat',
  displayName: 'Chat Send Button',
  isHiddenFromOverview: true,
  description: '聊天输入区的圆形发送/停止切换按钮。放在 ChatComposer 内即可自动读取上下文：无需任何接线。流式输出开始时，按钮从主发送图标切换为次级停止图标。独立或自定义使用时，可通过 props 覆盖任意上下文值。',
  props: [
    {
      name: 'isStopShown',
      type: 'boolean',
      description: '是否显示停止按钮。默认取上下文值。',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: '发送按钮是否禁用。默认取上下文中的 !canSend。',
    },
    {
      name: 'onSend',
      type: '() => void',
      description: '用户点击发送时调用。默认取上下文中的 onSubmit。',
    },
    {
      name: 'onStop',
      type: '() => void',
      description: '流式输出期间用户点击停止时调用。默认取上下文中的 onStop。',
    },
    {
      name: 'sendIcon',
      type: 'ReactNode',
      description: '发送状态的自定义图标。默认取图标注册表中的 arrowUp。',
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
      name: 'stopIcon',
      type: 'ReactNode',
      description: '停止状态的自定义图标。默认取图标注册表中的 stop。',
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
      name: 'size',
      type: "'sm' | 'md'",
      description: '按钮尺寸。',
      default: "'md'",
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description: '用于布局定制的 StyleX 样式（边距、定位、尺寸）。必须是 stylex.create() 的值：不能是 style={{}} 这样的内联样式对象。',
    },
  ],
  usage: {
    description: '当操作需要在发送与停止之间切换时，将 ChatSendButton 用作 ChatComposer 的发送控件。在 ChatComposer 内部，它会从上下文读取就绪状态、流式状态和操作回调；独立使用时需显式提供这些值。',
    bestPractices: [
      {
        guidance: true,
        description: '当就绪状态与发送/停止生命周期需要跟随输入区上下文时，将 ChatSendButton 放入 ChatComposer 内。',
      },
      {
        guidance: true,
        description: '独立使用时，显式提供状态及对应的 onSend 或 onStop 回调。',
      },
      {
        guidance: true,
        description: '提供自定义图标时，保持本地化的 Send 或 Stop 无障碍名称不变；图标仅起装饰作用，不能作为唯一名称来源。',
      },
      {
        guidance: false,
        description: '不要在没有可用 onStop 回调（来自 props 或 ChatComposer 上下文）的情况下渲染停止状态。',
      },
      {
        guidance: false,
        description: '不要指望 isDisabled 会禁用停止操作；它只作用于发送状态。',
      },
    ],
    anatomy: [
      {
        name: 'Action button',
        required: true,
        description: '圆形纯图标 Button，暴露本地化的 Send 或 Stop 名称，并承载 chat-send-button 主题目标。',
      },
    ],
  },
};

export const docsZh = {
  name: 'ChatSendButton',
  isHiddenFromOverview: true,
  displayName: 'Chat Send Button',
  description: '编写器的圆形发送/停止切换按钮。默认从 ChatComposerContext 读取状态，在 ChatComposer 内自动工作。所有上下文值均可通过 props 覆盖以用于独立使用。',
  propDescriptions: {
    isStopShown: '是否显示停止按钮。默认使用上下文值。',
    isDisabled: '发送按钮是否禁用。默认使用上下文的 !canSend。',
    onSend: '用户点击发送时调用。默认使用上下文的 onSubmit。',
    onStop: '流式响应期间用户点击停止时调用。默认使用上下文的 onStop。',
    sendIcon: '发送状态的自定义图标。默认使用图标注册表的 arrowUp。',
    stopIcon: '停止状态的自定义图标。默认使用图标注册表的 stop。',
    size: '按钮大小。',
    xstyle: '额外的 StyleX 样式。',
  },
};

export const docsDense = {
  name: 'ChatSendButton',
  isHiddenFromOverview: true,
  displayName: 'Chat Send Button',
  description: '输入区圆形发送/停止切换按钮；读取 ChatComposerContext；所有上下文值均可经 props 覆盖',
  propDescriptions: {
    isStopShown: '停止按钮可见性；默认取上下文',
    isDisabled: '禁用；默认取上下文的 !canSend',
    onSend: '发送点击回调；默认取上下文 onSubmit',
    onStop: '停止点击回调；默认取上下文 onStop',
    sendIcon: '自定义发送图标；默认取注册表 arrowUp',
    stopIcon: '自定义停止图标；默认取注册表 stop',
    size: '按钮尺寸',
    xstyle: '额外 StyleX 样式',
  },
};
