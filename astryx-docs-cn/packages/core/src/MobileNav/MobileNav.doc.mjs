// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentAnatomyElement[]} */
const anatomy = [
  {
    name: 'Navigation overlay',
    required: true,
    description:
      '承载移动端导航抽屉的全视口对话框覆盖层。',
  },
  {
    name: 'Drawer',
    required: true,
    description:
      '从解析出的视口边缘滑入的着色面板。',
  },
  {
    name: 'Header',
    required: true,
    description:
      '固定的行，包含可选头部内容与关闭按钮。',
  },
  {
    name: 'Content',
    required: true,
    description: '包含导航内容的可滚动区域。',
  },
  {
    name: 'Close button',
    required: true,
    description: '关闭导航抽屉的按钮。',
  },
  {
    name: 'Toggle button',
    required: false,
    description:
      '感知 AppShell 的按钮，在移动端视口打开或关闭抽屉。',
  },
];

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'MobileNav',
  displayName: 'Mobile Nav',
  group: 'Navigation',
  category: 'Navigation',
  isHiddenFromOverview: true,
  keywords: [
    'mobilenav',
    'drawer',
    'sidebar',
    'navigation',
    'hamburger',
    'menu',
    'offcanvas',
    'slideout',
    'navdrawer',
    'toggle',
    '移动端导航',
    '抽屉',
    '汉堡菜单',
  ],
  components: [
    {
      name: 'MobileNav',
      displayName: 'Mobile Nav',
      description:
        '移动端导航的滑出式抽屉。接受 SideNav 子元素。',
      // The drawer opens via showModal() and renders nothing while closed —
      // overlay mode gives the Properties preview an open trigger instead of
      // an empty stage (#2706). Declared on this entry (not the directory
      // doc) so MobileNavToggle does not inherit it.
      playground: {
        overlay: true,
        defaults: {
          isOpen: false,
          header: '导航',
          children: {
            __element: 'SideNavSection',
            props: {title: '主菜单'},
            children: [
              {
                __element: 'SideNavItem',
                props: {label: '仪表板', isSelected: true},
              },
              {__element: 'SideNavItem', props: {label: '项目'}},
              {__element: 'SideNavItem', props: {label: '设置'}},
            ],
          },
        },
      },
      props: [
        {
          name: 'isOpen',
          type: 'boolean',
          description:
            '抽屉是否打开。在 AppShell 内，由上下文自动管理；在 AppShell 外，请提供此 prop 自行控制抽屉。',
        },
        {
          name: 'onOpenChange',
          type: '(isOpen: boolean) => void',
          description:
            '抽屉可见性变化时调用（点击背景遮罩、按 Escape 键或点击关闭按钮）。在 AppShell 内，由上下文自动管理。在手机或平板上（主指针为粗指针时），抽屉滑入期间不接受点按或拖动；键盘和辅助技术仍可操作。关闭后，焦点会在其对话框关闭时回到打开它的元素。',
        },
        {
          name: 'children',
          type: 'ReactNode',
          description:
            '抽屉内容：通常是 SideNavSection/SideNavItem，或任意 ReactNode。',
          required: true,
        },
        {
          name: 'header',
          type: 'ReactNode',
          description:
            '抽屉的头部内容，渲染在关闭按钮旁。传字符串作为简单文本标题，或传 ReactNode 作为自定义内容（logo、搜索栏等）。',
        },
        {
          name: 'width',
          type: 'number',
          description:
            '抽屉宽度（像素）。上限 85vw，防止在小屏幕上溢出。',
          default: '320',
        },
        {
          name: 'side',
          type: "'start' | 'end' | 'auto'",
          description:
            '抽屉滑出的方向。start 在 LTR 下为左、RTL 下为右。auto 根据触发器位置选择一侧。',
          default: "'auto'",
        },
      ],
    },
    {
      name: 'MobileNavToggle',
      displayName: 'Mobile Nav Toggle',
      description:
        '打开/关闭移动端导航抽屉的汉堡按钮。自动从 AppShell 上下文读取打开状态：不接受 isOpen 或 onOpenChange prop。在移动端断点之上不渲染任何内容。宿主属性与 DOM 处理器（id、data-*、aria-*）会落到按钮上；其 aria-expanded 与 aria-controls 仍由组件管理，调用方的 onClick 在切换之后执行。',
      // The toggle renders null unless AppShell mobile context reports an
      // enabled mobile viewport — the default context outside AppShell never
      // does, so the Properties preview was an empty stage. appShellMobile
      // has the preview simulate that context instead (#4983).
      playground: {
        appShellMobile: true,
      },
      props: [
        {
          name: 'children',
          type: 'ReactNode',
          description:
            '替代默认汉堡图标渲染的自定义内容。',
        },
        {
          name: 'label',
          type: 'string',
          description: '切换按钮的无障碍标签。',
          default: "'Open navigation'",
        },
      ],
    },
  ],
  theming: {
    targets: [{className: 'astryx-mobile-nav', visualProps: ['side']}],
  },
  usage: {
    anatomy,
    description:
      '移动端导航的滑出式抽屉。MobileNav 是 SideNav 的移动端对应物，接受相同的子元素。在窄视口、常驻侧边栏不现实时使用。在 AppShell 内，用 MobileNavToggle 作为触发器；它会自动从上下文读取状态。',
    bestPractices: [
      {
        guidance: true,
        description:
          '把导航项提取为一个变量，在 MobileNav 与 SideNav 之间共享。',
      },
      {
        guidance: true,
        description:
          '当抽屉用途无法从内容中明显看出时，提供 header。',
      },
      {
        guidance: true,
        description:
          '在 AppShell 内用 MobileNavToggle 打开抽屉；它从上下文读取状态。不要向该切换按钮传 isOpen/onOpenChange。',
      },
      {
        guidance: false,
        description:
          '不要在桌面端使用 MobileNav；请改用常驻的 SideNav。',
      },
    ],
  },
};
/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docsZh = {
  name: 'MobileNav',
  displayName: 'Mobile Nav',
  props: [
    {
      name: 'isOpen',
      type: 'boolean',
      description: '抽屉是否打开。',
      required: true,
    },
    {
      name: 'onOpenChange',
      type: '(isOpen: boolean) => void',
      description:
        '当抽屉可见性变化时调用（点击背景遮罩、按 Escape 键或点击关闭按钮）。在手机或平板上（主指针为粗指针时），抽屉滑入期间不接受点按或拖动；键盘和辅助技术仍可操作。关闭后，焦点会在对话框关闭时回到打开它的元素。',
      required: true,
    },
    {
      name: 'children',
      type: 'ReactNode',
      description:
        '抽屉内容，通常是 SideNavSection/SideNavItem 或任何 ReactNode。',
      required: true,
    },
    {
      name: 'header',
      type: 'ReactNode',
      description:
        '抽屉的头部内容。渲染在关闭按钮旁边。传入字符串作为简单文本标题，或传入 ReactNode 作为自定义内容。',
    },
    {
      name: 'width',
      type: 'number',
      description: '抽屉宽度（像素）。上限为 85vw 以防止在小屏幕上溢出。',
      default: '320',
    },
    {
      name: 'side',
      type: "'start' | 'end' | 'auto'",
      description:
        '抽屉滑出的方向。在 LTR 布局中 start 为左侧，在 RTL 布局中为右侧。auto 根据触发元素的位置自动选择方向。',
      default: "'auto'",
    },
  ],
  theming: {
    targets: [{className: 'astryx-mobile-nav', visualProps: ['side']}],
  },
  usage: {
    anatomy,
    description:
      'A slide-out drawer for mobile navigation. MobileNav is the mobile counterpart to SideNav and accepts the same children. Use it on narrow viewports where a persistent sidebar is not practical.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Share the same nav items between MobileNav and SideNav by extracting them into a variable.',
      },
      {
        guidance: true,
        description:
          "Provide a header when the drawer's purpose is not obvious from its content.",
      },
      {
        guidance: true,
        description:
          'Inside AppShell, use MobileNavToggle to open the drawer; it reads state from context. Do not pass isOpen/onOpenChange to the toggle.',
      },
      {
        guidance: false,
        description:
          'Use MobileNav on desktop: use a persistent SideNav instead.',
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description:
    '移动端导航的滑出式抽屉覆盖层。SideNav 的移动端对应物；接受相同的子元素（SideNavSection、SideNavItem 或任意 ReactNode）。',
  usage: {
    anatomy,
    description:
      '移动端导航的滑出式抽屉。MobileNav 是 SideNav 的移动端对应物，接受相同的子元素。在窄视口、常驻侧边栏不现实时使用。',
    bestPractices: [
      {
        guidance: true,
        description:
          '把导航项提取为变量，在 MobileNav 与 SideNav 之间共享。',
      },
      {
        guidance: true,
        description:
          '当抽屉用途无法从内容中明显看出时，提供 header。',
      },
      {
        guidance: true,
        description:
          '在 AppShell 内用 MobileNavToggle 打开抽屉；它从上下文读取状态。不要向该切换按钮传 isOpen/onOpenChange。',
      },
      {
        guidance: false,
        description:
          '不要在桌面端使用 MobileNav；请改用常驻的 SideNav。',
      },
    ],
  },
  components: [
    {
      name: 'MobileNav',
      description:
        '移动端导航的滑出式抽屉。接受 SideNav 子元素。',
    },
    {
      name: 'MobileNavToggle',
      description:
        '打开/关闭移动端导航抽屉的汉堡按钮。自动从 AppShell 上下文读取打开状态。在移动端断点之上不渲染任何内容。宿主属性与处理器会落到按钮上；aria-expanded/aria-controls 仍由组件管理。',
    },
  ],
  propDescriptions: {
    isOpen: '抽屉是否打开',
    onOpenChange:
      '抽屉可见性变化时调用（点击背景遮罩、Escape、关闭按钮）；主指针为粗指针时抽屉滑入期间不接受点按或拖动（键盘仍可操作）',
    children:
      '抽屉内容；通常是 SideNavSection/SideNavItem 或任意 ReactNode',
    header:
      '头部内容（字符串或 ReactNode），渲染在关闭按钮旁',
    width:
      '抽屉宽度（像素）；上限 85vw，防止在小屏幕上溢出',
    side: '滑出方向；start 在 LTR 下为左、RTL 下为右',
  },
};
