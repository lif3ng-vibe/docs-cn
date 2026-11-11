// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'ChatComposer',
  subComponentOf: 'Chat',
  displayName: 'Chat Composer',
  description:
    '聊天编写器的布局外壳。排列命名插槽（抽屉、标题栏、输入、页脚、发送），带页面圆角容器、层级、仅键盘焦点时显示的编辑器焦点环，以及子元素的同心内圆角。',
  usage: {
    description:
      'ChatComposer 是聊天界面的消息录入外壳。它协调受控或非受控草稿，提供默认支持标记的输入与发送/停止操作，并排列可选的抽屉、标题、页脚与状态内容。自定义输入与发送控件可通过 useChatComposerContext() 加入同一套取值、提交、禁用、停止与焦点契约。',
    anatomy: [
      {name: 'Composer frame', required: true, description: '外层组合根，将主体与可选的状态消息（在其上方或下方）组合在一起。'},
      {name: 'Composer body', required: true, description: '承载标题、输入与页脚的圆角凸起表面。'},
      {name: 'Drawer', required: false, description: '主体之前的附件或其他可展开上下文内容，通常为 ChatComposerDrawer。'},
      {name: 'Header', required: false, description: '一行：起始侧对齐的操作与末端对齐的上下文信息。'},
      {name: 'Input', required: true, description: '默认的 ChatComposerInput，或经 useChatComposerContext() 接入的自定义编辑器。'},
      {name: 'Footer', required: true, description: '一行：调用方提供的页脚与发送操作，外加主操作。'},
      {name: 'Send or stop action', required: true, description: '默认的 ChatSendButton 或自定义 sendButton；提交当前草稿或请求中断生成。'},
      {name: 'Status message', required: false, description: '渲染在编写器主体前后的错误或警告反馈。'},
    ],
  },
  playground: {
    wrapper: {component: 'Stack', props: {width: 480}},
  },
  props: [
    {
      name: 'onSubmit',
      type: '(value: string) => void',
      description: '用户提交消息时调用。',
      required: true,
    },
    {
      name: 'onStop',
      type: '() => void',
      description: '用户请求停止生成时调用。',
    },
    {
      name: 'isStopShown',
      type: 'boolean',
      description: '是否显示停止按钮（代替发送按钮）。',
      default: 'false',
    },
    {
      name: 'value',
      type: 'string',
      description: '受控输入值。',
    },
    {
      name: 'onChange',
      type: '(value: string) => void',
      description: '受控模式的变更回调。',
    },
    {
      name: 'placeholder',
      type: 'string',
      description: '输入为空时显示的占位文本。',
      default: "'输入消息...'",
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: '禁用编写器。',
      default: 'false',
    },
    {
      name: 'density',
      type: "'compact' | 'balanced' | 'spacious'",
      description: '视觉密度。',
      default: "'balanced'",
    },
    {
      name: 'elevation',
      type: "'none' | 'low'",
      description:
        '编写器主体的静止高度。low（默认）保持当前的抬起外观——静止时 low，悬停/聚焦时升至 med。none 会将其扁平化并绘制边框。编辑器通过键盘获得焦点时，两种呈现方式都会显示共享焦点环；指针聚焦不会显示该焦点环。',
      default: "'low'",
    },
    {
      name: 'drawer',
      type: 'ReactNode',
      description: '插槽：输入上方的可折叠抽屉——附件、上下文标签等。使用 ChatComposerDrawer。',
      slotElements: [
        {
          __element: 'Text',
          props: {
            type: 'body',
          },
          children: '抽屉内容',
        },
      ],
    },
    {
      name: 'headerActions',
      type: 'ReactNode',
      description: '插槽：标题左侧操作按钮（附件、提及按钮）。使用仅图标 size="sm" 按钮。',
      slotElements: [
        {
          __element: 'Button',
          props: {
            label: '操作',
            variant: 'ghost',
            size: 'sm',
          },
        },
      ],
    },
    {
      name: 'headerContext',
      type: 'ReactNode',
      description: '插槽：标题右侧上下文信息（上下文窗口使用情况、ProgressBar、辅助文本）。',
      slotElements: [
        {
          __element: 'Text',
          props: {
            type: 'body',
          },
          children: '上下文',
        },
      ],
    },
    {
      name: 'input',
      type: 'ReactNode',
      description: '插槽：自定义输入元素。替换默认输入。使用 ChatComposerInput 实现触发菜单/标记，或通过 useChatComposerContext() 将任意输入（纯 textarea、富文本编辑器）接入组合契约——读取 value/onChange/onSubmit/canSend，并在 inputControlRef 上注册聚焦控制，使点击空白处聚焦生效。',
      slotElements: [
        {
          __element: 'TextInput',
          props: {
            label: '输入',
            placeholder: '在此输入...',
          },
        },
      ],
    },
    {
      name: 'footerActions',
      type: 'ReactNode',
      description: '插槽：左对齐的页脚操作（模型选择器等）。',
      slotElements: [
        {
          __element: 'Button',
          props: {
            label: '操作',
            variant: 'ghost',
            size: 'sm',
          },
        },
      ],
    },
    {
      name: 'sendActions',
      type: 'ReactNode',
      description: '插槽：发送按钮左侧的操作。',
      slotElements: [
        {
          __element: 'Button',
          props: {
            label: '操作',
            variant: 'ghost',
            size: 'sm',
          },
        },
      ],
    },
    {
      name: 'sendButton',
      type: 'ReactNode',
      description: '插槽：自定义发送按钮。替换默认的发送/停止按钮。',
      slotElements: [
        {
          __element: 'Button',
          props: {
            label: '操作',
            variant: 'ghost',
            size: 'sm',
          },
        },
      ],
    },
    {
      name: 'status',
      type: "{ type: 'error' | 'warning'; message?: string }",
      description: '编写器下方（或上方）的状态消息。',
    },
    {
      name: 'statusPosition',
      type: "'top' | 'bottom'",
      description: '状态的渲染位置。',
      default: "'bottom'",
    },
  ],
};

