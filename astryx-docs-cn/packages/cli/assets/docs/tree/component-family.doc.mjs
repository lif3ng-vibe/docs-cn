// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs authoring/building-blocks/components/describe-the-component/component-family`:
 * author one ComponentDoc for several public exports in a component family.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'component-family',
  placement: {
    parent: 'namespace:describe-the-component',
    slot: 'guides',
    order: 30,
  },
  title: '组件家族',
  category: 'guide',
  description:
    '当一个模块暴露了多个同属一族的公共组件或 Hook 时，把单组件文档改写成家族式文档。',
  sections: [
    {
      id: 'choose-the-family-shape',
      title: '选择家族的形态',
      content: [
        {
          type: 'prose',
          text: '从一份完整的单组件文档出发。只有当一个源码模块或组件目录以一个家族的形式暴露多个公共组件或 Hook 时，才把顶层的 `props` 转换成 `components` 数组。家族文档保留共享的用法指引；数组中的每一项对应一个公共导出。',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '把主组件或最常用的导出放在第一位。',
            "当本文件负责该导出的描述与签名时，使用完整条目。",
            '组件条目使用 `props`；Hook 条目使用 `params` 和 `returns`。',
            '不要添加私有实现辅助函数，也不要添加不希望被人直接使用的导出。',
          ],
        },
        {
          type: 'prose',
          text: '所有字段见 {@link schema:component-doc}。',
        },
      ],
    },
    {
      id: 'document-the-family-inline',
      title: '内联撰写家族文档',
      content: [
        {
          type: 'code',
          lang: 'javascript',
          label: 'components/AcmeTabs.doc.mjs',
          code: `/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export default {
  type: 'component',
  name: 'AcmeTabs',
  displayName: 'Acme Tabs',
  import: '@acme/astryx-widgets/components/AcmeTabs',
  usage: {
    description:
      'Switches between related views without leaving the page.',
  },
  components: [
    {
      name: 'AcmeTabs',
      displayName: 'Acme Tabs',
      description: 'Owns selection and lays out the tab list and panels.',
      props: [
        {
          name: 'value',
          type: 'string',
          description: 'The selected tab value.',
          required: true,
        },
      ],
    },
    {
      name: 'AcmeTab',
      displayName: 'Acme Tab',
      description: 'Selects one view in Acme Tabs.',
      props: [
        {
          name: 'value',
          type: 'string',
          description: 'The value this tab selects.',
          required: true,
        },
      ],
    },
  ],
};`,
        },
        {
          type: 'prose',
          text: '`import` 所指的公共模块必须导出完整条目里点名的每个组件或 Hook。此后应用就能按各自的名称列出、搜索并打开家族中的每个组件。模块没有导出的完整条目不会被列出，`integration verify` 也不会报告它：请用 `{@command component --list}` 检查家族。当 `import` 指向的是你的打包生命周期构建出的产物（例如 `dist`）时，只要该产物存在，成员就会被列出；打包构建完成后，`integration verify` 按列出的样子比较它们。',
        },
        {
          type: 'prose',
          text: '成员的源码是家族文档文件夹内（或其下层）声明它的那个 `.tsx` 文件：即家族自身文件或 `import` 所指模块能到达的那个文件；否则（例如 `import` 指向构建产物时）就是该文件夹中声明该名称的那个文件。只由 bundle 或该文件夹之外的文件声明的成员仍会列出，但没有可供 `--source` 和 `swizzle` 使用的源码。当某份文档文件、或你的包所替换的 Core 名称已经占用该名称时，成员不会被列出。与 Core 同名的成员要用 `--package` 打开。',
        },
      ],
    },
    {
      id: 'give-a-member-its-own-file',
      title: '给成员单独的文件',
      content: [
        {
          type: 'prose',
          text: '当某个家族成员需要自己的文档时，把它的完整条目替换成 `{name: \'MemberName\'}`，并把细节移入一个同级文档。父文档保留家族关系，而不复制子文档的内容。继续阅读 {@link generic:subcomponent}。',
        },
      ],
    },
  ],
};
