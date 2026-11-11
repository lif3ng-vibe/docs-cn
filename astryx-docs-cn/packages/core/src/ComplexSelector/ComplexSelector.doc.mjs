// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ComplexSelector.doc.mjs
 * @input ComplexSelector public API and composition contract
 * @output Exports full and dense component documentation
 * @position Core documentation consumed by CLI and Storybook autodocs
 *
 * SYNC: When modified, update ComplexSelector.tsx, tests, and stories.
 */

/** @type {import('@astryxdesign/cli/authoring').ComponentAnatomyElement[]} */
const anatomy = [
  {
    name: 'Field',
    required: true,
    description:
      '提供标签与可选字段辅助内容的字段外壳。',
  },
  {
    name: 'Trigger',
    required: true,
    description:
      '显示当前值或占位文本并打开弹层的控件。',
  },
  {
    name: 'Icon-rendered start icon',
    required: false,
    description:
      '经 Icon 渲染的可选前置语义图标或图标组件。',
  },
  {
    name: 'Caller-rendered start content',
    required: false,
    description:
      '直接渲染在触发器起始处的可选任意 React 内容。',
  },
  {
    name: 'Indicator icon',
    required: false,
    description:
      '状态呈现未取代时显示的尾随箭头；随弹层开合旋转。',
  },
  {
    name: 'Popup',
    required: true,
    description:
      '已挂载的对话框表面，打开时绘制并显示，关闭时隐藏。',
  },
];

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'ComplexSelector',
  displayName: 'Complex Selector',
  group: 'Selector',
  category: 'Form Controls',
  keywords: [
    '选择器',
    '拾取器',
    '弹层',
    '对话框',
    '自定义',
    '富内容',
    '矩阵',
    '网格',
  ],
  theming: {
    targets: [
      {
        className: 'astryx-complex-selector',
        visualProps: ['variant', 'size', 'status'],
      },
      {
        className: 'astryx-complex-selector-indicator-icon',
        states: ['state'],
      },
      {className: 'astryx-complex-selector-popup'},
    ],
  },
  components: [
    {
      name: 'ComplexSelector',
      displayName: 'Complex Selector',
      description:
        '为自定义选择器内容提供输入框或工具栏触发器与对话框弹层外壳。',
      props: [
        {
          name: 'label',
          type: 'string',
          description: '用于无障碍与字段标签的标签文本。',
          required: true,
        },
        {
          name: 'value',
          type: 'Value',
          description: '当前受控值。',
          required: true,
        },
        {
          name: 'onChange',
          type: '(value: Value) => void',
          description: '自定义内容提交新值时调用。',
        },
        {
          name: 'changeAction',
          type: '(value: Value) => void | Promise<void>',
          description:
            'onChange 之后的异步操作。等待期间 ComplexSelector 暴露乐观值与忙碌状态。',
        },
        {
          name: 'children',
          type: '(value: Value, onChange: (value: Value) => void, close: () => void, state: ComplexSelectorRenderState) => ReactNode',
          description:
            '自定义对话框内容。接收位置参数 value、onChange、close 与 state 辅助对象。',
          required: true,
        },
        {
          name: 'triggerLabel',
          type: 'ReactNode',
          description: '收起状态下触发器显示的标签/内容。',
        },
        {
          name: 'placeholder',
          type: 'ReactNode',
          description: 'triggerLabel 省略时显示的占位文本。',
          default: "'Select...'",
        },
        {
          name: 'isDisabled',
          type: 'boolean',
          description: '禁用选择器。',
        },
        {
          name: 'isLoading',
          type: 'boolean',
          description: '在触发器上显示加载状态。',
        },
        {
          name: 'status',
          type: "{type: 'warning' | 'error' | 'success', message?: string}",
          description: '校验状态。',
        },
        {
          name: 'statusVariant',
          type: "'attached' | 'detached' | 'tooltip'",
          description:
            '状态消息相对输入框的摆放方式。attached 直接叠放在输入框下方（边框式处理；variant 为 secondary 或 ghost 时为 detached）；detached 作为独立元素带间距悬浮在下方；tooltip 经信息提示按钮展示消息。',
          default:
            "'attached' for input selectors; 'detached' for secondary and ghost selectors",
        },
        {
          name: 'size',
          type: "'sm' | 'md' | 'lg'",
          description: '精确触发器高度：sm 28px、md 32px 或 lg 36px。',
          default: "'md'",
        },
        {
          name: 'variant',
          type: "'input' | 'secondary' | 'ghost'",
          description:
            '触发器视觉样式。input 为带边框的表单处理；secondary 匹配当前主题的次级按钮（默认无边框、中性填充）；ghost 无边框且透明，与 ghost 按钮一致。',
          default: "'input'",
        },
        {
          name: 'startIcon',
          type: 'ReactNode | IconType',
          description: '触发器起始处显示的图标。',
        },
        {
          name: 'width',
          type: 'SizeValue',
          description: '字段宽度。',
        },
        {
          name: 'placement',
          type: "'above' | 'below' | 'start' | 'end'",
          description: '弹层摆放位置。',
          default: "'below'",
        },
        {
          name: 'alignment',
          type: "'start' | 'center' | 'end'",
          description: '弹层沿摆放轴的对齐方式。',
          default: "'start'",
        },
        {
          name: 'renderTrigger',
          type: '(props: ComplexSelectorRenderTriggerProps) => ReactNode',
          description:
            '渲染弹层所依附的控件——列表行中的符号、芯片、图标按钮——以取代选择器自身的字段与按钮。将给定 props（{ref, id, onClick, onKeyDown, role, aria-haspopup, aria-expanded, aria-controls, aria-busy, aria-required, aria-disabled}）展开到其上：该控件成为选择器的 combobox 字段，弹层锚定其上且仍由 `label` 标注；禁用的控件保留 tab 停靠点但不打开。字段外观不渲染。配合 handleRef 可从其他按键处打开。',
        },
        {
          name: 'handleRef',
          type: 'React.Ref<ComplexSelectorHandle>',
          description:
            '程序化控制的命令式句柄。暴露 open()、close()、toggle() 与 isOpen()。',
        },
        {
          name: 'onOpenChange',
          type: '(isOpen: boolean) => void',
          description:
            '表面打开或关闭时都会调用，无论触发方式——触发器、键盘、轻量关闭、Escape、close() 或命令式句柄。',
        },
        {
          name: 'contentXstyle',
          type: 'StyleXStyles',
          description: '弹层内容容器的 StyleX 样式。',
        },
        {
          name: 'onClick',
          type: '(event: MouseEvent) => void',
          description:
            '触发器上的点击处理函数。在弹层打开前运行；调用 preventDefault() 可保持关闭。控件框内其他位置的按压同样经由触发器。使用 renderTrigger 时在内建切换之后运行，且无法取消它。',
        },
        {
          name: 'onKeyDown',
          type: '(event: KeyboardEvent) => void',
          description:
            '触发器上的按键处理函数。在内建处理之后运行并接收每个按键，包括打开弹层的 ArrowDown。使用 renderTrigger 时，内建处理已取消的按键会跳过它。',
        },
        {
          name: 'containerXstyle',
          type: 'StyleXStyles',
          description:
            '字段容器（标签、控件与状态整体）的 StyleX 样式。在 InputGroup 内无效（应改为样式化 InputGroup），在 `horizontal-labels` FormLayout 中也无效。不接受根级 `xstyle`、`className` 和 `style`。',
        },
        {
          name: 'containerClassName',
          type: 'string',
          description:
            '字段容器的 class 名。定位范围与 `containerXstyle` 相同。',
        },
        {
          name: 'containerStyle',
          type: 'CSSProperties',
          description:
            '字段容器的内联样式。定位范围与 `containerXstyle` 相同。',
        },
        {
          name: 'controlXstyle',
          type: 'StyleXStyles',
          description:
            '可视控件框的 StyleX 样式：即绘制边框与背景、承载值、图标和末端控件的元素。绝不是触发按钮本身。',
        },
        {
          name: 'controlClassName',
          type: 'string',
          description: '可视控件框的 class 名。',
        },
        {
          name: 'controlStyle',
          type: 'CSSProperties',
          description: '可视控件框的内联样式。',
        },
      ],
    },
  ],
  usage: {
    anatomy,
    description:
      '当选择需要比 Selector 选项行更丰富的自定义内容时使用 ComplexSelector。它刻意保持为单一组件：ComplexSelector 负责字段、触发器、弹层、焦点恢复与 changeAction 流程，内容 render prop 负责选择器特有的无障碍结构。',
    bestPractices: [
      {
        guidance: true,
        description:
          '次级按钮旁用 variant="secondary"，ghost 按钮旁用 variant="ghost"；有助于识别触发器时加 startIcon。宽表面需要末端边缘对齐触发器时用 alignment="end"。',
      },
      {
        guidance: true,
        description:
          '分步编辑器把草稿状态留在组合内容中，仅在"应用"时调用提供的 onChange 辅助函数。取消或关闭时不提交。',
      },
      {
        guidance: true,
        description:
          '按任务选择合适的无障碍结构组合对话框内容：简单选择用 RadioList，日期选择用 Calendar/日期输入，层级用 TreeList 或可搜索列表，二维方向键导航有用时用自定义网格。',
      },
      {
        guidance: true,
        description:
          '在 children 中使用提供的 onChange 辅助函数；它已同时调用 onChange 与 changeAction，并更新乐观忙碌状态。',
      },
      {
        guidance: true,
        description:
          '选择后应关闭弹层时，从自定义内容调用 close()。多步内容或自由输入流程保持打开。',
      },
      {
        guidance: true,
        description:
          '自定义内容使用 Astryx 焦点 Hook：二维网格用 useGridFocus，层级经 TreeList 用 useTreeFocus，自定义线性集合用 useListFocus。',
      },
      {
        guidance: true,
        description:
          '对照 WCAG 2.2 评估自定义内容：键盘操作、焦点可见/不被遮挡、名称与角色、标签/说明、目标尺寸、对比度/非文本对比度对选择器弹层尤其重要。',
      },
      {
        guidance: false,
        description:
          '不要在产品代码中重造触发器 ARIA、弹层焦点管理或 changeAction 处理。',
      },
      {
        guidance: false,
        description:
          '纯单列文本列表不要用 ComplexSelector；请改用 Selector。',
      },
    ],
  },
};

