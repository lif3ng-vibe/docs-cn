// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').HookDoc} */
export const docs = {
  name: 'useHotkeys',
  displayName: 'useHotkeys',
  keywords: ['hotkey', 'shortcut', '快捷键', '键盘', 'keydown', '组合键', '命令面板', 'mod', 'cmd', 'ctrl', 'kbd'],
  params: [
    {
      name: 'hotkeys',
      type: 'Hotkey[]',
      description:
        '快捷键注册项。每个条目为 `{ keys, onPress, allowInInputs?, isDisabled? }`。`keys` 是以 "+" 分隔的组合键，如 "mod+k"、"shift+/"、"escape"；"mod" 在 macOS 上是 ⌘，其他平台为 Ctrl。`onPress` 在 preventDefault() 之后接收 KeyboardEvent。`allowInInputs`（默认 false）允许在输入框/文本域/下拉框/contenteditable 中输入时触发快捷键。`isDisabled` 可临时停用该条目。',
      required: true,
    },
  ],
  returns: [],
  usage: {
    description:
      '通过每个 hook 实例一个 window keydown 监听器注册全局键盘快捷键。处理器存放在 ref 中，因此重新渲染不会重新订阅。除非设置 allowInInputs，否则会跳过来自输入目标（input、textarea、select、contenteditable）的事件；跳过已被 defaultPrevented 的事件，并在匹配时调用 preventDefault()。SSR 安全。',
    bestPractices: [
      { guidance: true, description: '用于应用级快捷键，如命令面板（mod+k）、帮助浮层（shift+/）和导航键。' },
      { guidance: true, description: '与 Kbd 组件搭配显示所注册的组合键；两者对各平台 "mod" 的解析完全一致。' },
      { guidance: true, description: '在模态框或向导占用键盘时，用 isDisabled 暂停快捷键，而不是卸载 hook。' },
      { guidance: false, description: '不要用于组件内部聚焦范围的键盘导航；请改用 useListFocus 或 useGridFocus。' },
    ],
  },
  relatedComponents: ['Kbd'],
  relatedHooks: ['useListFocus', 'useGridFocus'],
  importPath: '@astryxdesign/core/hooks',
  category: 'interaction',
};

/** @type {import('@astryxdesign/cli/authoring').HookTranslationDoc} */
export const docsDense = {
  description:
    '全局键盘快捷键；每个 hook 实例一个 window keydown 监听器。处理器保存在 ref 中，重新渲染不会重新订阅。除非设置 allowInInputs，否则跳过输入目标（input/textarea/select/contenteditable）；跳过 defaultPrevented 与 IME 按键事件（即使设置 allowInInputs 也不例外），匹配时调用 preventDefault()。"mod" 在 macOS 为 ⌘，其他平台为 Ctrl。SSR 安全。',
  paramDescriptions: {
    hotkeys:
      '数组，每项为 { keys, onPress, allowInInputs?, isDisabled? }。keys 为以 "+" 分隔的组合键（"mod+k"、"shift+/"、"escape"）。',
  },
  usage: {
    description:
      '全局键盘快捷键；每个 hook 实例一个 window keydown 监听器。处理器保存在 ref 中，重新渲染不会重新订阅。除非设置 allowInInputs 否则跳过输入目标，跳过 defaultPrevented 与 IME 按键事件（即使设置 allowInInputs 也不例外），匹配时调用 preventDefault()。SSR 安全。',
    bestPractices: [
      { guidance: true, description: '用于应用级快捷键：命令面板（mod+k）、帮助浮层（shift+/）、导航键。' },
      { guidance: true, description: '与 Kbd 组件搭配显示所注册的组合键；两者对各平台 "mod" 的解析完全一致。' },
      { guidance: true, description: '在模态框/向导占用键盘时用 isDisabled 暂停快捷键，而不是卸载 hook。' },
      { guidance: false, description: '不要用于组件内部聚焦范围的键盘导航；请改用 useListFocus / useGridFocus。' },
    ],
  },
};
