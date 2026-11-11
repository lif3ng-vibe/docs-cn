// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').HookDoc} */
export const docs = {
  name: 'usePopover',
  displayName: 'usePopover',
  group: 'Popover',
  keywords: [
    'popover',
    'popup',
    'dropdown',
    'floating',
    'anchor',
    'dialog',
    'overlay',
    'flyout',
    '弹出框',
    '下拉',
    '锚定',
  ],
  params: [
    {
      name: 'onShow',
      type: '() => void',
      description: '弹出框变为可见时触发的回调。',
    },
    {
      name: 'onHide',
      type: '() => void',
      description:
        '弹出框隐藏时触发的回调。需要时用它把焦点还给触发器。',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '应用于弹出框内容包装器的 StyleX 样式，位于默认表面样式之后。',
    },
    {
      name: 'hasLightDismiss',
      type: 'boolean',
      description: '点击外部是否关闭弹出框。',
      default: 'true',
    },
    {
      name: 'hasEscapeDismiss',
      type: 'boolean',
      description:
        '按 Escape 是否关闭弹出框。仅与 hasLightDismiss: false 同用时完全生效，因为原生 light dismiss 也在 Escape 时关闭。',
      default: 'true',
    },
    {
      name: 'hasAutoFocus',
      type: 'boolean',
      description:
        '打开时是否聚焦第一个真正的内容控件。没有此类控件的对话框回退到带标签的表面；生成的关闭控件不参与初始聚焦。',
      default: 'true',
    },
    {
      name: 'hasCloseButton',
      type: 'boolean',
      description:
        '是否包含一个为键盘用户出现的隐藏关闭按钮。',
      default: 'true',
    },
    {
      name: 'closeButtonLabel',
      type: 'string',
      description: '隐藏关闭按钮的无障碍标签。',
      default: "'Close popover'",
    },
    {
      name: 'dialogLabel',
      type: 'string',
      description:
        '弹出框对话框的无障碍标签（仅 role 为 "dialog" 时适用）。没有可见标题时提供。',
    },
    {
      name: 'role',
      type: "'dialog' | 'none'",
      description:
        '内容包装器上的 ARIA 角色。真正的对话框内容用 "dialog"；listbox/menu 弹层用 "none"——它们应暴露自己的内容角色，且触发器保持 DOM 焦点。',
      default: "'dialog'",
    },
    {
      name: 'isModal',
      type: 'boolean',
      description:
        'dialog 角色的弹出框是否为模态（aria-modal）。仅在 role 为 "dialog" 时适用。',
      default: 'true',
    },
    {
      name: 'hasSurface',
      type: 'boolean',
      description:
        '是否应用默认的弹出框表面背景、圆角与阴影。',
      default: 'true',
    },
    {
      name: 'padding',
      type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
      description:
        '着色表面的内边距，使用间距刻度（0、0.5、1、1.5、2、3、4、5、6、8、10）。省略时 hook 不绘制自己的内边距；Popover 默认传 3，无内边距表面传 0。',
    },
    {
      name: 'surfaceTarget',
      type: 'string',
      description:
        '着色表面上可选的组件自有精修目标，不带 astryx- 前缀。当直接的 hook 组合需要独立的主题可达性时，使用并文档化它。',
    },
  ],
  returns: [
    {
      name: 'triggerRef',
      type: '(el: HTMLElement | null) => void',
      description:
        '附加到触发元素上的 ref 回调，用于 CSS 锚定定位。',
    },
    {
      name: 'contentRef',
      type: 'RefObject<HTMLDivElement | null>',
      description:
        '弹出框内容容器的 ref，供焦点陷阱使用。',
    },
    {
      name: 'anchorId',
      type: 'string',
      description: '高级定位场景用的 CSS 锚名。',
    },
    {
      name: 'show',
      type: '(options?: {skipAutoFocus?: boolean}) => void',
      description:
        '命令式显示弹出框。skipAutoFocus 保持当前焦点，适用于输入框触发的弹出框。',
    },
    {
      name: 'hide',
      type: '() => void',
      description: '命令式隐藏弹出框。',
    },
    {
      name: 'toggle',
      type: '() => void',
      description: '切换弹出框打开或关闭。',
    },
    {
      name: 'isOpen',
      type: 'boolean',
      description: '弹出框当前是否打开。',
    },
    {
      name: 'id',
      type: 'string',
      description: 'aria-describedby 或 aria-controls 用的唯一 ID。',
    },
    {
      name: 'render',
      type: '(children: ReactNode, props?: ContextRenderProps) => ReactNode',
      description:
        "锚定定位弹出框内容的渲染函数。在此传入 placement 与 alignment。逻辑值：start/end 依据弹出层自身继承的方向解析（纯 CSS 的 RTL 镜像）。",
    },
    {
      name: 'triggerProps',
      type: '{aria-haspopup: "dialog" | "true"; aria-expanded: boolean; aria-controls: string}',
      description:
        '展开到触发元素上的 ARIA 属性。aria-haspopup 反映弹出框角色。',
    },
  ],
  usage: {
    description:
      '点击触发弹出框的无障碍 hook，带焦点陷阱。组合 useLayer 与 useFocusTrap、自动聚焦、light dismiss、Escape 处理以及可选的隐藏关闭按钮，实现无障碍的对话框式弹出框行为。每个着色表面都会发出规范的弹出框目标。需要独立稳定接缝的自定义组合应传入并文档化自己的 surfaceTarget。',
    bestPractices: [
      {
        guidance: true,
        description:
          '用于需要焦点管理的交互内容：菜单、选择器、表单、命令面板等。',
      },
      {
        guidance: true,
        description:
          '标准的触发器-内容组合优先用 Popover 组件；自定义触发模式才用 hook。',
      },
      {
        guidance: true,
        description: '宽泛的表面主题定制用规范的 popover 目标。',
      },
      {
        guidance: true,
        description:
          '当自定义组合需要自己的主题精修时，传入并文档化自有的 surfaceTarget（如 selector-popup）。它精修 Popover 表面，而不是创建另一个结构部件。',
      },
      {
        guidance: false,
        description:
          '不要用于非交互的悬停预览：请改用 useHoverCard 或 useTooltip。',
      },
    ],
  },
  relatedComponents: ['Popover', 'DropdownMenu', 'HoverCard'],
  relatedHooks: ['useLayer', 'useFocusTrap', 'useHoverCard', 'useTooltip'],
  importPath: '@astryxdesign/core/Popover',
  category: 'interaction',
};

