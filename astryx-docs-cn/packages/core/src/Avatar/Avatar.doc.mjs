// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'Avatar',
  displayName: 'Avatar',
  group: 'Avatar',
  category: 'Content',
  keywords: ["avatar","个人资料","用户","照片","缩略图","姓名首字母","gravatar","头像","用户头像"],
  usage: {
    description:
      'Avatar 用头像照片、姓名首字母或默认图标来表示个人或团队。可用于评论区头部、联系人列表、聊天消息、用户卡片，以及任何需要视觉标识身份的场景。',
    bestPractices: [
      {guidance: true, description: '务必传入 name：照片加载失败时头像可以显示首字母，屏幕阅读器也能播报它代表谁。'},
      {guidance: true, description: '按场景选择尺寸：行内提及用 xsm 或 sm，列表和卡片用 md 或 lg，个人资料页头部用 xl。'},
      {guidance: true, description: '在需要了解某人在线状态的场景（如聊天或团队视图）添加状态点。'},
      {guidance: true, description: '用自己的 Tooltip 或 HoverCard 包裹 Avatar 时，设置 tooltip={false}，避免内置名称提示与你的提示重叠。'},
      {guidance: true, description: '为每个可交互头像（href 或 onClick）提供 name 或 alt。它是控件的无障碍名称，缺失时在开发环境会发出警告。'},
      {guidance: false, description: '不要依赖状态标签为可交互头像命名。"Online" 说明不了链接去向。'},
      {guidance: false, description: '不要用 Avatar 展示 logo、产品图片或任何非个人/团队的内容。应改用图片或图标。'},
      {guidance: false, description: '不要用 xstyle 或 className 覆盖形状。应使用 shape prop，让主题可以全局控制。'},
    ],
    anatomy: [
      {name: 'Photo', required: false, description: '头像图片，从 src URL 加载，可用时显示。'},
      {name: 'Initials', required: false, description: '取 name 首尾两个词的首个字母、数字或表情符号；跳过标点。无照片时显示。名称中没有任何字母、数字或表情符号时改显默认图标。与照片一样，首字母是图像的一部分：辅助技术读的是 name，而不是这些字母。'},
      {name: 'Default icon', required: false, description: '通用的人物剪影。没有照片也没有 name 时显示。'},
      {name: 'Status dot', required: false, description: '右下角的小指示器，显示可用状态（在线、离开、忙碌）。每个变体将颜色与独特形状配对，状态不只靠颜色传达。'},
    ],
  },
  theming: {
    targets: [
      {className: 'astryx-avatar', visualProps: ['size', 'shape']},
      {className: 'astryx-avatar-fallback', visualProps: ['size']},
      {className: 'astryx-avatar-status-dot', visualProps: ['variant']},
      {className: 'astryx-avatar-status-dot-glyph', visualProps: ['shape']},
    ],
    vars: [
      {name: '--_avatar-group-overlap', description: 'AvatarGroup 中每个堆叠头像的负向行内偏移；组会按相同量内收起始边，让第一个头像保持在组内。由组尺寸推导；数值越负，堆叠越紧密。', default: '运行时按组头像尺寸（px）设置', private: true},
      {name: '--_avatar-radius', description: '头像包裹层、内容、焦点环以及 AvatarGroupOverflow "+N" 徽标的圆角。由 shapeStyles 按形状变体设置。', default: 'var(--radius-full)', private: true},
    ],
    derived: [
      {property: 'borderRadius', vars: ['--_avatar-radius']},
    ],
  },
  description: '显示用户头像：图片、首字母回退，以及可选的状态指示器。',
  props: [
    {
      name: 'src',
      type: 'string',
      description: '主图片源 URL。',
    },
    {
      name: 'fallbackSrc',
      type: 'string',
      description: '主图片加载失败时的回退图片。',
    },
    {
      name: 'name',
      type: 'string',
      description: '用于生成首字母和 alt 文本的用户名。',
    },
    {
      name: 'alt',
      type: 'string',
      description: 'alt 文本（回退到 name）。',
    },
    {
      name: 'size',
      type:
        "'xsm' | 'sm' | 'md' | 'lg' | 'xl' | 16 | 20 | 24 | 32 | 36 | 40 | 48 | 60 | 64 | 72 | 96 | 128 | 144 | 180",
      description:
        "Avatar 尺寸：命名尺寸为 'xsm'（20px）、'sm'（24px）、'md'（36px）、'lg'（48px）与 'xl'（128px）；数字尺寸必须是 type 中列出的像素值之一。在 AvatarGroup 内，组的尺寸始终覆盖该 prop，包括组使用默认尺寸时。",
      default: "'md'",
    },
    {
      name: 'shape',
      type: "'circle' | 'rounded' | 'square'",
      description: "头像的形状变体。'circle'（默认）保持正圆。'rounded' 使用元素圆角令牌，与 UI 圆角一致，并可通过主题全局设置。'square' 无圆角。状态点位置自动适配：circle 在四点钟方向，rounded/square 在右下角。",
      default: "'circle'",
    },
    {
      name: 'status',
      type: 'ReactNode',
      description: '状态指示器的角落内容。AvatarStatusDot 会把 `label` 上报给头像，头像将其合成进无障碍名称（如 "Jane Doe, Online"），屏幕阅读器据此播报状态。上报经 context 传递，因此状态点位于你自己的包裹组件内时依然有效。',
      slotElements: [
        {
          __element: 'AvatarStatusDot',
          props: {
            variant: 'success',
            label: '在线',
          },
        },
      ],
    },
    {
      name: 'tooltip',
      type: 'string | boolean',
      description:
        "悬停与键盘聚焦时显示的 Tooltip。省略或 true 显示头像的 name；字符串则显示该文本；false 不显示。被你自己的 Tooltip/HoverCard 包裹时不会自动禁用；若自带浮层，请设置 tooltip={false}。tooltip 为 true/省略且没有 name 时不显示 Tooltip。",
      default: 'true',
    },
    {
      name: 'href',
      type: 'string',
      description:
        '设置后头像渲染为指向该地址的可交互链接（`<a>` 或自定义链接组件），遵循与 Button 相同的元素替换规则。必须通过 `alt` 或 `name` 提供有意义的无障碍名称：缺失时开发环境会发出警告。在 AvatarGroup 内，可交互头像共享一个 Tab 停靠点，用方向键到达。',
    },
    {
      name: 'as',
      type: 'ElementType',
      description:
        '设置 `href` 时使用的自定义链接组件（如 `next/link`）。覆盖 provider 级 LinkProvider 默认值。仅在设置 `href` 时生效。',
    },
    {
      name: 'target',
      type: 'string',
      description: '链接 target 属性。仅在设置 `href` 时生效。',
    },
    {
      name: 'rel',
      type: 'string',
      description: '链接 rel 属性。仅在设置 `href` 时生效。',
    },
    {
      name: 'onClick',
      type: '(e: MouseEvent) => void',
      description:
        '点击处理器。设置了它但未设 `href` 时，头像渲染为可聚焦的 `<button type="button">`。必须通过 `alt` 或 `name` 提供有意义的无障碍名称：缺失时开发环境会发出警告。',
    },
  ],
  components: [
    {name: 'AvatarStatusDot'},
  ],
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsZh = {
  usage: {
    description:
      'Avatar 显示用户或实体的头像图片，加载失败时自动回退到首字母或默认图标。在界面各处与用户信息搭配，可视化呈现个人、团队或实体。',
    bestPractices: [
      {guidance: true, description: '务必提供 name prop，图片加载失败时组件才能生成有意义的首字母与 alt 文本。'},
      {guidance: true, description: '场景相关时，用 status 插槽搭配 AvatarStatusDot 表示在线状态或可用性。'},
      {guidance: true, description: '为每个可交互头像（href 或 onClick）提供 name 或 alt。它是控件的无障碍名称，缺失时在开发环境会发出警告。'},
      {guidance: false, description: '不要用 Avatar 展示不代表人或实体的装饰图片或 logo。应改用图片或图标组件。'},
      {guidance: false, description: '不要覆盖圆形形状。头像始终为圆形，以保持系统视觉一致性。'},
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description: '个人/团队头像：照片 → 首字母 → 图标的回退链',
  usage: {
    description:
      'Avatar 用照片、首字母或默认图标表示个人或团队，自动回退。用于评论区头部、联系人列表、聊天、用户卡片。',
    bestPractices: [
      {guidance: true, description: '务必传 name，用于首字母回退与屏幕阅读器 alt 文本。'},
      {guidance: true, description: '尺寸匹配场景：行内 xsm/sm，列表 md/lg，个人资料页 xl。'},
      {guidance: true, description: '在聊天或团队视图等关注可用性的场景加状态点。'},
      {guidance: true, description: '用自己的 Tooltip 或 HoverCard 包裹 Avatar 时，设置 tooltip={false}，避免内置名称提示与你的提示重叠。'},
      {guidance: true, description: '可交互头像（href/onClick）需要 name 或 alt；缺失时开发环境警告。'},
      {guidance: false, description: '不要依赖状态标签为可交互头像命名。"Online" 说明不了链接去向。'},
      {guidance: false, description: '不要用于 logo 或产品图片；应改用图片或图标。'},
      {guidance: false, description: '不要强制方形或自定义形状；头像始终为圆形。'},
    ],
  },
  propDescriptions: {
    src: '主图片源 URL',
    fallbackSrc: '主图失败时的回退图片',
    name: '用于首字母与 alt 文本的用户名',
    alt: 'alt 文本；回退到 name',
    size: "命名尺寸：'xsm' 20px、'sm' 24px、'md' 36px、'lg' 48px、'xl' 128px；数字 px 限于 type 列出的值。AvatarGroup 的尺寸始终优先，默认尺寸也不例外。",
    status:
      '状态指示器的角落内容；AvatarStatusDot 上报 `label` 并合成进头像无障碍名称（"Jane Doe, Online"），任意嵌套深度都有效',
    tooltip:
      "悬停/聚焦 Tooltip。true/省略 → name；字符串 → 该文本；false → 不显示。自带 Tooltip；用自己的 Tooltip/HoverCard 包裹时设 false。默认 true。",
    href: '将头像渲染为链接（<a>/自定义）。需要 alt/name 作为无障碍名称；缺失时开发环境警告。与 Button 相同的元素替换规则。',
    as: 'href 使用的自定义链接组件（如 Next Link）。仅在设置 href 时生效。',
    target: '链接 target。仅在设置 href 时生效。',
    rel: '链接 rel。仅在设置 href 时生效。',
    onClick: '点击处理器 → 无 href 时渲染 <button>。需要 alt/name；缺失时开发环境警告。',
  },
  components: [
    {name: 'AvatarStatusDot', description: '渲染在 Avatar 角落的尺寸感知状态指示器'},
  ],
};
