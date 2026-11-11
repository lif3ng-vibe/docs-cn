// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs authoring/building-blocks/templates/build-the-template/template-assets`:
 * make every style, font, icon, and media dependency survive a template copy.
 */

/** @type {import('@astryxdesign/cli/authoring').NamespaceDoc} */
export const docs = {
  type: 'namespace',
  name: 'template-assets',
  placement: {
    parent: 'namespace:build-the-template',
    slot: 'guides',
    order: 20,
  },
  title: '资源',
  summary:
    '确保应用复制模板后，模板的样式、字体、图标、图片与视频依然正常显示。',
  blocks: [
    {
      type: 'prose',
      text: '被复制的文件不会随身带上同级的资源（{@link generic:write-the-template-file}）。给每个资源指定唯一一个归属：',
    },
    {
      type: 'table',
      headers: ['归属', '何时使用', '复制出的源码如何到达它'],
      rows: [
        [
          '随源码复制',
          '值很小、可编辑，且属于这个起点',
          '保留在 `.tsx` 文件中',
        ],
        [
          '集成包',
          '资源应随包集中维护',
          '导入稳定的公开包路径',
        ],
        [
          '应用',
          '应用必须提供特定产品的内容或品牌素材',
          '使用显式占位符或应用公开 URL，并说明要替换成什么',
        ],
      ],
    },
    {
      type: 'prose',
      text: '不要让模板表面上看起来自包含，实际却依赖未写明的包文件或应用约定。',
    },
  ],
  keywords: [
    '模板资源',
    '模板样式',
    '模板字体',
    '模板图标',
    '模板图片',
  ],
  slots: {
    guides: {
      title: '指南',
      accepts: {kinds: ['generic']},
    },
  },
};
