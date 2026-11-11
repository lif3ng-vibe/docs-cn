// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'TopNavItem',
  subComponentOf: 'TopNav',
  displayName: 'Top Nav Item',
  isHiddenFromOverview: true,
  description: '用于 TopNav startContent 的导航链接项：渲染为带悬停与选中状态的锚点。',
  playground: {
    defaults: {label: 'Projects', href: '#', isSelected: true},
  },
  props: [
    {
      name: 'label',
      type: 'string',
      description: '导航项的无障碍标签。默认渲染为可见文本；isIconOnly 为 true 时改用作 aria-label。',
      required: true,
    },
    {
      name: 'href',
      type: 'string',
      description: '导航目标 URL。',
    },
    {
      name: 'isSelected',
      type: 'boolean',
      description: '此导航项当前是否选中。设置 aria-current="page" 并应用高亮样式。',
      default: 'false',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: '导航项是否禁用。设置 aria-disabled，移除 href/target 使其无法导航，并阻止交互。',
      default: 'false',
    },
    {
      name: 'isIconOnly',
      type: 'boolean',
      description: '将项渲染为方形纯图标元素。为 true 时 label 用作 aria-label、隐藏可见文本。必须设置 icon。',
      default: 'false',
    },
    {
      name: 'icon',
      type: 'ReactNode',
      description: '显示在标签之前的可选图标。',
      slotElements: [
        {
          __element: 'Icon',
          props: {
            icon: 'check',
            size: 'sm',
          },
        },
      ],
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: '替代标签文本渲染的自定义内容。',
    },
    {
      name: 'as',
      type: 'LinkComponentType',
      description: '替代 <a> 渲染的自定义组件。覆盖 LinkProvider 设置的提供方级默认值。必须接受 href、className、style 与 children prop。',
    },
  ],
};

export const docsZh = {
  name: 'TopNavItem',
  isHiddenFromOverview: true,
  displayName: 'Top Nav Item',
  description: '用于 TopNav startContent 的导航链接项，渲染为具有悬停和选中状态的锚点。',
  props: [
    {
      name: 'label',
      type: 'string',
      description: '导航项的无障碍标签。用作可见文本，或作为仅图标项的 aria-label。',
      required: true,
    },
    {
      name: 'href',
      type: 'string',
      description: '导航目标 URL。',
    },
    {
      name: 'isSelected',
      type: 'boolean',
      description: '此导航项是否为当前选中状态。设置 aria-current="page" 并应用高亮样式。',
      default: 'false',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: '导航项是否被禁用。设置 aria-disabled，移除 href/target 使其无法导航，并阻止交互。',
      default: 'false',
    },
    {
      name: 'icon',
      type: 'ReactNode',
      description: '在标签前显示的可选图标。如果在没有子元素的情况下提供，项目变为仅图标模式。',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: '替代标签文本渲染的自定义内容。省略且提供了图标时，项目变为仅图标模式。',
    },
    {
      name: 'as',
      type: 'LinkComponentType',
      description: '替代 <a> 渲染的自定义组件。覆盖 LinkProvider 设置的提供者级别默认值。必须接受 href、className、style 和 children 属性。',
    },
  ],
};

export const docsDense = {
  name: 'TopNavItem',
  isHiddenFromOverview: true,
  displayName: 'Top Nav Item',
  description: 'TopNav startContent 的导航链接：渲染为带悬停+选中状态的锚点。',
  propDescriptions: {
    label: '可见文本；isIconOnly 为 true 时作 aria-label。',
    href: '导航 URL。',
    isSelected: '设置 aria-current="page" + 高亮样式。',
    isDisabled: '设置 aria-disabled，移除 href/target (无法导航)，阻止交互。',
    icon: '标签前的图标。',
    children: '替代标签文本的自定义内容。',
    as: '自定义链接组件。覆盖 LinkProvider 默认值。必须接受 href、className、style、children。',
  },
};
