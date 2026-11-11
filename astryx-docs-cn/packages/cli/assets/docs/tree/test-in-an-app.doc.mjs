// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs authoring/ship/test-in-an-app`: install the packed
 * package in an app and run the commands its users run.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'test-in-an-app',
  placement: {parent: 'namespace:ship', slot: 'guides', order: 10},
  title: '在应用中测试集成',
  category: 'guide',
  keywords: ['在本地测试集成', '在应用中试用集成'],
  description:
    '将打包好的包安装进一个应用，并运行其用户将要运行的命令。',
  sections: [
    {
      id: 'install-the-packed-package',
      title: '在应用中安装打包好的包',
      content: [
        {
          type: 'prose',
          text: '在包所在文件夹的上一级目录执行打包，这样下一次打包就不会把它打进去；然后将它与 Core 和 CLI 一起安装进应用。应用之所以会加载你的包，是因为它是依赖。',
        },
        {
          type: 'code',
          lang: 'bash',
          code: '# In the package\n{@pm-only npm "the tarball the registry receives" pack --pack-destination ..}\n\n# In an app folder beside it\n{@pm install @astryxdesign/core @astryxdesign/cli ../acme-astryx-widgets-1.0.0.tgz}',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '也在应用中安装 CLI：`astryx` 会从应用的 `node_modules` 运行 CLI。',
            '应用持有的是副本，而不是链接。每次改动后，重新打包并运行同样的 `{@pm install}`。',
            '在包内部读到的改动是你的源码；应用里看到的则是 npm 将要发布的产物。',
          ],
        },
      ],
    },
    {
      id: 'check-what-the-app-sees',
      title: '检查应用看到的内容',
      content: [
        {
          type: 'prose',
          text: '在应用文件夹中，运行你的用户会运行的命令。每条命令都应在你的包名下显示你的贡献内容。',
        },
        {
          type: 'code',
          lang: 'bash',
          code: '{@command component AcmeCarousel}\n{@command template --list --package @acme/astryx-widgets}\n{@command theme list --package @acme/astryx-widgets}\n{@command docs acme}\n{@command search deploying --type doc}',
        },
        {
          type: 'table',
          headers: ['命令', '应看到'],
          rows: [
            [
              '`component AcmeCarousel`',
              "`import {AcmeCarousel} from '@acme/astryx-widgets/components/AcmeCarousel';`",
            ],
            [
              '`template --list --package`',
              '一条 `acme-dashboard` 条目，其 `package` 为 `@acme/astryx-widgets`',
            ],
            [
              '`theme list --package`',
              '一条 `ocean` 条目，其 `package` 为 `@acme/astryx-widgets`',
            ],
            ['`docs acme`', '你的分区，包含 `deploying` 之类的指南'],
            [
              '`search deploying --type doc`',
              '`acme/deploying` 作为第一条结果',
            ],
          ],
        },
        {
          type: 'prose',
          text: '`--package` 将 `template --list` 和 `theme list` 限定到单个包。`component --list` 会忽略它并把 Core 一并列出，因此按名称查找组件即可。最后，在应用的代码中导入 `AcmeCarousel` 并构建应用——就像你的用户会做的那样。',
        },
      ],
    },
    {
      id: 'run-doctor-in-the-app',
      title: '在应用中运行 doctor',
      content: [
        {
          type: 'prose',
          text: '`{@command doctor}` 检查整个应用，包括它加载的每一个包。`doctor integration validate` 则按应用实际安装的形态检查你的包。',
        },
        {
          type: 'code',
          lang: 'bash',
          code: '{@command doctor}\n{@command doctor integration validate @acme/astryx-widgets}',
        },
        {
          type: 'code',
          lang: 'text',
          code: 'id:      implicit-integrations\nstatus:  [info]\nlabel:   Implicitly linked integrations\nmessage: 1 integration loaded from installed dependencies with no astryx.config entry: @acme/astryx-widgets@1.0.0 from dependencies, contributing components, templates, themes, docs, codemods.',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '`implicit-integrations` 行会点名应用加载的每个没有配置的包。`[info]` 属于预期结果。',
            '当你的某个文档分区超过 32 KB 时，`docs-progressive-disclosure` 行会发出警告。`doctor integration` 的检查不度量大小。',
            '当安装的副本完好时，`doctor integration validate @acme/astryx-widgets` 会输出 `[ok] No integration issues found.`',
          ],
        },
      ],
    },
  ],
};
