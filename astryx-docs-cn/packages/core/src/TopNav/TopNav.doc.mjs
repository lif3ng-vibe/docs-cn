// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'TopNav',
  displayName: 'Top Nav',
  group: 'Navigation',
  category: 'Navigation',
  keywords: ["topnav","navbar","appbar","header","toolbar","navigation","menubar","topbar","顶部导航“,”导航栏"],
  playground: {
    defaults: {
      label: 'Navigation',
      heading: {__element: 'TopNavHeading', props: {heading: 'My App'}},
    },
  },
  theming: {
    targets: [
      {className: 'astryx-top-nav', states: ['mode']},
      {className: 'astryx-top-nav-item', states: ['mode', 'selected']},
      {className: 'astryx-top-nav-heading'},
      {className: 'astryx-top-nav-mega-menu', states: ['mode']},
      {className: 'astryx-top-nav-mega-menu-item', states: ['mode']},
      {className: 'astryx-top-nav-mega-menu-featured-card'},
      {className: 'astryx-top-nav-menu'},
    ],
  },
  description: '基于插槽布局的主导航栏容器。children 可作为 startContent 的别名。',
  props: [
    {
      name: 'heading',
      type: 'ReactNode',
      description: '标题插槽内容 (logo、品牌)：位于导航栏左缘。',
      slotElements: [
        {
          __element: 'Text',
          props: {
            type: 'body',
            weight: 'bold',
          },
          children: 'Heading',
        },
      ],
    },
    {
      name: 'startContent',
      type: 'ReactNode',
      description: '起始内容插槽，用于导航项或面包屑：位于标题之后，左对齐。',
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
      description: 'startContent 的别名。与 heading、centerContent 或 endContent 组合时优先用 startContent；children 则保证常见 React 导航项写法不会静默丢项。',
      slotElements: [
        {
          __element: 'TopNavItem',
          props: {
            label: 'Home',
            href: '#',
          },
        },
      ],
    },
    {
      name: 'centerContent',
      type: 'ReactNode',
      description: '居中内容插槽 (标签页、搜索栏、主导航)：提供时布局切换为三个区域，能放进一行时它保持在栏的中部；放不下时整栏换行。',
      slotElements: [
        {
          __element: 'Text',
          props: {
            type: 'body',
            weight: 'bold',
          },
          children: 'Center',
        },
      ],
    },
    {
      name: 'endContent',
      type: 'ReactNode',
      description: '末端内容插槽，用于搜索、图标或用户信息：位于右缘。',
      slotElements: [
        {
          __element: 'Icon',
          props: {
            icon: 'chevronDown',
            size: 'sm',
          },
        },
        {
          __element: 'Badge',
          props: {
            label: '3',
          },
        },
      ],
    },
    {
      name: 'label',
      type: 'string',
      description: '导航地标的无障碍标签，作为 aria-label 应用在 <nav> 元素上。',
      default: "'Top navigation'",
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description: '用于布局自定义的 StyleX 样式 (外边距、定位、尺寸)。必须是 stylex.create() 的值：不能是 style={{}} 这样的内联样式对象。',
    },
  ],
  components: [
    {name: 'TopNavHeading'},
    {name: 'TopNavItem'},
    {name: 'TopNavMenu'},
    {name: 'TopNavMegaMenu'},
    {name: 'TopNavMegaMenuItem'},
    {name: 'TopNavMegaMenuFeaturedCard'},
  ],
  usage: {
    description:
      'TopNav 是应用页眉中用于产品级导航的水平导航栏。适合 5 个及以内常显的导航项，或与搜索和控件搭配的极简导航。复杂的导航层级请用侧边栏；筛选内容请改用标签页或筛选按钮。',
    bestPractices: [
      {guidance: true, description: '在标题插槽中放入产品标志与名称，清晰标识当前应用。'},
      {guidance: true, description: '主导航项限制在 5 个及以内，便于快速扫读、降低认知负担。'},
      {guidance: false, description: '不要用 TopNav 筛选页面内容；请改用 Tabs 或筛选控件。'},
      {guidance: false, description: '避免深层嵌套的导航层级；菜单保持一层深度。'},
    ],
    anatomy: [
      {name: 'Product icon and name', required: true, description: '在导航栏中标识产品。'},
      {name: 'Navigation items', required: true, description: '通往产品级目的地的主链接。'},
      {name: 'More menu', required: false, description: '容纳更多导航项的溢出菜单。'},
      {name: 'Flex area', required: false, description: '用于搜索、主操作按钮或其他控件的弹性区域。'},
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsZh = {
  usage: {
    description:
      'TopNav is a horizontal navigation bar for product-level navigation in application headers. Use TopNav for 5 or fewer always-visible navigation items, or minimal navigation paired with search and controls. For complex navigation hierarchies, use a sidebar; to filter content, use tabs or filter buttons instead.',
    bestPractices: [
      {guidance: true, description: 'Include a product logo and name in the heading slot to clearly identify the application.'},
      {guidance: true, description: 'Limit primary navigation items to 5 or fewer for quick scanning and minimal cognitive load.'},
      {guidance: false, description: 'Avoid using TopNav to filter page content; use Tabs or filter controls instead.'},
      {guidance: false, description: 'Avoid deeply nested navigation hierarchies; keep menus to one level of depth.'},
    ],
    anatomy: [
      {name: 'Product icon and name', required: true, description: 'Identifies the product in the navigation bar.'},
      {name: 'Navigation items', required: true, description: 'Primary links for product-level destinations.'},
      {name: 'More menu', required: false, description: 'Overflow menu for additional navigation items.'},
      {name: 'Flex area', required: false, description: 'Flexible region for search, primary action buttons, or other controls.'},
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description: '应用页眉的顶部导航栏：插槽式布局 + 配套导航项组件。',
  usage: {
    description:
      '应用页眉中产品级导航的水平导航栏。适合 5 个及以内常显导航项，或与搜索和控件搭配的极简导航。复杂层级用侧边栏；筛选内容用标签页或筛选按钮。',
    bestPractices: [
      {guidance: true, description: '标题插槽放产品标志与名称，清晰标识应用。'},
      {guidance: true, description: '主导航项限 5 个及以内，快速扫读、低认知负担。'},
      {guidance: false, description: '不要用 TopNav 筛选页面内容；改用 Tabs 或筛选控件。'},
      {guidance: false, description: '避免深层嵌套层级；菜单保持一层深度。'},
    ],
    anatomy: [
      {name: 'Product icon and name', required: true, description: '在导航栏中标识产品。'},
      {name: 'Navigation items', required: true, description: '通往产品级目的地的主链接。'},
      {name: 'More menu', required: false, description: '容纳更多导航项的溢出菜单。'},
      {name: 'Flex area', required: false, description: '用于搜索、主操作按钮或其他控件的弹性区域。'},
    ],
  },
};
