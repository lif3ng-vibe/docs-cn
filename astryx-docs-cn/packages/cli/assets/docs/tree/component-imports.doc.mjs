// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs authoring/building-blocks/components/component-imports`: make an
 * integration component's documented import resolve from the packed package.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'component-imports',
  placement: {parent: 'namespace:components', slot: 'guides', order: 30},
  title: '解析 import',
  category: 'guide',
  description:
    '让组件文档的 import 与包的 exports 映射保持一致，然后校验打包后的包。',
  sections: [
    {
      id: 'export-the-component',
      title: '导出组件',
      content: [
        {
          type: 'prose',
          text: '应用会把组件文档的 `import` 字段复制进自己的代码，因此这个精确的说明符必须能从你打包后的包中解析。`integration add` 会在写入它的同时，在 package.json 里写入一条 `exports` 条目。',
        },
        {
          type: 'code',
          lang: 'json',
          label: 'package.json',
          code: `"exports": {
  "./components/AcmeCarousel": "./components/AcmeCarousel.tsx"
}`,
        },
        {
          type: 'prose',
          text: '只有当 package.json 已有 `exports` 映射时，add 才会写入条目，所以每个包一开始就要带上 `"exports": {}`。',
        },
        {
          type: 'prose',
          text: '文件不必以组件命名。当 `Slides.tsx` 导出的是 `AcmeCarousel` 而没有任何名为 `Slides` 的东西时，把文档放在它旁边，命名为 `Slides.doc.mjs`，并把 `name` 设为 `AcmeCarousel`：应用按这个名称列出、搜索并打开组件，`integration verify` 会检查其 import 是否导出 `AcmeCarousel`。导出与自身同名的文件就沿用该名称。以 kebab case 命名文件的包同理：`acme-gallery.tsx` 旁的 `acme-gallery.doc.mjs` 设置 `name: \'AcmeGallery\'`。',
        },
        {
          type: 'prose',
          text: '文件名仍决定打开哪份文档。已被 Core 或其他文档文件占用的名称仍归它们所有；你的包所替换的 Core 名称也一样：`Badge.doc.mjs` 声明 `AcmeBadge` 时，`{@command component Badge}` 打开的是 Core 的 `Badge`，而 `--package` 加上你的包名才能打开你的。',
        },
      ],
    },
    {
      id: 'verify-the-packed-import',
      title: '校验打包后的 import',
      content: [
        {
          type: 'prose',
          text: '`integration verify` 会把打包后的包解包到一个临时应用，解析每条文档声明的 import，并检查模块是否导出文档声明的组件名。其 `--json` 输出会按代码指出每个失败项。',
        },
        {
          type: 'code',
          lang: 'bash',
          code: '{@command integration verify}',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '`component_import_unresolvable` 表示 exports 映射中没有文档 import 对应的条目。',
            '`component_export_missing` 表示模块没有导出文档声明的名称，或 package.json 没有 exports 映射。',
            '`typescript_extension_in_specifier` 表示公共 import 以 `.ts` 或 `.tsx` 结尾。',
          ],
        },
        {
          type: 'prose',
          text: '要从包根导入，设置 `import: \'@acme/astryx-widgets\'`，并在 `exports["."]` 指向的文件里重新导出该组件。见 {@link command:integration verify}。',
        },
      ],
    },
    {
      id: 'global-mode',
      title: '全局模式下',
      content: [
        {
          type: 'prose',
          text: '全局模式下：在项目之外，CLI 打印的 import 指向为整台机器安装的包，新应用必须先安装它们才能构建；在项目之内，只打印项目安装的包。见 {@link namespace:global} 和 {@link generic:global-integrations}。',
        },
      ],
    },
  ],
};
