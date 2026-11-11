// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs authoring/ship/publishing`: publish an integration to
 * npm, use release tags, and check the package before and after.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'publishing',
  placement: {parent: 'namespace:ship', slot: 'guides', order: 40},
  title: '发布集成',
  category: 'guide',
  keywords: ['发布集成', 'npm publish', '发布'],
  description:
    '以正确的发布标签将包发布到 npm，发布前后各检查一次。',
  sections: [
    {
      id: 'check-before-you-publish',
      title: '发布前检查',
      content: [
        {
          type: 'prose',
          text: '只发布通过全部检查的包，先用 `{@pm-only npm "发布走 npm，每个 Node 安装都自带" publish --dry-run}` 预览上传内容。dry run 会在不上传的情况下列出文件与标签。',
        },
        {
          type: 'code',
          lang: 'bash',
          code: '{@command doctor integration validate} && {@command doctor integration components} && {@command doctor integration templates} && {@command doctor integration docs} && {@command integration verify}\n{@pm-only npm "publishing goes through npm, which every Node install carries" publish --dry-run --access public}',
        },
        {
          type: 'code',
          lang: 'text',
          code: 'npm notice Publishing to https://registry.npmjs.org/ with tag latest and public access (dry-run)\n+ @acme/astryx-widgets@1.0.0',
        },
        {
          type: 'prose',
          text: '每次发布都设置新的 `version`；{@link generic:versioning} 说明了什么算破坏性变更。各项检查分别验证什么，见 {@link generic:checks}。',
        },
      ],
    },
    {
      id: 'keep-private-files-out',
      title: '排除私有文件',
      content: [
        {
          type: 'prose',
          text: '没有 `files` 列表时，npm 会打包所有未被 ignore 文件排除的文件，包括陈旧的 `.tgz` 文件或 `.env` 文件。应当改为显式列出要发布的内容。',
        },
        {
          type: 'code',
          lang: 'bash',
          code: "{@pm-only npm \"edits package.json\" pkg set 'files[]=components' 'files[]=templates' 'files[]=themes' 'files[]=docs' 'files[]=codemods' 'files[]=astryx.integration.mjs'}\n{@pm-only npm \"builds the tarball npm publishes\" pack --dry-run}",
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '只列出要发布的根目录，且始终包含 `astryx.integration.mjs`。npm 会自动加入 package.json，有 README 和 LICENSE 时也会一并加入。',
            '后续每次 `integration add` 都会把它的根目录追加进列表。',
            '列表缺了某个根目录时 `integration verify` 会失败，并指出应加入 `files` 的根目录（报错信息见 {@link generic:troubleshooting}）。',
          ],
        },
      ],
    },
    {
      id: 'publish-to-npm',
      title: '发布到 npm',
      content: [
        {
          type: 'prose',
          text: 'scoped 包默认是私有的，所以发布时要加 `--access public`。不指定 `--tag` 时，npm 会给发布打上 `latest` 标签，`{@pm install @acme/astryx-widgets}` 安装的正是它。',
        },
        {
          type: 'code',
          lang: 'bash',
          code: '# Publish a release\n{@pm-only npm "publishing goes through npm, which every Node install carries" publish --access public}\n\n# Or set the access once in package.json\n{@pm-only npm "Yarn has no pkg command" pkg set publishConfig.access=public}',
        },
        {
          type: 'prose',
          text: '想让应用先试用某个发布，可以先以 `next` 标签发布，就绪后再把 `latest` 指向它。',
        },
        {
          type: 'code',
          lang: 'bash',
          code: '# Only apps that ask for next get it: npm install @acme/astryx-widgets@next\n{@pm-only npm "publishing goes through npm, which every Node install carries" publish --tag next}\n\n# Make that version the default\n{@pm-only npm "dist-tags are set with npm, which every Node install carries" dist-tag add @acme/astryx-widgets@1.1.0 latest}\n{@pm-only npm "dist-tags are set with npm, which every Node install carries" dist-tag ls @acme/astryx-widgets}',
        },
      ],
    },
    {
      id: 'check-the-published-package',
      title: '检查已发布的包',
      content: [
        {
          type: 'prose',
          text: '在一个干净的应用里安装你刚发布的版本，并运行之前对 `.tgz` 文件执行过的同一组命令。',
        },
        {
          type: 'code',
          lang: 'bash',
          code: 'mkdir check-release && cd check-release\n{@pm-only npm "npm, which every Node install carries, writes the package.json" init -y}\n{@pm install @astryxdesign/core @astryxdesign/cli @acme/astryx-widgets@1.0.0}\n{@command component AcmeCarousel}\n{@command doctor integration validate @acme/astryx-widgets}',
        },
        {
          type: 'prose',
          text: '在应用中要运行的完整命令清单见 {@link generic:test-in-an-app}。帮助应用迁移到新版本的内容见 {@link generic:upgrading}。',
        },
      ],
    },
  ],
};
