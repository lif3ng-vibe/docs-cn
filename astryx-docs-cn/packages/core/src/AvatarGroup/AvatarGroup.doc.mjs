// Copyright (c) Meta Platforms, Inc. and affiliates.
/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'AvatarGroup',
  displayName: 'Avatar Group',
  group: 'Avatar',
  category: 'Content',
  keywords: ['avatar', '分组', 'facepile', '堆叠', '重叠', '参与者', '负责人', '成员', '团队'],
  usage: {
    description:
      'AvatarGroup 以重叠排列方式显示多个头像，并可选择显示溢出指示器。使用组合式 API：直接传入 Avatar 子元素，每个头像可携带自己的 prop（状态点、点击处理器等）。',
    bestPractices: [
      {guidance: true, description: '自行切分列表，只传入需要显示的头像，通常 3-5 个为佳。分组只渲染传入的子元素，不会代为切分。'},
      {guidance: true, description: '用 AvatarGroupOverflow 自定义溢出内容，如弹出触发器或 "添加成员" 按钮。'},
      {guidance: true, description: '直接在每个 Avatar 子元素上传递状态点、点击处理器或提示。'},
      {guidance: true, description: '用 HoverCard 或 Tooltip 包裹 Avatar 子元素以在悬停时显示更多信息；头像仍保持重叠。在被包裹的 Avatar 上设置 tooltip={false}，避免与内置名称提示相互干扰。'},
      {guidance: true, description: '用 href 或 onClick 让头像可交互以链接到个人资料页。可交互头像共享一个 Tab 停靠点，用方向键在其间移动，分组会向辅助技术播报键盘操作提示。这遵循 WAI-ARIA APG 的 roving tabindex 技术（组合控件中的焦点管理）：https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/#kbd_roving_tabindex'},
      {guidance: false, description: '不要嵌套 AvatarGroup，使用单个组包含所有头像。'},
      {guidance: false, description: '不要在子头像上设置 size。分组的 size 会覆盖每个子 Avatar 自身的 size prop，即使分组使用默认值也是如此——子头像的 size 在分组内会被静默忽略。'},
    ],
    anatomy: [
      {name: 'Avatar children', required: true, description: '构成重叠行的 Avatar 元素，每个都可有自己的 prop。'},
      {name: 'Overflow indicator', required: false, description: '末尾显示隐藏数量的 "+N" 圆形，或自定义 AvatarGroupOverflow 插槽。'},
    ],
  },
  theming: {
    targets: [
      {className: 'astryx-avatar-group', visualProps: ['size', 'shape']},
      {className: 'astryx-avatar-group-overflow', visualProps: ['size', 'shape']},
    ],
  },
  description: '以重叠布局堆叠显示头像，可选溢出指示器。子元素为 Avatar 元素。',
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: 'Avatar 子元素，可在其后跟一个 AvatarGroupOverflow。由使用方自行切分到期望的可见数量。',
      required: true,
      slotElements: [
        {
          __element: 'Avatar',
          props: {
            name: '用户',
          },
        },
      ],
    },
    {
      name: 'size',
      type:
        "'xsm' | 'sm' | 'md' | 'lg' | 'xl' | 16 | 20 | 24 | 32 | 36 | 40 | 48 | 60 | 64 | 72 | 96 | 128 | 144 | 180",
      description:
        "应用于所有头像的尺寸：命名尺寸为 'xsm'（20px）、'sm'（24px）、'md'（36px）、'lg'（48px）与 'xl'（128px）；数字尺寸必须是 type 中列出的像素值之一。分组的尺寸始终覆盖每个子 Avatar 的尺寸，包括分组使用默认尺寸时。",
      default: "'md'",
    },
    {
      name: 'shape',
      type: "'circle' | 'rounded' | 'square'",
      description: "通过 context 应用于所有头像的形状，覆盖每个头像自身的 shape prop。也应用于 AvatarGroupOverflow 的 \"+N\" 指示器。",
      default: "'circle'",
    },
    {
      name: 'ref',
      type: 'React.Ref<HTMLDivElement>',
      description: '转发到根元素的 ref。',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description: '用于布局自定义的 StyleX 样式。',
    },
    {
      name: 'data-testid',
      type: 'string',
      description: '供自动化测试框架使用的测试选择器。',
    },
  ],
  components: [
    {name: 'AvatarGroupOverflow'},
  ],
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsZh = {
  usage: {
    description:
      'AvatarGroup 以重叠排列方式显示多个头像，并可选择显示溢出指示器。使用组合式 API：直接传入 Avatar 子元素，每个头像可携带自己的属性。',
    bestPractices: [
      {guidance: true, description: '自行切分列表，只传入需要显示的头像，通常 3-5 个为佳。组件只渲染传入的子元素，不会自动切分。'},
      {guidance: true, description: '使用 AvatarGroupOverflow 自定义溢出内容，如弹出触发器或"添加成员"按钮。'},
      {guidance: true, description: '直接在每个 Avatar 子元素上传递状态点、点击处理器或工具提示。'},
      {guidance: true, description: '可以用 HoverCard 或 Tooltip 包裹 Avatar 子元素以在悬停时显示更多信息，头像仍会重叠。请在被包裹的 Avatar 上设置 tooltip={false}，避免与内置的名称提示冲突。'},
      {guidance: false, description: '不要嵌套 AvatarGroup，使用单个组包含所有头像。'},
      {guidance: false, description: '不要在子头像上设置 size。分组的 size 会覆盖每个子 Avatar 自身的 size，即使分组使用默认值也是如此。'},
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description: '组合式重叠头像行，支持 +N 溢出或自定义插槽',
  usage: {
    description:
      '重叠布局的堆叠头像展示。组合式 API：Avatar 子元素可带各自的 prop（状态点、点击）。可用 AvatarGroupOverflow 插槽自定义溢出。',
    bestPractices: [
      {guidance: true, description: '自行切分列表；只传可见头像（通常 3-5 个）。不自动切分。'},
      {guidance: true, description: '用 AvatarGroupOverflow 自定义溢出（弹出层、添加按钮）。'},
      {guidance: true, description: '状态点/点击处理器直接放在每个 Avatar 上。'},
      {guidance: true, description: '头像可用 HoverCard/Tooltip 包裹；重叠保持不变。在被包裹的 Avatar 上设 tooltip={false}。'},
      {guidance: true, description: '可交互头像（href/onClick）共享一个 Tab 停靠点；方向键在其间与溢出按钮间漫游（APG roving tabindex）。'},
      {guidance: false, description: '不要嵌套 AvatarGroup。'},
      {guidance: false, description: '不要在子头像上设 size；分组尺寸始终优先，默认值也不例外。'},
    ],
  },
};
