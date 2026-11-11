// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').HookDoc} */
export const docs = {
  name: 'useTooltip',
  displayName: 'useTooltip',
  group: 'Tooltip',
  keywords: ['tooltip', 'hint', 'label', 'hover', 'info', 'title', 'floating', '提示', '悬停提示'],
  params: [
    {
      name: 'placement',
      type: "'above' | 'below' | 'start' | 'end'",
      description:
        '相对于触发元素的位置。逻辑值：start/end 依据弹出层自身继承的方向解析 (RTL 在纯 CSS 中镜像)。',
      default: "'above'",
    },
    {
      name: 'alignment',
      type: "'start' | 'center' | 'end'",
      description:
        '沿放置轴的对齐方式。逻辑值：start/end 依据弹出层自身继承的方向解析 (RTL 在纯 CSS 中镜像)。',
      default: "'center'",
    },
    {
      name: 'delay',
      type: 'number',
      description: '悬停后显示前的延迟 (毫秒)。',
      default: '200',
    },
    {
      name: 'hideDelay',
      type: 'number',
      description:
        '鼠标或焦点离开后隐藏前的延迟 (毫秒)。',
      default: '0',
    },
    {
      name: 'focusTrigger',
      type: "'auto' | 'always' | 'never'",
      description:
        '焦点何时应打开 tooltip。auto 在触发元素自身获得焦点，或焦点落入当时可聚焦的触发元素内部时打开——因此循环 tabindex 成员在被方向键到达时也会打开。',
      default: "'auto'",
    },
    {
      name: 'touchTrigger',
      type: "'auto' | 'tap' | 'none'",
      description:
        '无悬停场景下轻点的行为。auto：轻点即打开，除非触发元素自身执行操作 (aria-disabled 控件不执行)；tap：始终打开 (适用于唯一作用是展示 tooltip 的按钮)；none：触摸永不打开。',
      default: "'auto'",
    },
    {
      name: 'isEnabled',
      type: 'boolean',
      description: '悬停与聚焦触发器是否启用。',
      default: 'true',
    },
    {
      name: 'isOpen',
      type: 'boolean',
      description:
        '受控打开状态。true 强制显示；false 强制隐藏，本会显示它的聚焦会调用 onShow；undefined 由悬停/聚焦自行管理可见性。',
    },
    {
      name: 'isDefaultOpen',
      type: 'boolean',
      description: '挂载时是否显示 tooltip。',
      default: 'false',
    },
    {
      name: 'onShow',
      type: '() => void',
      description:
        'tooltip 变为可见时触发的回调。在 isOpen={false} 下，它报告本会显示 tooltip 的聚焦。',
    },
    {
      name: 'onHide',
      type: '() => void',
      description: 'tooltip 被隐藏时触发的回调。',
    },
  ],
  returns: [
    {
      name: 'ref',
      type: 'RefCallback<HTMLElement>',
      description:
        '组合 ref，在同一个触发元素上同时设置定位与交互。',
    },
    {
      name: 'positionRef',
      type: 'RefCallback<HTMLElement>',
      description: '定位锚点元素的 ref。',
    },
    {
      name: 'interactionRef',
      type: 'RefCallback<HTMLElement>',
      description: '悬停/聚焦交互元素的 ref。',
    },
    {
      name: 'anchorId',
      type: 'string',
      description: '用于高级定位场景的 CSS 锚点名称。',
    },
    {
      name: 'describedBy',
      type: 'string',
      description: '组合进触发元素 aria-describedby 的 ID。',
    },
    {
      name: 'renderTooltip',
      type: "(children: ReactNode, props?: Omit<ContextRenderProps, 'positioning'>) => ReactNode",
      description:
        '锚定定位 tooltip 内容的渲染函数。不含定位退出选项：tooltip 始终从 placement/alignment 推导位置。',
    },
    {
      name: 'show',
      type: '() => void',
      description:
        '立即打开 tooltip 并保持打开，直到 hide()、Escape、外部按压或焦点离开触发元素。其文本播报一次，并触发 onShow。受控 isOpen 下只调用 onShow。isEnabled 为 false 时无操作。',
    },
    {
      name: 'hide',
      type: '() => void',
      description:
        '立即关闭 tooltip，并触发 onHide。受控 isOpen 下只调用 onHide。',
    },
  ],
  usage: {
    description:
      '面向悬停/聚焦触发 tooltip 的无头 Hook。基于 useLayer 构建，带悬停意图、键盘焦点处理与无障碍的 aria-describedby 关联。用于需要 tooltip 行为但不想要包装组件的自定义触发元素。',
    bestPractices: [
      {
        guidance: true,
        description:
          '用于描述图标按钮、截断文本、缩写或紧凑控件的简短文本标签。',
      },
      {
        guidance: true,
        description:
          '标准包装优先用 Tooltip 组件；触发元素不是简单子元素时再用本 Hook。',
      },
      {
        guidance: true,
        description:
          '切换式触发：让自有按钮在每次按压时调用 show() 与 hide()。为其设置 aria-describedby 与指向 describedBy 的 aria-controls，以及 aria-expanded (show() 保持期间为 true，hide() 或 onHide 之后为 false)，并保留其自身无障碍名称。信息图标请改用 InfoTip。',
      },
      {
        guidance: false,
        description:
          '不要把可交互内容放进 tooltip：请改用 Popover 或 HoverCard。',
      },
    ],
  },
  relatedComponents: ['Tooltip', 'HoverCard', 'Popover'],
  relatedHooks: ['useLayer', 'useHoverCard', 'usePopover'],
  importPath: '@astryxdesign/core/Tooltip',
  category: 'interaction',
};

