// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs authoring/building-blocks/components/add-a-component`: choose a
 * component name and generate its first source and doc files.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'add-a-component',
  placement: {parent: 'namespace:components', slot: 'guides', order: 10},
  title: '添加组件',
  category: 'guide',
  description:
    '选定一个稳定的组件名，并生成它的源码、文档、包导出与集成入口。',
  sections: [
    {
      id: 'pick-a-component-name',
      title: '选定组件名',
      content: [
        {
          type: 'prose',
          text: '选定一个唯一的 PascalCase 名称，例如 `AcmeCarousel`。该名称既是组件的公开导出，也是它在 CLI 中的标识，因此请保持稳定。如果只想更改人们看到的标签，请使用 `displayName`。',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '优先选择能描述该组件在产品中用途的名称。',
            '避免使用 Core 组件名，除非你确实有意替换该组件。',
            '如确需替换，请阅读 {@link generic:replace-a-core-component}。',
          ],
        },
      ],
    },
    {
      id: 'run-the-add-command',
      title: '运行 add 命令',
      content: [
        {
          type: 'prose',
          text: '在包内运行 `integration add component` 并传入该名称。它会写入组件源码、对应的文档文件，以及应用使用的公开导入。',
        },
        {
          type: 'code',
          lang: 'bash',
          code: '{@command integration add component AcmeCarousel}',
        },
        {
          type: 'code',
          lang: 'text',
          code: `component contribution added

[ok] AcmeCarousel

Declare component root ./components in astryx.integration.mjs.

- components/AcmeCarousel.doc.mjs
- components/AcmeCarousel.tsx
- package.json
- astryx.integration.mjs`,
        },
        {
          type: 'prose',
          text: '`integration add` 会先创建一个源码导出和一个单组件 `.doc.mjs`。单个公开组件请保持这一形态。如果源码暴露的是一个组件族，请按 {@link namespace:describe-the-component} 选择正确的形态。',
        },
        {
          type: 'prose',
          text: 'add 命令从不覆盖已有文件，`--dry-run` 可以预览将要写入的内容。组件命令需要读取 Core，因此请先在包中安装 `@astryxdesign/core`（见 {@link generic:quick-start}）。',
        },
      ],
    },
    {
      id: 'document-an-existing-component',
      title: '为已有组件撰写文档',
      content: [
        {
          type: 'prose',
          text: "要为包中已有的组件撰写文档，请把文档文件写在源码文件旁边，并按源码文件命名，例如在 `acme-gallery.tsx` 旁边放置 `acme-gallery.doc.mjs`。将 `name` 设为应用导入的导出名，例如 `name: 'AcmeGallery'`，并把两个文件都放在 `astryx.integration.mjs` 声明的组件根目录内。文件名不必与组件同名；应用随后如何找到它，见 {@link generic:component-imports}。",
        },
      ],
    },
    {
      id: 'global-mode',
      title: '全局模式下',
      content: [
        {
          type: 'prose',
          text: "全局模式下：用户把你的包安装到电脑上、与全局 CLI 并列时，你的组件会出现在任何项目之外的目录里；在项目内，则只有该项目也安装了你的包时才会出现。见 {@link namespace:global} 和 {@link generic:global-integrations}。",
        },
      ],
    },
  ],
};
