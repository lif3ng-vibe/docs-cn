// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'Breadcrumbs',
  displayName: 'Breadcrumbs',
  group: 'Breadcrumbs',
  category: 'Navigation',
  keywords: ["breadcrumbs","面包屑","导航","nav","面包屑项","链接路径","路径","层级","寻路","步骤"],
  usage: {
    description:
      'Breadcrumbs 显示从根到当前页面的链接路径。用于详情页、设置面板顶部，或任何用户需要了解当前位置并向上返回的地方。',
    bestPractices: [
      {guidance: true, description: '把面包屑放在页面标题上方，让用户在阅读内容前先看到位置。'},
      {guidance: true, description: '标签要短，并与其链接的页面标题一致："Settings"，而不是 "Application Settings Page"。'},
      {guidance: true, description: '在管理面板、侧边栏等面包屑需要低调的密集 UI 中使用 supporting 变体。'},
      {guidance: true, description: '最后一项用纯文本而非链接；它代表当前页面。设置 isCurrent 后组件会自动完成。'},
      {guidance: true, description: '组件实现了 WAI-ARIA APG Breadcrumb 模式：带标签的 nav 地标包裹有序列表，当前项带 aria-current="page"。带菜单的面包屑项还实现了 APG Menu Button 模式，Enter、Space 或 ArrowDown 打开，Escape 关闭。'},
      {guidance: true, description: '页面渲染多个路径时为每条路径单独设置 label，让各 nav 地标在屏幕阅读器的地标列表中可区分。'},
      {guidance: false, description: '不要把面包屑当作主要导航；它们补充侧边栏或顶部导航，而非取代。'},
      {guidance: false, description: '不要在没有上级的顶层页面显示面包屑；只会增加杂乱，帮不了用户。'},
      {guidance: false, description: '不要让路径超过 5 层。需要更多层级时，考虑简化页面层级。'},
      {guidance: true, description: '内置斜杠分隔符在 RTL 中自动镜像。自定义分隔符时，› 这类 Unicode 镜像角引号保持原样；箭头与 Icon 分隔符用 rtlStyles.mirror 镜像一次。'},
      {guidance: false, description: '不要镜像 bidi 算法已经镜像的分隔符。› 这类角引号字符是 Bidi_Mirrored，RTL 下会自行翻转，再用 rtlStyles.mirror 会翻回来。→ 这类箭头字符与 Icon 分隔符不是，因此才需要经 xstyle 用 rtlStyles.mirror。'},
    ],
    anatomy: [
      {name: 'Trail', required: true, description: '从根到当前页面的有序链接列表。'},
      {name: 'Item', required: true, description: '路径中的单一步骤。渲染为链接，当前页则渲染为纯文本。'},
      {name: 'Separator', required: true, description: '项目之间的字符。默认为 "/"，可自定义。'},
      {name: 'Icon', required: false, description: '项目标签前的可选图标，如第一项上的主页图标。'},
    ],
  },
  theming: {
    targets: [
      {className: 'astryx-breadcrumb-item', visualProps: ['variant']},
      {
        className: 'astryx-breadcrumb-item-menu-trigger',
        visualProps: ['variant'],
      },
      {className: 'astryx-breadcrumb-menu'},
      {className: 'astryx-breadcrumbs', visualProps: ['variant']},
    ],
  },
  description: '导航容器，渲染 <nav> 并包含有序的面包屑项列表。',
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: '渲染在面包屑路径内的 BreadcrumbItem 元素。',
      slotElements: [
        {
          __element: 'BreadcrumbItem',
          props: {
            href: '#',
          },
          children: '页面',
        },
      ],
      required: true,
    },
    {
      name: 'separator',
      type: 'ReactNode',
      description: '渲染在面包屑项之间的分隔符。内置斜杠在 RTL 中自动镜像。',
      default: "'/'",
      slotElements: [
        {
          __element: 'Icon',
          props: {
            icon: 'chevronRight',
            size: 'sm',
          },
        },
      ],
    },
    {
      name: 'variant',
      type: "'default' | 'supporting'",
      description: '视觉变体：supporting 更小并使用次要文本样式。',
      default: "'default'",
    },
    {
      name: 'label',
      type: 'string',
      description: 'nav 地标的无障碍标签（aria-label）。',
      default: "'Breadcrumb'",
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description: '用于布局自定义的 StyleX 样式（外边距、定位、尺寸）。必须是 stylex.create() 的值：不能是 style={{}} 这样的内联样式对象。',
    },
  ],
  components: [
    {
      name: 'BreadcrumbItem',
      displayName: 'Breadcrumb Item',
      description: '单个面包屑项。提供 href 时渲染为链接，当前页面渲染为纯文本。',
      props: [
        {
          name: 'children',
          type: 'ReactNode',
          description: '面包屑项的标签内容。',
          required: true,
        },
        {
          name: 'href',
          type: 'string',
          description: '面包屑链接的 URL；不可导航的项目请省略。',
        },
        {
          name: 'onClick',
          type: '(e: MouseEvent) => void',
          description: '面包屑项的点击处理函数。',
        },
        {
          name: 'isCurrent',
          type: 'boolean',
          description:
            '将此项标记为当前页面，应用 aria-current="page"。省略时，如果没有显式的当前项，则自动将最后一项标记为当前项；传入 false 可退出自动检测。',
        },
        {
          name: 'startIcon',
          type: 'ReactNode',
          description: '在项目标签前渲染的图标。',
        },
        {
          name: 'as',
          type: 'LinkComponentType',
          description: '自定义链接组件，代替 <a> 渲染。覆盖 LinkProvider 设置的默认值。仅适用于非当前项。',
        },
        {
          name: 'menu',
          type: 'DropdownMenuOption[] | ReactNode',
          description:
            '激活项目时打开的菜单，使用与 DropdownMenu/MoreMenu/ContextMenu 相同的项目 API（DropdownMenuOption[] 数组或组合的 DropdownMenuItem 子元素）。渲染为带 chevron 和 aria-haspopup="menu" 的链接样式触发器。优先于 href/onClick。',
        },
        {
          name: 'menuSize',
          type: "'sm' | 'md' | 'lg'",
          description:
            "传递给菜单项的尺寸。默认根据面包屑变体推断（'supporting' → 'sm'，否则 'md'）。",
        },
      ],
    },
  ],
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsZh = {
  usage: {
    description:
      'Breadcrumbs 显示从根到当前页面的链接路径。用于详情页、设置面板顶部，或任何用户需要了解当前位置并向上返回的地方。',
    bestPractices: [
      {guidance: true, description: '把面包屑放在页面标题上方，让用户在阅读内容前先看到位置。'},
      {guidance: true, description: '标签要短，并与其链接的页面标题一致："Settings"，而不是 "Application Settings Page"。'},
      {guidance: true, description: '在管理面板、侧边栏等面包屑需要低调的密集 UI 中使用 supporting 变体。'},
      {guidance: true, description: '最后一项用纯文本而非链接；它代表当前页面。设置 isCurrent 后组件会自动完成。'},
      {guidance: true, description: '组件实现了 WAI-ARIA APG Breadcrumb 模式：带标签的 nav 地标包裹有序列表，当前项带 aria-current="page"。带菜单的面包屑项还实现了 APG Menu Button 模式，Enter、Space 或 ArrowDown 打开，Escape 关闭。'},
      {guidance: true, description: '页面渲染多个路径时为每条路径单独设置 label，让各 nav 地标在屏幕阅读器的地标列表中可区分。'},
      {guidance: false, description: '不要把面包屑当作主要导航；它们补充侧边栏或顶部导航，而非取代。'},
      {guidance: false, description: '不要在没有上级的顶层页面显示面包屑；只会增加杂乱，帮不了用户。'},
      {guidance: false, description: '不要让路径超过 5 层。需要更多层级时，考虑简化页面层级。'},
      {guidance: true, description: '内置斜杠分隔符在 RTL 中自动镜像。自定义分隔符时，› 这类 Unicode 镜像角引号保持原样；箭头与 Icon 分隔符用 rtlStyles.mirror 镜像一次。'},
      {guidance: false, description: '不要镜像 bidi 算法已经镜像的分隔符。› 这类角引号字符是 Bidi_Mirrored，RTL 下会自行翻转，再用 rtlStyles.mirror 会翻回来。→ 这类箭头字符与 Icon 分隔符不是，因此才需要经 xstyle 用 rtlStyles.mirror。'},
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description: '从根到当前页的链接路径，用于寻路',
  usage: {
    description:
      'Breadcrumbs 显示从根到当前页的链接路径。用于详情页、设置或嵌套内容顶部。',
    bestPractices: [
      {guidance: true, description: '放在页面标题上方，让用户阅读内容前先看到位置。'},
      {guidance: true, description: '标签要短且与所链页面标题一致："Settings" 而非 "Application Settings Page"。'},
      {guidance: true, description: '密集 UI 中面包屑需低调时用 supporting 变体。'},
      {guidance: true, description: '最后一项为纯文本而非链接；代表当前页；设置 isCurrent 时自动完成。'},
      {guidance: true, description: '实现 APG Breadcrumb：带标签 nav 地标 + ol + aria-current="page"。带菜单的面包屑项还实现 APG Menu Button（Enter/Space/ArrowDown 打开，Escape 关闭）。'},
      {guidance: true, description: '页面渲染多条路径时为每条单独设 label。'},
      {guidance: false, description: '不要当主要导航用；面包屑补充主导航，而非取代。'},
      {guidance: false, description: '不要在无上级的顶层页面显示。'},
      {guidance: false, description: '不要让路径超过 5 层；应简化层级。'},
      {guidance: true, description: '内置 / 在 RTL 中自动镜像。bidi 镜像的 › 保持原样；自定义箭头与 Icon 镜像一次。'},
      {guidance: false, description: '不要镜像本就自镜像的分隔符：› 是 Bidi_Mirrored，RTL 下自行翻转。→ 与 Icon 分隔符不是，需经 xstyle 用 rtlStyles.mirror。'},
    ],
  },
};