/** @type {import('@astryxdesign/cli/authoring').HookTranslationDoc} */
export const docsDense = {
  description:
    '无头悬停/聚焦 tooltip Hook。基于 useLayer，带悬停意图、键盘焦点处理与 aria-describedby。用于无需包装组件的自定义触发元素。',
  paramDescriptions: {
    placement:
      '相对触发元素的位置。逻辑值：start/end 跟随弹出层继承的方向 (RTL 镜像)。',
    alignment:
      '沿放置轴的对齐。逻辑值：start/end 跟随弹出层继承的方向 (RTL 镜像)。',
    delay: '显示延迟 (毫秒)。',
    hideDelay: '鼠标/焦点离开后的隐藏延迟 (毫秒)。',
    focusTrigger:
      '焦点何时打开 tooltip；auto = 焦点落在触发元素上，或落入聚焦到达时可聚焦的触发元素内部。',
    touchTrigger:
      '无悬停的轻点行为；auto = 轻点打开除非触发元素执行操作，tap = 始终打开，none = 永不打开。',
    isEnabled: '悬停/聚焦触发器是否启用。',
    isOpen:
      '受控打开状态：true 强制显示，false 强制隐藏，undefined 不托管。',
    isDefaultOpen: '挂载时显示。',
    onShow: 'tooltip 变为可见时触发。',
    onHide: 'tooltip 隐藏时触发。',
  },
  returnDescriptions: {
    ref: '组合的定位 + 交互 ref。',
    positionRef: '定位锚点 ref。',
    interactionRef: '悬停/聚焦交互 ref。',
    anchorId: 'CSS 锚点名称。',
    describedBy: '用于 aria-describedby 的 ID。',
    renderTooltip: '渲染锚定定位的 tooltip 内容。',
    show: '打开并保持，直到 hide()/Escape/外部按压/焦点离开；播报一次；触发 onShow。受控时仅 onShow。禁用时无操作。',
    hide: '关闭；触发 onHide。受控时仅 onHide。',
  },
  usage: {
    description:
      '无头悬停/聚焦 tooltip Hook。基于 useLayer，带悬停意图、键盘焦点处理与 aria-describedby。用于无需包装组件的自定义触发元素。',
    bestPractices: [
      {
        guidance: true,
        description:
          '用于描述图标按钮、截断文本、缩写、紧凑控件的简短标签。',
      },
      {
        guidance: true,
        description:
          '标准包装优先 Tooltip；触发元素非简单子元素时用本 Hook。',
      },
      {
        guidance: true,
        description:
          '切换式触发：自有按钮每次按压调用 show()/hide()，设置 aria-describedby + aria-controls={describedBy} 与 aria-expanded (保持期间 true)，保留自身名称。信息图标用 InfoTip。',
      },
      {
        guidance: false,
        description:
          '不要把可交互内容放进 tooltip：改用 Popover / HoverCard。',
      },
    ],
  },
};
