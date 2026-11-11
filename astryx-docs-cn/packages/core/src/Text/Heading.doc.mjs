// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'Heading',
  subComponentOf: 'Text',
  displayName: 'Heading',
  description:
    '语义化标题组件，渲染 h1-h6 元素，带主题化样式、通过字号比例令牌实现的主题化尺寸，以及行数截断。',
  theming: {
    targets: [
      {
        className: 'astryx-heading',
        visualProps: ['level', 'color', 'type', 'weight'],
      },
    ],
  },
  props: [
    {
      name: 'level',
      type: '1 | 2 | 3 | 4 | 5 | 6',
      description:
        '标题级别。决定语义 HTML 元素（h1-h6）和来自主题的视觉样式（除非设置了 `type`）。',
      required: true,
    },
    {
      name: 'type',
      type: "'display-1' | 'display-2' | 'display-3'",
      description:
        '展示型变体。用展示级尺寸（更大、更轻的字重、更紧的行高）覆盖来自 `level` 的视觉样式。主题可添加自定义视觉类型。`level` 仍决定无障碍所用的 HTML 元素。用于英雄横幅、营销标题和数据标注。',
    },
    {
      name: 'weight',
      type: "'normal' | 'medium' | 'semibold' | 'bold'",
      description:
        '显式字重覆盖。优先于所选视觉类型或标题级别的默认值。',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: '标题内容。',
      required: true,
    },
    {
      name: 'accessibilityLevel',
      type: '1 | 2 | 3 | 4 | 5 | 6',
      description:
        '无障碍级别覆盖。设置且与 `level` 不同时应用 `aria-level`，使文档大纲不同于视觉样式。',
    },
    {
      name: 'color',
      type: "'primary' | 'secondary' | 'disabled' | 'placeholder' | 'accent' | 'inherit'",
      description: '文本颜色。主题可添加自定义颜色。',
      default: "'primary'",
    },
    {
      name: 'display',
      type: "'inline' | 'block'",
      description:
        "显示类型。当 maxLines > 0 或 hasCapsize 为 true 时静默覆盖为 'block'。",
      default: "'block'",
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
      name: 'id',
      type: 'string',
      description: 'HTML id 属性。',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '应用于标题元素的 StyleX 样式。必须是 stylex.create() 的值：不能是 style={{}} 这样的内联样式对象。',
    },
    {
      name: 'className',
      type: 'string',
      description: '应用于标题元素的 CSS 类名。',
    },
    {
      name: 'style',
      type: 'React.CSSProperties',
      description:
        '应用于标题元素的内联样式。当 `maxLines` 大于 1 时，其行数截断会替换 `style` 中的任何 `WebkitLineClamp`。',
    },
    {
      name: 'ref',
      type: 'React.Ref<HTMLHeadingElement>',
      description: '转发到标题元素的 ref。',
    },
  ],
};

