// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').HookDoc} */
export const docs = {
  name: 'useInputContainer',
  displayName: 'useInputContainer',
  keywords: ['input', 'container', '容器', 'focus', '焦点委托', 'wrapper', 'text', 'textarea', 'click', 'icon', '图标', 'padding'],
  params: [
    {
      name: 'options',
      type: 'UseInputContainerOptions',
      description: '输入容器的配置对象。',
      required: true,
    },
    {
      name: 'options.containerRef',
      type: 'RefObject<HTMLElement | null>',
      description: '指向外层容器/包裹元素的 ref。',
      required: true,
    },
    {
      name: 'options.inputRef',
      type: 'RefObject<HTMLInputElement | HTMLTextAreaElement | HTMLElement | null>',
      description: '指向内层 input 或 textarea 元素的 ref。',
      required: true,
    },
    {
      name: 'options.disabled',
      type: 'boolean',
      description: 'input 是否禁用。',
      default: 'false',
      required: false,
    },
  ],
  returns: [
    {
      name: 'onClick',
      type: '(event: MouseEvent<HTMLElement>) => void',
      description: '挂载到容器包裹元素上的点击处理器。',
    },
    {
      name: 'onMouseUp',
      type: '(event: MouseEvent<HTMLElement>) => void',
      description: '挂载到容器包裹元素上的鼠标抬起处理器。',
    },
  ],
  usage: {
    description:
      '让输入容器包裹元素可点击，当用户点击非交互区域（图标、边距、状态指示器）时将焦点委托给内层的 input/textarea。构建于 useClickableContainer 之上，因此嵌套的交互元素（清除按钮、日历开关、链接）会被安全处理；点击它们不会从 input 抢走焦点。自动检测 input 类型：文本类 input 调用 .focus()，其他类型（checkbox、radio、file）调用 .click()。',
    bestPractices: [
      { guidance: true, description: '在输入包裹类组件（TextInput、NumberInput、TimeInput、TextArea）内部使用，让整个容器区域都可点击。' },
      { guidance: true, description: '将 onClick 和 onMouseUp 都挂到包裹 div 上，以完整处理交互。' },
      { guidance: false, description: '不要用在无包裹元素的裸 input 上；如果 input 已填满整个可点击区域，这样做没有收益。' },
    ],
  },
  relatedComponents: ['TextInput', 'NumberInput', 'TimeInput', 'TextArea'],
  relatedHooks: ['useClickableContainer'],
  importPath: '@astryxdesign/core/hooks',
  category: 'interaction',
};

/** @type {import('@astryxdesign/cli/authoring').HookTranslationDoc} */
export const docsDense = {
  description:
    '让输入容器包裹元素可点击，用户点击非交互区域（图标、边距、状态指示器）时把焦点委托给内层 input/textarea。构建于 useClickableContainer，嵌套交互元素（清除按钮、日历开关、链接）会被安全处理；点击它们不会抢走 input 的焦点。自动检测 input 类型：文本类 input 调用 .focus()，其他类型（checkbox、radio、file）调用 .click()。',
  paramDescriptions: {
    options: '输入容器的配置。',
    'options.containerRef': '指向外层容器/包裹元素的 ref。',
    'options.inputRef': '指向内层 input/textarea 元素的 ref。',
    'options.disabled': 'input 是否禁用。',
  },
  returnDescriptions: {
    onClick: '容器包裹元素的点击处理器。',
    onMouseUp: '容器包裹元素的鼠标抬起处理器。',
  },
  usage: {
    description:
      '让输入容器包裹元素可点击，用户点击非交互区域（图标、边距、状态指示器）时把焦点委托给内层 input/textarea。构建于 useClickableContainer，嵌套交互元素（清除按钮、日历开关、链接）会被安全处理；点击它们不会抢走 input 的焦点。自动检测 input 类型：文本类 input 调用 .focus()，其他类型（checkbox、radio、file）调用 .click()。',
    bestPractices: [
      { guidance: true, description: '在输入包裹类组件（TextInput、NumberInput、TimeInput、TextArea）内部使用，让整个容器区域都可点击。' },
      { guidance: true, description: '将 onClick 与 onMouseUp 都挂到包裹 div 上，以完整处理交互。' },
      { guidance: false, description: '不要用在无包裹元素的裸 input 上；input 已填满整个可点击区域时没有收益。' },
    ],
  },
};
