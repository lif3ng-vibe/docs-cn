// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs authoring/building-blocks/templates/document-the-template/page-template`:
 * the page-only fields that help people find a page.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'page-template',
  placement: {
    parent: 'namespace:document-the-template',
    slot: 'guides',
    order: 20,
  },
  title: '页面模板',
  category: 'guide',
  description:
    '帮人找到页面：给它一个 category 以便 `{@command search}` 与模板列表收录，并把刻意精简的起始外壳标记为 scaffold。',
  sections: [
    {
      id: 'start-from-the-generated-page-doc',
      title: '从生成的页面 doc 入手',
      content: [
        {
          type: 'prose',
          text: '`integration add template` 默认会写出一个页面 doc。替换其中的示例 description，然后加上下方的页面专属字段。',
        },
        {
          type: 'code',
          lang: 'javascript',
          label: 'templates/acme-dashboard.doc.mjs',
          code: `/** @type {import('@astryxdesign/cli/authoring').IntegrationTemplateDoc} */
export default {
  type: 'page',
  name: 'acme-dashboard',
  displayName: 'Acme Analytics Dashboard',
  description:
    '可筛选的账户健康状况仪表盘，含核心指标、趋势图与近期动态表。适用于仪表盘、报表、分析或状态总览。',
  category: 'Dashboard - Analytics',
  isReady: false,
};`,
        },
      ],
    },
    {
      id: 'help-people-find-the-page',
      title: '帮人找到页面',
      content: [
        {
          type: 'prose',
          text: '全部字段见 {@link schema:template-doc}。',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '把 `category` 设为受支持的 `{Group} - {Variant}` 取值中最具体的一个。它的词会成为 `{@command search}` 的搜索词，并出现在 JSON 模板列表里。',
            '只对刻意精简的起始外壳设置 `scaffold: true`。JSON 模板列表会标注它，工具与画廊就能区分 scaffold 与成品页面。',
            '只有 Astryx 自家画廊读取的字段（如 `isHiddenFromOverview`）对集成模板没有效果。',
          ],
        },
      ],
    },
  ],
};
