// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'Toast',
  displayName: 'Toast',
  group: 'Toast',
  category: 'Overlay',
  hiddenComponents: ['ToastViewport'],
  keywords: [
    'toast',
    'notification',
    'snackbar',
    'alert',
    'message',
    '反馈',
    '状态',
  ],

  playground: {
    defaults: {body: '更改已保存'},
  },

  props: [
    {
      name: 'body',
      type: 'ReactNode',
      description: '主要消息内容。',
      required: true,
      slotElements: [
        {__element: 'Text', props: {type: 'body'}, children: 'Toast message'},
      ],
    },
    {
      name: 'type',
      type: "'info' | 'error'",
      description:
        '控制背景颜色的 toast 类型。error toast 持续显示直到关闭。',
      default: "'info'",
    },
    {
      name: 'isAutoHide',
      type: 'boolean',
      description:
        'toast 是否自动关闭。info 默认 true，error 默认 false。',
    },
    {
      name: 'autoHideDuration',
      type: 'number',
      description:
        '自动关闭前的持续毫秒数。定时内容必须满足 WCAG 2.2.1。',
      default: '5000',
    },
    {
      name: 'endContent',
      type: 'ReactNode',
      description:
        '在尾部渲染的内容（如撤销按钮、链接）。操作标签保持简短。',
      slotElements: [
        {__element: 'Icon', props: {icon: 'chevronDown', size: 'sm'}},
        {__element: 'Badge', props: {label: '3'}},
      ],
    },
    {
      name: 'uniqueID',
      type: 'string',
      description: '用于去重的唯一标识符。',
    },
    {
      name: 'collisionBehavior',
      type: "'overwrite' | 'ignore'",
      description:
        '已存在相同 uniqueID 的 toast 时的行为。',
      default: "'overwrite'",
    },
    {
      name: 'onHide',
      type: '(reason: "auto" | "manual") => void',
      description: 'toast 被移除时触发的回调。',
    },
    {
      name: 'onDismiss',
      type: '(reason: "auto" | "manual") => void',
      description: 'toast 被关闭时触发的回调。',
      required: true,
    },
    {
      name: 'renderContent',
      type: '(toast: ToastContentRenderProps) => ReactNode',
      description:
        "用你自己的布局替换该 toast 卡片的内容。Astryx 保留卡片、其 astryx-toast 主题目标和自动关闭行为（在 ToastViewport 内由视口播报该 toast，模态框之上也一样；卡片本身不是 live region），然后把消息、endContent、解析后的 toast 设置和 dismiss 回调交给渲染函数。自定义渲染函数拥有其布局中的每个控件：组合所需的控件并在其中调用 dismiss。Astryx 不会向自定义内容注入后备关闭控件。按 toast 单独设置：应用可通过封装 useToast 并在每次调用时传入来共享同一套布局；而由库代码发起、从不传入它的 toast 会渲染为普通 Astryx toast。参数为 {body, endContent, type, isAutoHide, autoHideDuration, dismiss}，其中 type 为 'info' | 'error'。",
    },
  ],
  theming: {
    targets: [{className: 'astryx-toast', visualProps: ['type']}],
    vars: [
      {
        name: '--_toast-slide-y',
        description:
          '从 ToastViewport 继承的私有块轴偏移，用于进入和退出动效',
        default: 'var(--spacing-2)',
        private: true,
      },
      {
        name: '--_toast-swipe-y',
        description: '块轴上的私有活动滑动偏移',
        default: '0px',
        private: true,
      },
      {
        name: '--_toast-swipe-exit-y',
        description: '一次完成滑动的私有退出偏移',
        default: 'var(--_toast-swipe-y)',
        private: true,
      },
      {
        name: '--_toast-swipe-opacity',
        description: '被接受的滑动期间的私有不透明度反馈',
        default: '1',
        private: true,
      },
      {
        name: '--_toast-swipe-scale',
        description: '被接受的滑动期间的私有缩放反馈',
        default: '1',
        private: true,
      },
    ],
  },

  usage: {
    description:
      'Toast 显示简短的非阻塞通知，用于确认操作或呈现临时信息。适用于用户需要反馈但不需要做决定的场景，如保存、删除或状态变更。\n\n生产环境中推荐使用 `useToast()` hook；它通过 `ToastViewport` 处理定位、堆叠、自动关闭和去重。Toast 保持在视口和安全区域边距内，换行长消息内容，并朝配置的顶部或底部边缘进入、退出或滑动关闭。垂直滑动使用与位置动效相同的空间模型：顶部 Toast 向上离开，底部 Toast 向下离开。滑动先等待明确的朝向边缘的主导意图，然后才取消原生触摸移动，并报告现有的 manual 关闭原因。触控笔作为直接接触输入受支持；鼠标拖动被排除以避免与桌面文本选择冲突，此时可见的关闭控件仍然可用。当操作或消息必须持续可用时，显式设置 `isAutoHide: false`。`Toast` 组件内联渲染 toast 视觉元素，适用于不需要视口生命周期的预览、文档和静态展示。',
    bestPractices: [
      {
        guidance: true,
        description:
          '保持消息简短：只用几个词告诉用户发生了什么，如 "Changes saved" 或 "Message sent"。',
      },
      {
        guidance: true,
        description:
          '可逆操作在 endContent 插槽中添加简短的撤销操作。当操作必须持续可用时把 isAutoHide 设为 false。',
      },
      {
        guidance: true,
        description:
          '用 uniqueID 对重复操作触发的 toast 去重，比如多次点击保存按钮。',
      },
      {
        guidance: true,
        description:
          "需要关注但不需要立即操作的失败用 error 类型；它持续显示直到关闭，用户不会错过。",
      },
      {
        guidance: false,
        description:
          "不要用 toast 呈现阻塞用户的严重错误。需要确认的持久上下文消息请用 Banner。",
      },
      {
        guidance: false,
        description:
          "不要在 toast 中放长内容或多行内容；它 5 秒后消失，用户可能读不完。",
      },
      {
        guidance: false,
        description:
          "不要把表单校验错误显示为 toast。请用内联字段校验，让用户确切看到哪个字段需要修复。",
      },
    ],
    anatomy: [
      {
        name: 'Body',
        required: true,
        description:
          '描述发生了什么或用户应当知道什么的主要消息文本。',
      },
      {
        name: 'End content',
        required: false,
        description:
          '正文之后的尾部操作，如撤销按钮或链接。',
      },
      {
        name: 'Dismiss button',
        required: true,
        description:
          '让用户在自动隐藏之前手动关闭 toast 的关闭按钮。',
      },
    ],
  },
};

