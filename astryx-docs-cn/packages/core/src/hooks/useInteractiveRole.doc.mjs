// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').HookDoc} */
export const docs = {
  name: 'useInteractiveRole',
  displayName: 'useInteractiveRole',
  keywords: [
    'role',
    '多态',
    'polymorphic',
    'link',
    'button',
    'inert',
    'href',
    'onClick',
    'element type',
    'as',
    'trigger',
    '触发器',
    '语义',
    'accessibility',
    'a11y',
  ],
  params: [
    {
      name: 'options',
      type: 'UseInteractiveRoleOptions',
      description: '组件接收到的交互性输入。',
      required: true,
    },
    {
      name: 'options.href',
      type: 'string',
      description:
        '用于导航的 URL。优先级最高：有 href 时组件即为链接。',
    },
    {
      name: 'options.onClick',
      type: '((...args: never[]) => unknown) | null',
      description:
        '点击处理器。解析为 button，优先于任何由上下文提供的角色。',
    },
    {
      name: 'options.isDisabled',
      type: 'boolean',
      description:
        '为 true 时，角色解析忽略 href（禁用的链接是一种反模式），角色依次取自 onClick、上下文，最后是 inert。',
      default: 'false',
    },
  ],
  returns: [
    {
      name: 'role',
      type: "'link' | 'button' | 'inert'",
      description:
        '组件应渲染的元素：锚点（a）、button，或非交互的 span/div。',
    },
  ],
  usage: {
    description:
      '在一个地方解析多态组件应渲染成什么：href 优先，其次是 onClick，然后是父级提供的交互式触发器上下文（Popover、DropdownMenu 等），最后是 inert。任何「有时是链接、有时是按钮、有时只是普通内容」的组件都应使用它；Token、Thumbnail、Item 与 ClickableCard 都是如此。由于上下文参与解析，基于它构建的组件无需改动就能成为新表面上的有效触发器。',
    bestPractices: [
      {
        guidance: true,
        description:
          '根据返回的 role 切换选择元素，并且只在 "link" 时渲染锚点，这样键盘和中键行为都来自平台原生实现。',
      },
      {
        guidance: true,
        description:
          '透传 isDisabled，而不是自行丢弃 href；hook 已确保禁用的链接不进入 Tab 焦点顺序。',
      },
      {
        guidance: false,
        description:
          '不要在组件里再写一套临时的 href/onClick 优先级判断；新的触发器上下文会加在这里，所有使用方自动继承。',
      },
    ],
  },
  relatedComponents: ['Token', 'Thumbnail', 'Item', 'ClickableCard'],
  relatedHooks: ['useClickableContainer'],
  importPath: '@astryxdesign/core/hooks',
  category: 'interaction',
};

/** @type {import('@astryxdesign/cli/authoring').HookTranslationDoc} */
export const docsDense = {
  description:
    '解析多态组件的渲染形态：href -> link，onClick -> button，交互式触发器上下文 -> 其角色，否则 inert。优先级只在这一处维护。',
  paramDescriptions: {
    options: '组件接收到的交互性输入。',
    'options.href': '导航 URL；优先级最高。',
    'options.onClick': '点击处理器；解析为 button，优先于上下文角色。',
    'options.isDisabled':
      'true = 解析时忽略 href（禁用的链接是反模式）；退到 onClick / 上下文 / inert。',
  },
  returnDescriptions: {
    role: "要渲染的元素：'link'（锚点）、'button' 或 'inert'（span/div）。",
  },
  usage: {
    description:
      '适用于「有时是链接、有时是按钮、有时是普通内容」的组件（Token、Thumbnail、Item、ClickableCard）。感知上下文，使用方无需改动即可成为新表面上的有效触发器。',
    bestPractices: [
      {
        guidance: true,
        description:
          '根据返回的 role 切换；"link" 时渲染真实锚点，平台键盘/中键行为随之生效。',
      },
      {
        guidance: true,
        description:
          '透传 isDisabled，而不是自行丢弃 href。',
      },
      {
        guidance: false,
        description:
          '不要在每个组件里重新实现 href/onClick 优先级；新的触发器上下文统一加在这里。',
      },
    ],
  },
};
