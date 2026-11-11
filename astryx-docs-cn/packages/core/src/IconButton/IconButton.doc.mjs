// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'IconButton',
  displayName: 'Icon Button',
  group: 'Button',
  category: 'Action',
  keywords: ['icon-button', 'icon', 'button', 'toolbar', 'action', 'compact', '图标按钮', '工具栏', '操作', '紧凑'],

  props: [
    {
      name: 'label',
      type: 'string',
      description:
        '无障碍标签。用作 aria-label（不渲染为可见文本）。',
      required: true,
    },
    {
      name: 'icon',
      type: 'ReactNode',
      description:
        '按钮内渲染的图标元素。未显式设置尺寸的 Astryx Icon，在 sm/md 按钮中默认 sm，lg 按钮中默认 md。',
      required: true,
      slotElements: [{__element: 'Icon', props: {icon: 'check'}}],
    },
    {
      name: 'variant',
      type: "\'primary\' | \'secondary\' | \'ghost\' | \'destructive\'",
      description: '视觉样式变体。',
      default: "\'secondary\'",
    },
    {
      name: 'size',
      type: "\'sm\' | \'md\' | \'lg\'",
      description: '尺寸变体。',
      default: "\'md\'",
    },
    {
      name: 'elevation',
      type: "'none' | 'low' | 'med' | 'high'",
      description:
        '静止阴影深度。最常见的 FAB 形态就是纯图标按钮，用作浮动操作按钮时用 `low`/`med`/`high` 提升层级。`none` 为默认扁平按钮。',
      default: "'none'",
    },
    {
      name: 'isLoading',
      type: 'boolean',
      description:
        '显示加载指示器并阻止重复激活，同时保持可聚焦（aria-busy + aria-disabled，而非原生 disabled）。',
      default: 'false',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description:
        '禁用按钮。使用 aria-disabled 而非原生 disabled，按钮保持可聚焦。',
      default: 'false',
    },
    {
      name: 'tooltip',
      type: 'string',
      description:
        '悬停和键盘聚焦时显示的工具提示文本。除非重复了按钮的无障碍名称，它同时作为按钮的描述。',
    },
    {
      name: 'onClick',
      type: '(e: MouseEvent) => void',
      description: '标准点击处理器。',
    },
    {
      name: 'clickAction',
      type: '(e: MouseEvent) => void | Promise<void>',
      description: '带自动加载状态的异步点击处理器。',
    },
    {
      name: 'isInterruptible',
      type: 'boolean',
      description:
        'clickAction 进行期间保持按钮可点击：加载指示器和 aria-busy 仍然显示，但按钮不禁用、动作不去重，再次点击会生效并以新动作中断进行中的动作。用于可中断的动作，不要用于只触发一次的动作（提交、保存、支付）。',
      default: 'false',
    },
    {
      name: 'width',
      type: 'SizeValue',
      description:
        '按钮宽度。数字按像素处理，字符串原样使用。不设置时按钮保持纯图标比例（默认正方形）；设置后按钮采用该宽度。',
    },
    {
      name: 'type',
      type: "'button' | 'submit' | 'reset'",
      description: 'HTML button 的 type 属性。',
      default: "'button'",
    },
    {
      name: 'name',
      type: 'string',
      description: '表单提交用的 HTML name 属性。',
    },
    {
      name: 'value',
      type: 'string | number | readonly string[]',
      description: '表单提交用的 HTML value 属性。',
    },
    {
      name: 'form',
      type: 'string',
      description: '按 ID 将按钮关联到 form 元素。',
    },
    {
      name: 'href',
      type: 'string',
      description:
        '提供时，按钮渲染为链接元素（<a> 或自定义链接组件）。禁用的 IconButton 仍渲染 <button>。',
    },
    {
      name: 'as',
      type: 'ComponentType',
      description:
        '提供 href 时使用的自定义链接组件（如 Next.js Link）。',
    },
    {
      name: 'target',
      type: 'string',
      description:
        '渲染为链接时的 HTML target 属性（如 "_blank"）。',
    },
    {
      name: 'rel',
      type: 'string',
      description:
        '渲染为链接时的 HTML rel 属性（如 "noopener noreferrer"）。',
    },
  ],

  usage: {
    description:
      '只显示图标、无可见文本的按钮。在空间紧张且图标含义人尽皆知的工具栏、表格行和紧凑 UI 中使用 IconButton。',
    accessibility: [
      {
        name: 'Essential icon or spinner arc',
        category: 'Color contrast',
        criterion: '1.4.11 Non-text Contrast',
        requirement: '3:1',
        states: ['静止', '悬停', '按下', '加载中'],
        description:
          'IconButton 没有可见标签。其图标在静止、悬停、按下状态下与按钮背景的对比度至少 3:1；加载时旋转的指示弧线同样须达 3:1。',
      },
      {
        name: 'Visible control boundary',
        category: 'Color contrast',
        criterion: '1.4.11 Non-text Contrast',
        requirement: '需要时 3:1',
        states: ['静止'],
        description:
          '只有当用户需要靠边缘辨认控件时，按钮边界才需要 3:1 对比度。',
      },
      {
        name: 'Keyboard focus indicator',
        category: 'Color contrast',
        criterion: '1.4.11 Non-text Contrast',
        requirement: '3:1',
        states: ['聚焦可见'],
        description:
          '焦点轮廓与按钮周围区域的对比度至少 3:1。destructive 按钮的红色轮廓也要检查。',
      },
      {
        name: 'Disabled appearance',
        category: 'Color contrast',
        criterion: '1.4.3 and 1.4.11 exceptions',
        requirement: '不要求',
        states: ['禁用'],
        description:
          '禁用控件无需满足这些对比度要求。',
      },
    ],
    bestPractices: [
      {
        guidance: true,
        description:
          'aria-label 要具体：对屏幕阅读器而言，垃圾桶图标标注 "删除对话" 比 "删除" 更清晰。',
      },
      {
        guidance: true,
        description:
          '添加工具提示：即使是齿轮图标也可能指设置、偏好或配置。',
      },
      {
        guidance: true,
        description:
          '工具栏和密集区域使用 ghost，减少视觉噪音。',
      },
      {
        guidance: false,
        description:
          '仅凭图标无法明显看出动作时不要用 IconButton；请用带文本的 Button。',
      },
      {
        guidance: false,
        description:
          '不要省略工具提示；label 只有屏幕阅读器能读到，视觉用户需要悬停提示。',
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description:
    '只显示图标、无可见文本的按钮。用于工具栏、表格行、空间紧张且图标含义明确的紧凑 UI。',
  usage: {
    description:
      '只显示图标、无可见文本的按钮。用于工具栏、表格行、空间紧张且图标含义明确的紧凑 UI。',
    bestPractices: [
      {
        guidance: true,
        description:
          'aria-label 要具体：对屏幕阅读器，垃圾桶图标标注 "删除对话" 优于 "删除"。',
      },
      {
        guidance: true,
        description:
          '添加工具提示：齿轮图标也可能指设置/偏好/配置。',
      },
      {
        guidance: true,
        description:
          '工具栏 + 密集区域使用 ghost，减少视觉噪音。',
      },
      {
        guidance: false,
        description:
          '仅凭图标看不出动作时不要用 IconButton；改用带文本的 Button。',
      },
      {
        guidance: false,
        description:
          '不要省略工具提示：label 只有屏幕阅读器能读到；视觉用户需要悬停提示。',
      },
    ],
  },
  propDescriptions: {
    label: '无障碍标签；用作 aria-label，不渲染为可见文本',
    icon: '按钮内渲染的图标元素；未设尺寸的 Astryx Icon 在 sm/md 按钮默认 sm，lg 默认 md',
    variant: '视觉样式变体',
    size: '尺寸变体',
    elevation:
      '静止阴影深度：none|low|med|high；做浮动操作按钮（FAB）时提升',
    isLoading:
      '显示加载指示器，阻止重复激活但保持可聚焦（aria-disabled，非原生 disabled）',
    isDisabled: '禁用按钮；用 aria-disabled 代替原生 disabled',
    tooltip:
      '悬停 + 键盘聚焦时的工具提示；除非重复无障碍名称，同时描述按钮',
    onClick: '标准点击处理器',
    clickAction: '带自动加载状态的异步点击处理器',
    isInterruptible:
      'clickAction 进行期间保持可点击；再次点击会中断。不要用于只触发一次的动作（提交/保存/支付）',
    width:
      '按钮宽度；数字=像素，字符串=原样；不设置则保持纯图标比例（默认正方形）',
    type: 'HTML button 类型；默认 "button"',
    name: '表单提交用的 HTML name',
    value: '表单提交用的 HTML value',
    form: '按 ID 将按钮关联到 form 元素',
    href: '渲染为链接；禁用的 IconButton 仍是 <button>',
    as: '与 href 搭配的自定义链接组件',
    target: '渲染为链接时的 HTML target',
    rel: '渲染为链接时的 HTML rel',
  },
};
