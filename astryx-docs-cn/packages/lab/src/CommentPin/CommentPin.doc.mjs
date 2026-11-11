// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file CommentPin.doc.mjs
 * @input CommentPin API, anatomy, ownership boundaries, and examples
 * @output Consumer documentation for the Lab comment pin
 * @position CLI and docsite metadata; the runnable showcase lives in packages/lab/blocks
 */

/** @type {import('@astryxdesign/cli/authoring').ComponentAnatomyElement[]} */
const anatomy = [
  {
    name: 'Marker surface',
    required: true,
    description:
      '紧凑的对话气泡按钮表面，逻辑 bottom-start 角固定 2px 圆角，高度随尺寸为 28、32 或 36px，四边内边距相等。它负责选中、已解决、禁用、悬停、按压、focus-visible 与分组的呈现，但不持有任何坐标。',
  },
  {
    name: 'Representative avatars',
    required: true,
    description:
      '单线程显示一个 Avatar。线程组以 AvatarGroup 呈现去重后的参与者，最多三个圆形：至多三个 Avatar，或参与者超过三人时两个 Avatar 加溢出指示。头像在标记内仅作装饰；无障碍由按钮标签负责。',
  },
  {
    name: 'Overflow indicator',
    required: false,
    description:
      '省略号 AvatarGroupOverflow 圆形，当线程组的不同参与者超过三人时占据第三个位置。它不显示数字，因此线程组数量仍是标记上唯一的数字。在标记内仅作装饰、不可交互。',
  },
  {
    name: 'Group count',
    required: false,
    description:
      '所代表线程的准确总数。threadCount 大于 1 时出现，有未读点时位于其前；它是数量，不是序号身份。额外的末端内边距使它与标记边缘保持距离。',
  },
  {
    name: 'Unread dot',
    required: false,
    description:
      '标记末端的强调色 StatusDot，unreadCount 大于 0 时标记未读活动：位于线程组数量之后，单线程标记则位于参与者之后。它不添加第二个数字；在标记内仅作装饰。',
  },
];

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docs = {
  name: 'CommentPin',
  displayName: 'Comment Pin',
  group: 'Comments',
  category: 'Chat',
  keywords: [
    'annotation',
    '批注',
    'marker',
    '标记',
    'pin',
    '图钉',
    'comment',
    '评论',
    'thread',
    '线程',
    'anchor',
    '锚点',
    'avatar',
    '头像',
    'grouped comments',
    '分组评论',
    'image annotation',
    '图片批注',
    'margin comment',
    '边距评论',
  ],
  description:
    '以头像为主的按钮，用于打开单个锚定批注线程或调用方定义的线程组。单个标记显示主要参与者；分组标记最多显示三个参与者圆形（超过三人时为两个加一个省略号）以及线程总数。只要任一代表线程未读，数量之后就会出现强调色状态点。三种尺寸遵循元素尺寸刻度。锚点、坐标、分组、碰撞处理与评论表面由宿主负责。',
  props: [
    {
      name: 'label',
      type: 'string',
      description:
        '必填的无障碍操作名称及悬停/聚焦提示。当分组、未读或已解决上下文会改变操作含义时将其纳入，例如“打开 Ada 和 Lin 的 4 条分组批注，2 条未读”。',
      required: true,
    },
    {
      name: 'participants',
      type: 'readonly [CommentPinParticipant, ...CommentPinParticipant[]]',
      description:
        '非空的有序参与者列表，主要参与者在前。单个标记渲染第一个。分组标记将去重后的 ID 渲染为最多三个圆形的 AvatarGroup：不同参与者不超过三人时渲染全部，否则渲染前两个加一个省略号溢出圆形。请传入所有不同参与者，使溢出圆形恰好在参与者超过三人时出现。每条记录含 id、name 和可选的 avatarSrc。',
      required: true,
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description:
        '标记高度按元素尺寸刻度：sm 28px、md 32px、lg 36px，参与者圆形分别为 22px、24px、28px。四边内边距相等，因此头像与溢出圆形到各边缘距离一致；末尾的数量或未读点会加一点末端内边距，避免贴边。',
      default: "'sm'",
    },
    {
      name: 'threadCount',
      type: 'number',
      description:
        '所代表线程的总数。大于 1 的有限正整数会切换为分组呈现并显示准确数量。聚类策略仍由宿主负责。',
      default: '1',
    },
    {
      name: 'unreadCount',
      type: 'number',
      description:
        '有未读活动的代表线程数。大于 0 时，标记末端会出现强调色状态点，位于线程总数或单个参与者之后；数字本身不显示。无效值会被忽略，超过 threadCount 的值会被截断。请在 label 中重复未读上下文。',
      default: '0',
    },
    {
      name: 'isSelected',
      type: 'boolean',
      description:
        '标记是否为当前激活的批注目标。在标记外侧绘制 2px 实线强调色轮廓（保持其层级），并设置 aria-pressed；键盘聚焦时共享的偏移焦点环仍在其更外侧。遵循 aria-pressed 切换语义：再次激活已选中的标记时应清除宿主选择。',
      default: 'false',
    },
    {
      name: 'isDimmed',
      type: 'boolean',
      description:
        '是否有其他标记被选中。降低此标记的不透明度但不禁用它，因此仍可用于切换选择。未选中任何标记时所有标记都保持 false。两者同时为真时选中呈现优先。',
      default: 'false',
    },
    {
      name: 'isResolved',
      type: 'boolean',
      description:
        '所有代表线程是否都已解决。已解决的标记除非被选中否则不渲染任何内容：已解决的讨论会从内容中消失，而读者打开过的线程（或从其弹出层解决的线程）会保留锚点并保持选中处理，直到宿主清除选择。',
      default: 'false',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description:
        '禁用激活：标记设置 aria-disabled、保留 Tab 停靠点并拦截所有激活路径。适用于线程尚不存在前的待定锚点。',
      default: 'false',
    },
    {
      name: 'onClick',
      type: 'MouseEventHandler<HTMLButtonElement>',
      description:
        '由产品拥有的激活处理函数。在此打开或选中代表的线程/线程组；CommentPin 不持有评论或弹出层状态。',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '按钮根元素的 StyleX 布局定制。宿主可将其定位在内容上方或边距中；绝对锚点映射到逻辑 bottom-start 角：将 inline-start 边对齐锚点，再把标记向上平移其整个高度。',
    },
  ],
  theming: {
    targets: [
      {
        className: 'astryx-comment-pin',
        visualProps: [
          'size',
          'grouped',
          'unread',
          'selected',
          'dimmed',
          'resolved',
          'disabled',
        ],
      },
    ],
  },
  usage: {
    anatomy,
    description:
      '将 CommentPin 用作图片、文档、画布、表格区域或内容边距上评论的交互锚点。传入去重后的参与者（主要参与者在前）、宿主在该锚点分组的线程总数，以及其中多少条未读。该组件有意不包含坐标、锚点 ID、线程 ID、聚类算法、弹出层或对 Comments 的依赖：这些留给产品，使同一标记既能覆盖在变换过的媒体上，也能位于普通文档布局中。参与者头像与溢出圆形会抑制自身的提示与交互；标记是唯一的按钮，其 label 就是完整的操作名称。',
    accessibility: [
      {
        name: 'Native button activation',
        category: 'Keyboard',
        criterion: '2.1.1 Keyboard',
        description:
          'CommentPin 是一个原生按钮。Tab 可到达启用的标记；Enter 和空格激活它。禁用的标记保留在 Tab 序列中并通过 aria-disabled 播报为禁用，所有激活路径都被拦截。',
      },
      {
        name: 'Selected state and name',
        category: 'Semantics',
        criterion: '4.1.2 Name, Role, Value',
        description:
          '必填的 label 是按钮名称和提示。aria-pressed 传达受控选择；参与者头像、溢出圆形、可见的线程总数与未读点均保持装饰性，因此请在 label 中重复分组与未读上下文。',
      },
      {
        name: 'Selection and focus',
        category: 'Color contrast',
        criterion: '1.4.11 Non-text Contrast',
        description:
          '2px 实线强调色轮廓紧贴标记，而共享的 focus-visible 轮廓位于其更外侧，因此选中与键盘聚焦仍可区分；forced colors 下采用平台 Highlight 处理。请在宿主表面上验证选中以及选中加聚焦两种状态。',
      },
    ],
    bestPractices: [
      {
        guidance: true,
        description:
          '主要评论者放最前。线程组传入所有不同参与者，按帮助用户识别该簇的程度排序；标记最多显示三个圆形，其余用省略号概括。',
      },
      {
        guidance: true,
        description:
          'label 要完整，写明操作与相关上下文，例如“打开 Ada 和 Lin 的 4 条分组批注”。',
      },
      {
        guidance: true,
        description:
          '坐标、缩放/旋转变换、碰撞处理、分组归属与线程选择都交给宿主；用布局组合或 xstyle 定位标记。',
      },
      {
        guidance: true,
        description:
          '将绝对锚点坐标映射到标记的逻辑 bottom-start 角而非中心：把标记的 inline-start 边对齐锚点，再向上平移其整个高度。',
      },
      {
        guidance: true,
        description:
          '选中一个标记时，向其他标记传 isDimmed 而不是禁用它们。激活标记保持视觉焦点的同时，它们仍可用于切换选择。未选中任何标记时不做变暗处理。',
      },
      {
        guidance: true,
        description:
          '把选中当作 aria-pressed 切换：再次激活已选中的标记时清除宿主选择。',
      },
      {
        guidance: true,
        description:
          '把 threadCount 仅当作数量。即使总数很大，Avatar 身份仍是最主要的信息。',
      },
      {
        guidance: true,
        description:
          '只要有代表线程存在未读活动就传 unreadCount。其强调色圆点让未读工作在总数旁保持可见；在 label 中重复未读数。',
      },
      {
        guidance: false,
        description:
          '用序号作为标记身份。随着批注被插入、删除、过滤或分组，编号会变得不稳定且难以浏览。',
      },
      {
        guidance: false,
        description:
          '在标记内放置可交互的 Avatar 链接或按钮。标记根元素拥有唯一的操作和无障碍名称。',
      },
      {
        guidance: false,
        description:
          '自行裁剪参与者来控制溢出。应传入所有不同参与者，使省略号恰好在参与者超过三人时出现，并在 label 中写明被隐藏的人。',
      },
    ],
  },
  examples: [
    {
      label: '单线程',
      code: `<CommentPin
  label="Open annotation from Ada"
  participants={[{id: 'ada', name: 'Ada Lovelace', avatarSrc: '/ada.jpg'}]}
  onClick={() => openThread('thread-1')}
/>`,
    },
    {
      label: '线程组',
      code: `<CommentPin
  label="Open 4 grouped annotations from Ada and Lin"
  participants={[
    {id: 'ada', name: 'Ada Lovelace', avatarSrc: '/ada.jpg'},
    {id: 'lin', name: 'Lin Chen', avatarSrc: '/lin.jpg'},
  ]}
  threadCount={4}
  isSelected={selectedCluster === 'cluster-1'}
  onClick={() => setSelectedCluster('cluster-1')}
/>`,
    },
    {
      label: '未读线程与参与者溢出',
      code: `// Five distinct people: two Avatars plus an ellipsis circle.
// Two unread threads: an accent dot after the total.
<CommentPin
  label="Open 6 grouped annotations from Ada, Lin, and 3 others, 2 unread"
  participants={[ada, lin, mira, noah, sam]}
  threadCount={6}
  unreadCount={2}
  onClick={() => setSelectedCluster('cluster-2')}
/>`,
    },
    {
      label: '尺寸',
      code: `<HStack gap={3}>
  <CommentPin size="sm" label="Open annotation from Ada" participants={[ada]} />
  <CommentPin size="md" label="Open annotation from Ada" participants={[ada]} />
  <CommentPin size="lg" label="Open annotation from Ada" participants={[ada]} />
</HStack>`,
    },
    {
      label: '宿主主导的定位',
      code: `const positions = stylex.create({
  marker: {
    position: 'absolute',
    insetInlineStart: '42%',
    insetBlockStart: '28%',
    transform: 'translateY(-100%)',
  },
});

<div className="annotated-content">
  <img src="/diagram.png" alt="System diagram" />
  <CommentPin
    label="Open annotation from Mira"
    participants={[{id: 'mira', name: 'Mira Patel'}]}
    xstyle={positions.marker}
    onClick={openAnnotation}
  />
</div>`,
    },
  ],
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsZh = {
  description:
    '用于打开单个锚定批注线程或调用方定义线程组的头像优先按钮。单线程显示主要参与者头像；分组标记最多显示三个圆形（超过三人时显示两个头像和省略号圆形），并显示线程总数；有未读线程时在末尾（总数或单个头像之后）显示强调色状态点。三种尺寸遵循元素尺寸刻度。',
  propDescriptions: {
    label:
      '必填的无障碍操作名称及悬停/聚焦提示；包含分组、未读或已解决上下文。',
    participants:
      '有序参与者列表（主要参与者在前）；单线程显示第一个；分组最多显示三个圆形，超过三位不同参与者时显示前两个头像和省略号溢出圆形。',
    size: '标记高度：sm 28px、md 32px、lg 36px，参与者头像分别为 22px、24px、28px；四边内边距相等。',
    threadCount: '所代表的线程总数；大于 1 时使用分组样式并显示准确数量。',
    unreadCount:
      '有未读活动的线程数；大于 0 时在总数之后（单线程时在头像之后）显示强调色状态点，不显示该数字。',
    isSelected:
      '标记是否为当前批注目标；再次激活已选中的标记时，宿主应清除选择（aria-pressed 切换语义）。',
    isDimmed:
      '其他标记被选中时降低此标记的视觉突出度，但不禁用操作；未选中任何标记时不应降低。',
    isResolved: '所代表的线程是否都已解决；已解决的标记除非被选中否则不渲染。',
    isDisabled:
      '通过 aria-disabled 禁用激活：保留 Tab 焦点，拦截所有激活路径。',
    onClick: '由产品拥有的激活处理函数。',
    xstyle: '根按钮的 StyleX 布局样式；由宿主决定内容上方或边距中的位置。',
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description:
    '头像优先的批注锚点；单线程 1 个主要 Avatar；线程组最多 3 个圆形（超过 3 人时 2 个 Avatar + 省略号）+ 准确总数；unreadCount > 0 时总数后（单标记则在头像后）显示强调色 StatusDot；sm/md/lg = 28/32/36px；定位/分组由宿主负责',
  usage: {
    description:
      '内容上方或边距中评论的交互锚点。传入所有不同参与者、线程总数与未读线程数；坐标、聚类、碰撞、线程状态与打开的 UI 都交给宿主。绝对坐标映射到逻辑 bottom-start 角；选中其他标记时兄弟标记用 isDimmed 且保持可交互；再次激活已选中的标记会清除宿主选择。',
    bestPractices: [
      {
        guidance: true,
        description:
          '主要评论者放最前，label 写完整的操作与上下文，含未读信息。',
      },
      {
        guidance: true,
        description:
          'threadCount 只作数量，绝不做序号身份；传 unreadCount 让强调色圆点标记未读工作。',
      },
      {
        guidance: false,
        description:
          '不要嵌套可交互 Avatar、不要裁剪参与者伪造溢出、不要把坐标/分组逻辑塞进标记。',
      },
    ],
  },
  propDescriptions: {
    label:
      '必填操作名 + 悬停/聚焦提示；含分组/未读上下文',
    participants:
      '{id,name,avatarSrc?} 的非空有序元组；单线程渲染 1 个；线程组最多 3 个圆形（不同参与者超 3 人时 2 个 + 省略号溢出）',
    size: "'sm' | 'md' | 'lg' = 高 28/32/36px，头像 22/24/28px，内边距相等；默认 'sm'",
    threadCount:
      '正整数总数；>1 时切换分组呈现；默认 1',
    unreadCount:
      '有未读活动的代表线程数；>0 时总数后（单标记则在头像后）显示强调色圆点；上限 threadCount；默认 0',
    isSelected:
      '受控的激活标记；标记外侧 2px 实线强调色轮廓 + aria-pressed；再次激活已选标记时由宿主清除',
    isDimmed:
      '受控的弱化，仅在选中其他标记时用于未选中的兄弟标记；保持可交互',
    isResolved: '已解决的标记除非被选中否则不渲染',
    isDisabled:
      '禁用标记：aria-disabled，保留 Tab 停靠点，拦截所有激活路径',
    onClick: '宿主激活处理函数',
    xstyle: '根元素布局/定位样式；标记不持有坐标',
  },
};
