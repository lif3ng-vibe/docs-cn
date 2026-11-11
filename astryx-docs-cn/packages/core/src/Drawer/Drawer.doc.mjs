// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Drawer.doc.mjs
 * @input Drawer props, panel anatomy, DrawerHeader composition, overlay playground config, and story-aligned examples
 * @output Consumer documentation and examples for Drawer
 * @position CLI and docsite metadata; runnable docsite demos live in packages/cli/assets/templates/blocks/components/Drawer
 */

/** @type {import('@astryxdesign/cli/authoring').ComponentAnatomyElement[]} */
const anatomy = [
  {
    name: 'Panel',
    required: true,
    description:
      '根 <dialog> 元素：锚定于行内起始或结束边缘的全高表面，与三个视口边缘齐平（直角）。',
  },
  {
    name: 'Content area',
    required: true,
    description:
      '承载 children 的可滚动容器；像 Dialog 一样在其中用 Layout 组合页眉、正文和页脚。默认带有 --spacing-4（16px）的内边距；padding 属性或主题可设置其他容器内边距。',
  },
  {
    name: 'Header',
    required: false,
    description:
      'DrawerHeader，像 Dialog 中的 DialogHeader 一样放在 Layout 的 header 插槽：包含标题，以及可选的副标题和首尾内容。传入 onOpenChange 即显示关闭按钮，与 DialogHeader 相同。',
  },
  {
    name: 'Scrim',
    required: false,
    description:
      '模态抽屉（hasScrim，默认开启）背后调暗并阻止页面交互的背景层；非模态抽屉没有。',
  },
];

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'Drawer',
  displayName: 'Drawer',
  // Keeps the registry route Drawer had as a canary-only Lab component.
  registry: {aliases: ['lab/drawer']},
  group: 'Drawer',
  category: 'Overlay',
  keywords: [
    'drawer',
    '抽屉',
    '侧边面板',
    '面板',
    '检查器',
    '详情视图',
    '浮层',
    '滑入',
    '侧边栏',
    'dialog',
    '侧边抽屉',
  ],
  // No isInline docs-preview prop (the drawer has no inline containment), so
  // this is the overlay preview: closed on load with an open trigger, knobs
  // live, and opening renders the real top-layer drawer — see
  // ComponentPlaygroundConfig.overlay (#3657).
  playground: {
    overlay: true,
    defaults: {
      isOpen: false,
      label: 'Details',
      children: {
        __element: 'Section',
        props: {padding: 4},
        children: {
          __element: 'VStack',
          props: {gap: 2},
          children: [
            {__element: 'Heading', props: {level: 3}, children: '详情'},
            {
              __element: 'Text',
              props: {type: 'body'},
              children: '调整下方的属性，然后打开预览。',
            },
          ],
        },
      },
    },
  },
  theming: {
    container: true,
    targets: [
      {className: 'astryx-drawer', visualProps: ['side']},
      {className: 'astryx-drawer-header'},
      {className: 'astryx-drawer-header-start-content'},
      {className: 'astryx-drawer-header-title-block'},
      {className: 'astryx-drawer-header-end-content'},
      {className: 'astryx-drawer-header-close-icon'},
    ],
    derived: [{property: 'padding', expand: 'container'}],
  },
  description:
    "浮在页面内容之上的侧边面板，使用原生 <dialog> 元素。从行内起始或结束边缘滑入；全高，从不挤压下方布局。与 Dialog 一样，它是一个容器：设置 padding（或主题的 drawer padding）后，单独的 Section 子元素以及 Table、Divider 等通栏子元素会对齐该内边距。默认内边距与 Dialog 相同，为 --spacing-4（16px）。",
  props: [
    {
      name: 'isOpen',
      type: 'boolean',
      description:
        '抽屉是否打开。完全受控；与 onOpenChange 搭配使用。',
      required: true,
    },
    {
      name: 'onOpenChange',
      type: '(isOpen: boolean) => void',
      description:
        '抽屉请求改变打开状态时调用。按 Escape 或点击遮罩会以 false 调用它（以 purpose 允许为准）；传入同一回调的 DrawerHeader 会从其关闭按钮调用它。打开状态由调用方持有。多个同级抽屉同时打开时，Escape 只关闭最后打开的一个。',
      required: true,
    },
    {
      name: 'label',
      type: 'string',
      description:
        '抽屉的无障碍标签。必填；抽屉没有可用来派生名称的内建标题。',
      required: true,
    },
    {
      name: 'children',
      type: 'ReactNode',
      description:
        '抽屉内容，渲染在全高可滚动区域内。自行组合 header/body/footer；带有 data-autofocus 的元素会在打开时获得焦点。退出动画期间子内容保持挂载；关闭时保留最后选中的内容，不要把内容置空。',
      required: true,
    },
    {
      name: 'side',
      type: "'start' | 'end'",
      description:
        "抽屉从哪一侧滑入：LTR 中 'end' 为右侧（检查器的惯例），'start' 为左侧。仅支持行内轴；底部面板请用 BottomSheet。",
      default: "'end'",
    },
    {
      name: 'width',
      type: 'number | string',
      description:
        "桌面端宽度上限。数字为像素；字符串为任意 CSS 长度（'50%'、'32rem'）。低于 640px 移动端断点时，该值仍是上限，同时抽屉会保留 56px 的底层页面露出。",
      default: '400',
    },
    {
      name: 'experimental',
      type: '{isFullWidthOnMobile?: boolean}',
      stability: 'experimental',
      description:
        '实验性选项：该对象中的任何内容都可能在补丁版本中变更或移除，省略时保持稳定行为。isFullWidthOnMobile（默认 false）在低于 640px 移动端断点时占满整个视口宽度，而不是保留默认 56px 的底层页面露出——这让抽屉看起来更像浮层而非导航。',
    },
    {
      name: 'hasScrim',
      type: 'boolean',
      description:
        '抽屉背后的模态遮罩。true 使用 showModal()（顶层、焦点捕获、滚动锁定；除非 purpose 阻止，点击遮罩关闭；仅模态）；false 使用手动 Popover API，呈现非模态的顶层浮层——不捕获焦点，背后的页面保持可交互。',
      default: 'true',
    },
    {
      name: 'purpose',
      type: "'required' | 'form' | 'info'",
      description:
        '配置隐式关闭行为，与 Dialog 一致。info：Escape 和点击遮罩均可关闭。form：Escape 可关闭，点击遮罩不可。required：两者都不能关闭（Escape 被拦截），且模态抽屉会以 alertdialog 形式暴露，请为其内容提供退出途径。非模态抽屉没有遮罩，form 与 info 行为相同。',
      default: "'info'",
    },
    {
      name: 'padding',
      type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
      description:
        "使用间距刻度设置抽屉内容的内边距，与 Dialog 一致。省略时使用抽屉的主题默认值：除非主题为 drawer 设置了 padding，否则为 --spacing-4（16px）。传 0 可获得通栏内容区。单独的 Section 子元素会越出该内边距，Table、Divider 等通栏子元素会做反向补偿，Layout 则会把内边距分配给其各区域。所有模式下，内容区的块向结束边缘都会额外叠加 home indicator 安全区。",
    },
  ],
  usage: {
    anatomy,
    description:
      '浮在页面内容之上的侧边面板，用于检查器和详情视图——"点击表格行查看详情"的模式。与停靠面板不同，它覆盖在布局之上，不会挤压重排页面。桌面端与触屏均可用：宽度上限作用于桌面端，640px 以下面板保留 56px 的底层页面露出，且不超过宽度上限。按 Escape 关闭抽屉（purpose 为 required 时除外），焦点返回到打开它的元素。滑入/滑出动画遵循 prefers-reduced-motion。在手机或平板（主指针为粗指针）上，抽屉还在滑入时落下的点按或拖动不会命中任何目标（无遮罩的抽屉只有面板本身如此：页面保持活跃），抽屉会继续完成滑入；键盘和辅助技术保持活跃，鼠标或触控板仍然可以点击：若它是最近使用的指针则立即生效，否则在移动后生效。堆叠约定：同级抽屉后开的在上层，Escape 只关闭最上层的，关闭顺序由内向外；请以同级方式渲染，切勿嵌套。\n\n与 Dialog 一样，抽屉是一个容器：内容区域默认带有 --spacing-4（16px）的内边距，也可由 padding 属性或主题中 drawer 的 padding 设置。像 Dialog 一样用 Layout 组合页眉、正文和页脚：DrawerHeader 放在 header 插槽（传入 onOpenChange 时显示关闭按钮，与 DialogHeader 相同），正文放在 LayoutContent，操作放在 LayoutFooter。Layout 会把内边距重新分配给这些区域，使它们对齐在同一条内容线上，页眉也不会被重复缩进。单独的 Section 子元素同样会越出该内边距。Drawer 自身不渲染关闭按钮，因此每个抽屉都要提供可见的关闭方式，非模态抽屉尤其如此——它没有可点击的遮罩。在打开时应获得焦点的控件上加 data-autofocus。\n\n表面选择：居中的决定或短表单用 Dialog；需要保持页面可见的全高侧边详情用 Drawer；触屏上的块轴面板用 BottomSheet；内容应当挤开重排页面而不是浮于其上时，用停靠面板（布局分栏）。\n\n主题化：面板是唯一的稳定目标（astryx-drawer，data-side 反映 side 值），遮罩是面板的原生 ::backdrop。DrawerHeader 为其标题行、插槽和关闭图标提供 astryx-drawer-header 系列目标。',
    bestPractices: [
      {
        guidance: true,
        description:
          '用于上下文详情视图（行检查器、实体详情），让用户保持对底层列表的可见性。',
      },
      {
        guidance: true,
        description:
          '让调用方作为唯一数据源：从选中状态派生 isOpen，并在 onOpenChange 中清除选中。',
      },
      {
        guidance: true,
        description:
          '在主从流程中使用 hasScrim={false}——非模态抽屉不捕获焦点，抽屉后面的页面保持可交互。',
      },
      {
        guidance: true,
        description:
          '关闭时保留最后选中的内容：退出动画期间子内容仍然挂载，中途置空会让面板在滑出时变为空白。',
      },
      {
        guidance: true,
        description:
          '为每个抽屉提供可见的关闭操作，通常是带 onOpenChange 的 DrawerHeader；非模态抽屉没有可点击的遮罩。',
      },
      {
        guidance: true,
        description:
          '误点遮罩会丢失未保存的输入时，使用 purpose="form"。',
      },
      {
        guidance: false,
        description:
          '用 Drawer 做简短确认或小表单——请改用 Dialog 或 AlertDialog。',
      },
      {
        guidance: false,
        description:
          '需要把页面内容挤开时不要用 Drawer——它浮在内容之上，请改用停靠面板或布局分栏。',
      },
      {
        guidance: false,
        description:
          '不要把 Drawer 当作底部/顶部面板使用——它只支持行内轴，块轴面板请用 BottomSheet。',
      },
      {
        guidance: false,
        description:
          '在 Drawer 中嵌套另一个 Drawer；应以同级方式渲染——后开的堆叠在上层，Escape 先关闭它。',
      },
    ],
  },
  // CLI snippets. The docsite renders the paired Drawer blocks in ../../blocks.
  examples: [
    {
      label: '基础用法',
      code: `const [isOpen, setIsOpen] = useState(false);
<>
  <Button label="Open drawer" onClick={() => setIsOpen(true)} />
  <Drawer
    isOpen={isOpen}
    onOpenChange={setIsOpen}
    label="Details"
    width={360}>
    <Layout
      header={<DrawerHeader title="Details" onOpenChange={setIsOpen} />}
      content={
        <LayoutContent>
          <Text type="body">Close with Escape, the scrim, or the close button.</Text>
        </LayoutContent>
      }
    />
  </Drawer>
</>
// Modal by default: the scrim dims the page and focus is trapped. Escape, a
// scrim click, or the header's close button closes it, and focus returns to
// the trigger.`,
    },
    {
      label: '模态与非模态（hasScrim）',
      code: `const [openModal, setOpenModal] = useState(false);
const [openPanel, setOpenPanel] = useState(false);
<>
  {/* Modal (default): the scrim dims the page, focus is trapped, and a
      scrim click closes. */}
  <Drawer isOpen={openModal} onOpenChange={setOpenModal} label="Edit details">
    <EditForm />
  </Drawer>
  {/* Non-modal: no scrim, no focus trap; the page behind stays interactive.
      With no scrim to click, the header's close button is the visible exit. */}
  <Drawer
    isOpen={openPanel}
    onOpenChange={setOpenPanel}
    label="Details"
    hasScrim={false}>
    <Layout
      header={<DrawerHeader title="Details" onOpenChange={setOpenPanel} />}
      content={<LayoutContent><DetailsPanel /></LayoutContent>}
    />
  </Drawer>
</>`,
    },
    {
      label: '带底部操作区的编辑表单',
      code: `const [isOpen, setIsOpen] = useState(false);
<Drawer
  isOpen={isOpen}
  onOpenChange={setIsOpen}
  label="Edit host"
  purpose="form">
  <Layout
    header={<DrawerHeader title="Edit host" onOpenChange={setIsOpen} />}
    content={<LayoutContent><HostFields /></LayoutContent>}
    footer={
      <LayoutFooter>
        <HStack gap={2} hAlign="end">
          <Button label="Cancel" variant="secondary" onClick={() => setIsOpen(false)} />
          <Button label="Save" variant="primary" onClick={save} />
        </HStack>
      </LayoutFooter>
    }
  />
</Drawer>
// purpose="form" keeps Escape but ignores scrim clicks, so a stray click
// outside does not discard edits. The footer stays pinned while the fields
// scroll.`,
    },
    {
      label: '从起始边缘滑入',
      code: `const [isOpen, setIsOpen] = useState(false);
<Drawer
  isOpen={isOpen}
  onOpenChange={setIsOpen}
  label="Navigation"
  side="start">
  <NavPanel />
</Drawer>
// 'start' is left in LTR and mirrors under RTL; 'end' (the default) is the
// inspector convention.`,
    },
    {
      label: '宽度上限：像素或任意 CSS 长度',
      code: `const [isOpen, setIsOpen] = useState(false);
<Drawer
  isOpen={isOpen}
  onOpenChange={setIsOpen}
  label="Details"
  width="50%">
  <DetailsPanel />
</Drawer>
// A number is pixels (width={320}); a string is any CSS length ('32rem',
// '50%'). The budget also caps the drawer on mobile.`,
    },
  ],
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsZh = {
  usage: {
    anatomy: [
      {
        name: 'Panel',
        required: true,
        description:
          '根 <dialog> 元素：锚定于行内起始或结束边缘的全高表面，与三个视口边缘齐平（直角）。',
      },
      {
        name: 'Content area',
        required: true,
        description:
          '承载 children 的可滚动容器；像 Dialog 一样在其中用 Layout 组合页眉、正文和页脚。默认带有 --spacing-4（16px）的内边距；padding 属性或主题的 drawer padding 可设置其他容器内边距。',
      },
      {
        name: 'Header',
        required: false,
        description:
          'DrawerHeader，像 Dialog 中的 DialogHeader 一样放在 Layout 的 header 插槽：包含标题，以及可选的副标题和首尾内容。传入 onOpenChange 即显示关闭按钮，与 DialogHeader 相同。',
      },
      {
        name: 'Scrim',
        required: false,
        description:
          '模态抽屉（hasScrim，默认开启）背后调暗并阻止页面交互的背景层；非模态抽屉没有。',
      },
    ],
    description:
      '浮在页面内容之上的侧边面板，用于检查器和详情视图——"点击表格行查看详情"的模式。与停靠面板不同，它覆盖在布局之上，不会挤压页面。桌面端按 width 设定宽度，宽度小于 640px 时保留 56px 的底层页面，并且不超过 width 上限。按 Escape 关闭抽屉（purpose 为 required 时除外），焦点返回到打开它的元素。滑入/滑出动画遵循 prefers-reduced-motion。堆叠约定：同级抽屉后开的在上层，Escape 只关闭最上层的，关闭顺序由内向外——请以同级方式渲染，切勿嵌套。\n\n与 Dialog 一样，Drawer 是一个容器：内容区域默认带有 --spacing-4（16px）的内边距，也可以由 padding 属性或主题中 drawer 的 padding 设置。像 Dialog 一样用 Layout 组合页眉、正文和页脚：DrawerHeader 放在 header 插槽（传入 onOpenChange 时显示关闭按钮，与 DialogHeader 相同），正文放在 LayoutContent，操作放在 LayoutFooter。Layout 会把内边距分配给这些区域，使它们对齐在同一条内容线上，页眉也不会被重复缩进。作为唯一子元素的 Section 同样会越出该内边距。Drawer 本身不渲染关闭按钮，所以每个抽屉都要提供可见的关闭方式，非模态抽屉尤其如此，因为它没有可点击的遮罩。在打开时应获得焦点的控件上加 data-autofocus。\n\n如何选择：居中的决定或短表单用 Dialog；保持页面可见的全高侧边详情用 Drawer；触屏上的块轴面板用 BottomSheet；内容应当把页面挤开重排时用停靠面板（布局分栏），而不是浮层。\n\n主题化：面板是唯一的稳定目标（astryx-drawer，data-side 反映 side 值），遮罩是面板的原生 ::backdrop。DrawerHeader 为其标题行、插槽和关闭图标提供 astryx-drawer-header 系列目标。',
    bestPractices: [
      {
        guidance: true,
        description:
          '用于上下文详情视图（行检查器、实体详情），让用户保持对底层列表的可见性。',
      },
      {
        guidance: true,
        description:
          '让调用方作为唯一数据源：从选中状态派生 isOpen，并在 onOpenChange 中清除选中。',
      },
      {
        guidance: true,
        description:
          '在主从流程中使用 hasScrim={false}——非模态抽屉不捕获焦点，抽屉后面的页面保持可交互。',
      },
      {
        guidance: true,
        description:
          '关闭时保留最后选中的内容：退出动画期间子内容仍然挂载，中途置空会让面板在滑出时变为空白。',
      },
      {
        guidance: true,
        description:
          '为每个抽屉提供可见的关闭操作，通常是带 onOpenChange 的 DrawerHeader；非模态抽屉没有可点击的遮罩。',
      },
      {
        guidance: true,
        description: '误点遮罩会丢失未保存的输入时，使用 purpose="form"。',
      },
      {
        guidance: false,
        description:
          '用 Drawer 做简短确认或小表单——请改用 Dialog 或 AlertDialog。',
      },
      {
        guidance: false,
        description:
          '需要把页面内容挤开时不要用 Drawer——它浮在内容之上，请改用停靠面板或布局分栏。',
      },
      {
        guidance: false,
        description:
          '不要把 Drawer 当作底部/顶部面板使用——它只支持行内轴，块轴面板请用 BottomSheet。',
      },
      {
        guidance: false,
        description:
          '在 Drawer 中嵌套另一个 Drawer；应以同级方式渲染——后开的堆叠在上层，Escape 先关闭它。',
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description:
    '浮于内容之上的侧边面板（原生 <dialog>）：起始/结束边缘、全高、类 Dialog 的容器内边距（默认 --spacing-4；padding 属性或主题 drawer padding）',
  usage: {
    anatomy,
    description:
      "用于检查器和详情视图的浮层侧边面板；浮于内容之上，从不挤压重排页面。width 为桌面端上限；640px 以下保留 56px 页面露出，且受 width 限制。Escape 关闭最上层（purpose=required 时除外）；焦点归还给打开者。同级抽屉后开的在上层；切勿嵌套。滑动动画遵循 prefers-reduced-motion。类 Dialog 容器：内容区内边距默认 --spacing-4（16px），也可由 padding 属性或主题 drawer padding 设置（padding={0} 即通栏）。像 Dialog 一样组合：Layout 的 header 插槽放 DrawerHeader（传入 onOpenChange 才有关闭按钮）、LayoutContent、LayoutFooter；Layout 重新分配内边距，使各区域对齐且页眉不被重复缩进；单独的 Section 会越出内边距。无内建关闭按钮，因此每个抽屉都需要可见的退出方式；data-autofocus 决定焦点目标。purpose 与 Dialog 一致：info = Escape + 点击遮罩，form = 仅 Escape，required = 均不可（模态 → alertdialog）。选择：居中决定/短表单用 Dialog，全高侧边详情用 Drawer，块轴面板用 BottomSheet，需要重排而非浮层时用停靠布局分栏。主题化：唯一目标 astryx-drawer（data-side）；遮罩是其 ::backdrop；DrawerHeader 有 astryx-drawer-header 系列目标。",
    bestPractices: [
      {
        guidance: true,
        description: '用于行检查器和实体详情视图。',
      },
      {
        guidance: true,
        description:
          '从选中状态派生 isOpen；在 onOpenChange 中清除。',
      },
      {
        guidance: true,
        description:
          '非模态主从流程使用 hasScrim={false}（不捕获焦点，页面保持可交互）。',
      },
      {
        guidance: true,
        description:
          '关闭时保留最后选中的内容（退出动画期间子内容保持挂载）。',
      },
      {
        guidance: true,
        description:
          '为每个抽屉提供可见的关闭操作（DrawerHeader + onOpenChange）；非模态没有遮罩。',
      },
      {
        guidance: true,
        description:
          '误点遮罩会丢失输入时，使用 purpose="form"。',
      },
      {
        guidance: false,
        description:
          '不要用于确认或小表单；请改用 Dialog。',
      },
      {
        guidance: false,
        description:
          '不要在内容应挤开页面时使用（它是浮层），也不要当底部面板使用（请用 BottomSheet）。',
      },
      {
        guidance: false,
        description:
          '不要嵌套 Drawer：应以同级渲染；Escape 先关闭最后打开的。',
      },
    ],
  },
};