export const docsZh = {
  name: 'Heading',
  displayName: 'Heading',
  description:
    '语义化标题组件，渲染带主题样式的 h1–h6 元素，支持可选的编辑风格比例和行截断。',
  props: [
    {
      name: 'level',
      type: '1 | 2 | 3 | 4 | 5 | 6',
      description:
        '标题级别。决定语义 HTML 元素（h1–h6）和来自主题的样式（除非设置了 `type`）。',
      required: true,
    },
    {
      name: 'type',
      type: "'display-1' | 'display-2' | 'display-3'",
      description:
        '展示类型变体。用展示级别的大小（更大、更轻的字重、更紧的行高）覆盖来自 `level` 的视觉样式。主题可以添加自定义视觉类型。`level` 仍然决定用于无障碍的 HTML 元素。用于英雄横幅、营销标题和数据提示。',
    },
    {
      name: 'weight',
      type: "'normal' | 'medium' | 'semibold' | 'bold'",
      description: '显式字重覆盖。优先于所选视觉类型或标题级别的默认值。',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: '标题内容。',
      required: true,
    },
    {
      name: 'accessibilityLevel',
      type: '1 | 2 | 3 | 4 | 5 | 6',
      description:
        '无障碍级别覆盖。当设置且与 `level` 不同时，应用 `aria-level` 使文档大纲与视觉样式不同。',
    },
    {
      name: 'color',
      type: "'primary' | 'secondary' | 'disabled' | 'placeholder' | 'accent' | 'inherit'",
      description: '文本颜色。主题可添加自定义颜色。',
      default: "'primary'",
    },
    {
      name: 'display',
      type: "'inline' | 'block'",
      description:
        "显示类型。当 maxLines > 0 或 hasCapsize 为 true 时，会静默覆盖为 'block'。",
      default: "'block'",
    },
    {
      name: 'maxLines',
      type: 'number',
      description:
        '截断前的最大行数。0 表示不截断。设置后，如果内容被截断，悬停时会显示工具提示。',
      default: '0',
    },
    {
      name: 'hasTruncateTooltip',
      type: "boolean | 'above' | 'below' | 'start' | 'end'",
      description:
        "控制截断文本的工具提示行为。true 在默认位置显示工具提示，false 禁用它，或者放置字符串 ('above' | 'below' | 'start' | 'end') 设置特定位置。",
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
      description: '使用 text-box-trim 启用光学对齐。强制块级显示。',
      default: 'false',
    },
    {
      name: 'hasStrikethrough',
      type: 'boolean',
      description: '应用删除线文本装饰。',
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
        '应用于标题元素的 StyleX 样式。必须是 stylex.create() 的值，而不是 style={{}} 这样的内联样式对象。',
    },
    {
      name: 'className',
      type: 'string',
      description: '应用于标题元素的 CSS 类名。',
    },
    {
      name: 'style',
      type: 'React.CSSProperties',
      description:
        '应用于标题元素的内联样式。当 `maxLines` 大于 1 时，其行数截断会替换 `style` 中的 `WebkitLineClamp`。',
    },
    {
      name: 'ref',
      type: 'React.Ref<HTMLHeadingElement>',
      description: '转发到标题元素的 Ref。',
    },
  ],
};

export const docsDense = {
  name: 'Heading',
  displayName: 'Heading',
  description:
    '语义化 h1–6，带主题化样式、经字号比例令牌的主题化尺寸、行数截断。',
  propDescriptions: {
    level:
      '标题级别；决定 HTML 元素 + 来自主题的样式（除非设置 type）。',
    type: '展示型变体（display-1/2/3 或主题自有自定义类型）；覆盖 level 的视觉样式。',
    weight:
      '显式字重；优先于视觉类型或标题级别默认值。',
    children: '标题内容。',
    accessibilityLevel:
      '与 level 不同时的 aria-level 覆盖，用于文档大纲。',
    color: '文本颜色。主题可添加自定义颜色。',
    display:
      "显示类型；当 maxLines>0 或 hasCapsize 时覆盖为 'block'。",
    maxLines:
      '截断前最大行数；0=不截断。截断时显示工具提示。',
    hasTruncateTooltip:
      "截断文本的工具提示；true=默认位置，false=禁用，或放置值（'above' | 'below' | 'start' | 'end'）。",
    wordBreak:
      "截断时的断词行为；单行默认 'break-all'，其余 'break-word'。未截断的长词会换行（overflow-wrap: break-word）；flex 子元素需要 min-width: 0；你自己容器的 overflow-wrap: anywhere 不会作用于此文本（Astryx 容器会传递其换行）。",
    textWrap: '文本换行行为。',
    justify:
      "文本对齐（两端对齐）；逻辑值 'start' | 'center' | 'end'，适配 RTL。",
    hasCapsize: '经 text-box-trim 的光学对齐；强制块级显示。',
    hasStrikethrough: '删除线文本装饰。',
    id: 'HTML id 属性。',
    xstyle: '标题上的 StyleX 样式；仅限 stylex.create() 值。',
    className: '标题上的 CSS 类名。',
    style:
      '标题上的内联样式；maxLines>1 时行数截断替换 WebkitLineClamp。',
    ref: '转发到标题元素的 ref。',
  },
};
