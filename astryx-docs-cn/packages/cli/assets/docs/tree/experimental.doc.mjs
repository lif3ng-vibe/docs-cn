// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs cli/experimental`: the one docs route for experimental
 * features (spec:AST-017 FR27). Each experimental feature's docs place
 * themselves here, so nothing under this route reads as stable.
 */

/** @type {import('@astryxdesign/cli/authoring').NamespaceDoc} */
export const docs = {
  type: 'namespace',
  name: 'experimental',
  placement: {parent: 'namespace:cli', slot: 'guides', order: 90},
  stability: 'experimental',
  title: '实验性功能',
  summary:
    '现在就可以尝试的功能，但在补丁版本中可能更改或移除。',
  keywords: ['实验性', 'experimental', '预览', '不稳定'],
  slots: {
    guides: {
      title: '实验性功能',
      accepts: {kinds: ['generic', 'namespace']},
    },
  },
  blocks: [
    {
      type: 'prose',
      text: '这里的一切都是实验性的：其命令（位于 `astryx experimental` 之下）、配置（astryx.config 与集成清单中的 `experimental` 字段）、输出与文档都可能在任意补丁版本中更改或移除，不设弃用期。除非你使用它们，这里的内容不会改变 Astryx 其余部分的行为。功能转为稳定后即离开本分区。',
    },
  ],
};
