// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs authoring/building-blocks/templates/document-the-template/replace-a-core-template`:
 * deliberately replace one Core template through template metadata.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'replace-a-core-template',
  placement: {
    parent: 'namespace:document-the-template',
    slot: 'guides',
    order: 40,
  },
  title: '替换 Core 模板',
  category: 'guide',
  description:
    '只有当集成有意改变某个 Core 模板 id 默认返回的源码时，才使用模板替换。',
  sections: [
    {
      id: 'replace-only-on-purpose',
      title: '仅在有意为之时替换',
      content: [
        {
          type: 'prose',
          text: '谨慎使用：只有当使用该集成的每个应用默认都应收到你为现有 Core id 提供的源码时，才替换 Core 模板。备选方案、产品专属变体或其他类型的模板应改用自己的 id（{@link generic:start-a-template}）。',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '不写 `replaces` 而共用 Core id 并不会替换 Core。它会让裸 id 产生歧义，`{@command template <id>}` 会失败，直到应用加上 `--package`，且 `doctor integration templates` 会报告这次意外冲突。',
            '替换可以保留 Core id，也可以用自己的 id。让它成为默认的正是 `replaces`。',
          ],
        },
      ],
    },
    {
      id: 'declare-the-replacement',
      title: '声明替换',
      content: [
        {
          type: 'prose',
          text: '先找到确切的 Core id 与类型。',
        },
        {
          type: 'code',
          lang: 'bash',
          code: 'astryx --json template --list --package @astryxdesign/core',
        },
        {
          type: 'code',
          lang: 'javascript',
          label: 'templates/acme-app-shell.doc.mjs',
          code: `/** @type {import('@astryxdesign/cli/authoring').IntegrationTemplateDoc} */
export default {
  type: 'page',
  name: 'acme-app-shell',
  displayName: 'Acme App Shell',
  description:
    'Acme 应用外壳，含产品导航、账户控件与响应式内容区。',
  replaces: 'shell-side-nav',
  isReady: true,
  category: 'Shell - Left Sidebar',
};`,
        },
        {
          type: 'prose',
          text: '全部字段见 {@link schema:template-doc}。',
        },
        {
          type: 'prose',
          text: '在模板 doc 上声明 `replaces`，绝不要写在 `astryx.integration.mjs` 里。',
        },
      ],
    },
    {
      id: 'require-a-compatible-cli',
      title: '要求兼容的 CLI',
      content: [
        {
          type: 'prose',
          text: '把 `integration verify` 指出的 CLI 最低版本声明为可选 peer 依赖（{@link generic:versioning}）。',
        },
        {
          type: 'code',
          lang: 'json',
          label: 'package.json',
          code: `{
  "peerDependencies": {
    "@astryxdesign/cli": ">=0.6.4"
  },
  "peerDependenciesMeta": {
    "@astryxdesign/cli": {
      "optional": true
    }
  }
}`,
        },
        {
          type: 'prose',
          text: '该 peer 缺失或过旧时，`integration verify` 会报告 `replaces_needs_cli`。没有它，已发布的 0.6.3 及更早版本会丢弃该模板并隐藏你的文档话题。',
        },
      ],
    },
    {
      id: 'what-apps-receive',
      title: '应用会得到什么',
      content: [
        {
          type: 'code',
          lang: 'bash',
          code: `# Receives the active replacement
{@command template shell-side-nav src/app}

# Receives the original Core template
{@command template shell-side-nav --package @astryxdesign/core src/app}`,
        },
        {
          type: 'prose',
          text: '多个集成替换同一 Core 模板时，由一个胜出：',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '在 `astryx.config.mjs` 中显式列出的集成，胜过仅被安装、自动选中的集成。',
            '多个显式配置的集成替换同一目标时，列在后面的胜出，且 Astryx 会报告歧义。',
            '没有任何集成被显式配置时，应用 package.json 依赖中列在后面的包胜出。请显式配置你想要的集成，不要依赖这个顺序。',
          ],
        },
      ],
    },
    {
      id: 'check-the-replacement',
      title: '检查替换',
      content: [
        {
          type: 'code',
          lang: 'bash',
          code: '{@command doctor integration templates}',
        },
        {
          type: 'table',
          headers: ['问题', '含义'],
          rows: [
            [
              '`missing_template_replacement_target`',
              '`replaces` 未指向任何 Core 模板 id。',
            ],
            [
              '`invalid_template_replacement`',
              '替换不可用，或其 page/block 类型与 Core 不一致。',
            ],
            [
              '`ambiguous_template_replacement`',
              '一个包为同一目标声明了两个替换，或多个生效的包争抢该目标。',
            ],
          ],
        },
        {
          type: 'prose',
          text: '替换解析默认是安全的。源码缺失、doc 非法、目标缺失、类型不符或声明冲突，都不会把 Core id 交给可疑的替换：Astryx 会报告问题并保留 Core 模板。发布前修复所有问题。',
        },
      ],
    },
  ],
};
