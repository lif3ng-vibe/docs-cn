// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').HookDoc} */
export const docs = {
  name: 'useAppShellMobile',
  displayName: 'useAppShellMobile',
  group: 'AppShell',
  category: 'layout',
  keywords: [
    'appshell',
    '移动端导航',
    '移动端抽屉',
    '汉堡按钮',
    '导航切换',
    '响应式导航',
    '抽屉状态',
  ],
  params: [
    // useAppShellMobile takes no arguments; it reads AppShell context.
  ],
  returns: [
    {
      name: 'isMobile',
      type: 'boolean',
      description:
        '当前视口是否低于 AppShell 移动端导航断点。用于让 AppShell 附近的移动端 UI 与移动端导航共用同一断点。',
    },
    {
      name: 'isMobileNavOpen',
      type: 'boolean',
      description:
        '由 AppShell 管理的移动端导航抽屉是否打开。',
    },
    {
      name: 'mobileNavId',
      type: 'string | undefined',
      description:
        '移动端导航抽屉的 DOM id，由 AppShell 设置。将自定义切换器的 aria-controls 指向它，让屏幕阅读器用户知道切换器展开的是哪个元素。在未管理抽屉的 AppShell 之外为 undefined。',
    },
    {
      name: 'toggleMobileNav',
      type: '() => void',
      description:
        '切换由 AppShell 管理的移动端导航抽屉。移动端导航禁用时为空操作。',
    },
    {
      name: 'openMobileNav',
      type: '() => void',
      description:
        '打开由 AppShell 管理的移动端导航抽屉。移动端导航禁用时为空操作。',
    },
    {
      name: 'closeMobileNav',
      type: '() => void',
      description: '关闭由 AppShell 管理的移动端导航抽屉。',
    },
    {
      name: 'isMobileNavEnabled',
      type: 'boolean',
      description:
        'AppShell 移动端导航是否已启用并由 AppShell 管理。mobileNav 为 false、没有导航内容，或完全自定义的 mobileNav ReactNode 接管抽屉时为 false。',
    },
    {
      name: 'hasAutoToggle',
      type: 'boolean',
      description:
        'AppShell 的自动切换行为是否启用。mobileNav 的 hasToggle 设为 false 时为 false；渲染自定义切换器前请结合 isMobile 与 isMobileNavEnabled 判断。',
    },
  ],
  usage: {
    description:
      '用于在 AppShell 的后代组件中读取和控制 AppShell 移动端导航状态的 Hook。可用于自定义移动端导航触发器、路由变化后关闭抽屉，或让 AppShell 附近的移动端体验与移动端导航共用同一断点。',
    bestPractices: [
      {
        guidance: true,
        description:
          '构建自定义移动端导航控件、感知路由的导航项，或需要与 AppShell 移动端导航在同一断点更新的 UI 时，在 AppShell 树内使用。',
      },
      {
        guidance: true,
        description:
          '标准汉堡按钮触发器优先使用 MobileNavToggle：需要自定义位置、样式或额外行为时再用本 Hook。',
      },
      {
        guidance: true,
        description:
          '自定义移动端导航项切换路由后调用 closeMobileNav，让抽屉干净地收起。',
      },
      {
        guidance: false,
        description:
          'UI 不在 AppShell 内或无需与 AppShell 移动端导航对齐时，不要把它当通用响应式原语使用：应改用 useMediaQuery。',
      },
      {
        guidance: false,
        description:
          '不要假定它在 AppShell 之外会抛出异常。没有 provider 时，Hook 返回安全的默认值和空操作回调。',
      },
    ],
  },
  relatedComponents: [
    'AppShell',
    'MobileNav',
    'MobileNavToggle',
    'TopNav',
    'SideNav',
  ],
  relatedHooks: ['useMediaQuery'],
  importPath: '@astryxdesign/core/AppShell',
};

/** @type {import('@astryxdesign/cli/authoring').HookTranslationDoc} */
export const docsDense = {
  description:
    '读取/控制 AppShell 移动端导航上下文。用于自定义触发器、路由变化后关闭抽屉，或让 AppShell 附近的移动端 UI 与移动端导航同步到同一断点。',
  returnDescriptions: {
    isMobile:
      '视口是否低于 AppShell 移动端导航断点；用于同步 AppShell 附近的移动端 UI',
    isMobileNavOpen: 'AppShell 管理的移动端导航抽屉是否打开',
    mobileNavId:
      '抽屉的 DOM id；将自定义切换器的 aria-controls 指向它',
    toggleMobileNav: '切换抽屉；移动端导航禁用时为空操作',
    openMobileNav: '打开抽屉；移动端导航禁用时为空操作',
    closeMobileNav: '关闭抽屉',
    isMobileNavEnabled:
      'AppShell 是否接管移动端导航；mobileNav=false、无导航内容或自定义 ReactNode 接管抽屉时为 false',
    hasAutoToggle:
      '自动切换是否启用；mobileNav.hasToggle=false 时为 false；渲染自定义切换器前结合 isMobile + isMobileNavEnabled 判断',
  },
  usage: {
    description:
      '读取/控制 AppShell 移动端导航上下文。用于自定义触发器、路由变化后关闭抽屉，或让 AppShell 附近的移动端 UI 与移动端导航同步到同一断点。',
    bestPractices: [
      {
        guidance: true,
        description:
          '在 AppShell 树内使用：自定义导航控件、感知路由的导航项，或需在 AppShell 移动端导航断点更新的 UI。',
      },
      {
        guidance: true,
        description:
          '标准汉堡按钮优先用 MobileNavToggle；需要自定义位置、样式或额外行为时用本 Hook。',
      },
      {
        guidance: true,
        description:
          '自定义移动端导航项切换路由后调用 closeMobileNav，让抽屉收起。',
      },
      {
        guidance: false,
        description:
          '不在 AppShell 内或不对齐 AppShell 移动端导航时，不要当通用响应式原语用：改用 useMediaQuery。',
      },
      {
        guidance: false,
        description:
          '不要假定它在 AppShell 之外会抛错；无 provider 时 Hook 返回安全默认值与空操作回调。',
      },
    ],
  },
};
