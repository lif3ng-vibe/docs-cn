// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs authoring/ship/upgrading`: update an integration
 * package for each Astryx release, and the command apps run to upgrade with
 * it.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'upgrading',
  placement: {parent: 'namespace:ship', slot: 'guides', order: 50},
  title: '升级',
  category: 'guide',
  keywords: ['升级应用', '发布说明'],
  description:
    '为每个 Astryx 版本更新你的包，并帮助应用随之升级。',
  sections: [
    {
      id: 'update-for-a-new-astryx-release',
      title: '为新版 Astryx 更新',
      content: [
        {
          type: 'prose',
          text: 'Astryx 发布新版本时，提升你的 devDependencies 版本、重新运行各项检查、放宽 peer 依赖范围，并为每个破坏应用的变更交付一个 codemod。',
        },
        {
          type: 'code',
          lang: 'bash',
          code: '# 1. Build and test against the new release\n{@pm install @astryxdesign/cli@latest @astryxdesign/core@latest --dev}\n# 2. Rerun the checks\n{@command doctor integration validate}\n{@command doctor integration docs}\n{@command integration verify}\n# 3. Admit the new Core once the checks pass\n{@pm-only npm "edits package.json" pkg set \'peerDependencies.@astryxdesign/core=^0.6.0 || ^0.7.0\'}\n# 4. Migrate apps across a change that breaks them\n{@command integration add codemod rename-delay --to 0.7.0}',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '运行 {@link generic:checks} 中的每一项检查，而不仅是这里展示的几项。',
            'codemod 文件夹按 Core 版本命名：{@link generic:codemods}。',
            '将结果作为你的包的新版本发布；参见 {@link generic:publishing}。',
          ],
        },
      ],
    },
    {
      id: 'upgrade-an-app',
      title: '升级应用',
      content: [
        {
          type: 'prose',
          text: '应用安装新的 Core 之后，`{@command upgrade}` 会针对其跨越的各版本运行相应 codemod。默认是演练（dry run）；`--apply` 才会写入更改。',
        },
        {
          type: 'code',
          lang: 'bash',
          code: '# Preview what would change; nothing is written\n{@command upgrade --from 0.6.3 --integration @acme/astryx-widgets}\n# Write the changes\n{@command upgrade --from 0.6.3 --integration @acme/astryx-widgets --apply}',
        },
        {
          type: 'code',
          lang: 'text',
          code: 'Integrations: @acme/astryx-widgets\n<n> codemods to run\nApplying integration codemods...\n  Rename AcmeCarousel delay to interval (v0.7.0, @acme/astryx-widgets)\n[ok]     [ok] src/Hero.tsx',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '`--from` 是应用此前使用的 `@astryxdesign/core` 版本，目标版本则是已安装的 Core。',
            '`--integration` 指明你的包。若缺少它，或 `astryx.config` 中缺少 `integrations` 条目，升级就会跳过你的 codemod，即使应用已安装你的包。',
            '`<n>` 包含 Core 针对相同版本的 codemod，它们会先运行。',
            '请将这条命令写进你的发布说明。',
          ],
        },
      ],
    },
    {
      id: 'know-which-files-upgrades-skip',
      title: '了解升级会跳过哪些文件',
      content: [
        {
          type: 'prose',
          text: '升级从不写入应用标记为生成（generated）、vendored 或忽略（ignored）的文件。当这类文件仍需要 codemod 更改时，升级会以 `ERR_CODEMOD_PROTECTED` 和退出码 1 停止。',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '生成（generated）：文件顶部的 `@generated` 注释，或 `.gitattributes` 中的 `linguist-generated`。',
            'vendored：`.gitattributes` 中的 `linguist-vendored`。',
            '忽略（ignored）：`.gitignore` 或 `.hgignore` 中的匹配项。',
          ],
        },
        {
          type: 'code',
          lang: 'text',
          code: '!     ! src/gen/Gen.tsx - protected by @generated in the leading comment block\nERR_CODEMOD_PROTECTED: 1 protected file still requires a codemod change:\n  src/gen/Gen.tsx — @generated in the leading comment block\nUpgrade incomplete: protected changes remain',
        },
        {
          type: 'prose',
          text: '升级仍会写入其余所有文件。其选项与退出码见 {@link command:upgrade}。',
        },
      ],
    },
  ],
};
