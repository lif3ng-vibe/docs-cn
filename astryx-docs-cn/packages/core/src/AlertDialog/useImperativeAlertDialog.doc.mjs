// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'useImperativeAlertDialog',
  subComponentOf: 'AlertDialog',
  displayName: 'useImperativeAlertDialog',
  description: '无需管理打开状态即可展示警告框的 Hook。调用 alert.show(options) 打开、alert.hide() 关闭，并在 JSX 树中渲染 alert.element。',
  props: [
    {
      name: 'show',
      type: '(options: AlertDialogOptions) => void',
      description: '以给定选项展示警告框。选项与 AlertDialog 的 prop 一致，但不包含 isOpen/onOpenChange。',
    },
    {
      name: 'hide',
      type: '() => void',
      description: '隐藏警告框。',
    },
    {
      name: 'isOpen',
      type: 'boolean',
      description: '对话框当前是否打开。',
    },
    {
      name: 'element',
      type: 'ReactNode',
      description: '对话框元素：请在 JSX 树中渲染它。',
    },
  ],
};

export const docsDense = {
  name: 'useImperativeAlertDialog',
  description: '无需管理打开状态即可展示警告框的 Hook。调用 alert.show(options) 打开、alert.hide() 关闭；在 JSX 树中渲染 alert.element。',
  propDescriptions: {
    show: '按选项展示警告框；选项与 AlertDialog 的 prop 一致，不含 isOpen/onOpenChange',
    hide: '隐藏警告框',
    isOpen: '对话框当前是否打开',
    element: '对话框元素：在 JSX 树中渲染',
  },
};
