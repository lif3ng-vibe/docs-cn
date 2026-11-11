// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docs = {
  name: 'Code',
  displayName: 'Code',
  keywords: ['行内代码', '等宽'],
  group: 'Code',
  category: 'Content',
  description:
    '带等宽字体与柔和背景的行内代码元素。用于行文中的简短代码引用。',
  usage: {
    description:
      'Code 用于标记简短的内联引用，如函数名、变量、文件路径和命令行参数。独立或多行代码片段请用 CodeBlock。',
    bestPractices: [
      {
        guidance: true,
        description:
          '行文中出现简短技术术语（如函数名、prop、文件路径或命令行参数）时使用 Code。',
      },
      {
        guidance: true,
        description:
          "行内代码需要与周围文本字号和行高一致时，将 size 设为 'inherit'。",
      },
      {
        guidance: false,
        description:
          '不要用 Code 呈现多行或独立代码片段。请改用 CodeBlock，让读者获得合适的块级排版与语法支持。',
      },
      {
        guidance: false,
        description:
          '不要把 Code 用作交互式的复制或导航控件。需要操作时请搭配相应的 Button 或 Link。',
      },
    ],
    anatomy: [
      {
        name: 'Container',
        required: true,
        description:
          '承载行内代码内容的语义化 code 元素，负责背景、排版、内边距与圆角。',
      },
    ],
  },
  playground: {
    defaults: {
      children: 'const count = 0',
    },
  },
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: '行内代码内容。',
      required: true,
    },
    {
      name: 'color',
      type: "'primary' | 'secondary' | 'inherit'",
      description:
        "文本颜色。设为 'inherit' 可继承周围文本的颜色。",
      default: "'primary'",
    },
    {
      name: 'size',
      type: "'inherit'",
      description:
        "设为 'inherit' 可继承周围文本的字号与行高。省略时使用代码字号的默认尺寸。",
    },
    {
      name: 'ref',
      type: 'React.Ref<HTMLElement>',
      description: '转发至语义化 code 元素的 ref。',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于布局定制的 StyleX 样式。必须是 stylex.create() 的值，不能是 style={{}} 这样的内联样式对象。',
    },
    {
      name: 'className',
      type: 'string',
      description:
        '根元素的 CSS class 名。样式定制优先使用 xstyle。',
    },
    {
      name: 'style',
      type: 'CSSProperties',
      description:
        '根元素的内联样式。需要 StyleX 优化时优先使用 xstyle。',
    },
    {
      name: 'data-testid',
      type: 'string',
      description: '供自动化测试框架使用的测试选择器。',
    },
  ],
  theming: {
    targets: [{className: 'astryx-code', visualProps: ['color', 'size']}],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description:
    '行文简短技术引用的行内语义化 code；CodeBlock 负责独立或多行片段',
  usage: {
    description:
      '用于行文中的简短函数名、变量、路径与命令行参数。独立或多行片段用 CodeBlock。',
    bestPractices: [
      {
        guidance: true,
        description: '行文中的简短技术引用使用它。',
      },
      {
        guidance: true,
        description:
          "设 size='inherit' 匹配周围文本字号与行高。",
      },
      {
        guidance: false,
        description:
          '多行或独立片段不要用它；改用 CodeBlock。',
      },
      {
        guidance: false,
        description:
          '不要用作交互控件；需要操作时搭配 Button 或 Link。',
      },
    ],
  },
  propDescriptions: {
    children: '行内代码内容。',
    color:
      '文本颜色：primary、secondary 或继承周围文本。',
    size: "设为 'inherit' 继承周围字号与行高。",
    ref: '转发至语义化 code 元素的 ref。',
    xstyle:
      'StyleX 布局样式；必须是 stylex.create() 值，不能是内联样式对象。',
    className: '根元素的 CSS class；优先用 xstyle。',
    style: '根元素的内联样式；优先用 xstyle。',
    'data-testid': '供自动化测试框架使用的测试选择器。',
  },
};
