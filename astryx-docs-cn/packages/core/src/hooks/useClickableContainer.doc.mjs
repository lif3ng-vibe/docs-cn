// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').HookDoc} */
export const docs = {
  name: 'useClickableContainer',
  displayName: 'useClickableContainer',
  keywords: ['click', 'container', 'card', 'pressable', 'interactive', 'nested', 'link', 'button', 'delegate', '点击', '容器', '卡片'],
  params: [
    {
      name: 'options',
      type: 'UseClickableContainerOptions',
      description: '可点击容器的配置对象。',
      required: true,
    },
    {
      name: 'options.containerRef',
      type: 'RefObject<HTMLElement | null>',
      description: '外层容器元素的 ref。',
      required: true,
    },
    {
      name: 'options.interactiveRef',
      type: 'RefObject<HTMLElement | null>',
      description: '内部主要交互元素 (链接、按钮) 的 ref。未提供 onClick 或 href 时，点击会代理到此元素。',
      required: false,
    },
    {
      name: 'options.onClick',
      type: '(event: MouseEvent<HTMLElement>) => void',
      description: '点击容器表面 (而非嵌套交互元素) 时触发的点击处理函数。',
      required: false,
    },
    {
      name: 'options.href',
      type: 'string',
      description: '导航 URL。提供时，点击容器会导航到此 URL。',
      required: false,
    },
    {
      name: 'options.target',
      type: 'string',
      description: "链接 target (如 '_blank')。与 href 搭配决定导航行为。",
      required: false,
    },
    {
      name: 'options.disabled',
      type: 'boolean',
      description: '容器是否禁用。',
      default: 'false',
      required: false,
    },
  ],
  returns: [
    {
      name: 'onClick',
      type: '(event: MouseEvent<HTMLElement>) => void',
      description: '附加到容器元素的点击处理函数。',
    },
    {
      name: 'onMouseUp',
      type: '(event: MouseEvent<HTMLElement>) => void',
      description: '附加到容器的鼠标抬起处理函数 (处理 href 的中键点击导航)。',
    },
    {
      name: 'onPointerDown',
      type: '(event: PointerEvent<HTMLElement>) => void',
      description: '附加到容器的指针按下处理函数。在用 usePressFeedback 绘制按压效果的容器上，它会丢弃起始于嵌套交互元素上的触摸按压——这种按压不激活容器。鼠标 :active 的按压绘制不变。不接它时，容器对每次按压都保持原有的点击规则与按压状态。',
    },
  ],
  usage: {
    description:
      '让容器元素可点击，同时保留嵌套交互元素的行为。解决“嵌套交互元素”问题：卡片可点击但内含按钮/链接时，点击按钮/链接不应触发卡片的操作。检测点击目标与容器之间的交互祖先元素，并忽略文本选择。支持 href 导航 (包括中键与 Ctrl/Cmd+点击开新标签页)。',
    bestPractices: [
      { guidance: true, description: '把 onClick、onMouseUp、onPointerDown 都接到容器元素：完整的点击处理 (含中键)，且按压嵌套控件时不出现触摸按压状态。' },
      { guidance: true, description: '在 ClickableCard 或 SelectableCard 内使用，即标准卡片交互模式。' },
      { guidance: true, description: '没有卡片外框的可按压表面 (如按压后跳转的引用消息) 需要自行组合：表面上接本 hook；同一元素上用 `usePressFeedback()` 与 `interactionOverlayStyles.backgroundColor` (来自 `@astryxdesign/core/utils`) 实现悬停着色与触摸按压；`VisuallyHidden` 内放原生 `<button>` (目的地用 `<a>`) 作为具名控件与 interactiveRef；表面上用 `focusOutlineStyles.focusWithin` (来自 `@astryxdesign/core/utils`) 画共享焦点环 (ClickableCard 画的那个)。`Core/Hooks/useClickableContainer` story 有完整配方。' },
      { guidance: false, description: '整个容器就是一个交互元素时不要用它；直接用 <button> 或 <a>。' },
    ],
  },
  relatedComponents: ['ClickableCard', 'SelectableCard'],
  relatedHooks: ['useInputContainer'],
  importPath: '@astryxdesign/core/hooks',
  category: 'interaction',
};

/** @type {import('@astryxdesign/cli/authoring').HookTranslationDoc} */
export const docsDense = {
  description:
    '让容器元素可点击并保留嵌套交互元素行为。解决“嵌套交互元素”问题：卡片可点击但内含按钮/链接时，点它们不应触发卡片操作。检测点击目标与容器间的交互祖先，忽略文本选择。支持 href 导航 (含中键与 Ctrl/Cmd+点击开新标签)。',
  paramDescriptions: {
    options: '可点击容器配置。',
    'options.containerRef': '外层容器元素 ref。',
    'options.interactiveRef': '内部主要交互元素 (链接、按钮) ref。未提供 onClick/href 时点击代理到此元素。',
    'options.onClick': '点击容器表面 (非嵌套交互元素) 时触发。',
    'options.href': '导航 URL。提供时点击容器即导航。',
    'options.target': "链接 target (如 '_blank')。与 href 搭配决定导航行为。",
    'options.disabled': '容器是否禁用。',
  },
  returnDescriptions: {
    onClick: '容器元素的点击处理函数。',
    onMouseUp: '容器鼠标抬起处理 (处理 href 中键导航)。',
    onPointerDown: '容器指针按下处理：丢弃起始于嵌套交互元素的 usePressFeedback 触摸按压；鼠标 :active 绘制不变。',
  },
  usage: {
    description:
      '让容器元素可点击并保留嵌套交互元素行为。解决“嵌套交互元素”问题：卡片可点击但内含按钮/链接时，点它们不应触发卡片操作。检测点击目标与容器间的交互祖先，忽略文本选择。支持 href 导航 (含中键与 Ctrl/Cmd+点击开新标签)。',
    bestPractices: [
      { guidance: true, description: '把 onClick + onMouseUp + onPointerDown 接到容器：完整点击处理 (含中键)，按压嵌套控件无触摸按压状态。' },
      { guidance: true, description: '在 ClickableCard / SelectableCard 内使用，即标准卡片交互模式。' },
      { guidance: true, description: '无卡片外框的可按压表面 (如按压跳转的引用消息)：表面上接本 hook；同元素用 usePressFeedback() + interactionOverlayStyles.backgroundColor；VisuallyHidden 内放原生 <button> (目的地用 <a>) 作具名控件 + interactiveRef；表面用 focusOutlineStyles.focusWithin 画共享焦点环 (ClickableCard 画的那个)。完整配方见 Core/Hooks/useClickableContainer story。' },
      { guidance: false, description: '整个容器就是单个交互元素时不要用；直接用 <button> / <a>。' },
    ],
  },
};