// -------------------------------------------------------
// Auto-generated translations below. Do not edit manually.
// Regenerate with the dense compression protocol.
// See .context/decisions/dense-compression-protocol.md
// -------------------------------------------------------

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsZh = {
  propDescriptions: {
    body: '主要消息内容。',
    type: 'Toast 类型，控制背景颜色。error toast 持续显示直到关闭。',
    isAutoHide: '是否自动关闭。info 默认为 true，error 默认为 false。',
    autoHideDuration:
      '自动关闭前的持续时间（毫秒）。定时内容必须符合 WCAG 2.2.1。',
    endContent: '尾部渲染的内容（如撤销按钮、链接）。操作标签应保持简短。',
    uniqueID: '用于去重的唯一标识符。',
    collisionBehavior: '当已存在相同 uniqueID 的 toast 时的行为。',
    onHide: '当 toast 被移除时触发的回调。',
    renderContent:
      "用你自己的布局替换该 toast 卡片内部的内容。Astryx 保留卡片本身、astryx-toast 主题目标和自动关闭行为（在 ToastViewport 中由视口播报该 toast；当模态框承载视口时由卡片自行播报），并把消息、endContent、解析后的 toast 设置和 dismiss 回调交给渲染函数。自定义渲染函数完全拥有布局中的控件：请组合所需的控件并通过它调用 dismiss。Astryx 不会向自定义内容注入后备关闭按钮。按 toast 单独设置：应用可通过封装 useToast 并在每次调用时传入来共享同一套布局；而由库代码发起、从不传入该参数的 toast 会渲染为普通的 Astryx toast。传入参数为 {body, endContent, type, isAutoHide, autoHideDuration, dismiss}，其中 type 为 'info' | 'error'。",
  },
  usage: {
    description:
      'Toast 显示简短的非阻塞通知，用于确认操作或呈现临时信息。适用于用户需要反馈但不需要做决定的场景，如保存、删除或状态变更。\n\n生产环境中推荐使用 `useToast()` hook，它通过 `ToastViewport` 处理定位、堆叠、自动关闭和去重。Toast 会保持在视口和安全区域边距内，较长的消息会换行，并根据配置的顶部或底部边缘进入、退出或滑动关闭。垂直滑动与位置动效使用同一空间模型：顶部 Toast 向上离开，底部 Toast 向下离开。只有在动作明确朝向关闭边缘时才会接管原生触摸移动，滑动关闭继续报告现有的 manual 原因。触控笔属于直接接触输入，因此支持相同手势；鼠标拖动会与桌面文本选择冲突，所以不启用，关闭按钮始终可用。当操作或消息必须持续可用时，请显式设置 `isAutoHide: false`。`Toast` 组件以内联方式渲染 toast 视觉元素，适用于不需要视口生命周期的预览、文档和静态展示。',
    bestPractices: [
      {
        guidance: true,
        description:
          '保持消息简短，只需几个词告诉用户发生了什么，如"更改已保存"或"消息已发送"。',
      },
      {
        guidance: true,
        description:
          '在 endContent 插槽中添加简短的撤销操作，用于可逆操作。当操作必须持续可用时，将 isAutoHide 设置为 false。',
      },
      {
        guidance: true,
        description:
          '使用 uniqueID 去重重复操作触发的 toast，如多次点击保存按钮。',
      },
      {
        guidance: true,
        description:
          '对需要关注但不需要立即操作的错误使用 error 类型，它会持续显示直到关闭。',
      },
      {
        guidance: false,
        description:
          '不要对阻塞用户的严重错误使用 toast，使用 Banner 进行持久的上下文消息传递。',
      },
      {
        guidance: false,
        description:
          '不要在 toast 中放置长内容或多行内容，它会在5秒后消失，用户可能来不及阅读。',
      },
      {
        guidance: false,
        description:
          '不要将表单验证错误显示为 toast，使用内联字段验证让用户看到具体哪个字段需要修复。',
      },
    ],
    anatomy: [
      {
        name: '正文',
        required: true,
        description: '描述发生了什么或用户应该知道什么的主要消息文本。',
      },
      {
        name: '尾部内容',
        required: false,
        description: '正文后的尾随操作，如撤销按钮或链接。',
      },
      {
        name: '关闭按钮',
        required: true,
        description: '让用户在自动隐藏前手动关闭 toast 的关闭按钮。',
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description:
    'toast 通知，带自动关闭、堆叠、去重和平滑动效；MediaTheme 反转表面',
  usage: {
    description:
      '用于操作确认和临时信息的简短非阻塞通知。用户需要反馈而非决定时使用：保存、删除、状态变更。生产环境用 useToast() hook（安全区定位、响应式消息换行、堆叠、自动关闭、经 ToastViewport 去重）。朝配置边缘进入、退出或滑动关闭；只有在明确的朝边缘主导意图后才接管触摸；滑动报告 manual。触控笔使用直接接触手势；鼠标拖动保持关闭以保留文本选择，关闭控件仍然可用。必须持续可用的操作/消息显式设置 isAutoHide false。Toast 内联渲染，用于预览/文档/静态展示。',
    bestPractices: [
      {
        guidance: true,
        description:
          '消息简短，几个词即可："Changes saved"、"Message sent"。',
      },
      {
        guidance: true,
        description:
          '可逆操作在 endContent 放简短的 Undo；必须持续可用时设 isAutoHide false。',
      },
      {
        guidance: true,
        description: '用 uniqueID 对重复操作的 toast 去重。',
      },
      {
        guidance: true,
        description:
          '需要关注的失败用 error 类型；持续显示直到关闭。',
      },
      {
        guidance: false,
        description:
          "不要用于严重阻塞错误。持久上下文消息请用 Banner。",
      },
      {
        guidance: false,
        description:
          "不要放长内容/多行内容；5 秒即消失，用户可能读不完。",
      },
      {
        guidance: false,
        description:
          "不要显示表单校验错误。请改用内联字段校验。",
      },
    ],
  },
  propDescriptions: {
    body: '主要消息内容',
    type: 'toast 类型；控制背景色；error 持续显示直到关闭',
    isAutoHide: '自动关闭；info 为 true，error 为 false',
    autoHideDuration:
      '自动关闭前的毫秒数；定时内容必须满足 WCAG 2.2.1',
    endContent:
      '尾部内容（撤销按钮、链接）；操作标签保持简短',
    uniqueID: '去重用的唯一 id',
    collisionBehavior: '存在匹配 uniqueID 时的行为',
    onHide: 'toast 被移除时的回调',
    renderContent:
      '自定义内部布局；接收内容、解析后的设置 + dismiss 回调；不注入后备控件',
  },
};
