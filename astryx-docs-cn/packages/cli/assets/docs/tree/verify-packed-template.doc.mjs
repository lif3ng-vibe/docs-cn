// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs authoring/building-blocks/templates/build-the-template/package-and-test/verify-packed-template`:
 * what `integration verify` checks for templates, and what it leaves to the
 * app test.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'verify-packed-template',
  placement: {
    parent: 'namespace:package-and-test',
    slot: 'guides',
    order: 20,
  },
  title: '验证打包后的包',
  category: 'guide',
  description:
    '在发布之前发现缺失的文件、导出与 CLI 要求，并了解哪些内容仍需应用测试。',
  sections: [
    {
      id: 'run-the-package-check',
      title: '运行包检查',
      content: [
        {
          type: 'code',
          lang: 'bash',
          code: '{@command integration verify}',
        },
        {
          type: 'prose',
          text: '`integration verify` 会运行 `{@pm-only npm "the tarball the registry receives" pack}`（包括生命周期脚本），把 `.tgz` 文件解包到一个不安装依赖的临时应用中，并对解包后的集成进行检查。它不会发布任何内容，并会删除 `.tgz` 文件与临时应用。',
        },
        {
          type: 'list',
          style: 'ordered',
          items: [
            '校验清单（manifest）、每个模板文档、其源文件以及模板目录。',
            '检查清单与每个模板文件都已包含在 `.tgz` 文件中。',
            '检查每个打包后的模板与你的工作副本保持相同的 id、type、`name` 和 `replaces`。它不比较模板源码或其他文档字段。',
            '在解包后的包中，通过每个模板的公共包路径解析该模板。',
            '检查解析出的模板模块具有默认导出。',
            '检查模板替换等功能所需的 CLI peer 依赖。',
          ],
        },
        {
          type: 'prose',
          text: '每次失败都会打印一行带消息的 `[fail]`；加上 `--json` 可查看每个问题码。{@link generic:troubleshooting} 列出了常见消息及其修复方法。发布前请修复所有错误，并复核所有警告。',
        },
      ],
    },
    {
      id: 'know-what-it-does-not-prove',
      title: '了解它不能证明什么',
      content: [
        {
          type: 'prose',
          text: '`integration verify` 检查打包后的模板及其公共入口。它不会把模板复制进应用，也不会运行浏览器构建，因此无法验证以下几点。',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '相对路径引用的辅助文件或样式表能否在复制后继续可用。',
            '复制后的文件能否在所有受支持的应用工具链中通过类型检查。',
            '包内自带的 CSS、字体、图标、图片或媒体能否在浏览器中加载。',
            '布局、颜色模式、键盘与指针输入以及真实内容是否正常工作。',
            '模板 id 是否与 Core 冲突，或 `replaces` 目标是否存在。这些请运行 `{@command doctor integration templates}` 检查。',
            '模板在质量评分上的得分。',
          ],
        },
      ],
    },
  ],
};
