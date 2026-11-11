// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs authoring/building-blocks/templates/build-the-template/package-and-test`:
 * expose a template from its package and prove the copied result in an app.
 */

/** @type {import('@astryxdesign/cli/authoring').NamespaceDoc} */
export const docs = {
  type: 'namespace',
  name: 'package-and-test',
  placement: {
    parent: 'namespace:build-the-template',
    slot: 'guides',
    order: 30,
  },
  title: '打包与测试',
  summary:
    '发布一个一次就能跑通的包：把模板需要的一切都打进去，发布前检查包，并在真实应用里试用模板。',
  keywords: [
    '模板导出',
    '模板打包',
    '集成验证',
    '模板测试',
  ],
  slots: {
    guides: {
      title: '指南',
      accepts: {kinds: ['generic']},
    },
  },
};
