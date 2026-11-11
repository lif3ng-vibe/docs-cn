// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'LineClamp',
  displayName: 'Line Clamp',
  category: 'Layout',
  keywords: [
    'clamp',
    '截断',
    'truncate',
    '省略号',
    'ellipsis',
    '溢出',
    'overflow',
    '行数',
    '多行',
    'multiline',
    '文本',
    'LineClamp',
  ],
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description:
        '要截断的内容：混合内联内容、嵌套元素，任何你不想包进单个 Text 的内容。',
      required: true,
    },
    {
      name: 'maxLines',
      type: 'number',
      description:
        '以省略号截断前显示的最大行数。',
      required: true,
    },
    {
      name: 'hasTruncateTooltip',
      type: 'boolean',
      description:
        '截断时在悬停或键盘聚焦时显示完整文本内容的工具提示。被截断的根元素可聚焦（tabindex 0），让键盘用户能触达工具提示；你传入的 tabIndex 优先。工具提示相关 prop 跟随 Text：当 Text 的 hasTruncateTooltip 在次版本中改名时，LineClamp 随之改名。',
      default: 'true',
    },
    {
      name: 'truncateTooltipPlacement',
      type: "'above' | 'below' | 'start' | 'end'",
      description: '截断工具提示的打开位置。',
      default: "'above'",
    },
    {
      name: 'as',
      type: "'div' | 'span' | 'p'",
      description: '要渲染的 HTML 元素。',
      default: "'div'",
    },
  ],
  usage: {
    description:
      "以省略号将任意内容截断为固定行数。Text 的 maxLines 截断 Text 元素自身；LineClamp 截断它包裹的任何内容且不附加自己的排版，因此适合混合内联内容和嵌套元素，不改变其字体、颜色或换行。截断检测复用 useTruncation（与 Text 使用的同一 Hook），即使 -webkit-line-clamp 裁剪了 scrollHeight 也能正确测量溢出。",
    bestPractices: [
      {
        guidance: true,
        description:
          '截断混合或组合内容块（而非单个 Text 节点）时使用 LineClamp。',
      },
      {
        guidance: true,
        description:
          '截断单个 Text 节点时用 Text 自身的 maxLines prop——无需用 LineClamp 包裹。',
      },
      {
        guidance: true,
        description:
          '当截断内容已在页面其他位置可访问时禁用工具提示（hasTruncateTooltip={false}），避免重复播报。',
      },
      {
        guidance: true,
        description:
          '只有同时满足以下两点时，LineClamp 才会把可聚焦的后代设为 inert：(1) 它在截断容器自己的文档流中。若定位元素的包含块是容器内同样处于文档流中的元素（例如控件自己的定位包装元素），该定位元素也算在文档流中，此时按该包含块的盒子判断是否越过最后一行。fixed 元素、包含块是容器本身或位于容器之外的 absolute 元素、顶层元素（popover 或 dialog），以及通过 portal 渲染到别处的内容，各自开启一个无论多深都不会被设为 inert 的子树。(2) 它的盒子完全位于最后一个可见行之外。只要有一部分可见，控件就保持可达。检查时没有盒子的可聚焦元素会被视为位于最后一行之外，直到它获得盒子；届时 LineClamp 会重新检查。LineClamp 会在尺寸、内容或字体变化时重新检查。已知缺口：被容器本身截断的绝对定位控件仍是一个 Tab 停靠点；容器内的定位内容由作者负责。inert 会把这类控件移出 Tab 顺序和无障碍树。LineClamp 不会改写你自己设置的 tabIndex 或 aria-hidden，持有焦点的元素也不会被设为 inert。',
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docsZh = {
  name: 'LineClamp',
  displayName: 'Line Clamp',
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description:
        '要截断的内容。LineClamp 包裹任意子节点（混合内联内容、嵌套元素）并截断整个区块，而不是单个 Text 组件。',
      required: true,
    },
    {
      name: 'maxLines',
      type: 'number',
      description: '截断前显示的最大行数。',
      required: true,
    },
    {
      name: 'hasTruncateTooltip',
      type: 'boolean',
      description:
        '截断时在悬停或键盘聚焦时显示完整文本的工具提示；被截断的根元素可聚焦（tabindex 0），你传入的 tabIndex 优先。工具提示相关属性与 Text 保持一致：Text 的 hasTruncateTooltip 在次版本中改名时，LineClamp 随之改名。',
      default: 'true',
    },
    {
      name: 'truncateTooltipPlacement',
      type: "'above' | 'below' | 'start' | 'end'",
      description: '截断工具提示的打开位置。',
      default: "'above'",
    },
    {
      name: 'as',
      type: "'div' | 'span' | 'p'",
      description: '要渲染的 HTML 元素。',
      default: "'div'",
    },
  ],
  usage: {
    description:
      '将任意内容截断为固定行数并显示省略号。Text 的 maxLines 截断 Text 组件自身的内容；LineClamp 是可组合版本 —— 用它包裹任意子节点（混合内联内容、嵌套元素）即可将整个区块截断为 N 行。',
    bestPractices: [
      {
        guidance: true,
        description:
          '当需要截断混合或组合内容（而非单个 Text 节点）时使用 LineClamp。',
      },
      {
        guidance: true,
        description:
          '截断单个 Text 节点时使用 Text 自身的 maxLines 属性，无需用 LineClamp 包裹。',
      },
      {
        guidance: true,
        description:
          '当截断内容已在页面其他位置可访问时，禁用工具提示（hasTruncateTooltip={false}）以避免重复播报。',
      },
      {
        guidance: true,
        description:
          '只有同时满足以下两点时，LineClamp 才会把可聚焦的后代设为 inert：(1) 它在截断容器自己的文档流中。若定位元素的包含块是容器内同样处于文档流中的元素（例如控件自己的定位包装元素），该定位元素也算在文档流中，此时按该包含块的盒子判断是否越过最后一行。fixed 元素、包含块是容器本身或位于容器之外的 absolute 元素、顶层元素（popover 或 dialog），以及通过 portal 渲染到别处的内容，各自开启一个无论多深都不会被设为 inert 的子树。(2) 它的盒子完全位于最后一个可见行之外。只要有一部分可见，控件就保持可达。检查时没有盒子的可聚焦元素会被视为位于最后一行之外，直到它获得盒子；届时 LineClamp 会重新检查。LineClamp 会在尺寸、内容或字体变化时重新检查。已知缺口：被容器本身截断的绝对定位控件仍是一个 Tab 停靠点；容器内的定位内容由作者负责。LineClamp 不会改写你自己设置的 tabIndex 或 aria-hidden，持有焦点的元素也不会被设为 inert。',
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description:
    '以省略号将任意内容截断为 N 行；Text maxLines 的可组合版本。',
  usage: {
    description:
      '包裹任意 children（混合内联内容、嵌套元素），将整个区块截断为 N 行。复用 useTruncation 做溢出检测。',
    bestPractices: [
      {
        guidance: true,
        description:
          '用于截断混合/组合内容块，而非单个 Text 节点。',
      },
      {
        guidance: true,
        description: '单个 Text 节点改用 Text 自身的 maxLines。',
      },
      {
        guidance: true,
        description:
          '内容已在别处可访问时禁用工具提示，避免重复播报。',
      },
      {
        guidance: true,
        description:
          '仅对处于截断容器自身文档流中、且盒子完全越过最后可见行的可聚焦元素设为 inert（相对容器内处于文档流的包含块定位的元素——如控件自己的包装元素——算在文档流中，按该包含块的盒子判断）；fixed、逃逸的 absolute、顶层或 portal 子树内绝不设为 inert；部分可见的控件保持可达；检查时没有盒子的可聚焦元素视为越过最后一行，直到获得盒子；尺寸、内容、字体变化时重新检查。缺口：被容器截断的绝对定位控件仍是 Tab 停靠点。持有焦点的元素绝不设为 inert，也绝不改写你自己的 tabIndex 或 aria-hidden。',
      },
    ],
  },
  propDescriptions: {
    children:
      '要截断的内容。maxLines 的可组合版本——包裹任意 children。',
    maxLines: '以省略号截断前的最大行数。',
    hasTruncateTooltip:
      '截断时悬停或聚焦显示完整文本的工具提示。被截断的根元素可聚焦。prop 名跟随 Text。',
    truncateTooltipPlacement: "工具提示位置。默认 'above'。",
    as: "要渲染的 HTML 元素。默认 'div'。",
  },
};
