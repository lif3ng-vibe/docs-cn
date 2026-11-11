// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentAnatomyElement[]} */
const anatomy = [
  {
    name: 'Text',
    required: true,
    description:
      '多态文本元素，以主题化排版渲染所提供的内容。',
  },
  {
    name: 'Heading',
    required: false,
    description:
      '引用的 Heading 成员，将所提供内容渲染为语义化 h1-h6 元素。',
  },
  {
    name: 'Truncation tooltip',
    required: false,
    description:
      '由工具提示拥有的表面，仅在 Text 或 Heading 被测量为已截断且截断工具提示启用时可用。',
  },
];

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'Text',
  displayName: 'Text',
  category: 'Content',
  keywords: [
    'text',
    'typography',
    '标签',
    '段落',
    'heading',
    '说明文字',
    '字体',
    '正文',
    '副标题',
  ],
  playground: {
    defaults: {
      children: '敏捷的棕色狐狸跳过了懒惰的狗。',
      type: 'body',
    },
  },
  theming: {
    targets: [
      {
        className: 'astryx-heading',
        visualProps: ['level', 'color', 'type', 'weight'],
      },
      {className: 'astryx-text', visualProps: ['type', 'size', 'color']},
    ],
  },
  description:
    '语义化正文文本组件，以主题中基于 type 的样式渲染文本，并带有可选的截断、装饰和布局 prop。',
  props: [
    {
      name: 'type',
      type: "'body' | 'large' | 'label' | 'supporting' | 'code' | 'display-1' | 'display-2' | 'display-3' | 'inherit'",
      description:
        "语义化文本类型。从主题决定字号、字重和行高。'inherit' 则三者都取自周围文本。主题可添加自定义类型。注意：该 prop 名为 `type`，而不是 `variant`。",
      default: "'body'",
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: '文本内容。',
      required: true,
    },
    {
      name: 'size',
      type: "'4xs' | '3xs' | '2xs' | 'xsm' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'",
      description:
        '显式字号覆盖。覆盖来自 `type` 的字号，但保留其他 type 属性。建议只用 `type`。',
    },
    {
      name: 'color',
      type: "'primary' | 'secondary' | 'disabled' | 'placeholder' | 'accent' | 'inherit'",
      description:
        "文本颜色。'supporting' 类型默认为 'secondary'，其余默认为 'primary'。主题可添加自定义颜色。",
    },
    {
      name: 'weight',
      type: "'normal' | 'medium' | 'semibold' | 'bold'",
      description: '字重覆盖。',
    },
    {
      name: 'display',
      type: "'inline' | 'block'",
      description:
        "显示类型。当 maxLines > 0 或 hasCapsize 为 true 时静默覆盖为 'block'。",
      default: "'inline'",
    },
    {
      name: 'as',
      type: "'span' | 'p' | 'div' | 'label'",
      description: '要渲染的 HTML 元素。',
      default: "'span'",
    },
    {
      name: 'maxLines',
      type: 'number',
      description:
        '截断前的最大行数。0 表示不截断。设置后，若内容被截断，悬停时显示工具提示。',
      default: '0',
    },
    {
      name: 'hasTruncateTooltip',
      type: "boolean | 'above' | 'below' | 'start' | 'end'",
      description:
        "控制截断文本的工具提示行为。true 在默认位置显示工具提示，false 禁用，或用放置字符串（'above' | 'below' | 'start' | 'end'）指定位置。",
      default: 'true',
    },
    {
      name: 'wordBreak',
      type: "'break-word' | 'break-all'",
      description:
        "截断时的断词行为。单行截断默认为 'break-all'，其他情况默认为 'break-word'。不截断时，超过一行宽度的长串（如 URL、ID）会换行（`overflow-wrap: break-word`），因此在普通文档流中文本不会让页面横向滚动。在 flex 行中，请为 flex 子元素设置 `min-width: 0` 以便其收缩。你自己设置了 `overflow-wrap: anywhere` 的容器不会作用于此文本；Astryx 自带的容器会传递其换行方式。",
    },
    {
      name: 'textWrap',
      type: "'wrap' | 'nowrap' | 'balance' | 'pretty'",
      description: '文本换行行为。',
    },
    {
      name: 'justify',
      type: "'start' | 'center' | 'end'",
      description:
        '文本对齐（两端对齐）。使用逻辑值（start/end）以兼容 i18n/RTL。',
      default: "'start'",
    },
    {
      name: 'hasCapsize',
      type: 'boolean',
      description:
        '使用 text-box-trim 启用光学对齐。强制块级显示。',
      default: 'false',
    },
    {
      name: 'hasStrikethrough',
      type: 'boolean',
      description: '应用删除线文本装饰。',
      default: 'false',
    },
    {
      name: 'hasTabularNumbers',
      type: 'boolean',
      description: '对需要纵向对齐的数字数据使用表格（等宽）数字。',
      default: 'false',
    },
    {
      name: 'id',
      type: 'string',
      description: 'HTML id 属性。',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于布局自定义（外边距、定位、尺寸）的 StyleX 样式。必须是 stylex.create() 的值：不能是 style={{}} 这样的内联样式对象。',
    },
  ],
  components: [{name: 'Heading'}],
  usage: {
    anatomy,
    description:
      'Text 渲染来自主题的、带样式的正文文本和标题。正文、标签和说明文字使用带语义 type 的 Text；分区标题使用 Heading，它会输出正确的 h1-h6 元素。',
    bestPractices: [
      {
        guidance: true,
        description:
          '选择语义化 type（body、label、supporting、large、code），而不是手动设置字号和字重；细节交给主题处理。',
      },
      {
        guidance: true,
        description:
          '当视觉级别与文档大纲不一致时，在 Heading 上设置 accessibilityLevel，让屏幕阅读器播报正确的层级。',
      },
      {
        guidance: true,
        description:
          '用 maxLines 加数字截断过长内容；悬停时自动出现工具提示，文字不会丢失。',
      },
      {
        guidance: true,
        description:
          '为数字数据列启用 hasTabularNumbers，让各行的数字纵向对齐。',
      },
      {
        guidance: false,
        description:
          '语义化 type 已经匹配时，不要覆盖字号和字重；额外覆盖会与主题对抗，主题变更时就会失效。',
      },
      {
        guidance: false,
        description:
          '不要在文档大纲中跳级标题；应依次 h1、h2、h3，绝不要 h1 直接接 h3。',
      },
      {
        guidance: false,
        description:
          '不要用 <p>、<h1>-<h6> 或 <span> 等原生 HTML 标签渲染文本；Text 和 Heading 会自动应用正确的主题令牌。',
      },
      {
        guidance: false,
        description:
          '不要传 `variant` prop；Text 没有 `variant` prop。语义化样式（body、label、large、supporting、code）用 `type`，标题用 Heading。',
      },
      {
        guidance: false,
        description:
          '不要用 Text 做标题；分区标题和标题请用带 `level` prop（1-6）的 Heading。',
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsZh = {
  usage: {
    description:
      'Text renders styled body text and headings from the theme. Use Text with a semantic type for body copy, labels, and captions, and Heading for section titles that output the correct h1\u2013h6 element.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Pick a semantic type (body, label, supporting, large, code) instead of manually setting size and weight; the theme handles the details.',
      },
      {
        guidance: true,
        description:
          'Set accessibilityLevel on Heading when the visual level differs from the document outline so screen readers announce the correct hierarchy.',
      },
      {
        guidance: true,
        description:
          'Use maxLines with a number to truncate long content; a tooltip appears automatically on hover so no text is lost.',
      },
      {
        guidance: true,
        description:
          'Enable hasTabularNumbers for columns of numeric data so digits align vertically across rows.',
      },
      {
        guidance: false,
        description:
          'Override size and weight when a semantic type already matches; extra overrides fight the theme and break when themes change.',
      },
      {
        guidance: false,
        description:
          'Skip heading levels in the document outline; go h1 then h2 then h3, never h1 then h3.',
      },
      {
        guidance: false,
        description:
          'Use raw HTML tags like <p>, <h1>\u2013<h6>, or <span> for text; Text and Heading apply the correct theme tokens automatically.',
      },
      {
        guidance: false,
        description:
          'Pass a `variant` prop; Text does not have a `variant` prop. Use `type` for semantic styling (body, label, large, supporting, code) or use Heading for headings.',
      },
      {
        guidance: false,
        description:
          'Use Text for headings; use Heading with a `level` prop (1\u20136) for section titles and headings.',
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description:
    '语义化正文文本 + 标题，带主题驱动的字号比例、截断、表格数字',
  usage: {
    description:
      'Text 渲染带样式的正文文本和标题。正文用带语义类型的 Text，标题用带主题令牌的 Heading（h1-h6）。',
    bestPractices: [
      {
        guidance: true,
        description:
          '用语义化 type（body、label、supporting、large、code），不要手动设置字号/字重。',
      },
      {
        guidance: true,
        description:
          '视觉级别与文档大纲不一致时，在 Heading 上设 accessibilityLevel。',
      },
      {
        guidance: true,
        description:
          '用 maxLines 截断；悬停工具提示显示全文。',
      },
      {
        guidance: true,
        description: '数字列对齐用 hasTabularNumbers。',
      },
      {
        guidance: false,
        description:
          '语义化 type 已匹配时，不要覆盖字号/字重。',
      },
      {
        guidance: false,
        description: '不要跳级标题；应顺序 h1 → h2 → h3。',
      },
      {
        guidance: false,
        description: '不要用原生 <p>/<h1>/<span>；主题令牌请用 Text/Heading。',
      },
      {
        guidance: false,
        description:
          '不要传不存在的 `variant` prop；文本样式用 `type`，标题用 Heading。',
      },
      {
        guidance: false,
        description: '不要用 Text 做标题：请用带 level（1-6）的 Heading。',
      },
    ],
  },
};
