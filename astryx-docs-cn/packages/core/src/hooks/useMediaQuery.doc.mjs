// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').HookDoc} */
export const docs = {
  name: 'useMediaQuery',
  displayName: 'useMediaQuery',
  keywords: ['responsive', '响应式', 'breakpoint', '断点', 'media', 'mobile', 'desktop', 'screen', 'matchmedia'],
  params: [
    {
      name: 'query',
      type: 'string',
      description: '要求值的 CSS 媒体查询字符串。',
      required: true,
    },
  ],
  returns: [
    {
      name: 'matches',
      type: 'boolean',
      description: '媒体查询当前是否匹配。首次渲染时始终为 false（SSR 安全）。',
    },
  ],
  usage: {
    description: 'SSR 安全的媒体查询 hook，订阅 window.matchMedia 变化。返回给定媒体查询是否匹配。为兼容 SSR，首次渲染始终返回 false。缺少 `window.matchMedia` 时，返回其服务端默认值且从不抛错。',
    bestPractices: [
      { guidance: true, description: '用于基于视口宽度、配色方案或动效偏好的响应式布局切换。' },
      { guidance: true, description: '可行时优先使用 Astryx 响应式令牌与组件 prop，而不是手写断点逻辑。' },
      { guidance: false, description: '不要用于首次绘制就必须匹配的服务端渲染内容；hook 初始始终返回 false。' },
    ],
  },
  relatedComponents: [],
  relatedHooks: ['useImageMode'],
  importPath: '@astryxdesign/core/hooks',
  category: 'media',
};

/** @type {import('@astryxdesign/cli/authoring').HookTranslationDoc} */
export const docsDense = {
  description: 'SSR 安全的媒体查询 hook，订阅 window.matchMedia 变化。返回给定媒体查询是否匹配。为兼容 SSR，首次渲染始终返回 false。',
  paramDescriptions: {
    query: '要求值的 CSS 媒体查询字符串。',
  },
  returnDescriptions: {
    matches: '媒体查询当前是否匹配。首次渲染始终为 false（SSR 安全）。',
  },
  usage: {
    description: 'SSR 安全的媒体查询 hook，订阅 window.matchMedia 变化。返回给定媒体查询是否匹配。为兼容 SSR，首次渲染始终返回 false。缺少 `window.matchMedia` 时返回服务端默认值且从不抛错。',
    bestPractices: [
      { guidance: true, description: '用于基于视口宽度、配色方案或动效偏好的响应式布局切换。' },
      { guidance: true, description: '可行时优先使用 Astryx 响应式令牌 + 组件 prop，而不是手写断点逻辑。' },
      { guidance: false, description: '不要用于首次绘制就必须匹配的服务端渲染内容；hook 初始始终返回 false。' },
    ],
  },
};