export const docsDense = {
  name: 'ComplexSelector',
  displayName: 'Complex Selector',
  group: 'Selector',
  category: 'Form Controls',
  description:
    'input/secondary/ghost 触发器 + 对话框弹层外壳，用于富自定义选择器。内容获得 value/onChange/close/state；语义由内容负责。使用焦点 Hook 并对照 WCAG 2.2 评估自定义内容。',
  usage: {
    anatomy,
    description:
      '选择需要比 Selector 行更丰富的自定义内容时使用。单一组件：字段、触发器、弹层、焦点恢复、changeAction 由它负责；render prop 负责选择器特有的无障碍结构。',
    bestPractices: [
      {
        guidance: true,
        description:
          '工具栏触发器用 variant="ghost" 加 startIcon。宽表面需末端对齐触发器时用 alignment="end"。',
      },
      {
        guidance: true,
        description:
          '分步编辑器把草稿状态留在组合内容中，仅在"应用"时调用提供的 onChange 辅助函数。取消或关闭时不提交。',
      },
      {
        guidance: true,
        description:
          '按任务选择合适的无障碍结构组合内容：简单选择用 RadioList，日期用 Calendar/日期输入，层级用 TreeList 或可搜索列表，二维方向导航用自定义网格。',
      },
      {
        guidance: true,
        description:
          'children 中使用 onChange 辅助函数；它同时调用 onChange 与 changeAction 并更新乐观忙碌状态。',
      },
      {
        guidance: true,
        description:
          '选择后应关闭弹层时从自定义内容调用 close()。多步或自由输入流程保持打开。',
      },
      {
        guidance: true,
        description:
          '使用 Astryx 焦点 Hook：二维网格用 useGridFocus，层级经 TreeList 用 useTreeFocus，自定义线性集合用 useListFocus。',
      },
      {
        guidance: true,
        description:
          '对照 WCAG 2.2 评估自定义内容：键盘操作、焦点可见/不被遮挡、名称与角色、标签/说明、目标尺寸、对比度。',
      },
      {
        guidance: false,
        description:
          '不要在产品代码中重造触发器 ARIA、弹层焦点管理或 changeAction 处理。',
      },
      {
        guidance: false,
        description:
          '纯单列文本列表不要用 ComplexSelector；请改用 Selector。',
      },
    ],
  },
  propDescriptions: {
    label: '字段无障碍标签。',
    value: '受控值。',
    onChange: '提交值。',
    changeAction: 'onChange 后异步操作；驱动乐观值/忙碌状态。',
    children: '从 (value,onChange,close,state) 渲染自定义对话框内容。',
    triggerLabel: '收起触发器的标签/内容。',
    variant:
      '表单用 input；次级按钮旁用 secondary；ghost 按钮旁用 ghost。',
    startIcon: '触发器前置图标。',
    placement: '弹层摆放位置。',
    alignment: '弹层对齐。',
    renderTrigger:
      '调用方渲染的开启控件，取代字段+按钮；展开给定 props；弹层锚定其上，由 label 标注。',
    handleRef: '命令式 open/close/toggle 句柄。',
    onOpenChange: '每次开合都收到通知，无论原因。',
    onClick:
      '触发器点击；打开前运行，preventDefault() 保持关闭。',
    onKeyDown:
      '触发器按键；内建处理后运行，能看到打开用的 ArrowDown。',
    containerXstyle:
      '字段容器 StyleX 样式；InputGroup 或 horizontal-labels FormLayout 中无效。不接受根级 xstyle/className/style。',
    containerClassName: '字段容器的 class 名。',
    containerStyle: '字段容器的内联样式。',
    controlXstyle:
      '可视控件框（边框、背景、图标）的 StyleX 样式；不是触发按钮。',
    controlClassName: '可视控件框的 class 名。',
    controlStyle: '可视控件框的内联样式。',
    statusVariant:
      '状态消息的摆放：attached 叠放于输入框下方（secondary/ghost 为 detached）；detached 带间距悬浮于下方；tooltip 显示在状态图标上。',
    accessibility:
      '自定义内容须自带无障碍结构。使用焦点 Hook 并对照 WCAG 2.2 评估。',
  },
};
