// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs authoring/building-blocks/themes/document-the-theme`:
 * document a theme by extending the core theme topic, not in agent guidance.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'document-the-theme',
  placement: {parent: 'namespace:themes', slot: 'guides', order: 50},
  title: '为主题编写文档',
  category: 'guide',
  description:
    '通过扩展核心 theme 话题为主题编写文档，让应用在 {@link generic:theme} 中读到它。',
  sections: [
    {
      id: 'extend-the-theme-topic',
      title: '扩展核心 theme 话题',
      content: [
        {
          type: 'prose',
          text: "为你的主题写一个扩展核心 `theme` 话题的文档话题，这样列出你的包的应用会在 {@link generic:theme} 的末尾看到你的主题。用 `extends: 'theme'` 添加它（{@link generic:extend-or-replace}）。",
        },
        {
          type: 'code',
          lang: 'javascript',
          code: `// docs/ocean-theme.doc.mjs
/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export default {
  type: 'generic',
  name: 'ocean-theme',
  extends: 'theme',
  title: 'Ocean theme',
  description: 'Use the Ocean theme from @acme/astryx-widgets.',
  sections: [
    {
      id: 'use-the-ocean-theme',
      title: 'Use the Ocean theme',
      content: [
        {
          type: 'prose',
          text: '安装 @acme/astryx-widgets，然后运行 astryx theme add ocean --package @acme/astryx-widgets，并在生成的应用主题模块中应用它。',
        },
      ],
    },
  ],
};`,
        },
        {
          type: 'prose',
          text: '小节保持简短：如何安装包、运行 `theme add`、应用生成的模块（{@link generic:use-a-theme-in-an-app}），以及用 `extends` 定制。当主题使用自定义字体时，写明字体族名称，以及 `theme add` 会导入的可选导出字体样式表（{@link generic:fonts-and-assets}）。请扩展 `theme` 本身，而不是扩展某个会被其他包替换的话题；否则，若应用在你之后加载了那个包，你的小节会被丢弃。',
        },
      ],
    },
    {
      id: 'not-agent-guidance',
      title: '不属于智能体指引',
      content: [
        {
          type: 'prose',
          text: '不要把主题用法写进 `agentDocs`。智能体条目会进入每个应用的 agent 文件，只应承载每个会话都需要的指引；主题的安装与使用步骤应写进一份供人们和智能体按需阅读的文档话题。见 {@link generic:agent-guidance}。',
        },
      ],
    },
  ],
};
