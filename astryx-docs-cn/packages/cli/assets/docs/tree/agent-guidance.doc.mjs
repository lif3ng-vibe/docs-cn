// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs authoring/building-blocks/configuration/agent-guidance`: add short lines of
 * guidance that apps put in front of their AI agents, within the limits.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'agent-guidance',
  placement: {parent: 'namespace:configuration', slot: 'guides', order: 10},
  title: '智能体（agent）指引',
  category: 'guide',
  keywords: ['智能体文档', 'agents.md'],
  description:
    '添加几行指引，应用会把它们展示给在其代码中工作的 AI 智能体。',
  sections: [
    {
      id: 'add-a-guidance-line',
      title: '添加一行指引',
      content: [
        {
          type: 'prose',
          text: '`integration add agent-doc` 会为在使用你包的应用中工作的 AI 智能体添加一行指引。应用会在其智能体文件（如 `AGENTS.md`）中展示这行内容。',
        },
        {
          type: 'code',
          lang: 'bash',
          code: "{@command integration add agent-doc 'Use AcmeCarousel for rotating content.'}",
        },
        {
          type: 'prose',
          text: '这一行会写入你 manifest 中的 `agentDocs.append`：',
        },
        {
          type: 'code',
          lang: 'js',
          code: `// astryx.integration.mjs
export default {
  components: './components',
  agentDocs: {
    append: ['Use AcmeCarousel for rotating content.'],
  },
};`,
        },
        {
          type: 'prose',
          text: '重复添加同一行不会有任何变化。要改写或删除某一行，请手动编辑 `agentDocs.append`。',
        },
      ],
    },
    {
      id: 'keep-within-the-limits',
      title: '遵守限制',
      content: [
        {
          type: 'prose',
          text: '每一行都占用应用智能体文件的空间，因此 CLI 要求指引短且少。详细内容请放进你的文档。',
        },
        {
          type: 'table',
          headers: ['限制', '超限后的结果'],
          rows: [
            [
              '每个包 8 行',
              '`integration add` 失败：`append may contain at most 8 lines`。',
            ],
            [
              '每行 240 个字符',
              '`integration add` 失败：`must contain at most 240 Unicode code points`。',
            ],
            [
              '每个应用 32 行（来自其所有包）',
              '`init` 不写入智能体块，并打印 `Could not install agent docs.`',
            ],
          ],
        },
        {
          type: 'prose',
          text: '一行就是一行纯文本。换行符、控制字符、两端空格以及 `<!-- ASTRYX:START -->` 这类托管块标记都会被拒绝。',
        },
        {
          type: 'prose',
          text: '在指引行里写命令时，以单独的 astryx 一词开头，前面不带运行器，例如：收尾前运行 astryx doctor。托管块会在其顶部写明应用运行命令的方式，一次声明对其下方所有命令生效，因此你的指引行在每个应用中都适用。见 {@link generic:cli-command}。',
        },
      ],
    },
    {
      id: 'see-what-agents-read',
      title: '查看智能体读到的内容',
      content: [
        {
          type: 'prose',
          text: '应用的 `{@command init}` 会把你的指引行写进其托管智能体块的末尾，每行标注你的包名。标题、标注和标记都由 CLI 管理。',
        },
        {
          type: 'code',
          lang: 'bash',
          code: '{@command init --features agents}',
        },
        {
          type: 'code',
          lang: 'text',
          code: `INTEGRATIONS:
- \`@acme/astryx-widgets\`: Use AcmeCarousel for rotating content.
<!-- ASTRYX:END -->`,
        },
        {
          type: 'prose',
          text: '该块会汇集应用已安装的每个集成的指引行，无论其是否有 `astryx.config` 条目。',
        },
      ],
    },
    {
      id: 'refresh-the-block',
      title: '在应用中刷新该块',
      content: [
        {
          type: 'prose',
          text: '只有当应用运行 `init` 或 `upgrade --from <version> --apply` 时，该块才会更新。应用安装了带新指引行的你包新版本后，需要运行其中之一。',
        },
        {
          type: 'code',
          lang: 'bash',
          code: `{@command init --features agents}
# Or: --from takes the Core version the app had before
{@command upgrade --from <version> --apply}`,
        },
        {
          type: 'code',
          lang: 'text',
          code: '[ok] Agent docs refreshed -> AGENTS.md',
        },
        {
          type: 'prose',
          text: '`upgrade --apply` 会打印那行输出；`init` 则打印 `[ok] AI agent docs installed -> AGENTS.md`。不带 `--apply` 时，`upgrade` 只会报告 `Agent docs differ from the installed Astryx and integration configuration.`。即使 Core 没有变化，它也会刷新该块。见 {@link command:upgrade}。',
        },
      ],
    },
    {
      id: 'global-mode',
      title: '全局模式下',
      content: [
        {
          type: 'prose',
          text: '全局模式下：CLI 为整台电脑维护的智能体指南不携带任何集成的指引，因为它服务于所有文件夹；你的指引通过 `init` 在安装了你包的应用中写入的智能体文档到达智能体。见 {@link namespace:global} 和 {@link generic:computer-agent-guide}。',
        },
      ],
    },
  ],
};
