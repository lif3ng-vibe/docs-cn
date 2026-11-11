// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').HookDoc} */
export const docs = {
  name: 'useToast',
  displayName: 'useToast',
  group: 'Toast',
  keywords: ['toast', 'notification', 'snackbar', 'alert', 'message', '反馈', '闪现提示'],
  params: [
    // useToast takes no arguments; returns a show function
  ],
  returns: [
    {
      name: 'showToast',
      type: '(options: ToastOptions) => () => void',
      description: '显示一条 toast 通知。返回一个关闭函数。选项包括 body（ReactNode）、type（"info" | "error"）、isAutoHide、autoHideDuration、endContent、uniqueID 和 collisionBehavior。',
    },
  ],
  usage: {
    description: '在组件树任意位置显示 toast 通知的 Hook。返回一个接受 toast 选项并显示通知的函数。与 LayerProvider 自动协作，或自行挂载回退视口。',
    bestPractices: [
      {guidance: true, description: '用于不需要用户操作的瞬时成功/错误反馈。'},
      {guidance: true, description: '设置 uniqueID 对快速重复操作触发的 toast 去重。'},
      {guidance: false, description: '不要用于需要用户确认的严重错误；请改用 AlertDialog。'},
      {guidance: false, description: '不要在渲染 LayerProvider 的同一组件中调用 useToast；必须在 provider 内的子组件中调用。'},
    ],
  },
  relatedComponents: ['Toast', 'Banner', 'AlertDialog'],
  relatedHooks: [],
  importPath: '@astryxdesign/core/Toast',
  category: 'interaction',
};

/** @type {import('@astryxdesign/cli/authoring').HookTranslationDoc} */
export const docsDense = {
  description: '在组件树任意位置显示 toast 通知。返回接受 toast 选项并显示通知的函数。与 LayerProvider 自动协作 / 自行挂载回退视口。',
  returnDescriptions: {
    showToast: '显示 toast 通知。返回关闭函数。选项：body（ReactNode）、type（"info" | "error"）、isAutoHide、autoHideDuration、endContent、uniqueID、collisionBehavior。',
  },
  usage: {
    description: '在组件树任意位置显示 toast 通知。返回接受 toast 选项并显示通知的函数。与 LayerProvider 自动协作 / 自行挂载回退视口。',
    bestPractices: [
      {guidance: true, description: '用于不需要用户操作的瞬时成功/错误反馈。'},
      {guidance: true, description: '设置 uniqueID 对快速重复操作触发的 toast 去重。'},
      {guidance: false, description: '不要用于需要确认的严重错误；请改用 AlertDialog。'},
      {guidance: false, description: '不要在渲染 LayerProvider 的同一组件中调用 useToast；必须在 provider 内的子组件中调用。'},
    ],
  },
};
