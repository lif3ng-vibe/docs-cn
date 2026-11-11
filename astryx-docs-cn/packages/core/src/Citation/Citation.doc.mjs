// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'Citation',
  displayName: 'Citation',
  group: 'Citation',
  category: 'Content',

  usage: {
    description:
      'Citation 用于内联引用外部来源。适合在 AI 生成回复、文章或任何需要标注出处与来源链接的地方标注信息归属。',
    bestPractices: [
      {
        guidance: true,
        description:
          '来源标题能为读者提供有意义上下文时，使用 label 变体。',
      },
      {
        guidance: true,
        description:
          '正文中的紧凑内联引用（类似脚注）使用 number 变体。',
      },
      {
        guidance: false,
        description:
          '不要在同一段落中混用 label 与 number 变体；每个上下文选定一种风格以保持视觉一致。',
      },
    ],
    anatomy: [
      {
        name: 'Container',
        required: true,
        description:
          '根包裹层。可接受的来源 URL 渲染为锚点；缺失或被拒绝的 URL 渲染为惰性 span。',
      },
      {
        name: 'Icon',
        required: false,
        description:
          '标签文本前显示的可选来源图标。接受 favicon/logo 图片 URL（经 source.src）或 React 节点（如 Astryx <Icon>）。仅 label 变体可用。',
      },
      {
        name: 'Label text',
        required: false,
        description:
          '来源标题，超过最大宽度时以省略号截断。label 变体显示。',
      },
      {
        name: 'Number',
        required: false,
        description:
          '以上标徽标显示的引用序号。number 变体显示。',
      },
    ],
  },

  // `source` is a custom object type the docsite preview cannot generate
  // automatically; without these defaults the properties tab shows the
  // missing-required-props placeholder instead of an interactive preview.
  playground: {
    defaults: {
      source: {title: 'Astryx Design', url: 'https://example.com'},
      number: 1,
    },
  },

  props: [
    {
      name: 'source',
      type: 'CitationSource',
      description:
        '引用来源对象，包含 title、url、可选图片 src 和可选图标节点。url 遵循 Link `href` prop 描述的统一导航规则；被拒绝的目标保持引用可见且不导航。图片 src 使用单独的资源处理。',
      required: true,
    },
    {
      name: 'number',
      type: 'number',
      description: '该引用的显示序号。',
      required: true,
    },
    {
      name: 'variant',
      type: "'label' | 'number'",
      description:
        '展示样式：显示来源标题的 label 药丸，或紧凑的数字徽标。',
      default: "'label'",
    },
  ],
  theming: {
    targets: [
      {className: 'astryx-citation', visualProps: ['variant']},
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description:
    '外部来源的内联引用。在 AI 回复、文章或任何需要标注出处的地方标注信息归属。',
  usage: {
    description:
      '外部来源的内联引用。在 AI 回复、文章或任何需要标注出处的地方标注信息归属。',
    bestPractices: [
      {
        guidance: true,
        description:
          '来源标题提供有意义上下文时用 label 变体。',
      },
      {
        guidance: true,
        description:
          '正文紧凑内联引用（如脚注）用 number 变体。',
      },
      {
        guidance: false,
        description:
          '不要在同一段落混用 label 与 number 变体；每个上下文选一种风格。',
      },
    ],
  },
  propDescriptions: {
    source:
      '引用来源，含 title、url、可选图片 src 与可选图标。url 遵循 Link href 导航规则；被拒绝目标保持可见且不导航。图片 src 单独处理。',
    number: '该引用的显示序号。',
    variant: '展示样式：带来源标题的 label 药丸或紧凑数字徽标。',
  },
};
