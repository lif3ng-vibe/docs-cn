// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').HookDoc} */
export const docs = {
  name: 'useKeyboardHint',
  displayName: 'useKeyboardHint',
  keywords: ['keyboard', 'hint', '提示', 'arrow', 'navigation', 'roving', 'tabindex', 'focus', '可发现性', 'toolbar', 'tabs', 'segmented', 'affordance', 'a11y'],
  params: [
    {
      name: 'options',
      type: 'UseKeyboardHintOptions',
      description: '键盘提示的配置对象。',
      required: false,
    },
    {
      name: 'options.orientation',
      type: "'horizontal' | 'vertical' | 'both'",
      description: '组合部件响应的方向键轴，决定提示显示哪些箭头图标（horizontal 为 ← →，vertical 为 ↑ ↓，both 为全部四个）。',
      default: "'horizontal'",
      required: false,
    },
    {
      name: 'options.dismissAfterMs',
      type: 'number',
      description: '提示出现后自动消失前的毫秒数。',
      default: '3000',
      required: false,
    },
    {
      name: 'options.isEnabled',
      type: 'boolean',
      description: '提示是否启用。设为 false 可针对特定实例抑制提示（如禁用或只读的组件）。',
      default: 'true',
      required: false,
    },
  ],
  returns: [
    {
      name: 'hintElement',
      type: 'ReactNode',
      description: '渲染在组合容器内（作为最后一个子元素）的 popover 提示元素。通过 popover="manual" 传送到顶层，用 Kbd 渲染方向键，并自行管理可见性；请无条件渲染它。',
    },
    {
      name: 'onFocus',
      type: '(e: React.FocusEvent) => void',
      description: '挂到容器的 onFocus 上。当焦点从组合部件外首次经键盘聚焦（:focus-visible）进入时显示提示。',
    },
    {
      name: 'onBlur',
      type: '(e: React.FocusEvent) => void',
      description: '挂到容器的 onBlur 上。焦点完全离开组合部件时隐藏提示，焦点在内部移动时重新锚定。',
    },
    {
      name: 'onKeyDown',
      type: '(e: React.KeyboardEvent) => void',
      description: '挂到容器的 onKeyDown 上。首次按下方向键时关闭提示（用户已发现该交互）。从不 preventDefault 或阻止冒泡。',
    },
  ],
  usage: {
    description:
      '在 roving-tabindex 组合部件（Toolbar、TabList、SegmentedControl 等）首次获得键盘焦点时，在聚焦项旁显示一次性的“← → 导航”提示。它教会看得见的键盘用户方向键可在组内移动。提示在顶层（popover="manual"）用 Kbd 渲染方向键，并通过 CSS 锚点定位到聚焦元素，因此永远不会被溢出容器裁剪。它在首次按方向键、超时或失焦时自动消失，且在该实例中不再重现。Toolbar、TabList 与 SegmentedControl 已自动接入；只有构建自定义 roving-tabindex 组件时才需要直接使用该 hook。',
    bestPractices: [
      { guidance: true, description: '把返回的 onFocus/onKeyDown 与现有焦点处理器组合而不是替换它们：先调用 onKeyDown（它只负责关闭，从不 preventDefault），再调用你的导航处理器。' },
      { guidance: true, description: '把 hintElement 渲染为组合容器的最后一个子元素；它位于顶层的 position:fixed 且 aria-hidden，不会影响布局或无障碍树。' },
      { guidance: true, description: '让 orientation 与组件实际响应的方向键一致，这样提示显示正确的图标。' },
      { guidance: false, description: '不要用于单个控件或没有 roving-tabindex 导航的组件；只有方向键在组内移动焦点时提示才有意义。' },
    ],
  },
  relatedComponents: ['Toolbar', 'TabList', 'SegmentedControl'],
  relatedHooks: ['useListFocus', 'useGridFocus', 'useTreeFocus'],
  importPath: '@astryxdesign/core/hooks',
  category: 'focus',
};

/** @type {import('@astryxdesign/cli/authoring').HookTranslationDoc} */
export const docsDense = {
  description:
    '在 roving-tabindex 组合部件（Toolbar/TabList/SegmentedControl）首次获得键盘焦点时，在聚焦项旁显示一次性的“← → 导航”提示。教会看得见的键盘用户方向键可在组内移动。Kbd 渲染的箭头位于顶层 popover="manual"，CSS 锚点定位（不会被溢出裁剪），aria-hidden。首次按方向键、超时或失焦时自动消失；该实例内不再重现。',
  paramDescriptions: {
    options: '键盘提示的配置。',
    'options.orientation': "方向键轴：'horizontal'（← →）、'vertical'（↑ ↓）、'both'（全部四个）。决定显示的图标。",
    'options.dismissAfterMs': '出现后自动消失前的毫秒数。',
    'options.isEnabled': '提示是否启用；false 时抑制提示（如禁用/只读组件）。',
  },
  returnDescriptions: {
    hintElement: '作为容器最后一个子元素渲染的 popover 提示。Kbd 渲染箭头、顶层、自行管理可见性；请无条件渲染。',
    onFocus: '容器 onFocus：焦点从外部首次经 :focus-visible 进入时显示提示。',
    onBlur: '容器 onBlur：离开组合部件时隐藏；内部移动时重新锚定。',
    onKeyDown: '容器 onKeyDown：首次按方向键时关闭。从不 preventDefault。',
  },
  usage: {
    description:
      '在 roving-tabindex 组合部件首次获得键盘焦点时显示一次性的“← → 导航”提示。顶层锚定 popover，aria-hidden。首次按方向键、超时或失焦时自动消失；不再重现。Toolbar/TabList/SegmentedControl 已自动接入。',
    bestPractices: [
      { guidance: true, description: '把返回的 onFocus/onKeyDown 与现有处理器组合（先调 onKeyDown；它只负责关闭）。' },
      { guidance: true, description: '把 hintElement 渲染为最后一个子元素；顶层 + aria-hidden，不影响布局/无障碍。' },
      { guidance: true, description: '让 orientation 与组件响应的方向键一致。' },
      { guidance: false, description: '不要用于单个控件/非 roving 组件。' },
    ],
  },
};
