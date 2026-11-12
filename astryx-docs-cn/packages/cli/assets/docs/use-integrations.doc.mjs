// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */

export const docs = {
  type: 'generic',
  name: 'use-integrations',
  title: '使用集成',
  category: 'guide',
  description:
    '安装、发现并使用为应用增添组件、模板、主题与文档的集成包。',
  keywords: [
    '安装集成',
    '添加集成',
    '安装包',
    '使用集成',
    '发现集成',
    '集成',
    '包',
    '第三方',
    '插件',
    '扩展',
  ],

  sections: [
    {
      title: '发现集成',
      content: [
        {
          type: 'prose',
          text: '集成包用额外的组件、模板、主题、文档与 codemod 扩展 Astryx。它们以普通 npm 包的形式发布。',
        },
        {
          type: 'prose',
          text: '搜索你需要的：',
        },
        {
          type: 'code',
          lang: 'bash',
          code: 'astryx search carousel\nastryx discover',
        },
        {
          type: 'prose',
          text: '`search` 会在 CLI 认识的一切中查找（组件、文档、模板、主题与 hook），因此像 "carousel" 这样的词，无论它是组件、模板还是文档页都能找到。`discover` 列出项目已有的全部集成；配置了发现源时，还会列出可以添加的包。',
        },
      ],
    },
    {
      title: '安装集成',
      content: [
        {
          type: 'prose',
          text: '用你的包管理器安装该包。集成会自动链接：CLI 会在依赖里找到它们，装好即生效：',
        },
        {
          type: 'code',
          lang: 'bash',
          code: '{@pm install @acme/brand-integration}',
        },
        {
          type: 'prose',
          text: '运行 `astryx doctor` 确认一切接好了线。如果需要加载一个不是直接依赖的包，把它显式加进 `astryx.config.mjs`：',
        },
        {
          type: 'code',
          lang: 'js',
          label: '可选：显式配置条目',
          code: "export default {\n  integrations: ['@acme/brand-integration'],\n};",
        },
      ],
    },
    {
      title: '使用它带来的东西',
      content: [
        {
          type: 'prose',
          text: '安装之后，集成的贡献会与 Core 并排出现：',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '`astryx component --list` 会把它的组件与 Core 组件并列展示。',
            '`astryx template --list` 会包含它的页面与区块模板。',
            '`astryx theme list` 会列出它的主题；用 `astryx theme add <slug> --package @acme/brand-integration` 添加。',
            '`astryx docs` 会展示它提供的指南。',
            '`astryx search <query>` 能找到每个已安装集成里的一切。',
          ],
        },
        {
          type: 'prose',
          text: '按集成文档给出的子路径导入组件。运行 `astryx component <Name>` 查看确切导入：',
        },
        {
          type: 'code',
          lang: 'jsx',
          code: "import {AcmeCarousel} from '@acme/brand-integration/components/AcmeCarousel';",
        },
        {
          type: 'prose',
          text: '主题相关见 {@link generic:use-a-theme}。要构建你自己的集成，见 {@link namespace:authoring}。',
        },
      ],
    },
    {
      title: '检查问题',
      content: [
        {
          type: 'prose',
          text: '运行 `astryx doctor` 查看集成问题：缺失的根目录、无效的贡献或 CLI 版本不匹配。doctor 检查是唯一一个把每个包的所有问题都列出来的地方。',
        },
        {
          type: 'code',
          lang: 'bash',
          code: 'astryx doctor',
        },
      ],
    },
  ],
};
