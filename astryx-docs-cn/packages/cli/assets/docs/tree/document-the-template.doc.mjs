// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs authoring/building-blocks/templates/document-the-template`:
 * document page and block templates for discovery and correct reuse.
 */

/** @type {import('@astryxdesign/cli/authoring').NamespaceDoc} */
export const docs = {
  type: 'namespace',
  name: 'document-the-template',
  placement: {parent: 'namespace:templates', slot: 'build', order: 20},
  title: '为模板编写文档',
  summary:
    '编写一份帮助人们和智能体（agent）发现、选择并信任你的模板的文档：包括名称、描述、就绪度、预览以及任何 Core 替代方案。',
  keywords: [
    '模板文档',
    'template doc',
    '页面模板',
    '区块模板',
  ],
  slots: {
    guides: {
      title: '指南',
      accepts: {kinds: ['generic']},
    },
  },
};
