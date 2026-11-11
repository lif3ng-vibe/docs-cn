// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'AvatarGroupOverflow',
  subComponentOf: 'AvatarGroup',
  displayName: 'Avatar Group Overflow',
  isHiddenFromOverview: true,
  description:
    'AvatarGroup 的溢出指示器。用于显示隐藏头像数量，可自定义计数字符串或作为按钮使用。',
  props: [
    {
      name: 'count',
      type: 'number',
      description:
        '隐藏头像数量，用于默认 `+N` 标签和无障碍标签。',
      required: true,
    },
    {
      name: 'children',
      type: 'ReactNode',
      description:
        '可选的自定义计数字符串，渲染在指示器内。省略时使用默认 `+N` 标签。',
    },
    {
      name: 'onClick',
      type: '() => void',
      description:
        '点击溢出指示器时触发。提供后指示器会渲染为可聚焦按钮。',
    },
    {
      name: 'ref',
      type: 'React.Ref<HTMLElement>',
      description: '转发到溢出指示器元素的引用。',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description: 'stylex.create() 的值——不是内联样式对象。',
    },
  ],
  playground: {
    defaults: {
      count: 2,
      children: '+2',
    },
  },
  usage: {
    description:
      'AvatarGroupOverflow 显示在 AvatarGroup 末尾，用来汇总未单独展示的成员。适用于只展示少量头像但仍需要显示隐藏数量的场景。',
    bestPractices: [
      {guidance: true, description: '向 `count` 传入真实隐藏数量，确保无障碍标签与可见指示器一致。'},
      {guidance: true, description: '使用 `+12` 或 `99+` 等短文本；指示器在计数较短时为圆形，计数较宽时会拉伸为胶囊形，确保数字始终完整显示。'},
      {guidance: true, description: '当溢出项会打开成员列表、弹出层或详情视图时提供 `onClick`。'},
      {guidance: false, description: '不要让自定义文本与 `count` 不一致；`count` 仍用于无障碍标签。'},
      {guidance: false, description: '不要在指示器内使用长标签；更长的参与者详情应放在头像组旁边。'},
    ],
    anatomy: [
      {name: 'Count label', required: true, description: '显示在圆形指示器内的紧凑 `+N` 或自定义计数文本。'},
      {name: 'Button behavior', required: false, description: '提供 `onClick` 时，指示器变为可交互按钮，具备聚焦与悬停状态。'},
    ],
  },
  examples: [
    {
      label: '默认溢出计数',
      code: `
<AvatarGroup size="lg">
  {users.slice(0, 3).map(user => (
    <Avatar key={user.id} src={user.src} name={user.name} />
  ))}
  <AvatarGroupOverflow count={users.length - 3} />
</AvatarGroup>
`,
    },
    {
      label: '自定义计数文本',
      code: `
<AvatarGroup size="lg">
  {users.slice(0, 3).map(user => (
    <Avatar key={user.id} src={user.src} name={user.name} />
  ))}
  <AvatarGroupOverflow count={12}>12+</AvatarGroupOverflow>
</AvatarGroup>
`,
    },
  ],
};

export const docsZh = {
  name: 'AvatarGroupOverflow',
  isHiddenFromOverview: true,
  displayName: 'Avatar Group Overflow',
  description:
    'AvatarGroup 的溢出指示器。用于显示隐藏头像数量，可自定义计数字符串或作为按钮使用。',
  propDescriptions: {
    count: '隐藏头像数量，用于默认 `+N` 标签和无障碍标签。',
    children: '可选的自定义计数字符串。省略时使用默认 `+N` 标签。',
    onClick: '点击溢出指示器时触发。提供后指示器会渲染为可聚焦按钮。',
    ref: '转发到溢出指示器元素的引用。',
    xstyle: '用于布局自定义的 StyleX 样式。',
  },
  usage: {
    description:
      'AvatarGroupOverflow 显示在 AvatarGroup 末尾，用来汇总未单独展示的成员。适用于只展示少量头像但仍需要显示隐藏数量的场景。',
    bestPractices: [
      {guidance: true, description: '向 `count` 传入真实隐藏数量，确保无障碍标签与可见指示器一致。'},
      {guidance: true, description: '使用 `+12` 或 `99+` 等短文本；指示器在计数较短时为圆形，计数较宽时会拉伸为胶囊形，确保数字始终完整显示。'},
      {guidance: true, description: '当溢出项会打开成员列表、弹出层或详情视图时提供 `onClick`。'},
      {guidance: false, description: '不要让自定义文本与 `count` 不一致；`count` 仍用于无障碍标签。'},
      {guidance: false, description: '不要在指示器内使用长标签；更长的参与者详情应放在头像组旁边。'},
    ],
  },
};

export const docsDense = {
  name: 'AvatarGroupOverflow',
  isHiddenFromOverview: true,
  displayName: 'Avatar Group Overflow',
  description: 'AvatarGroup 的溢出指示器；默认 +N 或自定义短计数文本',
  propDescriptions: {
    count: '隐藏头像数量；决定默认 +N 与 aria 标签',
    children: '可选的自定义短计数文本，如 +12 或 99+',
    onClick: '点击处理器；设置后渲染为可聚焦按钮',
    ref: '转发的 ref',
    xstyle: 'stylex.create() 的值——不是内联样式对象',
  },
  usage: {
    description:
      '放在 AvatarGroup 末尾，在切分出可见头像后汇总隐藏成员。',
    bestPractices: [
      {guidance: true, description: '向 `count` 传真实隐藏数量以保证无障碍。'},
      {guidance: true, description: '自定义文本要短：`+12`、`99+`。'},
      {guidance: true, description: '用 `onClick` 打开成员列表/弹出层/详情。'},
      {guidance: false, description: '不要让自定义文本与 `count` 矛盾；无障碍标签仍由 `count` 提供。'},
      {guidance: false, description: '不要在头像大小的圆形内放长标签。'},
    ],
  },
};
