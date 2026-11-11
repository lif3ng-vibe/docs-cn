// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'ChatComposerDrawer',
  subComponentOf: 'Chat',
  displayName: 'Chat Composer Drawer',
  isHiddenFromOverview: true,
  description: '位于聊天输入上方、ChatComposer 内部的可折叠抽屉面板。传入编写器的 `drawer` 插槽以显示附件、上下文标签或任何补充内容。提供 `count` 时抽屉获得折叠切换：折叠态显示默认 Badge 与标签或调用方提供的 `collapsedSummary`，展开态显示全部 children。',
  usage: {
    description:
      '在 ChatComposer 的 drawer 插槽中使用 ChatComposerDrawer 承载附件、上下文标签或预览等补充内容。仅当用户需要能折叠该内容时才提供 count。',
    bestPractices: [
      {
        guidance: true,
        description:
          'label 用具体的复数名词（如 "附件"），让展开与折叠操作有可用的无障碍名称。',
      },
      {
        guidance: true,
        description:
          '页面其他部分掌管抽屉状态时，用受控的 isCollapsed 配 onCollapsedChange；否则用 defaultIsCollapsed。',
      },
      {
        guidance: false,
        description:
          '不要把编写器的主要操作放进抽屉；用 ChatComposer 的页脚或发送操作插槽，让这些控件在抽屉折叠时仍然可用。',
      },
    ],
    anatomy: [
      {
        name: 'Root surface',
        required: true,
        description: '组合在 ChatComposer 主体上方的抽屉表面。',
      },
      {
        name: 'Disclosure toggle',
        required: false,
        description: '提供 count 时渲染的折叠控件，键盘与指针均可操作。',
      },
      {
        name: 'Collapsed summary',
        required: false,
        description: '折叠时呈现的默认计数 Badge 与标签，或调用方提供的视觉内容。',
      },
      {
        name: 'Content area',
        required: true,
        description: '调用方提供的补充内容；折叠后其后代对键盘与辅助技术不可达。',
      },
    ],
  },
  theming: {
    targets: [
      {
        className: 'astryx-chat-composer-drawer',
        visualProps: ['collapsed'],
      },
    ],
  },
  playground: {
    wrapper: {component: 'Stack', props: {width: 480}},
    defaults: {
      count: 3,
      label: '附件',
      children: [
        {__element: 'Token', props: {label: 'design-spec.pdf'}},
        {__element: 'Token', props: {label: 'api-schema.json'}},
        {__element: 'Token', props: {label: 'screenshot.png'}},
      ],
    },
  },
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: '抽屉内渲染的内容——标记、标签、预览或任何 React 元素。',
      required: true,
    },
    {
      name: 'count',
      type: 'number',
      description: '折叠徽章中显示的总数。提供时，抽屉获得折叠/展开切换。',
    },
    {
      name: 'label',
      type: 'string',
      description: '默认折叠摘要中显示在数量旁边的标签，并用于命名展开/折叠操作。',
      default: "'条目'",
    },
    {
      name: 'collapsedSummary',
      type: 'ReactNode',
      description: '折叠摘要解剖部分的自定义视觉内容。提供 count 时替换默认的徽章和标签；组件仍负责折叠行为与无障碍命名，该内容仅用于展示。',
    },
    {
      name: 'isCollapsed',
      type: 'boolean',
      description: '受控折叠状态。与 `onCollapsedChange` 一起使用。',
    },
    {
      name: 'defaultIsCollapsed',
      type: 'boolean',
      description: '非受控模式的初始折叠状态。',
      default: 'false',
    },
    {
      name: 'onCollapsedChange',
      type: '(isCollapsed: boolean) => void',
      description: '用户切换抽屉时触发的回调。',
    },
  ],
};

export const docsZh = {
  name: 'ChatComposerDrawer',
  isHiddenFromOverview: true,
  displayName: 'Chat Composer Drawer',
  description: '位于聊天输入上方的可折叠抽屉面板。传入 ChatComposer 的 `drawer` 插槽，用于显示附件、上下文标签或预览内容。提供 `count` 时启用折叠切换。',
  propDescriptions: {
    children: '抽屉内渲染的内容——标记、标签、预览或任何 React 元素。',
    count: '折叠徽章中显示的总数。提供时，抽屉获得折叠/展开切换。',
    label: '默认折叠摘要中显示在数量旁边的标签，并用于命名展开/折叠操作。',
    collapsedSummary: '折叠摘要解剖部分的自定义视觉内容。提供 count 时替换默认的徽章和标签；组件仍负责折叠行为与无障碍命名，该内容仅用于展示。',
    isCollapsed: '受控折叠状态。与 onCollapsedChange 一起使用。',
    defaultIsCollapsed: '非受控模式的初始折叠状态。',
    onCollapsedChange: '用户切换抽屉时触发的回调。',
  },
};

export const docsDense = {
  name: 'ChatComposerDrawer',
  isHiddenFromOverview: true,
  displayName: 'Chat Composer Drawer',
  description: '聊天输入上方的可折叠抽屉；传入编写器 `drawer` 插槽承载附件、上下文标签、预览。`count` 启用折叠切换',
  propDescriptions: {
    children: '抽屉内容：标记、标签、预览、任意 React 元素',
    count: '折叠摘要的总数；启用折叠/展开切换',
    label: '默认计数徽章旁的折叠标签；为展开/折叠操作命名',
    collapsedSummary: '替换整个折叠摘要解剖部分的自定义视觉内容；需配合 count；仅用于展示；默认保留 Badge + 标签',
    isCollapsed: '受控折叠状态',
    defaultIsCollapsed: '初始折叠状态（非受控）',
    onCollapsedChange: '折叠切换回调',
  },
};
