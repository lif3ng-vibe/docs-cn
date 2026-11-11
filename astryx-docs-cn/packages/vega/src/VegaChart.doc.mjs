// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docs = {
  name: 'VegaChart',
  displayName: 'Vega Chart',
  category: 'Data Visualization',
  keywords: ['vega', 'vega-lite', '图表', 'chart', '数据可视化', 'data visualization'],
  props: [
    {
      name: 'spec',
      type: 'AnySpec',
      description:
        '带有官方 $schema URL 的 Vega 或 Vega-Lite 规格说明。',
      required: true,
    },
    {
      name: 'data',
      type: 'ViewData',
      description:
        'spec 所命名数据集的初始值。在视图创建时读取；后续更新应使用存活的 View。',
    },
    {
      name: 'compileOptions',
      type: 'CompileOptions',
      description:
        '传给 Vega-Lite 编译的选项。原生 Vega spec 会忽略。',
    },
    {
      name: 'parseConfig',
      type: 'Config',
      description: '传给 vega.parse() 的 Vega 配置。',
    },
    {
      name: 'parseOptions',
      type: 'ParseOptions',
      description: '传给 vega.parse() 的选项。',
    },
    {
      name: 'viewOptions',
      type: "Omit<ViewOptions, 'container'>",
      description:
        '传给 Vega View 的选项。组件始终自行提供 container。',
    },
    {
      name: 'onReady',
      type: '(view: View) => void',
      description: '首次渲染后以存活的 Vega View 调用。',
    },
    {
      name: 'onError',
      type: '(error: Error) => void',
      description:
        'schema 校验、编译或渲染失败时调用。',
    },
  ],
  usage: {
    description:
      '通过 Vega 运行时渲染 Vega 与 Vega-Lite 规格说明。@astryxdesign/vega 中的实验性组件（canary）。',
    bestPractices: [
      {
        guidance: true,
        description:
          '只渲染你自行编写或审查过的规格说明。对不受信任的 spec，请按包 README 的说明配置解释器与受限 loader。',
      },
      {
        guidance: true,
        description:
          '保持 spec 与选项对象稳定，避免不必要地重建 Vega View。',
      },
    ],
  },
};
