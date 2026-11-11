// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs authoring/building-blocks/templates/write-good-templates`:
 * what makes a template good, the rubric that scores it, and grading with an agent.
 */

/** @type {import('@astryxdesign/cli/authoring').NamespaceDoc} */
export const docs = {
  type: 'namespace',
  name: 'write-good-templates',
  placement: {parent: 'namespace:templates', slot: 'quality', order: 10},
  title: '如何写好模板',
  summary:
    '写出让人信赖的模板：什么是好、为质量打分的评分细则，以及如何用智能体（agent）给模板评分。',
  keywords: [
    '模板质量',
    '模板评分细则',
    '模板评分',
    '模板评审',
  ],
  blocks: [
    {
      type: 'prose',
      text: '好的模板不只是能渲染。它为应用提供一个清晰的产品起点，易于理解、可以放心修改，并且在 Astryx 把它从包中复制出来之后依然完整。评分细则（rubric）为这份质量打分，让你可以在构建过程中同步评分。',
    },
    {
      type: 'list',
      style: 'unordered',
      items: [
        '在读者细看每个细节之前，它的用途与主要任务就已经清晰。',
        '它组合 Astryx 组件，而不是用原生 HTML 或自定义样式重建组件的行为。',
        '在窄视口和每种受支持的颜色模式下，它的层级、间距、交互与阅读顺序都依然正常。',
        '从复制后的位置出发，它的源码、导入、样式、字体、图标、图片与媒体依然可用。',
        '它的元数据让模板易于被找到，并准确说明何时使用它。',
        '它的示例内容足够贴近真实，能暴露溢出、空白与层级问题。',
      ],
    },
    {
      type: 'prose',
      text: '给第一个可运行的版本评分；每次源码、文档、依赖或资源变更之后再评一次；每次发布之前完整评一遍。评分要同时覆盖源码、文档、复制出的文件与渲染出的应用，任何一项单独都不足够。',
    },
    {
      type: 'list',
      style: 'ordered',
      items: [
        '通读 {@link generic:template-grading-rubric} 中的每一条评分规则。',
        '先修复阻塞发布的问题，再处理每一处合理的扣分项。',
        '在一个干净的应用中，对打包后的包完整重评一遍（{@link generic:test-template-in-app}）。',
        '要让智能体给模板评分并加以改进，使用 {@link generic:grade-template-with-agent}。',
      ],
    },
    {
      type: 'prose',
      text: '把每份评分卡与对应的包修订版本及评分细则版本一起保存。',
    },
  ],
  slots: {
    guides: {
      title: '指南',
      accepts: {kinds: ['generic']},
    },
  },
};
