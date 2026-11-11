// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').HookDoc} */
export const docs = {
  name: 'useDevWarning',
  displayName: 'useDevWarning',
  keywords: [
    'warning',
    'dev',
    'development',
    'console',
    'guardrail',
    'misuse',
    'invariant',
    'debug',
    'devWarn',
    '警告',
    '开发',
  ],
  params: [
    {
      name: 'component',
      type: 'string',
      description: '组件或 hook 名，用作消息前缀。',
      required: true,
    },
    {
      name: 'message',
      type: 'string',
      description: '出了什么问题以及如何修复。',
      required: true,
    },
    {
      name: 'condition',
      type: 'boolean',
      description: '是否警告。',
      default: 'true',
    },
  ],
  returns: [],
  usage: {
    description:
      '条件成立时，每次挂载发一次仅开发环境的 "Component: message" 控制台警告。这是组件标记误用的渲染安全方式：直接在渲染体里警告会在每次渲染重复，用 state 门控又多一次重渲染，所以这里用 ref 与 effect。组件外部的警告请用命令式 devWarn 工具。',
    bestPractices: [
      {
        guidance: true,
        description:
          '说清哪里错了、构建者应该怎么做；消息就是警告的全部价值。',
      },
      {
        guidance: true,
        description:
          '对类型无法表达的组合发出警告，如两个互斥 prop 被同时设置。',
      },
      {
        guidance: false,
        description:
          '不要用于用户可见的任何问题或运行时错误处理；生产构建会剥离它。',
      },
    ],
  },
  relatedComponents: [],
  relatedHooks: [],
  importPath: '@astryxdesign/core/hooks',
  category: 'utility',
};

/** @type {import('@astryxdesign/cli/authoring').HookTranslationDoc} */
export const docsDense = {
  description:
    '仅开发环境的 "Component: message" 控制台警告，条件成立时每次挂载一次。ref + effect，绝不逐渲染重复、也不引发重渲染。组件外用命令式 devWarn 工具。',
  paramDescriptions: {
    component: '组件/hook 名，用作消息前缀。',
    message: '问题所在 + 修复方法。',
    condition: '是否警告。',
  },
  usage: {
    description:
      '组件内部的渲染安全护栏警告。生产构建剥离。',
    bestPractices: [
      {
        guidance: true,
        description:
          '说清错在哪 + 该怎么做；消息就是价值。',
      },
      {
        guidance: true,
        description:
          '对类型无法表达的组合警告 (互斥 prop 同时设置)。',
      },
      {
        guidance: false,
        description:
          '别用于用户可见问题/运行时错误处理；仅开发环境。',
      },
    ],
  },
};
