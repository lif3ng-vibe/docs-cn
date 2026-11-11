// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'SideNav',
  displayName: 'Side Nav',
  group: 'Navigation',
  category: 'Navigation',
  keywords: ['sidenav', 'sidebar', 'navigation', '侧边导航', '侧边栏', '导航', '抽屉', '菜单', 'aside', 'sidemenu', 'sider', 'treeview'],
  playground: {
    defaults: {
      children: [
        {__element: 'SideNavItem', props: {label: '仪表盘', isSelected: true}},
        {__element: 'SideNavItem', props: {label: '项目'}},
        {__element: 'SideNavItem', props: {label: '设置'}},
      ],
    },
  },
  theming: {
    targets: [
      {className: 'astryx-side-nav', visualProps: ['mode']},
      {className: 'astryx-side-nav-heading'},
      {className: 'astryx-side-nav-item', visualProps: ['size'], states: ['selected', 'disabled']},
      {className: 'astryx-side-nav-section'},
    ],
  },
  description: '包含五个区域的容器：header、topContent、children（可滚动）、footer 与 footerIcons。支持折叠与可调大小模式。',
  props: [
    {
      name: 'header',
      type: 'ReactNode',
      description: '页头区域（通常为 SideNavHeading）。吸顶。',
      slotElements: [
        {
          __element: 'Text',
          props: {
            type: 'body',
          },
          children: 'Header',
        },
      ],
    },
    {
      name: 'topContent',
      type: 'ReactNode',
      description: '页头下方的内容，例如新建按钮。',
      slotElements: [
        {
          __element: 'Text',
          props: {
            type: 'body',
          },
          children: 'Top content',
        },
      ],
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: '导航分区与条目。可滚动。',
      slotElements: [
        {
          __element: 'SideNavItem',
          props: {
            label: 'Nav Item',
          },
        },
      ],
    },
    {
      name: 'footer',
      type: 'ReactNode',
      description: '图标栏上方的页脚区域。',
      slotElements: [
        {
          __element: 'Text',
          props: {
            type: 'body',
          },
          children: 'Footer content',
        },
      ],
    },
    {
      name: 'footerIcons',
      type: 'ReactNode',
      description: "页脚图标栏。该行向其包含的可交互子元素级联 'sm' 尺寸，使其图标与内置折叠按钮高度一致；如需退出级联，请在子元素上显式传 size。",
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
      name: 'collapsible',
      type: 'boolean | { defaultIsCollapsed?: boolean; isCollapsed?: boolean; onCollapsedChange?: (isCollapsed: boolean) => void; hasButton?: boolean; buttonLabel?: string }',
      description: '启用折叠行为。true 为非受控并带默认切换按钮；对象用于受控模式与高级配置（defaultIsCollapsed、isCollapsed + onCollapsedChange、hasButton、buttonLabel）。受控配置也可传给渲染在本 SideNav 之外的 SideNavCollapseButton，让两者共享同一状态。',
      default: 'false',
    },
    {
      name: 'resizable',
      type: 'boolean | { defaultWidth?: number; minWidth?: number; maxWidth?: number; autoSaveId?: string; onWidthChange?: (width: number) => void; defaultIsCollapsed?: boolean; isCollapsed?: boolean; onCollapseChange?: (isCollapsed: boolean) => void } | ResizableRegion',
      description: '在行内末侧边缘启用调整手柄。true 用默认值（初始 260px、范围 180-480px）；或传 ResizableConfig 对象（defaultWidth、minWidth、maxWidth、autoSaveId 用于把宽度与折叠状态持久化到 localStorage、onWidthChange）。它也可持有折叠状态（defaultIsCollapsed、isCollapsed + onCollapseChange）；当两个 prop 都带折叠状态时，resizable 优先并给出指名冲突键的开发警告。它还接受 useResizable() 的输出，其轴向（\'horizontal\' | \'vertical\'）必须为 \'horizontal\'：此时该区域持有宽度与折叠状态，边栏跟随其 isCollapsed，切换按钮调用其 collapse 与 expand，其 autoSaveId 保存宽度。使用 Hook 输出时，区域自身的 collapsible 选项也决定边栏是否折叠；与之不一致的 collapsible prop 或其设置的折叠状态会被忽略并给出开发警告。折叠时手柄隐藏。',
      default: 'false',
    },
    {
      name: 'handleRef',
      type: 'Ref<SideNavImperativeCollapseHandle>',
      description: '已弃用。供渲染在本 SideNav 之外的 SideNavCollapseButton 实例使用的命令式折叠句柄；请改为向两者传入同一个受控 collapsible 配置。与 `ref` 无关，后者仍暴露根 HTMLElement。',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description: '用于布局自定义的 StyleX 样式（边距、定位、尺寸）。必须是 stylex.create() 的值：而非 style={{}} 之类的内联样式对象。',
    },
  ],
  components: [
    {name: 'SideNavHeading'},
    {name: 'SideNavItem'},
    {name: 'SideNavSection'},
    {name: 'SideNavCollapseButton'},
  ],
  usage: {
    description:
      '用于组织应用页面的侧边导航组件，支持分区、嵌套条目与图标。当应用有 5 个及以上目的地或需要层级分组时，用 SideNav 作为主导航。',
    bestPractices: [
      {guidance: true, description: '用分区组织相关导航条目，帮助用户快速找到目的地。'},
      {guidance: true, description: '搭配描边与填充图标变体，让选中状态在视觉上可辨。'},
      {guidance: true, description: '用 isSelected 标记当前页面：它会设置 aria-current="page"，当前目的地会被播报，而不只靠颜色传达。'},
      {guidance: true, description: 'SideNav 渲染导航地标，可折叠条目遵循 WAI-ARIA APG Disclosure 模式（https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/）：切换按钮携带 aria-expanded 与 aria-controls，其所属分组在折叠时不可交互。条目标签保持简短；纯图标条目靠它命名，除非有意义的 aria-label 提供了更多上下文。'},
      {guidance: true, description: '导航折叠时，带子级的条目会把子级显示在子菜单浮层中。在支持悬停的设备上，指向该条目稍作延迟即打开，移开即关闭；点击打开的浮层保持打开直至被关闭。触屏上轻点打开。不要把没有其他入口的操作放在那里。'},
      {guidance: false, description: 'TopNav 已提供应用标识时不要再加 SideNavHeading；会重复品牌信息。'},
      {guidance: false, description: '不要用于筛选内容；请改用标签页或筛选按钮。'},
    ],
    anatomy: [
      {name: 'Product icon and name', required: false, description: '导航顶部的品牌区域。'},
      {name: 'Navigation items', required: true, description: '可导航链接的分区与分组。'},
      {name: 'Collapse/expand toggle', required: false, description: '折叠或展开侧边导航的切换按钮。'},
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsZh = {
  usage: {
    description:
      'A sidebar navigation component for organizing application pages with sections, nested items, and icons. Use SideNav as the primary navigation when an app has 5 or more destinations or requires hierarchical grouping.',
    bestPractices: [
      {guidance: true, description: 'Use sections to group related navigation items and help users scan for their destination.'},
      {guidance: true, description: 'Pair outline and filled icon variants so the selected state is visually distinct.'},
      {guidance: true, description: 'Mark the current page with isSelected: it sets aria-current="page", so the current destination is announced rather than carried by color alone.'},
      {guidance: true, description: 'SideNav renders a navigation landmark, and a collapsible item follows the WAI-ARIA APG Disclosure pattern (https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/): the toggle carries aria-expanded and aria-controls, and the group it owns is inert while collapsed. Keep item labels short; they name icon-only items unless a meaningful aria-label supplies more context.'},
      {guidance: true, description: 'While the nav is collapsed, an item with children shows them in a submenu flyout. On a device that can hover, pointing at the item opens it after a short delay and moving away closes it; a flyout opened by clicking stays open until it is dismissed. On touch, it opens on tap. Do not put an action in there that has no other route to it.'},
      {guidance: false, description: 'Include a SideNavHeading when a TopNav is already providing app identity; this duplicates branding.'},
      {guidance: false, description: 'Use for filtering content; use tabs or filter buttons instead.'},
    ],
    anatomy: [
      {name: 'Product icon and name', required: false, description: 'Branding area at the top of the nav.'},
      {name: 'Navigation items', required: true, description: 'Sections and groups of navigable links.'},
      {name: 'Collapse/expand toggle', required: false, description: 'Toggle to collapse or expand the side nav.'},
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  usage: {
    description:
      '组织应用页面的侧边导航组件，支持分区、嵌套条目与图标。应用有 5 个及以上目的地或需要层级分组时作为主导航。',
    bestPractices: [
      {guidance: true, description: '用分区组织相关导航条目，帮助用户快速定位目的地。'},
      {guidance: true, description: '搭配描边与填充图标变体，让选中状态在视觉上可辨。'},
      {guidance: true, description: '用 isSelected 标记当前页面：设置 aria-current="page"，当前目的地会被播报，不只靠颜色。'},
      {guidance: true, description: 'SideNav 渲染导航地标，可折叠条目遵循 WAI-ARIA APG Disclosure 模式（https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/）：切换按钮带 aria-expanded 与 aria-controls，所属分组折叠时不可交互。条目标签保持简短。'},
      {guidance: true, description: '折叠时带子级的条目在子菜单浮层中显示子级；触屏轻点打开。不要把没有其他入口的操作放进去。'},
      {guidance: false, description: 'TopNav 已提供应用标识时不要再加 SideNavHeading；会重复品牌信息。'},
      {guidance: false, description: '不要用于筛选内容；请改用标签页或筛选按钮。'},
    ],
    anatomy: [
      {name: 'Product icon and name', required: false, description: '导航顶部的品牌区域。'},
      {name: 'Navigation items', required: true, description: '可导航链接的分区与分组。'},
      {name: 'Collapse/expand toggle', required: false, description: '折叠或展开侧边导航的切换按钮。'},
    ],
  },
};
