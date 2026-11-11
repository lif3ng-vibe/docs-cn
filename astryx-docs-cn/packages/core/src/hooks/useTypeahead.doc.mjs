// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').HookDoc} */
export const docs = {
  name: 'useTypeahead',
  displayName: 'useTypeahead',
  keywords: [
    'typeahead',
    '输入即跳转',
    'type to focus',
    'first character',
    'keyboard',
    '键盘',
    'search',
    '搜索',
    'jump',
    '跳转',
    'menu',
    'listbox',
    'select',
    'apg',
    'accessibility',
    'a11y',
  ],
  params: [
    {
      name: 'options',
      type: 'UseTypeaheadOptions',
      description: '配置对象。',
      required: true,
    },
    {
      name: 'options.getItemLabels',
      type: '() => ReadonlyArray<string | null | undefined>',
      description:
        "按 DOM 顺序返回项标签。null 或空条目标记一个不可匹配的槽位，并使索引与使用方的项保持对齐。",
      required: true,
    },
    {
      name: 'options.onMatch',
      type: '(index: number) => void',
      description:
        "以匹配项的索引调用，供使用方聚焦或选中它；通常接 useListFocus 的 focusItem。",
      required: true,
    },
    {
      name: 'options.getCurrentIndex',
      type: '() => number',
      description:
        '搜索起始索引，通常是聚焦项，使重复按同一字母能循环遍历匹配项。负值表示当前没有任何项。',
      default: '() => -1',
    },
    {
      name: 'options.resetMs',
      type: 'number',
      description:
        '无输入多少毫秒后重置已键入的缓冲。',
      default: '750',
    },
    {
      name: 'options.isDisabled',
      type: '(index: number) => boolean',
      description: '某个索引是否应跳过，如禁用项。',
    },
  ],
  returns: [
    {
      name: 'onKeyDown',
      type: '(e: React.KeyboardEvent | KeyboardEvent) => boolean',
      description:
        'keydown 处理器。消费了可打印字符时返回 true，使用方即可停止自己的按键处理。',
    },
    {
      name: 'reset',
      type: '() => void',
      description:
        '清空待处理缓冲，例如集合关闭时。',
    },
  ],
  usage: {
    description:
      "为集合添加 APG 输入即跳转（type-to-focus）搜索：可打印按键被缓冲（停顿后重置），第一个标签以缓冲开头的项（忽略大小写与变音符，各 locale 下均忽略带划线字母 đ ł ø ħ ŧ ƀ 及土耳其语 ı/İ；键入变音符时优先精确匹配）经 onMatch 上报。重复按同一字母在匹配项间循环，而不是继续过滤。它自身不移动任何焦点；请与集合自身的焦点管理搭配，最常见是 useListFocus 或 useGridFocus。",
    bestPractices: [
      {
        guidance: true,
        description:
          '把 onMatch 接到你已有的焦点管理器（useListFocus.focusItem），而不是自行移动焦点。',
      },
      {
        guidance: true,
        description:
          '让它先看到按键事件，仅当它返回 false 时才落到方向键导航。',
      },
      {
        guidance: true,
        description:
          '传入 getCurrentIndex，让重复按同一字母遍历匹配项，而不是停在第一个。',
      },
      {
        guidance: false,
        description:
          '不要在文本输入框上使用；输入框本就接收字符，typeahead 会与值打架。',
      },
    ],
  },
  relatedComponents: ['DropdownMenu', 'Selector', 'TreeList'],
  relatedHooks: ['useListFocus', 'useGridFocus', 'useTreeFocus'],
  importPath: '@astryxdesign/core/hooks',
  category: 'focus',
};

/** @type {import('@astryxdesign/cli/authoring').HookTranslationDoc} */
export const docsDense = {
  description:
    '为集合提供 APG 输入即跳转搜索。缓冲可打印按键（停顿后重置），按前缀匹配标签，各 locale 下忽略大小写、变音符、带划线字母 + 土耳其语 ı/İ（键入变音符时优先精确匹配），经 onMatch 上报索引。重复按同一字母在匹配项间循环。自身不移动焦点；与 useListFocus / useGridFocus 搭配。',
  paramDescriptions: {
    options: '配置。',
    'options.getItemLabels':
      '按 DOM 顺序的项标签；null/空 = 不可匹配槽位，索引保持对齐。',
    'options.onMatch':
      '以匹配索引调用，供使用方聚焦/选中（如 useListFocus focusItem）。',
    'options.getCurrentIndex':
      '搜索起始索引（通常是聚焦项）使重复按键循环。负值 = 当前没有项。',
    'options.resetMs': '无输入多少毫秒后重置键入缓冲。',
    'options.isDisabled': '某个索引是否跳过（如禁用项）。',
  },
  returnDescriptions: {
    onKeyDown:
      'keydown 处理器；true = 消费了可打印字符，使用方可停止自己的处理。',
    reset: '清空待处理缓冲（如关闭时）。',
  },
  usage: {
    description:
      '菜单/列表框/树的输入即跳转。带 APG 同字母循环的缓冲前缀匹配；上报索引，焦点由使用方负责。',
    bestPractices: [
      {
        guidance: true,
        description:
          '把 onMatch 接到已有焦点管理器（useListFocus.focusItem），不要自行移动焦点。',
      },
      {
        guidance: true,
        description:
          '让它先拿按键事件；返回 false 时落到方向键导航。',
      },
      {
        guidance: true,
        description:
          '传入 getCurrentIndex，让重复按键遍历匹配项而不是停在第一个。',
      },
      {
        guidance: false,
        description: '不要在文本输入框上使用；输入框本就接收字符。',
      },
    ],
  },
};