/** @type {import('@astryxdesign/cli/authoring').HookTranslationDoc} */
export const docsDense = {
  description:
    '点击触发弹出框的无障碍 hook，带焦点陷阱、自动聚焦、light dismiss、Escape、可选隐藏关闭按钮。每个表面都发出规范的弹出框目标。需要独立接缝的自定义组合传入并文档化自有的 surfaceTarget。',
  paramDescriptions: {
    onShow: '弹出框变为可见时触发。',
    onHide: '弹出框隐藏时触发；需要时用于归还焦点。',
    xstyle: '内容包装器的 StyleX 样式，位于默认表面之后。',
    hasLightDismiss: '点击外部是否关闭弹出框。',
    hasEscapeDismiss:
      'Escape 是否关闭；仅在 hasLightDismiss false 时完全生效。',
    hasAutoFocus:
      '打开时聚焦真正的内容；对话框表面回退；生成的关闭控件除外。',
    hasCloseButton: '是否包含隐藏的键盘关闭按钮。',
    closeButtonLabel: '隐藏关闭按钮的标签。',
    dialogLabel: '弹出框对话框的无障碍标签（仅 role="dialog"）。',
    role: '内容包装器 ARIA 角色；listbox/menu 弹层用 "none"。',
    isModal: 'dialog 角色的弹出框是否为模态（aria-modal）。',
    hasSurface: '应用默认表面背景/圆角/阴影。',
    padding: '着色表面上的间距刻度内边距；省略则无。',
    surfaceTarget:
      '可选的自有精修目标；需要独立可达性时文档化它。',
  },
  returnDescriptions: {
    triggerRef: 'CSS 锚定定位用的触发器 ref。',
    contentRef: '焦点陷阱用的内容容器 ref。',
    anchorId: 'CSS 锚名。',
    show: '显示弹出框；skipAutoFocus 保持当前焦点。',
    hide: '隐藏弹出框。',
    toggle: '切换打开/关闭。',
    isOpen: '当前是否打开。',
    id: '唯一 ARIA id。',
    render: '渲染锚定定位的弹出框内容。',
    triggerProps: '触发器的 ARIA 属性。',
  },
  usage: {
    description:
      '点击触发弹出框的无障碍 hook，带焦点陷阱、自动聚焦、light dismiss、Escape、可选隐藏关闭按钮。每个表面都发出规范的弹出框目标。需要独立接缝的自定义组合传入并文档化自有的 surfaceTarget。',
    bestPractices: [
      {
        guidance: true,
        description:
          '用于需要焦点管理的菜单、选择器、表单、命令面板。',
      },
      {
        guidance: true,
        description:
          '标准触发器-内容组合优先用 Popover；自定义触发模式才用 hook。',
      },
      {
        guidance: true,
        description:
          '宽泛的表面主题定制用规范的 popover 目标。',
      },
      {
        guidance: true,
        description:
          '组件专属可达性：传入并文档化自有的 surfaceTarget；它精修同一表面。',
      },
      {
        guidance: false,
        description:
          '不要用于非交互的悬停预览：请改用 useHoverCard / useTooltip。',
      },
    ],
  },
};
