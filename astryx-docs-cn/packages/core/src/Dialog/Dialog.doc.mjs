// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'Dialog',
  displayName: 'Dialog',
  group: 'Dialog',
  category: 'Overlay',
  keywords: [
    '对话框',
    '模态',
    '弹窗',
    '覆盖层',
    '灯箱',
    '警告',
    '确认',
    '提示输入',
    '背景遮罩',
    '焦点圈定',
    '命令式',
  ],
  // Intentionally a contained isInline preview, not playground.overlay: the
  // component stays visible on load and knobs stay live, whereas a real
  // showModal() overlay makes the page inert — see ComponentPlaygroundConfig.overlay
  // in docs-types.ts (#3657).
  playground: {
    defaults: {
      isOpen: true,
      isInline: true,
      onOpenChange: undefined,
      width: 400,
      children: {
        __element: 'VStack',
        props: {gap: 2},
        children: [
          {__element: 'Heading', props: {level: 3}, children: '对话框标题'},
          {
            __element: 'Text',
            props: {type: 'body'},
            children:
              '确定要继续吗？此操作稍后可在设置中撤销。',
          },
        ],
      },
    },
  },
  theming: {
    container: true,
    targets: [
      {className: 'astryx-dialog', visualProps: ['variant']},
      {className: 'astryx-dialog-header'},
      {className: 'astryx-dialog-header-start-content'},
      {className: 'astryx-dialog-header-title-block'},
      {className: 'astryx-dialog-header-end-content'},
      {className: 'astryx-dialog-header-close-icon'},
    ],
    vars: [
      {
        name: '--_dialog-radius',
        description: '对话框的圆角半径',
        default: 'var(--radius-container)',
        private: true,
      },
    ],
    derived: [
      {property: 'borderRadius', vars: ['--_dialog-radius']},
      {property: 'padding', expand: 'container'},
    ],
  },
  description:
    '使用原生 <dialog> 元素的模态对话框。模态与内联内容以主题正文文本为默认起点。祖先表面/组的从属关系整体解除，包括组拥有的状态。显式 props 与无关上下文保持不变。有意的分组与必需的 provider 请放在对话框内部。减弱动效时对话框绝不滑动或缩放进入：触屏上以不超过 200 ms 淡入，鼠标下立即出现。在手机或平板（粗主指针）上，对话框仍在进入时落下的点按或拖动不会命中任何东西，对话框会完成进入；键盘与辅助技术保持可用，鼠标或触控板仍可点击：若是最近使用的指针则立即生效，否则在其移动后生效。',
  props: [
    {
      name: 'isOpen',
      type: 'boolean',
      description: '对话框是否打开。',
      required: true,
    },
    {
      name: 'onOpenChange',
      type: '(isOpen: boolean) => unknown',
      description: '对话框可见性变化时的回调。',
      required: true,
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: '对话框内容。',
      required: true,
    },
    {
      name: 'width',
      type: 'number | string',
      description:
        '对话框的首选宽度，像素或任意 CSS 值。standard 对话框以间距 token 边距钳制在容器与动态视口内，窄视口也能让内容留在屏幕上。',
      default: '400',
    },
    {
      name: 'maxHeight',
      type: 'number | string',
      description:
        '对话框最大高度。默认为动态视口值，受支持时会反映浏览器 UI 变化。',
      default: "'75dvh'",
    },
    {
      name: 'position',
      type: 'DialogPosition',
      description:
        '对话框的静态位置；省略时居中。 ' +
        '行内偏移使用逻辑 `start`/`end`，使定位对话框在 RTL 下正确镜像。',
    },
    {
      name: 'variant',
      type: "'standard' | 'fullscreen'",
      description:
        '对话框变体：fullscreen 扩展至填满整个视口。',
      default: "'standard'",
    },
    {
      name: 'purpose',
      type: "'required' | 'form' | 'info'",
      description:
        '控制关闭行为：required 禁用 Escape 与点击遮罩；form 在交互后禁用点击遮罩；info 两者都允许。',
      default: "'info'",
    },
    {
      name: 'padding',
      type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
      description:
        '对话框内边距，使用间距刻度档位。',
    },
    {
      name: 'isInline',
      type: 'boolean',
      description:
        '以内联方式渲染对话框内容，不使用 <dialog> 元素、遮罩或模态行为。仅供文档预览与展示使用。',
      default: 'false',
    },
  ],
  components: [{name: 'DialogHeader'}, {name: 'useImperativeDialog'}],
  usage: {
    description:
      'Dialog 显示模态覆盖层，在用户响应前阻止与页面的交互。适用于删除确认、编辑表单、条款接受或任何不应被跳过的决策。\n\n若想展示对话框而不自行管理打开状态，使用 `useImperativeDialog` Hook：调用 `dialog.show(content)` 并在组件树中渲染 `dialog.element`。',
    bestPractices: [
      {
        guidance: true,
        description:
          '选对 purpose：可关闭内容用 info；防止误点遮罩关闭用 form；用户必须响应时用 required。',
      },
      {
        guidance: true,
        description:
          '头部写明清晰的标题，让用户立即理解对话框在问什么。',
      },
      {
        guidance: true,
        description:
          '含输入项的对话框用 purpose="form"，避免用户误点遮罩丢失数据。',
      },
      {
        guidance: true,
        description:
          '对话框聚焦单一任务；内容超出可容纳范围时考虑改用整页。',
      },
      {
        guidance: false,
        description:
          '简单消息不要用对话框；可内联展示或用 toast 通知。',
      },
      {
        guidance: false,
        description:
          '不要在对话框内嵌套对话框；把流程重构为单个对话框内的分步。',
      },
      {
        guidance: false,
        description:
          '简单确认不要用 fullscreen 变体；它面向编辑器或长表单等复杂内容。',
      },
    ],
    anatomy: [
      {
        name: 'Header',
        required: true,
        description:
          '标题、可选副标题与关闭按钮。打开时标题接收焦点，并经 aria-labelledby 标注对话框。',
      },
      {
        name: 'Body',
        required: true,
        description:
          '主内容区：文本、表单、列表或任意布局。',
      },
      {
        name: 'Footer',
        required: false,
        description:
          '操作按钮，如保存/取消或接受/拒绝，靠末端对齐。',
      },
      {
        name: 'Backdrop',
        required: true,
        description:
          '对话框背后的半透明覆盖层，阻止页面交互。',
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsZh = {
  usage: {
    description:
      'Dialog displays a modal overlay that blocks interaction with the page until the user responds. Use it for delete confirmations, edit forms, terms acceptance, or any decision that should not be skipped.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Choose the right purpose: info for dismissable content, form to prevent accidental backdrop dismissal, required when the user must respond.',
      },
      {
        guidance: true,
        description:
          'Include a clear title in the header so users immediately understand what the dialog is asking.',
      },
      {
        guidance: true,
        description:
          'Use purpose="form" for dialogs with inputs so the user can\'t accidentally lose data by clicking the backdrop.',
      },
      {
        guidance: true,
        description:
          'Keep dialogs focused on a single task; if the content grows beyond what fits, consider a full page instead.',
      },
      {
        guidance: false,
        description:
          'Use a dialog for simple messages that could be shown inline or as a toast notification.',
      },
      {
        guidance: false,
        description:
          'Nest dialogs inside other dialogs; restructure the flow into steps within a single dialog instead.',
      },
      {
        guidance: false,
        description:
          'Use the fullscreen variant for simple confirmations; it is meant for complex content like editors or long forms.',
      },
    ],
    anatomy: [
      {
        name: 'Header',
        required: true,
        description:
          'Title, optional subtitle, and close button. The title receives focus on open and labels the dialog via aria-labelledby.',
      },
      {
        name: 'Body',
        required: true,
        description:
          'The main content area: text, forms, lists, or any layout.',
      },
      {
        name: 'Footer',
        required: false,
        description:
          'Action buttons like Save/Cancel or Accept/Decline, aligned to the end.',
      },
      {
        name: 'Backdrop',
        required: true,
        description:
          'Semi-transparent overlay behind the dialog that blocks page interaction.',
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description:
    '在用户响应前阻止页面交互的模态覆盖层',
  usage: {
    description:
      'Dialog 显示阻止页面交互的模态覆盖层。用于删除确认、编辑表单、条款接受。模态与内联内容使用主题正文默认值，整体解除祖先表面/组从属；显式 props 与无关上下文保持不变。有意的分组与必需的 provider 请放在对话框内。',
    bestPractices: [
      {
        guidance: true,
        description:
          '选对 purpose：可关闭内容用 info；防止误点遮罩关闭用 form；用户必须响应时用 required。',
      },
      {
        guidance: true,
        description:
          '头部写明清晰的标题，让用户立即理解对话框在问什么。',
      },
      {
        guidance: true,
        description:
          '含输入项的对话框用 purpose="form"，避免用户误点遮罩丢失数据。',
      },
      {
        guidance: true,
        description:
          '对话框聚焦单一任务；内容超出可容纳范围时考虑改用整页。',
      },
      {
        guidance: false,
        description:
          '简单消息不要用对话框；可内联展示或用 toast 通知。',
      },
      {
        guidance: false,
        description:
          '不要在对话框内嵌套对话框；把流程重构为单个对话框内的分步。',
      },
      {
        guidance: false,
        description:
          '简单确认不要用 fullscreen 变体；它面向编辑器或长表单等复杂内容。',
      },
    ],
  },
};
