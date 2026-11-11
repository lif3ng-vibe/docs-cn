// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'AppShell',
  displayName: 'App Shell',
  group: 'AppShell',
  category: 'Layout',
  keywords: [
    'appshell',
    '布局',
    '脚手架',
    '侧边栏',
    'sidenav',
    'topnav',
    '顶栏',
    '导航',
    '仪表盘',
    '外壳',
    '页面',
    '框架',
  ],
  usage: {
    description:
      'AppShell 是应用级页面外壳，为顶部导航、侧边导航、横幅与主内容提供插槽。请将它作为每个页面的根包裹组件。它会自动处理响应式移动端导航与跳转正文（skip-to-content）。侧边导航的折叠行为通过 SideNav 的 collapsible prop 配置。',
    bestPractices: [
      {
        guidance: true,
        description:
          '选择合适的高度：内部滚动的仪表盘用 "fill"，随内容增长的页面用 "auto"。',
      },
      {
        guidance: true,
        description:
          '根据内容类型设置 `contentPadding`：表单和设置页用 4，表格和仪表盘用 0。',
      },
      {
        guidance: true,
        description:
          '给每个导航插槽一个无障碍名称。AppShell 将 TopNav 与 SideNav 渲染为独立的导航地标（landmark），屏幕阅读器会按名称列出它们，因此请为每个插槽传入 `label`。',
      },
      {
        guidance: true,
        description:
          '页面标题从 `children` 内开始。AppShell 负责跳转链接、横幅地标与主内容地标，但不渲染任何标题，因此内容区的第一个标题就是页面 h1。',
      },
      {
        guidance: true,
        description:
          '在手机上，通过 viewport meta 标签中的 `viewport-fit=cover`（`width=device-width, initial-scale=1, viewport-fit=cover`）让页面铺满全屏。此后 AppShell 会将页眉延伸到状态栏之下并贴到屏幕两侧，同时让页眉条目与内容末尾保持在设备安全区内。已安装的 Web 应用还可用 `<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">` 绘制到状态栏下方。横屏时只有页眉内缩：内联的 SideNav 与内容两侧仍会延伸到刘海之下，因此请保留内容内边距。没有页眉区域或手机顶栏的外壳不会有顶部内缩，请自行保留顶部内边距。',
      },
      {
        guidance: false,
        description:
          '不要把一个 AppShell 嵌套进另一个；它是最外层的布局框架。',
      },
      {
        guidance: false,
        description:
          '不要用于子页面布局；AppShell 内部的内容区域请使用 Layout。',
      },
      {
        guidance: false,
        description:
          '不要自行添加跳转链接或 <main> 元素。AppShell 已渲染两者，第二个 main 地标会让第一个变得含糊。',
      },
    ],
    anatomy: [
      {
        name: 'Page shell',
        required: true,
        description:
          '最外层的应用框架，负责页面级导航、外壳的响应式行为与主内容地标。',
      },
      {
        name: 'Skip link',
        required: true,
        description:
          '页面上第一个可聚焦元素。聚焦前视觉隐藏，聚焦后把焦点移到主内容区域。',
      },
      {
        name: 'Banner',
        required: false,
        description:
          'banner 插槽，用于全局公告。渲染在顶部导航上方，位于横幅地标内。',
      },
      {
        name: 'Top navigation',
        required: false,
        description:
          'topNav 插槽，通常为 TopNav。低于移动端断点时变成携带导航切换器的紧凑栏。',
      },
      {
        name: 'Side navigation',
        required: false,
        description:
          'sideNav 插槽，通常为 SideNav。高于断点时内联显示，低于断点时移入移动端抽屉。',
      },
      {
        name: 'Main content',
        required: true,
        description:
          'children，渲染在 main 地标中。height 为 fill 时内部滚动，为 auto 时随页面滚动。当它滚动溢出内容时，它是 Tab 序列中的一站；若其第一个可聚焦元素是普通链接或按钮，Tab 进入会直接跳过去，否则 main 位于它前面一站。',
      },
      {
        name: 'Mobile nav drawer',
        required: false,
        description:
          '低于断点时由导航插槽生成，除非 mobileNav 禁用或替换它。它是模态对话框：会困住焦点，关闭时把焦点交还切换器。',
      },
    ],
  },
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: '主内容区域，渲染在 <main> 元素内部。',
    },
    {
      name: 'contentPadding',
      type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
      description:
        '主内容区域的内边距。根据页面主要内容模式设置：4（16px）适用于表单/设置/文本页面，0 适用于仪表盘/地图/表格。可通过 Section 覆盖个别区域。',
      default: '0',
    },
    {
      name: 'topNav',
      type: 'ReactNode',
      description: '顶部导航插槽，通常为 TopNav。',
      slotElements: [{__element: 'TopNav', props: {label: '导航'}}],
    },
    {
      name: 'sideNav',
      type: 'ReactNode',
      description: '侧边导航插槽，通常为 SideNav。',
      slotElements: [{__element: 'SideNav', props: {}}],
    },
    {
      name: 'mobileNav',
      // Kept as the bare `ReactNode`, not widened to the true
      // `false | MobileNavConfig | ReactNode`: the docsite playground hides a
      // prop by exact-matching the type string against UNSUPPORTED_PROP_TYPES,
      // and widening drops that match. This prop's slotElements happen to hide
      // it a second way today, but the hide should not rest on that
      // coincidence. The legal values live in the description instead (#1645).
      type: 'ReactNode',
      description:
        "移动端导航配置。接受 false（禁用）、配置对象（调整自动行为）或 ReactNode（完全自定义抽屉）。配置对象为 {hasToggle?: boolean, isOpen?: boolean, onOpenChange?: (isOpen: boolean) => void, content?: ReactNode, breakpoint?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'none', defaultIsMobile?: boolean}；breakpoint 默认为 'md'，从最近 Theme 的 widthBreakpoints 解析，并在达到断点时切换到更宽的布局；'none' 始终视为非移动端并忽略 defaultIsMobile。",
      slotElements: [{__element: 'MobileNav', props: {}}],
    },
    {
      name: 'banner',
      type: 'ReactNode',
      description:
        '横幅插槽，用于全局公告，放置在 topNav 上方。',
      slotElements: [
        {
          __element: 'Banner',
          props: {title: '信息', status: 'info', container: 'section'},
        },
      ],
    },
    {
      name: 'height',
      type: "'fill' | 'auto'",
      description:
        "高度行为：'fill' 使外壳填满视口（100dvh），各区域拥有独立的滚动容器；'auto' 使外壳随内容增长，导航使用 sticky 定位。",
      default: "'fill'",
    },
    {
      name: 'variant',
      type: "'wash' | 'surface' | 'section' | 'elevated'",
      description:
        "导航背景样式，控制导航区域与内容的对比方式。'wash' 使用 wash 背景，'surface' 使用 surface 背景，'section' 在导航和内容之间添加分隔线，'elevated' 使用 wash 导航配合凸起的 surface 内容区域和圆角。",
      default: "'elevated'",
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于布局自定义的 StyleX 样式（外边距、定位、尺寸）。必须是 stylex.create() 的值，不能是 style={{}} 形式的内联样式对象。',
    },
  ],
  playground: {
    defaults: {
      variant: 'surface',
      contentPadding: 4,
      topNav: {
        __element: 'TopNav',
        props: {
          label: '导航',
          heading: {__element: 'TopNavHeading', props: {heading: '我的应用'}},
        },
      },
      sideNav: {
        __element: 'SideNav',
        props: {},
        children: [
          {
            __element: 'SideNavItem',
            props: {label: '仪表盘', isSelected: true},
          },
          {__element: 'SideNavItem', props: {label: '设置'}},
          {__element: 'SideNavItem', props: {label: '帮助'}},
        ],
      },
      children: {
        __element: 'VStack',
        props: {gap: 3},
        children: [
          {__element: 'Heading', props: {level: 2}, children: '仪表盘'},
          {
            __element: 'Text',
            props: {type: 'body', color: 'secondary'},
            children: '欢迎回来。这是你的工作区概览。',
          },
        ],
      },
    },
  },
  theming: {
    targets: [
      {className: 'astryx-app-shell', visualProps: ['variant']},
      {className: 'astryx-app-shell-header', visualProps: ['variant']},
      {className: 'astryx-app-shell-sidenav', visualProps: ['variant']},
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docsZh = {
  name: 'AppShell',
  displayName: 'App Shell',
  usage: {
    description:
      'AppShell 是应用级页面外壳，为顶部导航、侧边导航、横幅与主内容提供插槽。请将它作为每个页面的根包裹组件。它会自动处理响应式移动端导航与跳转正文（skip-to-content）。侧边导航的折叠行为通过 SideNav 的 collapsible prop 配置。',
    bestPractices: [
      {
        guidance: true,
        description:
          '选择合适的高度：内部滚动的仪表盘用 "fill"，随内容增长的页面用 "auto"。',
      },
      {
        guidance: true,
        description:
          '根据内容类型设置 `contentPadding`：表单和设置页用 4，表格和仪表盘用 0。',
      },
      {
        guidance: false,
        description:
          '不要把一个 AppShell 嵌套进另一个；它是最外层的布局框架。',
      },
      {
        guidance: false,
        description:
          '不要用于子页面布局；AppShell 内部的内容区域请使用 Layout。',
      },
    ],
  },
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: '主内容区域，渲染在 <main> 元素内部。',
    },
    {
      name: 'contentPadding',
      type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
      description:
        '主内容区域的内边距。根据页面主要内容模式设置：4（16px）适用于表单/设置/文本页面，0 适用于仪表盘/地图/表格。可通过 Section 覆盖个别区域。',
      default: '0',
    },
    {
      name: 'topNav',
      type: 'ReactNode',
      description: '顶部导航插槽，通常为 TopNav。',
    },
    {
      name: 'sideNav',
      type: 'ReactNode',
      description: '侧边导航插槽，通常为 SideNav。',
    },
    {
      name: 'mobileNav',
      type: 'ReactNode',
      description:
        "移动端导航配置。接受 false（禁用）、配置对象（调整自动行为）或 ReactNode（完全自定义抽屉）。配置对象为 {hasToggle?, isOpen?, onOpenChange?, content?, breakpoint?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'none', defaultIsMobile?}；breakpoint 默认为 'md'，从最近 Theme 的 widthBreakpoints 解析，并在等于断点时切换到较宽布局；'none' 始终使用非移动端布局并忽略 defaultIsMobile。",
    },
    {
      name: 'banner',
      type: 'ReactNode',
      description: '横幅插槽，用于全局公告，放置在 topNav 上方。',
    },
    {
      name: 'height',
      type: "'fill' | 'auto'",
      description:
        "高度行为：'fill' 使外壳填满视口（100dvh），各区域拥有独立的滚动容器；'auto' 使外壳随内容增长，导航使用 sticky 定位。",
      default: "'fill'",
    },
    {
      name: 'variant',
      type: "'wash' | 'surface' | 'section' | 'elevated'",
      description:
        "导航背景样式，控制导航区域与内容之间的对比。'wash' 使用 wash 背景，'surface' 使用 surface 背景，'section' 在导航和内容之间添加分隔线，'elevated' 使用 wash 导航配合凸起的 surface 内容区域和圆角。",
      default: "'elevated'",
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于布局自定义的 StyleX 样式（外边距、定位、尺寸）。必须是 stylex.create() 的值，不能是 style={{}} 形式的内联样式对象。',
    },
  ],
  theming: {
    targets: [
      {
        className: 'astryx-app-shell',
        visualProps: ['variant'],
      },
      {className: 'astryx-app-shell-header', visualProps: ['variant']},
      {className: 'astryx-app-shell-sidenav', visualProps: ['variant']},
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description:
    '应用级布局外壳，含页眉、侧边导航与主内容；内部组合 Layout，取代 Page+PageLayout',
  usage: {
    description:
      'AppShell 是应用级页面外壳，为顶部导航、侧边导航、横幅与主内容提供插槽。请将它作为每个页面的根包裹组件。它会自动处理响应式移动端导航与跳转正文（skip-to-content）。侧边导航的折叠行为通过 SideNav 的 collapsible prop 配置。',
    bestPractices: [
      {
        guidance: true,
        description:
          '选择合适的高度：内部滚动的仪表盘用 "fill"，随内容增长的页面用 "auto"。',
      },
      {
        guidance: true,
        description:
          '根据内容类型设置 `contentPadding`：表单和设置页用 4，表格和仪表盘用 0。',
      },
      {
        guidance: true,
        description:
          '给每个导航插槽无障碍名称：TopNav 与 SideNav 是独立的导航地标，请分别为其传入 `label`。',
      },
      {
        guidance: true,
        description:
          '手机：在 viewport meta 中加 `viewport-fit=cover`；页眉随即延伸到状态栏下方，同时其条目与内容末尾保持在安全区内。横屏：仅页眉内缩（内联 SideNav 与内容两侧不内缩）。无页眉区域或手机顶栏：无顶部内缩，请自行保留顶部内边距。已安装 Web 应用：`apple-mobile-web-app-status-bar-style` 设为 `black-translucent`。',
      },
      {
        guidance: true,
        description:
          '页面标题从 `children` 内开始：AppShell 负责跳转链接、横幅与 main 地标但不渲染标题，因此内容区第一个标题就是页面 h1。',
      },
      {
        guidance: false,
        description:
          '不要把一个 AppShell 嵌套进另一个；它是最外层的布局框架。',
      },
      {
        guidance: false,
        description:
          '不要用于子页面布局；AppShell 内部的内容区域请使用 Layout。',
      },
      {
        guidance: false,
        description:
          '不要自行添加跳转链接或 <main>；AppShell 已渲染两者，第二个 main 地标会让第一个变得含糊。',
      },
    ],
  },
  propDescriptions: {
    children: '主内容区域，渲染在 <main> 内',
    topNav: '顶部导航插槽，通常为 TopNav',
    sideNav: '侧边导航插槽，通常为 SideNav',
    mobileNav:
      '移动端导航配置：false | ReactNode | 配置对象，breakpoint 经主题解析（sm|md|lg|xl|2xl|none，不含上边界）；none 始终视为非移动端并忽略 defaultIsMobile',
    banner: '全局公告插槽，位于 topNav 上方',
    height:
      'fill=视口 100dvh 且各区域独立滚动；auto=随内容增长且导航 sticky',
    variant:
      '导航背景样式：wash=wash 背景，surface=surface 背景，section=分隔线，elevated=wash 导航配凸起 surface 内容 + 圆角',
    contentPadding:
      '主内容区域内边距。4（16px）适用于表单/设置/文本，0 适用于仪表盘/地图/表格。可按区域用 Section 覆盖。',
    xstyle: '通过 stylex.create() 自定义 StyleX 布局',
  },
};
