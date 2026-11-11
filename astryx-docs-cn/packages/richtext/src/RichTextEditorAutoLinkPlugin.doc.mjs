// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'RichTextEditorAutoLinkPlugin',
  subComponentOf: 'RichTextEditor',
  description:
    '将输入与粘贴的 URL 和邮箱地址转换为链接，用于 RichTextEditor 的 plugins 插槽。',
  displayName: 'Rich Text Editor Auto-Link Plugin',
  keywords: ['富文本', 'richtext', '自动链接', 'autolink', '链接', 'link', 'url', '邮箱', 'email', '插件', 'plugin'],
  props: [
    {
      name: 'matchers',
      type: 'LinkMatcher[]',
      description:
        '要使用的链接匹配器。默认项识别 URL 与邮箱地址，并在新标签页打开链接。额外的匹配器用 @lexical/react/LexicalAutoLinkPlugin 的 createLinkMatcherWithRegExp 构建。',
      default: 'DEFAULT_LINK_MATCHERS',
    },
    {
      name: 'onChange',
      type: '(url: string | null, prevUrl: string | null) => void',
      description:
        '自动链接创建、更新或移除链接时调用。参数为新 URL（链接被移除时为 null）以及上一个 URL。',
    },
  ],
  usage: {
    description:
      "将输入与粘贴的 URL 和邮箱地址转换为链接。代码块内的文本保持为代码，永远不会被链接。请在 RichTextEditor 的 plugins 插槽中渲染；它经编辑器的 Lexical composer 接入编辑器，并使用编辑器默认注册的 AutoLinkNode。",
    bestPractices: [
      {
        guidance: true,
        description:
          '以 plugins={<RichTextEditorAutoLinkPlugin />} 传入。其链接在新标签页打开，节点内写入 target="_blank" 与 rel="noopener noreferrer"。',
      },
      {
        guidance: false,
        description:
          "不要在 RichTextEditor 的 plugins 插槽之外渲染：它依赖编辑器的 Lexical composer。",
      },
    ],
  },
};
