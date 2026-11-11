// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').HookDoc} */
export const docs = {
  name: 'useScrollLock',
  displayName: 'useScrollLock',
  keywords: [
    'scroll',
    '滚动',
    'lock',
    '锁定',
    'modal',
    'dialog',
    'page',
    'prevent',
    'background',
    'ios',
    'safari',
    'touch',
    'scrollbar',
    'gutter',
    '边距',
    'layout shift',
    '布局偏移',
    'reflow',
  ],
  params: [
    {
      name: 'isLocked',
      type: 'boolean',
      description: '是否应锁定页面滚动。',
      required: true,
    },
  ],
  returns: [],
  usage: {
    description:
      '生效期间锁定页面滚动并让页面保持原位。页面获得 overflow: hidden（设在根元素上，或当 body 自身的 overflow 是视口所用的那个时设在 body 上），从而阻止滚轮、键盘与滚动条滚动；根元素与 body 上还会设置 overscroll-behavior-y: none，在锁定期间阻止过度滚动回弹。在主指针为 coarse 的设备（手机与平板）上，会取消原本会滚动页面的单指平移，因为 iOS Safari 会让 overflow: hidden 的页面在手指下滚动；浮层内滚动容器能接管的平移、原生 range input 上的拖动、双指捏合缩放，以及捏合放大后页面上的单指拖动（平移放大视图）仍然有效。滚动偏移从不改变，因此锁定开始或结束时什么都不会跳动，iOS Safari 的工具栏也保持原样。在隐藏滚动条占用布局空间的环境（桌面），hook 用 scrollbar-gutter: stable 保持其边距（gutter）敞开，使页面——包括任何 position: fixed 的界面部件——不会横向移位。',
    bestPractices: [
      {
        guidance: true,
        description:
          '打开全屏模态框或对话框时使用，防止背景内容滚动。',
      },
      {
        guidance: true,
        description:
          '把控制对话框可见性的同一个布尔值（如 isOpen）作为 isLocked 参数传入。',
      },
      {
        guidance: false,
        description:
          '不要用于 popover、tooltip 等非模态浮层；用户应能滚动离开它们。',
      },
    ],
  },
  relatedComponents: ['Dialog'],
  relatedHooks: ['useFocusTrap'],
  importPath: '@astryxdesign/core/hooks',
  category: 'layout',
};

/** @type {import('@astryxdesign/cli/authoring').HookTranslationDoc} */
export const docsDense = {
  description:
    "生效期间锁定页面滚动且页面保持原位：overflow: hidden 设在根元素上（或 body 自身 overflow 传播时设在 body 上），阻止滚轮、键盘与滚动条滚动 + 根元素与 body 上设 overscroll-behavior-y: none（锁定期间无过度滚动回弹）+ 取消会滚动页面的单指平移（iOS Safari 会让 overflow: hidden 页面在手指下滚动）；浮层内滚动容器、range input、捏合缩放与放大页面上的拖动仍然有效。偏移从不改变：不跳动，iOS 工具栏不变。用 scrollbar-gutter: stable 保持隐藏滚动条的边距敞开，使页面（含 position: fixed 部件）不横向移位。",
  paramDescriptions: {
    isLocked: '是否应锁定页面滚动。',
  },
  usage: {
    description:
      "生效期间锁定页面滚动且页面保持原位：overflow: hidden 设在根元素上（或 body 自身 overflow 传播时设在 body 上），阻止滚轮、键盘与滚动条滚动 + 根元素与 body 上设 overscroll-behavior-y: none（锁定期间无过度滚动回弹）+ 取消会滚动页面的单指平移（iOS Safari 会让 overflow: hidden 页面在手指下滚动）；浮层内滚动容器、range input、捏合缩放与放大页面上的拖动仍然有效。偏移从不改变：不跳动，iOS 工具栏不变。用 scrollbar-gutter: stable 保持隐藏滚动条的边距敞开，使页面（含 position: fixed 部件）不横向移位。",
    bestPractices: [
      {
        guidance: true,
        description:
          '打开全屏模态框/对话框时使用，防止背景内容滚动。',
      },
      {
        guidance: true,
        description:
          '把控制对话框可见性的同一个布尔值（如 isOpen）作为 isLocked 参数传入。',
      },
      {
        guidance: false,
        description:
          '不要用于 popover/tooltip 等非模态浮层；用户应能滚动离开它们。',
      },
    ],
  },
};
