// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs authoring/building-blocks/templates/document-the-template/template-doc-overview`:
 * the source and doc file pair, the fields every template doc shares, and how
 * to check what Astryx lists.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'template-doc-overview',
  placement: {
    parent: 'namespace:document-the-template',
    slot: 'guides',
    order: 10,
  },
  title: '模板文档总览',
  category: 'guide',
  description:
    '了解模板文档控制什么，随着 UI 变化保持其准确，并检查 Astryx 如何列出该模板。',
  sections: [
    {
      id: 'understand-the-two-files',
      title: '理解两个文件',
      content: [
        {
          type: 'prose',
          text: '每个模板都有一个源文件和一个文档文件。以 `acme-dashboard` 为例，源文件是 `templates/acme-dashboard.tsx`，文档是 `templates/acme-dashboard.doc.mjs`。两者都以 `acme-dashboard` 开头，Astryx 据此知道它们属于一体。',
        },
        {
          type: 'table',
          headers: ['文件', '控制什么'],
          rows: [
            [
              '`templates/acme-dashboard.tsx`',
              '应用复制后归其所有的 UI 源码。',
            ],
            [
              '`templates/acme-dashboard.doc.mjs`',
              '复制之前 Astryx 如何命名、描述、归类、预览和解析该模板。',
            ],
          ],
        },
        {
          type: 'prose',
          text: '集成清单（manifest）只告诉 Astryx `templates` 目录的位置，并不逐个列出模板。只要用途、预览、就绪状态或替换行为发生变化，就同时修改源文件与文档。没有任何自动检查能判断文档是否仍与渲染出的 UI 相符。',
        },
      ],
    },
    {
      id: 'document-the-shared-fields',
      title: '编写共享字段',
      content: [
        {
          type: 'prose',
          text: '以下字段适用于所有页面与区块。页面、区块与替换指南会补充各自独有的字段。',
        },
        {
          type: 'prose',
          text: '所有字段见 {@link schema:template-doc}。',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '把 `type` 设为你在 {@link generic:start-a-template} 中选定的种类。它决定文档还能接受哪些其他字段。',
            '文件名决定模板 id（{@link generic:start-a-template}）。标签放在文档里：终端列表打印 `name`，JSON 列表打印 `displayName`。改其中任何一个都不会改变 id。',
            '描述要写给正在多个模板之间做选择的人。{@link generic:template-grading-rubric} 的 Doc metadata 类目定义了完整描述应覆盖的内容。',
            "在 `keywords` 中写出模板服务的概念：构建者可能使用的领域、任务及其他名称，用小写，例如服务健康仪表盘可用 `['monitoring', 'uptime', 'on-call']`。搜索与构建如何使用它们见 {@link generic:field-reference}，因此描述可以专注于布局本身。",
            '生成文档后立刻加上 `isReady: false`，因为没有 `isReady` 的文档会被列为已就绪。直到模板通过 {@link generic:test-template-in-app} 与质量评审后再移除。',
          ],
        },
        {
          type: 'prose',
          text: '注意：`keywords` 需要 `@astryxdesign/cli` 0.6.6 或更高版本。低于 0.6.6 的稳定版 CLI 会拒绝该字段并丢弃该模板；低于 0.6.4 的版本还会隐藏你的文档话题：`template --list` 与 `search` 会打印一条警告，而 `docs` 与 `build` 则一言不发。把 CLI 下限声明为 optional peer 依赖（{@link generic:versioning}）；在此之前 `integration verify` 会一直失败。',
        },
      ],
    },
    {
      id: 'check-how-astryx-lists-it',
      title: '检查 Astryx 如何列出它',
      content: [
        {
          type: 'prose',
          text: '每次修改文档后，查看按包过滤的模板列表。确认 id、可见名称、描述、类型、就绪状态与包名。',
        },
        {
          type: 'code',
          lang: 'bash',
          code: 'astryx --json template --list --package @acme/astryx-templates',
        },
        {
          type: 'code',
          lang: 'json',
          label: '相关列表结果',
          code: `{
  "id": "acme-dashboard",
  "name": "acme-dashboard",
  "displayName": "Acme Dashboard",
  "description": "An analytics dashboard for reviewing account health and recent trends.",
  "type": "page",
  "package": "@acme/astryx-templates",
  "isReady": false
}`,
        },
      ],
    },
  ],
};
