// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').HookDoc} */
export const docs = {
  name: 'useCollapsible',
  displayName: 'useCollapsible',
  group: 'Collapsible',
  keywords: ['折叠', '收起', '展开', '切换', '手风琴', '展开收起', '收合'],
  params: [
    {
      name: 'isCollapsible',
      type: "boolean | CollapsibleConfig",
      description: '启用折叠行为。true = 自管理（初始展开）。传入配置对象用于受控模式或自定义默认值。',
    },
    {
      name: 'value',
      type: 'string',
      description: 'CollapsibleGroup 内的唯一标识。存在且位于组内时，状态由组管理。',
    },
  ],
  returns: [
    {
      name: 'isEnabled',
      type: 'boolean',
      description: '折叠行为是否启用。',
    },
    {
      name: 'isOpen',
      type: 'boolean',
      description: '内容当前是否展开。',
    },
    {
      name: 'toggle',
      type: '() => void',
      description: '切换展开/收起状态。分派给组、受控回调或内部状态。',
    },
  ],
  usage: {
    description: '封装折叠状态机的可复用 Hook。支持三种模式：组受控（位于 CollapsibleGroup 内）、受控（isOpen + onOpenChange）、非受控（经 defaultIsOpen 自管理）。Card 与 Section 内部使用。',
    bestPractices: [
      {guidance: true, description: '构建需要 Astryx 折叠行为但不想套 Collapsible 包装的自定义组件时，直接使用该 Hook。'},
      {guidance: true, description: '手风琴行为：将各项包进 CollapsibleGroup 并传入唯一 value。'},
      {guidance: false, description: '不要为绑定 value 的组项传入本地 isOpen、defaultIsOpen 或 onOpenChange 并期待其生效；状态与通知路径归组所有。'},
      {guidance: false, description: '不要在 useCollapsible 已提供开/关状态时自行实现；该 Hook 自动处理组协调。'},
    ],
  },
  relatedComponents: ['Collapsible', 'Card', 'Section'],
  relatedHooks: [],
  importPath: '@astryxdesign/core/Collapsible',
  category: 'interaction',
};

/** @type {import('@astryxdesign/cli/authoring').HookTranslationDoc} */
export const docsDense = {
  description: '封装折叠状态机。3 种模式：组受控（CollapsibleGroup 内）、受控（isOpen + onOpenChange）、非受控（defaultIsOpen 自管理）。Card 与 Section 内部使用。',
  paramDescriptions: {
    isCollapsible: '启用折叠行为。true = 自管理（初始展开）。传配置对象用于受控模式/自定义默认值。',
    value: 'CollapsibleGroup 内唯一 id。存在且在组内时状态由组管理。',
  },
  returnDescriptions: {
    isEnabled: '折叠行为是否启用。',
    isOpen: '内容当前是否展开。',
    toggle: '切换展开/收起。分派给组、受控回调/内部状态。',
  },
  usage: {
    description: '封装折叠状态机。3 种模式：组受控（CollapsibleGroup 内）、受控（isOpen + onOpenChange）、非受控（defaultIsOpen 自管理）。Card 与 Section 内部使用。',
    bestPractices: [
      {guidance: true, description: '构建需要 Astryx 折叠行为但不套 Collapsible 包装的自定义组件时直接使用。'},
      {guidance: true, description: '手风琴行为：项包进 CollapsibleGroup + 传唯一 value。'},
      {guidance: false, description: '不要为绑定 value 的组项传本地状态或回调并期待生效；组拥有状态+通知。'},
      {guidance: false, description: 'useCollapsible 已提供开/关状态时不要自行实现；Hook 自动处理组协调。'},
    ],
  },
};