export const docsZh = {
  name: 'ChatComposer',
  displayName: 'Chat Composer',
  description: '聊天编写器布局外壳。排列命名插槽（附件、标题栏、输入、页脚、发送），带有页面圆角容器和同心内圆角。',
  propDescriptions: {
    onSubmit: '用户提交消息时调用。',
    onStop: '用户请求停止生成时调用。',
    isStopShown: '是否显示停止按钮。',
    value: '受控输入值。',
    onChange: '受控模式的输入值变更时调用。序列化字符串包含标记占位符。',
    placeholder: '输入为空时显示的占位文本。',
    isDisabled: '禁用编写器。',
    density: '视觉密度。',
    elevation:
      '编写器主体的静止高度。low（默认）保持当前的抬起外观——静止时 low，悬停/聚焦时升至 med。none 会将其扁平化并绘制边框。编辑器通过键盘获得焦点时，两种呈现方式都会显示共享焦点环；指针聚焦不会显示该焦点环。',
    drawer: '插槽：输入上方的可折叠抽屉——附件、上下文标签等。使用 ChatComposerDrawer。',
    headerActions: '插槽：标题左侧操作按钮（附件、提及按钮）。使用仅图标 size="sm" 按钮。',
    headerContext: '插槽：标题右侧上下文信息（上下文窗口使用情况、ProgressBar、辅助文本）。',
    input: '插槽：自定义输入元素。替换默认输入。使用 ChatComposerInput 实现触发菜单/标记，或通过 useChatComposerContext() 将任意输入（纯 textarea、富文本编辑器）接入组合契约——读取 value/onChange/onSubmit/canSend，并在 inputControlRef 上注册聚焦控制，使点击空白处聚焦生效。',
    footerActions: '插槽：左对齐的页脚操作（模型选择器等）。',
    sendActions: '插槽：发送按钮左侧的操作。',
    sendButton: '插槽：自定义发送按钮。替换默认的发送/停止按钮。',
    status: '编写器下方（或上方）的状态消息。',
    statusPosition: '状态渲染位置。',
  },
};

export const docsDense = {
  name: 'ChatComposer',
  displayName: 'Chat Composer',
  description: '编写器布局外壳；命名插槽（抽屉/标题栏/输入/页脚/发送），带页面圆角 + 同心内圆角',
  propDescriptions: {
    onSubmit: '提交消息回调',
    onStop: '停止生成回调',
    isStopShown: '是否显示停止按钮',
    value: '受控输入值',
    onChange: '受控变更回调',
    placeholder: '空值时的占位文本',
    isDisabled: '禁用；流式生成中或前置条件未满足时使用',
    density: '视觉密度',
    elevation:
      '编写器主体的静止层级：low（默认；悬停/聚焦时 low→med）| none（扁平带边框）；键盘聚焦的编辑器在两种模式下都显示共享焦点环；指针聚焦不显示',
    drawer: '插槽：输入上方可折叠抽屉：附件、上下文标签等；用 ChatComposerDrawer',
    headerActions: '插槽：标题左侧操作（附件、提及）；仅图标 sm 按钮',
    headerContext: '插槽：标题右侧上下文信息（窗口用量、ProgressBar、文本）',
    input: '插槽：自定义输入；替换默认。触发菜单/标记用 ChatComposerInput，或经 useChatComposerContext() 接入任意输入（value/onChange/onSubmit/canSend + 在 inputControlRef 注册聚焦控制）',
    footerActions: '插槽：页脚左侧操作（模型选择器等）',
    sendActions: '插槽：发送按钮左侧的操作',
    sendButton: '插槽：自定义发送按钮；替换默认',
    status: '编写器下方/上方的状态消息',
    statusPosition: '状态渲染位置',
  },
};
