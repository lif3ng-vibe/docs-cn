// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs authoring/building-blocks/templates/build-the-template`:
 * author portable template source and every asset that source needs.
 */

/** @type {import('@astryxdesign/cli/authoring').NamespaceDoc} */
export const docs = {
  type: 'namespace',
  name: 'build-the-template',
  placement: {parent: 'namespace:templates', slot: 'build', order: 30},
  title: '构建模板',
  summary:
    '确保你的模板在应用复制它时能正常工作：编写模板文件，配置其样式、字体、图标与图片，然后打包并测试。',
  keywords: [
    '模板源码',
    '可移植模板',
    '模板资源',
    '模板导入',
  ],
  slots: {
    guides: {
      title: '指南',
      accepts: {kinds: ['generic', 'namespace']},
    },
  },
};
