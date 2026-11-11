// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs authoring/building-blocks/docs/links`: link one doc
 * to another by identity, link the CLI's docs, and fix a link that names no
 * doc.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'links',
  placement: {parent: 'namespace:docs', slot: 'guides', order: 30},
  title: '链接',
  category: 'guide',
  description:
    '让一篇文档链接另一篇文档，文档移动后链接依然有效。',
  sections: [
    {
      id: 'link-another-doc',
      title: '链接另一篇文档',
      content: [
        {
          type: 'prose',
          text: '在 prose、列表项和表格单元格里写 `{@link [provider:]kind:name}` 即可链接另一篇文档。CLI 会打印打开它的命令，因此文档移动后链接依然有效。',
        },
        {
          type: 'code',
          lang: 'javascript',
          code: "{type: 'prose', text: 'Before you ship, read {@link generic:deploying}.'},\n{type: 'list', style: 'unordered', items: ['All guides: {@link namespace:acme}.']},\n{type: 'table', headers: ['Task', 'Guide'], rows: [['Ship', '{@link generic:deploying}']]},",
        },
        {
          type: 'prose',
          text: '每个链接都表现为一条命令。这个链接 {@link generic:extend-or-replace} 会打开下一篇指南。',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            'kind 取 `generic` 表示话题或指南，`namespace` 表示文档分区，`command` 或 `function` 表示 CLI 命令或 API 函数，`schema` 或 `enum` 表示 schema 或一组固定取值，`component` 表示组件，`page` 或 `block` 表示模板。',
            '组件用其导出名命名，模板用其 id 命名。链接呈现为打开它的那条命令，例如 `{@command component AcmeCarousel --package @acme/widgets}`。',
            '在反引号或代码块内，链接语法按原样打印。',
          ],
        },
      ],
    },
    {
      id: 'link-another-packages-docs',
      title: '链接其他包的文档',
      content: [
        {
          type: 'prose',
          text: '不带 provider 的链接会在你自己的包内解析。要链接 CLI 的文档或其他包的文档，让目标以该包的包名开头，例如 `@astryxdesign/cli:`。',
        },
        {
          type: 'code',
          lang: 'javascript',
          code: "// Resolves: the CLI's doctor command\n{type: 'prose', text: 'Check the app with {@link @astryxdesign/cli:command:doctor}.'},\n// Does not resolve: looks for a doctor command in your package\n{type: 'prose', text: 'Check the app with {@link command:doctor}.'},",
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            'CLI 命令按你输入的原样命名，包括空格，例如 `@astryxdesign/cli:command:doctor integration docs`。',
            '在 `extends` 了其他包话题的话题里，你的 sections 仍在你的包内解析，因此指向基础话题文档的链接需要带上其 provider。',
          ],
        },
      ],
    },
    {
      id: 'fix-a-link-that-names-no-doc',
      title: '修复未指向任何文档的链接',
      content: [
        {
          type: 'prose',
          text: '未指向任何文档的链接会按原样打印，`doctor integration docs` 会给出警告。警告中会给出一条能找到正确目标的搜索命令。',
        },
        {
          type: 'code',
          lang: 'bash',
          code: '{@command doctor integration docs}',
        },
        {
          type: 'code',
          lang: 'text',
          code: 'severity: [warn]\ncode:     invalid_doc_graph\nmessage:  acme/deploying § check-before-you-ship: "command:doctor" names no doc. Find it with `astryx search doctor --type doc`, then name it as `[<provider>:]<kind>:<name>`.',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '该警告不改变退出码（仍为 0），因此交付前请阅读报告；参见 {@link generic:check-your-docs}。',
            '已发布的 0.6.4 及以后版本会解析链接。更早的 CLI（如已发布的 0.6.3）则将每个链接按原样打印；参见 {@link generic:versioning}。',
          ],
        },
      ],
    },
  ],
};
