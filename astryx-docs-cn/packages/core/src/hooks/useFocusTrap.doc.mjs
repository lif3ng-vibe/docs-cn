// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').HookDoc} */
export const docs = {
  name: 'useFocusTrap',
  displayName: 'useFocusTrap',
  keywords: ['focus', 'trap', 'modal', 'dialog', 'accessibility', 'a11y', 'keyboard', 'tab', 'escape', 'wai-aria', '焦点圈禁', '焦点陷阱'],
  params: [
    {
      name: 'options',
      type: 'UseFocusTrapOptions',
      description: '焦点陷阱的配置对象。',
      required: true,
    },
    {
      name: 'options.isActive',
      type: 'boolean',
      description: '焦点陷阱当前是否激活。',
      required: true,
    },
    {
      name: 'options.onEscape',
      type: '() => void',
      description: '在被圈禁的容器内按下 Escape 时触发的回调。',
      required: false,
    },
  ],
  returns: [
    {
      name: 'containerRef',
      type: 'React.RefObject<HTMLElement | null>',
      description: '附加到应圈禁焦点的容器元素的 ref。',
    },
    {
      name: 'focusFirst',
      type: '() => void',
      description: '聚焦容器内第一个可聚焦元素。',
    },
  ],
  usage: {
    description:
      '遵循 WAI-ARIA 对话框焦点陷阱模式，把焦点圈禁在容器元素内。监听文档上的焦点事件，若 Tab 从容器内部把焦点移出则重定向回容器。处理 Tab 与 Shift+Tab 的循环。焦点在容器外时按下的 Tab 交给页面处理，因此打开的非模态表面绝不接管页面的焦点顺序。陷阱停用或卸载时，焦点恢复到激活前聚焦的元素，除非焦点已移到别处或从未进入陷阱 (因此把焦点保持在触发器上的弹层，如组合框，不受影响)。容器外的鼠标点击不被拦截；这类场景请用轻点关闭处理。',
    bestPractices: [
      { guidance: true, description: '打开对话框/模态框时调用 focusFirst()，把焦点移入被圈禁的区域。' },
      { guidance: true, description: '提供 onEscape 回调，在按下 Escape 时关闭对话框。' },
      { guidance: true, description: '依赖内置的关闭焦点恢复；仅当需要把焦点送到先前聚焦元素之外时才添加自己的 onHide 焦点处理。' },
      { guidance: false, description: '不要用于 tooltip 或下拉菜单等非模态内容；它们需要轻点关闭，而非焦点陷阱。' },
    ],
  },
  relatedComponents: ['Dialog', 'DatePicker'],
  relatedHooks: ['useListFocus', 'useScrollLock'],
  importPath: '@astryxdesign/core/hooks',
  category: 'focus',
};

/** @type {import('@astryxdesign/cli/authoring').HookTranslationDoc} */
export const docsDense = {
  description:
    '遵循 WAI-ARIA 对话框焦点陷阱模式，把焦点圈禁在容器元素内。监听文档焦点事件，Tab 从容器内移出焦点时重定向回容器。处理 Tab 与 Shift+Tab 循环。焦点在容器外时按下的 Tab 交给页面。容器外鼠标点击不被拦截；用轻点关闭处理。',
  paramDescriptions: {
    options: '焦点陷阱配置。',
    'options.isActive': '焦点陷阱当前是否激活。',
    'options.onEscape': '在被圈禁的容器内按下 Escape 时的回调。',
  },
  returnDescriptions: {
    containerRef: '附加到应圈禁焦点的容器元素的 ref。',
    focusFirst: '聚焦容器内第一个可聚焦元素。',
  },
  usage: {
    description:
      '遵循 WAI-ARIA 对话框焦点陷阱模式，把焦点圈禁在容器元素内。监听文档焦点事件，Tab 从容器内移出焦点时重定向回容器。处理 Tab 与 Shift+Tab 循环。焦点在容器外时按下的 Tab 交给页面。停用/卸载时恢复焦点到激活前聚焦的元素，除非焦点已移到别处或从未进入陷阱。容器外鼠标点击不被拦截；用轻点关闭处理。',
    bestPractices: [
      { guidance: true, description: '打开对话框/模态框时调用 focusFirst()，把焦点移入被圈禁的区域。' },
      { guidance: true, description: '提供 onEscape 回调，按下 Escape 时关闭对话框。' },
      { guidance: true, description: '依赖内置的关闭焦点恢复；仅当需要把焦点送到先前聚焦元素之外时才添加自己的 onHide 处理。' },
      { guidance: false, description: '不要用于 tooltip 或下拉菜单等非模态内容；它们需要轻点关闭，而非焦点陷阱。' },
    ],
  },
};
