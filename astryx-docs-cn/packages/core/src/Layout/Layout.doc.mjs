// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentAnatomyElement[]} */
const anatomy = [
  {
    name: 'Layout container',
    required: true,
    description:
      '通用布局原语，负责摆放 header、start、content、end 与 footer 插槽。',
  },
  {
    name: 'Header',
    required: false,
    description:
      '由调用方提供的可选 LayoutHeader 区域，通常置于 header 插槽。',
  },
  {
    name: 'Panel',
    required: false,
    description:
      '由调用方在 start 或 end 插槽中提供的可选 LayoutPanel 区域。',
  },
  {
    name: 'Content area',
    required: false,
    description:
      '由调用方在 content 插槽中提供的可选 LayoutContent 区域。',
  },
  {
    name: 'Footer',
    required: false,
    description:
      '由调用方提供的可选 LayoutFooter 区域，通常置于 footer 插槽。',
  },
];

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'Layout',
  displayName: 'Layout',
  group: 'Layout',
  category: 'Layout',
  keywords: ["layout","布局","容器","内容","flex","页面","区域","页面骨架"],
  playground: {
    defaults: {
      header: {__element: 'LayoutHeader', props: {}, children: {__element: 'Heading', props: {level: 3}, children: '页面标题'}},
      content: {__element: 'LayoutContent', props: {}, children: {__element: 'Text', props: {type: 'body', color: 'secondary'}, children: '主内容区。这是布局中可滚动的中央区域。'}},
      footer: {__element: 'LayoutFooter', props: {}, children: {__element: 'Text', props: {type: 'supporting', color: 'secondary'}, children: '页脚：状态栏或操作'}},
    },
  },
  theming: {
    targets: [
      {className: 'astryx-layout', visualProps: ['height']},
      {className: 'astryx-layout-content'},
      {className: 'astryx-layout-footer'},
      {className: 'astryx-layout-header'},
      {className: 'astryx-layout-panel'},
    ],
  },
  description: '通用五插槽布局原语，用于排布 header、start、content、end 与 footer 区域。',
  props: [
    {
      name: 'content',
      type: 'ReactNode',
      description:
        'content 插槽（居中）。接受任意 ReactNode；需要内容区域时使用 LayoutContent。传给 `<Layout>` 的 children 也会渲染到这里：`<Layout>{main}</Layout>` 等价于 `<Layout content={main} />` 的简写。',
      slotElements: [
        {
          __element: 'LayoutContent',
          props: {},
          children: 'Content',
        },
      ],
    },
    {
      name: 'header',
      type: 'ReactNode',
      description:
        'header 插槽。接受任意 ReactNode；需要页头区域时使用 LayoutHeader。',
      slotElements: [
        {
          __element: 'LayoutHeader',
          props: {},
          children: 'Header',
        },
      ],
    },
    {
      name: 'footer',
      type: 'ReactNode',
      description:
        'footer 插槽。接受任意 ReactNode；需要页脚区域时使用 LayoutFooter。',
      slotElements: [
        {
          __element: 'LayoutFooter',
          props: {},
          children: 'Footer',
        },
      ],
    },
    {
      name: 'start',
      type: 'ReactNode',
      description:
        '逻辑起始插槽（LTR 下为左侧）。接受任意 ReactNode；需要面板区域时使用 LayoutPanel。',
      slotElements: [
        {
          __element: 'LayoutPanel',
          props: {},
          children: 'Panel',
        },
      ],
    },
    {
      name: 'end',
      type: 'ReactNode',
      description:
        '逻辑结束插槽（LTR 下为右侧）。接受任意 ReactNode；需要面板区域时使用 LayoutPanel。',
      slotElements: [
        {
          __element: 'LayoutPanel',
          props: {},
          children: 'Panel',
        },
      ],
    },
    {
      name: 'height',
      type: "'fill' | 'auto'",
      description:
        '高度行为：填满容器高度，或随内容增长。fill 需要容器本身有确定高度，例如 AppShell 的内容区；在无高度的应用根节点下，布局会随自身内容增长。',
      default: "'fill'",
    },
    {
      name: 'contentWidth',
      type: 'SizeValue',
      description:
        '各插槽（header、content、footer、面板）内对齐内容的最大宽度，比可用空间窄时居中。无面板时，LayoutContent 铺满可用宽度，滚动条停在外侧边缘，其子元素则在内部对齐到 contentWidth。恰好只有一个面板时，面板保持对齐 contentWidth 边框，LayoutContent 则延伸到对侧开放边缘。两侧都有面板时，contentWidth 覆盖完整的中部构图。百分比宽度——包括带百分比的 calc()、min()、max() 与 clamp() 值——以及固有宽度和裸 var(...) 值都会保留约束构图；对保证解析为长度的变量，请使用 calc(var(...))。分隔线仍保持通栏。数字按像素处理，字符串原样使用（例如 `60ch`）。常见页面宽度：640 用于表单、设置与以文字为主的页面；960 用于内容页和更宽的布局。',
    },
    {
      name: 'padding',
      type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
      description:
        '布局外边缘的内边距，使用间距刻度。作用于该 Layout 自身的 header、footer、面板与 content。嵌套 Layout 不会继承它：未传 `padding` 时，其区域会沿用外层 Card、Section 或 Dialog 的内边距，或默认内缩（间距 4）。这样即使 AppShell 自身区域是通栏的，页面 Layout 也能保持在 AppShell 的内缩之内。',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description:
        'content 插槽的简写：`<Layout>{main}</Layout>` 与 `<Layout content={main} />` 相同。两者同时给出时以 `content` 为准。',
    },
    {
      name: 'ref',
      type: 'React.Ref<HTMLDivElement>',
      description: '转发到布局根元素的 ref。',
    },
    {
      name: 'defaultHasDividers',
      type: 'boolean',
      description:
        'LayoutHeader 与 LayoutFooter 子元素的分隔线默认可见性。未传 `hasDivider` 的页头与页脚会采用该值；未设置时，嵌套布局从父级上下文继承。',
    },
  ],
  components: [
    {name: 'LayoutHeader'},
    {name: 'LayoutContent'},
    {name: 'LayoutFooter'},
    {name: 'LayoutPanel'},
    {name: 'Card'},
    {name: 'Section'},
  ],
  usage: {
    description:
      'Layout 是通用的五插槽原语，用于在页面或有界容器内排布 header、start、content、end 与 footer 区域。AppShell 负责页面外壳与应用级导航行为；简单的方向性堆叠请使用 HStack 或 VStack。',
    bestPractices: [
      { guidance: true, description: '当内容需要具名的 header、start、content、end 或 footer 区域时，使用 Layout。' },
      { guidance: true, description: '在内容区域内做简单的方向性堆叠时，使用 HStack 和 VStack。' },
      { guidance: true, description: '向插槽传入 `false`、`null` 或 `undefined` 即可隐藏区域，例如 `isOpen && <LayoutPanel />`。该插槽视为空，相邻区域会扩展到布局边缘。' },
      { guidance: true, description: '当某区域是页面地标时，在其区域组件上赋予 landmark 角色与标签，例如 `<LayoutPanel role="navigation" label="Sections">`。Layout 自身不添加任何角色或名称。' },
      { guidance: false, description: '不要用 Layout 做简单的堆叠布局；请改用 HStack 或 VStack。' },
      { guidance: false, description: '不要把 Layout 当作页面外壳或应用级导航的载体；这属于 AppShell 的职责。' },
    ],
    anatomy,
  },
  examples: [
    {
      label: '在 AppShell 内带详情面板的页面',
      code: `
function OrdersPage() {
  return (
    <AppShell
      sideNav={
        <SideNav>
          <SideNavItem label="Orders" isSelected />
          <SideNavItem label="Customers" />
          <SideNavItem label="Settings" />
        </SideNav>
      }>
      {/* No padding props needed: the page Layout's regions keep their
          default inset inside AppShell's full-bleed content area. */}
      <Layout
        header={
          <LayoutHeader hasDivider>
            <Heading level={1}>Orders</Heading>
          </LayoutHeader>
        }
        end={
          <LayoutPanel
            hasDivider
            width={320}
            role="complementary"
            label="Order details">
            <VStack gap={2}>
              <Heading level={2}>Order #1042</Heading>
              <Text type="body" color="secondary">
                Shipped · 3 items · $184.00
              </Text>
            </VStack>
          </LayoutPanel>
        }
        content={
          <LayoutContent>
            <Text type="body">
              Select an order to see its shipping and payment details.
            </Text>
          </LayoutContent>
        }
      />
    </AppShell>
  );
}
`,
    },
  ],
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsZh = {
  usage: {
    description:
      'Layout is a general five-slot primitive for arranging header, start, content, end, and footer regions within a page or bounded container. AppShell owns the page shell and app-wide navigation behavior; use HStack or VStack for simple directional stacking.',
    bestPractices: [
      { guidance: true, description: 'Use Layout when content needs named header, start, content, end, or footer regions.' },
      { guidance: true, description: 'Use HStack and VStack for simple directional stacking within a content area.' },
      { guidance: true, description: 'Hide a region by passing `false`, `null`, or `undefined` to its slot, for example `isOpen && <LayoutPanel />`. The slot counts as empty, so the neighbouring regions move out to the layout edge.' },
      { guidance: true, description: 'Give a region a landmark role and label on the region component when it is a page landmark, for example `<LayoutPanel role="navigation" label="Sections">`. Layout adds no role or name.' },
      { guidance: false, description: 'Use Layout for simple stacking layouts; use HStack or VStack instead.' },
      { guidance: false, description: 'Use Layout as the page shell or for app-wide navigation; use AppShell for that responsibility.' },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description:
    '通用五插槽原语，用于排布 header、start、content、end 与 footer 区域。页面外壳由 AppShell 负责。',
  usage: {
    description:
      'Layout 是通用的五插槽原语，用于在页面或有界容器内排布 header、start、content、end 与 footer 区域。AppShell 负责页面外壳与应用级导航行为；简单的方向性堆叠请使用 HStack 或 VStack。',
    bestPractices: [
      { guidance: true, description: '当内容需要具名的 header、start、content、end 或 footer 区域时，使用 Layout。' },
      { guidance: true, description: '在内容区域内做简单的方向性堆叠时，使用 HStack 和 VStack。' },
      { guidance: true, description: '向插槽传入 `false`、`null` 或 `undefined` 即可隐藏区域，例如 `isOpen && <LayoutPanel />`。该插槽视为空，相邻区域会扩展到布局边缘。' },
      { guidance: true, description: '当某区域是页面地标时，在其区域组件上赋予 landmark 角色与标签，例如 `<LayoutPanel role="navigation" label="Sections">`。Layout 自身不添加任何角色或名称。' },
      { guidance: false, description: '不要用 Layout 做简单的堆叠布局；请改用 HStack 或 VStack。' },
      { guidance: false, description: '不要把 Layout 当作页面外壳或应用级导航的载体；这属于 AppShell 的职责。' },
    ],
    anatomy,
  },
};
