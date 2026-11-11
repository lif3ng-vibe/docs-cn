// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'useImperativeDialog',
  subComponentOf: 'Dialog',
  displayName: 'useImperativeDialog',
  description: '用于显示对话框而无需自行管理打开状态的 Hook。调用 dialog.show(content, options) 打开、dialog.hide() 关闭；将 dialog.element 渲染到你的 JSX 树中。',
  props: [
    {
      name: 'show',
      type: '(content: ReactNode, options?: DialogOptions) => void',
      description: '以给定内容显示对话框。options 与 Dialog 组件的 prop 相同，但不包括 isOpen/onOpenChange/children。',
    },
    {
      name: 'hide',
      type: '() => void',
      description: '隐藏对话框。',
    },
    {
      name: 'isOpen',
      type: 'boolean',
      description: '对话框当前是否打开。',
    },
    {
      name: 'element',
      type: 'ReactNode',
      description: '对话框元素：将其渲染到你的 JSX 树中。',
    },
  ],
};

export const docsDense = {
  name: 'useImperativeDialog',
  description: '无需管理打开状态即可显示对话框的 Hook；调用 dialog.show(content, options) 打开 + dialog.hide() 关闭；将 dialog.element 渲染到 JSX 树中',
  propDescriptions: {
    show: '以给定内容显示对话框；options 同 Dialog 组件的 prop，但不含 isOpen/onOpenChange/children',
    hide: '隐藏对话框',
    isOpen: '对话框当前是否打开',
    element: '对话框元素：将其渲染到 JSX 树中',
  },
};
