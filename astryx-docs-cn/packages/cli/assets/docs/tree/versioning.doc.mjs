// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs authoring/ship/versioning`: version an integration
 * package, know which changes break apps, declare peer ranges, keep apps on
 * older CLIs working, and match codemod folders to versions.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'versioning',
  placement: {parent: 'namespace:ship', slot: 'guides', order: 30},
  title: '版本管理',
  category: 'guide',
  keywords: ['peer 依赖', 'semver', 'CLI 版本'],
  description:
    '为你的包定版本、声明 peer 依赖，并让使用旧版 CLI 的应用继续正常工作。',
  sections: [
    {
      id: 'pick-a-version',
      title: '选择版本号',
      content: [
        {
          type: 'prose',
          text: '用 semver 为你的包定版本：破坏性变更提升主版本号，新功能提升次版本号，修复提升修订号。',
        },
        {
          type: 'code',
          lang: 'bash',
          code: '# 1.0.0 -> 2.0.0: a breaking change\n{@pm-only npm "npm, which every Node install carries, sets the version" version major}\n# 1.0.0 -> 1.1.0: a new feature\n{@pm-only npm "npm, which every Node install carries, sets the version" version minor}\n# 1.0.0 -> 1.0.1: a fix\n{@pm-only npm "npm, which every Node install carries, sets the version" version patch}',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '1.0.0 之前，npm 把每个次版本都视为破坏性变更：请求 `^0.6.0` 的应用永远不会得到 `0.7.0`。破坏性变更提升次版本号，其余变更提升修订号。',
            '为每个破坏性变更随附 codemod，让应用得以迁移；参见 {@link generic:codemods}。',
          ],
        },
      ],
    },
    {
      id: 'know-what-breaks-apps',
      title: '了解什么会破坏应用',
      content: [
        {
          type: 'prose',
          text: '破坏性变更会让应用中原本正常的代码、命令或链接在升级后失效。对集成包而言，这些名称都是其 API 的一部分。',
        },
        {
          type: 'table',
          headers: ['你更改或移除的内容', '应用中会失效的内容'],
          rows: [
            [
              '组件名，例如 `AcmeCarousel`',
              '导入语句，以及 `{@command component AcmeCarousel}`',
            ],
            [
              '模板 id，例如 `acme-dashboard`',
              '`{@command template acme-dashboard}`',
            ],
            ['主题 slug，例如 `ocean`', '`{@command theme add ocean}`'],
            [
              '话题名称或路由，例如 `acme/deploying`',
              '对旧名称的读取，以及其他文档中指向它的链接',
            ],
            [
              '组件的 `import` 路径',
              '按旧路径书写的导入语句',
            ],
            [
              '`exports` 条目',
              '对该路径的导入，会以 `ERR_PACKAGE_PATH_NOT_EXPORTED` 失败',
            ],
            ['prop', '传入该 prop 的代码'],
          ],
        },
        {
          type: 'prose',
          text: '在你的发布说明中列出每个破坏性变更，以及迁移它的 codemod。任何 changelog 工具都可以。如果 `package.json` 有 `files` 允许列表，请把 `CHANGELOG.md` 加进去，这样 npm 打包时才会包含它。',
        },
      ],
    },
    {
      id: 'declare-peer-ranges',
      title: '声明 peer 范围',
      content: [
        {
          type: 'prose',
          text: '把你代码导入的 Astryx 包在 `peerDependencies` 中声明为 peer 依赖，这样应用对每个包只安装一份。每个范围都放宽到你经测试所能证明的程度。',
        },
        {
          type: 'table',
          headers: ['Peer 依赖', '何时声明', '范围'],
          rows: [
            [
              '`@astryxdesign/core`',
              '你的代码导入了 Core，例如主题通过 `@astryxdesign/core/theme` 导入',
              '你测试过的 Core 版本，例如 `^0.6.0`',
            ],
            [
              '`@astryxdesign/theme-*`',
              '你的代码导入了该主题包',
              '你测试过的版本',
            ],
            [
              '`@astryxdesign/cli`',
              '你交付了文档 section、带 placement 的指南、设置了 `replaces` 或 `keywords` 的模板、设置了 `replaces` 的组件、带 `id` 的文档 section，或一个主题',
              '交付设置 `keywords` 的模板时为 `>=0.6.6`，组件设置 `replaces` 时为 `>=0.6.7`，否则为 `>=0.6.4`。在 `peerDependenciesMeta` 中标记为可选',
            ],
          ],
        },
        {
          type: 'code',
          lang: 'json',
          code: '{\n  "peerDependencies": {\n    "@astryxdesign/core": "^0.6.0",\n    "@astryxdesign/cli": ">=0.6.4"\n  },\n  "peerDependenciesMeta": {\n    "@astryxdesign/cli": {"optional": true}\n  }\n}',
        },
        {
          type: 'prose',
          text: '`integration verify` 会让两类包失败：需要 CLI peer 却没有声明的包，以及其范围允许一个对所交付内容而言过旧的稳定版 CLI 的包。`integration add doc --parent` 与 `integration add theme` 会替你写好 peer 依赖。',
        },
        {
          type: 'prose',
          text: '当 CLI 不在该范围内时，`doctor integration validate` 与 `integration check` 会列出一条指名你的包的 `cli_peer_version` 提示（note）。提示不会导致任何失败，包括 `--strict` 模式在内，`integration verify` 也不会报告它。低于范围时，提示会给出在你的包目录中把新版 Core 与 CLI 一起安装为 dev 依赖的命令，然后再运行 `upgrade --apply`。高于范围时，在应用中提示会要求发布一个支持该 CLI 的你的包版本；在你自己的包目录中，它会要求你用该 CLI 测试你的包并放宽范围。',
        },
      ],
    },
    {
      id: 'support-older-clis',
      title: '支持旧版 CLI',
      content: [
        {
          type: 'prose',
          text: '应用运行的 CLI 可能比你构建时用的更旧。CLI 会读取自己认识的内容并跳过其余部分，但某些较新的文件会让旧版 CLI 隐藏你的文档。',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '`astryx.integration.mjs` 中的未知字段会被忽略并给出 `unknown_manifest_key` 警告，清单的其余部分仍会加载。',
            'CLI 不认识的具名导出会被静默忽略（无警告），因此添加 `debug` 与 `gapReport` 是安全的。',
            '0.6.3 及更早的已发布版本会原样打印每个 `{@link ...}`。',
            '0.6.3 及更早的版本会拒绝设置了 `replaces` 或 `keywords` 的模板、丢弃该模板，并隐藏你的包交付的每个文档话题。0.6.4 与 0.6.5 仍会丢弃设置了 `keywords` 的模板。',
            '0.6.3 及更早的版本无法读取文档 section、section `id`，或 `integration add theme` 写出的主题文件夹。它们随后可能隐藏你的包交付的每个文档话题。',
            '0.6.2 与 0.6.3 仍会加载你的组件，但 0.6.0 与 0.6.1 无法读取 `integration add component` 写出的组件文档：`component AcmeCarousel` 在这些版本上会失败。',
            '在旧版 CLI 上，若组件的文档指名了其文件中的另一个导出，应用会把该组件列在文件名之下，并且不列出家族成员，因此 `component AcmeCarousel` 在那里会失败。',
          ],
        },
        {
          type: 'prose',
          text: '`integration verify` 会为文档 section、带 placement 的指南、模板的 `replaces` 或 `keywords`、带 `id` 的文档 section 以及主题要求 CLI peer。对其中某一项而言过旧的 CLI 无法读取它；当它隐藏你的话题时，`docs` 不会给出任何警告。',
        },
      ],
    },
    {
      id: 'codemods-and-versions',
      title: '以 Core 版本命名 codemod 文件夹',
      content: [
        {
          type: 'prose',
          text: '以应该运行它的那轮 Core 升级的版本来命名每个 codemod 文件夹，而不是以你的包版本命名。应用会运行哪些文件夹、何时运行，见 {@link generic:codemods} 中的"选择 codemod 的运行时机"。',
        },
      ],
    },
  ],
};
