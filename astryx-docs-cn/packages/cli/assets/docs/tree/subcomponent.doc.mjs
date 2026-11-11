// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs authoring/building-blocks/components/describe-the-component/subcomponent`:
 * give one member of a component family its own ComponentDoc.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'subcomponent',
  placement: {
    parent: 'namespace:describe-the-component',
    slot: 'guides',
    order: 40,
  },
  title: '子组件',
  category: 'guide',
  description:
    '把组件家族中的一个成员移入它自己的兄弟文档，而不在父文档中重复它。',
  sections: [
    {
      id: 'choose-a-separate-doc',
      title: '决定是否拆分文档',
      content: [
        {
          type: 'prose',
          text: '从组件家族文档开始。当某个公开成员拥有自己的源码，且有足够多的行为、props 或用法指引需要单独维护时，把它移入兄弟文档。父文档仍会列出该成员，但只列名字。',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '成员较小时保留在家族文档中内联描述，只要其完整契约在家族文档里仍然清晰。',
            '当成员需要专属的搜索结果、示例、用法指引或独立维护时，使用兄弟文档。',
            '每个成员只有一个文档归属。不要为同一个名字同时保留父文档完整条目和兄弟文档。',
          ],
        },
      ],
    },
    {
      id: 'reference-it-from-the-parent',
      title: '在父文档中引用它',
      content: [
        {
          type: 'code',
          lang: 'javascript',
          label: 'components/AcmeDialog.doc.mjs',
          code: `/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export default {
  type: 'component',
  name: 'AcmeDialog',
  displayName: 'Acme Dialog',
  import: '@acme/astryx-widgets/components/AcmeDialog',
  usage: {description: 'Presents a focused task above the current page.'},
  components: [
    {
      name: 'AcmeDialog',
      displayName: 'Acme Dialog',
      description: 'Owns the modal surface and open state.',
      props: [],
    },
    {name: 'AcmeDialogHeader'},
  ],
};`,
        },
        {
          type: 'prose',
          text: '仅写名字的条目让 `AcmeDialogHeader` 留在家族中。它的描述与 props 只来自兄弟文件。',
        },
      ],
    },
    {
      id: 'write-the-subcomponent-doc',
      title: '编写子组件文档',
      content: [
        {
          type: 'code',
          lang: 'javascript',
          label: 'components/AcmeDialogHeader.doc.mjs',
          code: `/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export default {
  type: 'component',
  name: 'AcmeDialogHeader',
  displayName: 'Acme Dialog Header',
  import: '@acme/astryx-widgets/components/AcmeDialogHeader',
  subComponentOf: 'AcmeDialog',
  description: 'Labels an Acme Dialog and holds its close action.',
  props: [
    {
      name: 'title',
      type: 'string',
      description: 'The dialog title.',
      required: true,
    },
  ],
};`,
        },
        {
          type: 'prose',
          text: '所有字段见 {@link schema:component-doc}。',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '`subComponentOf` 必须与父文档的 `name` 完全一致。',
            '`description` 说明该成员在家族中的角色。`usage` 可选；当成员需要超出那句话的指引时再加上。',
            'CLI 不会把 `group`、`category`、`keywords` 等家族字段从父文档复制到子文档。子文档需要哪些就在自己的文档里设置。',
          ],
        },
      ],
    },
  ],
};
