// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs authoring/building-blocks/docs/sections-and-placement`:
 * give an integration package its own section in the docs tree, place guides
 * in it, and fix a placement that fails.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'sections-and-placement',
  placement: {parent: 'namespace:docs', slot: 'guides', order: 20},
  title: '分区与放置',
  category: 'guide',
  description: '为你的包建立自己的文档分区，并把指南放进去。',
  sections: [
    {
      id: 'add-a-docs-section',
      title: '添加文档分区',
      content: [
        {
          type: 'prose',
          text: '用 `integration add doc <name> --parent <section>` 在文档树中为你的包建立自己的分区。第一次运行还会写入该分区的 namespace doc。',
        },
        {
          type: 'code',
          lang: 'bash',
          code: '{@command integration add doc deploying --parent acme}\n# Open your section\n{@command docs acme}',
        },
        {
          type: 'code',
          lang: 'javascript',
          label: 'docs/acme.doc.mjs',
          code: "/** @type {import('@astryxdesign/cli/authoring').NamespaceDoc} */\nexport default {\n  type: 'namespace',\n  name: 'acme',\n  title: 'Acme',\n  summary: 'Guides for Acme.',\n  slots: {\n    guides: {title: 'Guides', accepts: {kinds: ['generic']}},\n  },\n};",
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '编辑它的 `title` 与 `summary`：读者会在文档列表和你的分区顶部看到它们。',
            '指南 `docs/deploying.doc.mjs` 会得到 `placement: {parent: \'namespace:acme\', slot: \'guides\'}`。之后带 `--parent acme` 的运行会复用该 namespace doc。',
            '`package.json` 会加入可选 peer `"@astryxdesign/cli": ">=0.6.4"`，因为更旧的 CLI 读不懂分区；见 {@link generic:versioning}。',
          ],
        },
      ],
    },
    {
      id: 'place-a-doc',
      title: '放置文档',
      content: [
        {
          type: 'prose',
          text: '指南用 `placement` 指定唯一归宿：你包里的一个 namespace、其中的一个插槽（slot），以及一个 `order`。它的路由是分区名再加指南名。',
        },
        {
          type: 'code',
          lang: 'javascript',
          code: "placement: {parent: 'namespace:acme', slot: 'guides', order: 10}, // route: acme/deploying",
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '全部字段见 {@link schema:authored-doc-graph-fields}。',
            '已放置的指南只能通过其路由 `acme/deploying` 打开，裸名不再有效。',
          ],
        },
        {
          type: 'code',
          lang: 'bash',
          code: '{@command docs acme/deploying}',
        },
      ],
    },
    {
      id: 'fix-a-failed-placement',
      title: '修复放置失败',
      content: [
        {
          type: 'prose',
          text: '`placement` 失败会隐藏文档：它没有路由，也不会出现在文档列表中。`doctor integration docs` 会以 `invalid_doc_graph` 失败，并指明要修复什么。',
        },
        {
          type: 'code',
          lang: 'bash',
          code: '{@command doctor integration docs}',
        },
        {
          type: 'code',
          lang: 'text',
          code: 'severity: [fail]\ncode:     invalid_doc_graph\nmessage:  @acme/astryx-widgets/deploying.doc.mjs: placement.parent "namespace:cli" names no namespace; @acme/astryx-widgets declares "acme".',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '你的包没有提供的 `parent`（如 `namespace:cli`）会得到 "names no namespace"。',
            'namespace 未声明的 `slot` 会得到 "is not a slot of namespace"；报错信息会列出已声明的插槽。',
            '该检查以退出码 1 结束；见 {@link generic:check-your-docs}。',
          ],
        },
      ],
    },
  ],
};
