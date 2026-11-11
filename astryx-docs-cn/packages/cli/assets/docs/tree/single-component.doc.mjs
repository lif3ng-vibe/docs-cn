// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs authoring/building-blocks/components/describe-the-component/single-component`:
 * write and maintain the default ComponentDoc for one public component.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'single-component',
  placement: {
    parent: 'namespace:describe-the-component',
    slot: 'guides',
    order: 20,
  },
  title: '单组件',
  category: 'guide',
  description:
    '编写默认组件 doc：说明何时使用该组件、为每个公开 prop 写文档，并添加聚焦的示例。',
  sections: [
    {
      id: 'start-from-the-generated-doc',
      title: '从生成的 doc 开始',
      content: [
        {
          type: 'prose',
          text: '`integration add component` 为一个公开组件生成常规 doc。保留生成的身份标识与 import，把示例文本和 props 换成组件真实的公开契约。',
        },
        {
          type: 'code',
          lang: 'javascript',
          label: 'components/AcmeCarousel.doc.mjs',
          code: `/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export default {
  type: 'component',
  name: 'AcmeCarousel',
  displayName: 'Acme Carousel',
  import: '@acme/astryx-widgets/components/AcmeCarousel',
  usage: {
    description:
      '逐张轮播幻灯片。适用于少量相关卡片。',
  },
  props: [
    {
      name: 'slides',
      type: 'ReactNode[]',
      description: 'The slides to show, in order.',
      required: true,
    },
  ],
};`,
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '把 `props` 保留在顶层 doc 上。私有的实现辅助函数不需要条目。',
            'doc 与其旁边的源码文件同名，如 `AcmeCarousel.tsx` 旁边放 `AcmeCarousel.doc.mjs`，并在同一个 pull request 里同时修改两者。',
            '如果模块后来暴露了多个相关的公开导出，用 {@link generic:component-family} 改造这份 doc。',
          ],
        },
        {
          type: 'prose',
          text: '全部字段见 {@link schema:component-doc}。',
        },
      ],
    },
    {
      id: 'explain-when-to-use-it',
      title: '说明何时使用',
      content: [
        {
          type: 'prose',
          text: '写好 `usage.description`，让人或智能体（agent）不打开源码就能判断这是不是合适的组件。说清它做什么、何时使用，以及与相邻替代组件之间最重要的边界。',
        },
        {
          type: 'code',
          lang: 'javascript',
          code: `usage: {
  description:
    '逐张轮播幻灯片。适用于少量相关卡片；若每一项都应常驻可见，请改用静态列表。',
  bestPractices: [
    {guidance: true, description: '用户操作轮播时，保持幻灯片顺序稳定。'},
    {guidance: false, description: 'Hide information that must remain visible for comparison.'},
  ],
},`,
        },
        {
          type: 'prose',
          text: '把 `keywords` 设为人们会搜索的词：同义词与组件承担的任务，如 `keywords: [\'slider\', \'slideshow\', \'rotating cards\']`。`{@command search}` 对组件名或 keywords 的命中排在 description 命中之上，所以不写 keywords 时，搜索组件承担的任务可能让 Core 组件排在前面。用人们会输入的词检查：',
        },
        {
          type: 'code',
          lang: 'bash',
          code: '{@command search "rotating cards" --type component}',
        },
      ],
    },
    {
      id: 'document-every-public-prop',
      title: '为每个公开 prop 写文档',
      content: [
        {
          type: 'prose',
          text: '从源码复制公开 prop 的名字与类型。解释调用者能控制的行为，而不只是 TypeScript 类型。',
        },
        {
          type: 'code',
          lang: 'javascript',
          code: `props: [
  {
    name: 'slides',
    type: 'ReactNode[]',
    description: 'The slides to show, in order.',
    required: true,
  },
  {
    name: 'interval',
    type: 'number',
    description: 'Milliseconds between automatic slide changes.',
    default: '5000',
  },
],`,
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '只有当每个调用者都必须传该 prop 时才设 `required: true`。',
            '`default` 一律写成文档中应呈现的值。',
            '跳过 `xstyle`、`className`、`style` 这类样式逃生舱。',
            '`{@command doctor integration components}` 会列出代码中没有的已文档化 prop、doc 遗漏的公开 prop，以及错误的 `required`。见 {@link generic:check-the-props}。',
          ],
        },
      ],
    },
    {
      id: 'add-focused-examples',
      title: '添加聚焦的示例',
      content: [
        {
          type: 'prose',
          text: '为 prop 表格无法不言自明的重要用法添加简短示例。每个示例只教一个完整模式，且只用公开 import。',
        },
        {
          type: 'code',
          lang: 'javascript',
          code: `examples: [
  {
    label: 'Automatic rotation',
    code: '<AcmeCarousel slides={slides} interval={5000} />',
  },
],`,
        },
      ],
    },
    {
      id: 'read-the-result',
      title: '读取结果',
      content: [
        {
          type: 'prose',
          text: '每次源码或 doc 变更后都重新读取组件。确认其用途、import、props、默认值与示例与源码一致，然后校验打包后的包。',
        },
        {
          type: 'code',
          lang: 'bash',
          code: '{@command component AcmeCarousel}\n{@command doctor integration components}\n{@command integration verify}',
        },
      ],
    },
  ],
};
