// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs authoring/building-blocks/components/see-it-in-an-app`: inspect an
 * integration component from an app that installs the package.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'see-it-in-an-app',
  placement: {parent: 'namespace:components', slot: 'guides', order: 40},
  title: '在应用中查看',
  category: 'guide',
  description:
    '确认应用能发现该组件、其包、其公开 import 与其文档。',
  sections: [
    {
      id: 'read-the-installed-component',
      title: '读取已安装的组件',
      content: [
        {
          type: 'prose',
          text: '安装了你包的应用会在 Core 组件旁边看到该组件，附带其包名与公开 import。应用无需任何配置。',
        },
        {
          type: 'code',
          lang: 'bash',
          code: `{@command component AcmeCarousel}
{@command component --list}
{@command search carousel}`,
        },
        {
          type: 'code',
          lang: 'text',
          code: `package: @acme/astryx-widgets

# AcmeCarousel

Cycles through slides one at a time. Use it for a small set of related cards.

**Import:** \`import {AcmeCarousel} from '@acme/astryx-widgets/components/AcmeCarousel';\``,
        },
        {
          type: 'prose',
          text: '`component --list` 会以 `import: @acme/astryx-widgets/components/AcmeCarousel  [@acme/astryx-widgets]` 的形式显示它。构建期间，在你的包里运行同样的命令也一样可用。',
        },
      ],
    },
    {
      id: 'test-the-packed-package',
      title: '测试打包后的包',
      content: [
        {
          type: 'prose',
          text: '发布之前，先在测试应用中安装打包好的包，然后在那里运行同样的详情、列表与搜索命令。见 {@link generic:test-in-an-app}。',
        },
      ],
    },
    {
      id: 'global-mode',
      title: '全局模式',
      content: [
        {
          type: 'prose',
          text: '全局模式下：要在应用中检查你的包，就把它安装进该应用；为整台电脑安装的副本在项目内不会被使用。要在项目外检查，把它与 CLI 一起装到整台电脑。见 {@link namespace:global} 和 {@link generic:global-integrations}。',
        },
      ],
    },
  ],
};
