// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs authoring/building-blocks/templates/start-a-template`:
 * what a template is, why an integration shares one, whether it is a page or
 * a block, and how to add one.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'start-a-template',
  placement: {parent: 'namespace:templates', slot: 'build', order: 10},
  title: '开始一个模板',
  category: 'guide',
  keywords: [
    '什么是模板',
    '添加模板',
    '页面模板',
    '区块模板',
  ],
  description:
    '把你的 UI 想法变成完整页面或页面片段，帮助他人更快地构建应用，并共享一致的视觉语言。',
  sections: [
    {
      id: 'what-a-template-is',
      title: '模板是什么',
      content: [
        {
          type: 'prose',
          text: '与组件不同，模板会变成应用代码：应用把它复制进自己的代码，再按自家产品需要改造。',
        },
        {
          type: 'prose',
          text: '组件始终是包依赖，随包一起更新；复制出的模板则不然，因此更新包永远不会改写应用手里的那份副本。',
        },
        {
          type: 'code',
          lang: 'bash',
          code: `# How an app finds a template and copies it
{@command template --list}
{@command template acme-dashboard src/app/dashboard}`,
        },
      ],
    },
    {
      id: 'why-share-one',
      title: '为什么要共享模板',
      content: [
        {
          type: 'prose',
          text: '模板帮助他人更快地构建应用，同时让各产品保持一致的视觉语言。当人们上手需要不止一个组件时，就适合共享模板：它把合适的组件、布局、内容结构与交互接线预先组装好一并带来。',
        },
        {
          type: 'prose',
          text: '不要为了共享结构而把特定产品的页面硬做成组件。以模板形式共享它，让每个应用自行改写文案。',
        },
      ],
    },
    {
      id: 'choose-page-or-block',
      title: '选择页面还是区块',
      content: [
        {
          type: 'table',
          headers: ['类型', '适用场景'],
          rows: [
            [
              '页面',
              '完整的屏幕，例如仪表盘、设置页或结账流程。',
            ],
            [
              '区块',
              '放在页面内部的较小片段，例如 hero 区、表单或数据面板。区块也可以作为某个组件的示例或展示。',
            ],
          ],
        },
      ],
    },
    {
      id: 'pick-a-template-id',
      title: '选定模板 id',
      content: [
        {
          type: 'prose',
          text: '选一个稳定的小写 kebab-case id，例如 `acme-dashboard`。id 会成为源文件与文档的文件名、包导出名，以及应用传给 `{@command template}` 的值。要改标签，请编辑文档（{@link generic:template-doc-overview}）；绝不要重命名 id。',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '以你的产品或包名开头，再命名这个可复用的模式，让 id 与 Core 及其他集成区分开。',
            '不要以 `-page`、`-app`、`-view` 或 `-screen` 结尾。',
            '不要无意复用 Core 的 id：裸 id 在每个安装了你包的应用里都会产生歧义。若要有意接管某个 Core 模板，请声明 `replaces`（{@link generic:replace-a-core-template}）。',
          ],
        },
        {
          type: 'code',
          lang: 'bash',
          code: '# See the Core ids\nastryx --json template --list --package @astryxdesign/core',
        },
      ],
    },
    {
      id: 'run-the-add-command',
      title: '运行 add 命令',
      content: [
        {
          type: 'prose',
          text: '默认添加的是页面。传入 `--type block` 可添加区块。',
        },
        {
          type: 'code',
          lang: 'bash',
          code: `{@command integration add template acme-dashboard}
{@command integration add template acme-stat-card --type block}`,
        },
        {
          type: 'code',
          lang: 'text',
          code: `template contribution added

[ok] acme-dashboard

Declare template root ./templates in astryx.integration.mjs.

- templates/acme-dashboard.doc.mjs
- templates/acme-dashboard.tsx
- package.json
- astryx.integration.mjs`,
        },
        {
          type: 'prose',
          text: '该命令会写入 `templates/<id>.tsx`（UI）与 `templates/<id>.doc.mjs`（元数据），并在 `astryx.integration.mjs` 中声明 templates 目录。当 `package.json` 含有 `exports` 映射时，还会添加 `./templates/<id>` 导出（{@link generic:export-template-assets}）。',
        },
        {
          type: 'prose',
          text: '它绝不覆盖已存在的源文件或文档文件。加上 `--dry-run` 可先查看每一个计划中的写入。',
        },
      ],
    },
    {
      id: 'global-mode',
      title: '全局模式下',
      content: [
        {
          type: 'prose',
          text: '全局模式下：用户为自己的电脑安装你的包（与全局 CLI 并存）时，你的模板会出现在任何项目之外的文件夹里；在项目内，则只有该项目也安装了你的包才会出现。参见 {@link namespace:global} 与 {@link generic:global-integrations}。',
        },
      ],
    },
  ],
};
