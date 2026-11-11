// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'AspectRatio',
  displayName: 'Aspect Ratio',
  category: 'Layout',
  keywords: ["aspect-ratio","比例","宽高比","响应式","嵌入","容器","宽屏","缩略图","留边","裁剪"],
  usage: {
    description:
      '在容器尺寸变化时为子元素保持固定的宽高比。适用于视频、图片、缩略图等媒体容器，或任何需要一致比例的内容。宽度取自容器，高度由比例推导，因此需要具有确定宽度的祖先元素。',
    bestPractices: [
      {guidance: true, description: '为可读性起见，比例写成分数形式——用 `ratio={16 / 9}` 而非 `ratio={1.78}`。它是数字，字符串形式 `ratio="16/9"` 会导致类型错误。'},
      {guidance: true, description: '用于需要在不同屏幕尺寸下保持一致比例的媒体。'},
      {guidance: true, description: '图片和视频使用 `fit="cover"`，让组件来定子元素尺寸；子元素不应重复设置 `width`/`height`/`objectFit` 样式。'},
      {guidance: true, description: '只传一个子元素。设置 `fit` 后，每个直接子元素都会被拉伸填满比例框，因此遮罩层或说明文字应放在单个包裹子元素内，而不要作为第二个子元素传入。'},
      {guidance: true, description: '用 `alt` 描述媒体子元素；图片纯装饰时用 `alt=""`。AspectRatio 自身不添加 role，也没有无障碍名称，因此无障碍描述完全由子元素承担。'},
      {guidance: true, description: '需要随断点变化的比例时，做响应式覆盖：通过 `xstyle`（StyleX）传入 `aspectRatio` 规则，或在自己未分层的 CSS 中用 `@media`/`@container` 规则覆盖 `aspect-ratio`；组件样式位于 `astryx-base` 级联层，因此未分层的消费者 CSS 优先。`xstyle` 规则在条件分支之外还要有 `default` 分支（`{default: 3, \'@container ...\': \'3 / 2\'}`）；只有条件分支时，查询之外的比例未被设置，比例框会塌陷。'},
      {guidance: false, description: '不要用作一般布局容器；应使用标准布局组件。'},
      {guidance: false, description: '不要嵌套 AspectRatio 容器；一层就够了。'},
      {guidance: false, description: '不要单独约束高度。宽度来自容器，单独的 `height` 或 `maxHeight` 会让比例框偏离比例；若要从高度出发定尺寸，请搭配 `width: "auto"`。'},
      {guidance: false, description: '不要放进收缩适应（shrink-to-fit）的父容器，如 `inline-flex`、`width: fit-content` 或浮动盒子。它在其中不贡献固有宽度，会塌陷为零。'},
    ],
    anatomy: [
      {name: 'Ratio box', required: true, description: '承载宽高比并裁剪溢出内容的外层元素。携带 `astryx-aspect-ratio` 主题目标；`shape` 为 `ellipse` 时应用椭圆裁剪。'},
      {name: 'Content slot', required: true, description: '填满比例框并为子元素定位的包裹层。设置 `fit` 时它还负责子元素的尺寸；未设置时子元素自行设置样式。'},
    ],
  },
  props: [
    {
      name: 'ratio',
      type: 'number',
      description: '宽高比，以宽/高表示（例如 16/9、1）。以类级声明输出（非内联样式），可通过 `xstyle` 规则或未分层的（unlayered）消费者 CSS 做响应式覆盖。',
      required: true,
    },
    {
      name: 'shape',
      type: "'rectangle' | 'ellipse'",
      description: '容器形状。两种形状都遵循 `ratio`。`ellipse` 裁剪为椭圆（`ratio={1}` 时为正圆）。',
      default: "'rectangle'",
    },
    {
      name: 'fit',
      type: "'cover' | 'contain' | 'center'",
      description: '子元素在比例框内的布局方式。`cover` 填满并裁剪媒体，`contain` 填满并留边，`center` 保持原始尺寸居中。省略时子元素自行设置样式。',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: '通过绝对定位填充容器的内容。',
      required: true,
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于布局自定义的 StyleX 样式（外边距、定位、尺寸）。必须是 stylex.create() 的值，而不是像 style={{}} 这样的内联样式对象。',
    },
  ],
  playground: {
    defaults: {
      ratio: 16 / 9,
      children: {__element: 'Center', props: {height: '100%'}, children: {__element: 'Text', props: {color: 'secondary'}, children: '16:9'}},
    },
  },
  theming: {
    targets: [
      {className: 'astryx-aspect-ratio', visualProps: ['shape']},
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docsZh = {
  name: 'AspectRatio',
  displayName: 'Aspect Ratio',
  usage: {
    description:
      '在容器尺寸变化时为子元素保持固定的宽高比。适用于视频、图片、缩略图等媒体容器，或任何需要一致比例的内容。宽度取自容器，高度由比例推导，因此需要具有确定宽度的祖先元素。',
    bestPractices: [
      {guidance: true, description: '为可读性起见，比例写成分数形式——用 `ratio={16 / 9}` 而非 `ratio={1.78}`。它是数字，字符串形式 `ratio="16/9"` 会导致类型错误。'},
      {guidance: true, description: '用于需要在不同屏幕尺寸下保持一致比例的媒体。'},
      {guidance: true, description: '图片和视频使用 `fit="cover"`，让组件来定子元素尺寸；子元素不应重复设置 `width`/`height`/`objectFit` 样式。'},
      {guidance: true, description: '只传一个子元素。设置 `fit` 后，每个直接子元素都会被拉伸填满比例框，因此遮罩层或说明文字应放在单个包裹子元素内，而不要作为第二个子元素传入。'},
      {guidance: true, description: '用 `alt` 描述媒体子元素；图片纯装饰时用 `alt=""`。AspectRatio 自身不添加 role，也没有无障碍名称，因此无障碍描述完全由子元素承担。'},
      {guidance: true, description: '需要随断点变化的比例时，做响应式覆盖：通过 `xstyle`（StyleX）传入 `aspectRatio` 规则，或在自己未分层的 CSS 中用 `@media`/`@container` 规则覆盖 `aspect-ratio`；组件样式位于 `astryx-base` 级联层，因此未分层的消费者 CSS 优先。`xstyle` 规则在条件分支之外还要有 `default` 分支（`{default: 3, \'@container ...\': \'3 / 2\'}`）；只有条件分支时，查询之外的比例未被设置，比例框会塌陷。'},
      {guidance: false, description: '不要用作一般布局容器；应使用标准布局组件。'},
      {guidance: false, description: '不要嵌套 AspectRatio 容器；一层就够了。'},
      {guidance: false, description: '不要单独约束高度。宽度来自容器，单独的 `height` 或 `maxHeight` 会让比例框偏离比例；若要从高度出发定尺寸，请搭配 `width: "auto"`。'},
      {guidance: false, description: '不要放进收缩适应（shrink-to-fit）的父容器，如 `inline-flex`、`width: fit-content` 或浮动盒子。它在其中不贡献固有宽度，会塌陷为零。'},
    ],
    anatomy: [
      {name: 'Ratio box', required: true, description: '承载宽高比并裁剪溢出内容的外层元素。携带 `astryx-aspect-ratio` 主题目标；`shape` 为 `ellipse` 时应用椭圆裁剪。'},
      {name: 'Content slot', required: true, description: '填满比例框并为子元素定位的包裹层。设置 `fit` 时它还负责子元素的尺寸；未设置时子元素自行设置样式。'},
    ],
  },
  props: [
    {name: 'ratio', type: 'number', description: '宽高比，以宽/高表示（例如 16/9、1）。以类级声明输出（非内联样式），可通过 `xstyle` 规则或未分层的（unlayered）消费者 CSS 做响应式覆盖。', required: true},
    {
      name: 'shape',
      type: "'rectangle' | 'ellipse'",
      description: '容器形状。两种形状都遵循 `ratio`。`ellipse` 裁剪为椭圆（`ratio={1}` 时为正圆）。',
      default: "'rectangle'",
    },
    {
      name: 'fit',
      type: "'cover' | 'contain' | 'center'",
      description: '子元素在比例框内的布局方式。`cover` 填满并裁剪媒体，`contain` 填满并留边，`center` 保持原始尺寸居中。省略时子元素自行设置样式。',
    },
    {name: 'children', type: 'ReactNode', description: '通过绝对定位填充容器的内容。', required: true},
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于布局自定义的 StyleX 样式（外边距、定位、尺寸）。必须是 stylex.create() 的值，而不是像 style={{}} 这样的内联样式对象。',
    },
  ],
  theming: {
    targets: [
      {className: 'astryx-aspect-ratio', visualProps: ['shape']},
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description: '为子元素保持固定的宽高比',
  usage: {
    description:
      '在容器尺寸变化时为子元素保持固定的宽高比。适用于视频、图片、缩略图等媒体容器，或任何需要一致比例的内容。宽度取自容器，高度由比例推导，因此需要具有确定宽度的祖先元素。',
    bestPractices: [
      {guidance: true, description: '为可读性起见，比例写成分数形式——用 `ratio={16 / 9}` 而非 `ratio={1.78}`。它是数字，字符串形式 `ratio="16/9"` 会导致类型错误。'},
      {guidance: true, description: '用于需要在不同屏幕尺寸下保持一致比例的媒体。'},
      {guidance: true, description: '图片和视频使用 `fit="cover"`，让组件来定子元素尺寸；子元素不应重复设置 `width`/`height`/`objectFit` 样式。'},
      {guidance: true, description: '只传一个子元素。设置 `fit` 后，每个直接子元素都会被拉伸填满比例框，因此遮罩层或说明文字应放在单个包裹子元素内，而不要作为第二个子元素传入。'},
      {guidance: true, description: '用 `alt` 描述媒体子元素；图片纯装饰时用 `alt=""`。AspectRatio 自身不添加 role，也没有无障碍名称，因此无障碍描述完全由子元素承担。'},
      {guidance: true, description: '需要随断点变化的比例时，做响应式覆盖：通过 `xstyle`（StyleX）传入 `aspectRatio` 规则，或在自己未分层的 CSS 中用 `@media`/`@container` 规则覆盖 `aspect-ratio`；组件样式位于 `astryx-base` 级联层，因此未分层的消费者 CSS 优先。`xstyle` 规则在条件分支之外还要有 `default` 分支（`{default: 3, \'@container ...\': \'3 / 2\'}`）；只有条件分支时，查询之外的比例未被设置，比例框会塌陷。'},
      {guidance: false, description: '不要用作一般布局容器；应使用标准布局组件。'},
      {guidance: false, description: '不要嵌套 AspectRatio 容器；一层就够了。'},
      {guidance: false, description: '不要单独约束高度。宽度来自容器，单独的 `height` 或 `maxHeight` 会让比例框偏离比例；若要从高度出发定尺寸，请搭配 `width: "auto"`。'},
      {guidance: false, description: '不要放进收缩适应（shrink-to-fit）的父容器，如 `inline-flex`、`width: fit-content` 或浮动盒子。它在其中不贡献固有宽度，会塌陷为零。'},
    ],
    anatomy: [
      {name: 'Ratio box', required: true, description: '承载宽高比并裁剪溢出内容的外层元素。携带 `astryx-aspect-ratio` 主题目标；`shape` 为 `ellipse` 时应用椭圆裁剪。'},
      {name: 'Content slot', required: true, description: '填满比例框并为子元素定位的包裹层。设置 `fit` 时它还负责子元素的尺寸；未设置时子元素自行设置样式。'},
    ],
  },
  propDescriptions: {
    ratio: '宽/高比例（如 16/9、1）；以类级声明输出（绝不内联），xstyle/未分层 CSS 的 @container 覆盖可生效',
    shape: "容器形状：'rectangle'（默认）| 'ellipse'（比例为 1 时为正圆）",
    fit: "子元素布局：'cover' 填满 + 裁剪 | 'contain' 填满 + 留边 | 'center' 原始尺寸；省略 = 子元素自行设置样式",
    children: '绝对定位填满容器的内容',
    xstyle: '通过 stylex.create() 自定义 StyleX 布局',
  },
};
