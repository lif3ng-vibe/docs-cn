// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs authoring/building-blocks/docs/check-your-docs`:
 * what each check proves about an integration's docs: the docs check, each
 * doc's fields, the read size, and the CLI peer.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'check-your-docs',
  placement: {parent: 'namespace:docs', slot: 'guides', order: 60},
  title: '检查你的文档',
  category: 'guide',
  description:
    '检查文档树、链接、重叠、文档字段、读取体积与 CLI peer。',
  sections: [
    {
      id: 'run-the-docs-check',
      title: '运行文档检查',
      content: [
        {
          type: 'prose',
          text: '在包内运行 `doctor integration docs`，检查文档树、每个链接以及与 Core 话题的重叠，并列出任意两个话题重复的段落。传入包名即可检查已安装的包。',
        },
        {
          type: 'code',
          lang: 'bash',
          code: '{@command doctor integration docs}\n# In an app, check an installed package\n{@command doctor integration docs @acme/astryx-widgets}',
        },
        {
          type: 'code',
          lang: 'text',
          code: 'Checking integration docs: @acme/astryx-widgets@1.0.0\n\n[ok] The docs tree and every link in these docs check out.\n\n[ok] No doc topics overlap with Core.\n[ok] No topic copies a passage from another.\n[ok] No filler phrases or low-density topics.',
        },
        {
          type: 'prose',
          text: '每个事实只写在一个话题里。当你的两个话题之间，或你的话题与 Core 话题之间，有 10 个或以上的 prose 单词逐字重复时，检查会把这对列为 `copied_passage` 警告。它会指明保留文本的话题（Core 话题，或你的两个中更契合该段落的一个）以及另一个话题中应放置链接的行（见 {@link generic:links}）。代码与示例不参与比对，且话题可以承载它所替换的 Core 话题的文本。少于 4 个不同内容词（"the"、"in"、"it" 等功能词之外的有实义词）的重复，或由三个及以上话题共享的重复（如系列引子），不会被列出。每个列出的配对同时也是警告（`copied_passage`）：`doctor integration docs` 仍以 0 退出，而 `integration check --strict` 会一直失败，直到你修复。',
        },
        {
          type: 'prose',
          text: "保持文档密度。检查会以 `doc_fluff` 警告列出 prose 中的每个填充短语及其所在行和改写建议；也会列出 prose 达 80 词以上而内容词（the、and、in 等功能词之外的有实义词）不足一半的话题，并给出实测占比与 0.5 的下限。`doctor integration docs` 仍以 0 退出，`integration check --strict` 会一直失败，直到你删减。代码、示例与引文不在读取范围内。这些短语包括：`it's important to note`, `it is important to note`, `important to note that`, `it's worth noting`, `it is worth noting`, `worth noting that`, `it should be noted`, `please note`, `note that`（用于句首时）, `as mentioned above`, `as mentioned earlier`, `as mentioned before`, `as noted above`, `as you can see`, `needless to say`, `in order to`, `due to the fact that`, `for the purpose of`, `at this point in time`, `in other words`, `basically`, `essentially`, `obviously`。",
        },
        {
          type: 'prose',
          text: '指向其他文档请用链接，绝不要在 prose 里直接写 `{@command docs <name>}`：你的包的话题用 `{@link generic:<name>}`，Core 文档用 `{@link @astryxdesign/cli:generic:<name>}`（Core 命名空间用 `namespace:`）。CLI 会把链接打印成打开该文档的命令，doctor 也会检查该文档是否存在。每个写出的、指向真实存在文档的指针都会被列为 `stray_doc_pointer` 警告，并给出应改用的链接。词数更多的命令或代码块中的命令属于操作指引，不会被列出。',
        },
        {
          type: 'prose',
          text: '其参数与退出码见 {@link command:doctor integration docs}。',
        },
      ],
    },
    {
      id: 'know-what-fails-the-check',
      title: '了解什么会让检查失败',
      content: [
        {
          type: 'prose',
          text: '加载失败的文档、与 Core 的意外重叠、未指向文档的 `reference` 块，或失败的 namespace 与 placement，都会让检查以退出码 1 失败。未指向文档的链接只作警告，退出码保持 0。',
        },
        {
          type: 'table',
          headers: ['问题', '报告形式', '退出码'],
          rows: [
            [
              '文档加载失败，如未知的小节字段或块类型',
              '`[fail]` `invalid_doc`',
              '1',
            ],
            [
              '话题与 Core 话题同名且未设 `replaces` 或 `extends`',
              '`[fail]` `accidental`',
              '1',
            ],
            [
              'placement 失败，导致文档被隐藏',
              '`[fail]` `invalid_doc_graph`',
              '1',
            ],
            [
              '`reference` 块的目标未指向文档',
              '`[fail]` `invalid_doc_reference`',
              '1',
            ],
            ['链接未指向文档', '`[warn]` `invalid_doc_graph`', '0'],
            [
              '设置了 `replaces` 或 `extends` 的话题',
              '`[info]` `replaces` 或 `extends`',
              '0',
            ],
          ],
        },
        {
          type: 'prose',
          text: '发布前请阅读这些警告。使用 `--json` 时，它们位于 `data.issues`，带 `severity: "warning"`。',
        },
      ],
    },
    {
      id: 'check-each-doc-against-its-type',
      title: '按类型核对每个文档',
      content: [
        {
          type: 'prose',
          text: '`doctor integration validate` 会按 `@astryxdesign/cli/authoring` 为各类文档发布的类型读取你包发布的每个文档，方式与 `tsc` 相同：`hidden` 文档以及同一名称的第二个文档也在其中。组件或 docs 根目录下 `__tests__` 中的测试夹具（前述读取器会跳过）只计数、不检查。它会报告类型中不存在的字段（`unknown_field`）、缺失的必填字段（`missing_field`），以及超出字段类型的值（`wrong_type`）。',
        },
        {
          type: 'code',
          lang: 'bash',
          code: '{@command doctor integration validate}',
        },
        {
          type: 'code',
          lang: 'text',
          code: `Checking 1 doc(s) against the authoring types (TypeScript 6.0.3)

severity: [warn]
doc:      components/AcmeCarousel.doc.mjs
line:     7
export:   default
type:     ComponentDoc
field:    summary
problem:  unknown_field
message:  Object literal may only specify known properties, and 'summary' does not exist in type 'SingleComponentDoc'.
fix:      Remove \`summary\`: SingleComponentDoc has no field \`summary\`.`,
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '文件夹决定类型：组件根目录用 `ComponentDoc`，模板根目录用 `IntegrationTemplateDoc`，主题根目录用 `ThemeDoc`，docs 根目录则用文档 `type` 所指的类型。同时保留每个文档导出上方的 `@type` 注释，编辑器就能在你输入时显示相同的问题。',
            '每个发现项都是警告，退出码保持 0。使用 `--json` 时，它们位于 `data.docTypes.findings`。',
            '它使用你包安装的 `typescript`。当 `typescript` 缺失或没有 JavaScript 编译器 API（TypeScript 7 即是如此）时，若你的包安装了 `@typescript/typescript6`（TypeScript 6 API 包），则使用它。两者都不可用时，会打印 `[skip] Docs not type-checked` 及原因。',
            '每个文档类型的每个字段见 {@link generic:field-reference}。',
          ],
        },
      ],
    },
    {
      id: 'check-read-size',
      title: '检查读取体积',
      content: [
        {
          type: 'prose',
          text: '`{@command doctor}` 还会测量每次读取的体积，对超过 32 KB 的读取发出警告。在你的包或安装了它的应用中运行；`doctor integration docs` 不检查体积。',
        },
        {
          type: 'code',
          lang: 'bash',
          code: '{@command doctor}',
        },
        {
          type: 'code',
          lang: 'text',
          code: 'id:      docs-progressive-disclosure\nstatus:  [warn]\nlabel:   Documentation navigation and size\nmessage: acme/deploying build-before-you-ship: 46 KB, over the 32 KB one read may return',
        },
        {
          type: 'prose',
          text: '把超限的小节拆成更小的小节，各自拥有独立的 key。见 {@link command:doctor}。',
        },
      ],
    },
    {
      id: 'check-the-cli-peer',
      title: '检查 CLI peer',
      content: [
        {
          type: 'prose',
          text: '如果包发布了文档分区、有 placement 的指南，或带 `id` 的文档小节，却没有 `>=0.6.4` 的 `@astryxdesign/cli` peer 依赖，`integration verify` 会让它失败。它不会运行文档检查，因此两者都要运行。',
        },
        {
          type: 'code',
          lang: 'bash',
          code: '{@command integration verify}',
        },
        {
          type: 'code',
          lang: 'text',
          code: '- [fail] The package ships a namespace doc or a placed guide but declares no @astryxdesign/cli peer. A stable CLI before 0.6.4 does not read the docs tree, and can hide every doc topic the package ships. Declare "@astryxdesign/cli": ">=0.6.4" in peerDependencies (optional in peerDependenciesMeta, if the CLI is not required).',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '`integration add doc --parent` 会替你写入 peer 依赖。',
            '`integration verify` 对隐藏指南和与 Core 的意外重叠会放行；只有 `doctor integration docs` 能发现它们。',
            '它检查的其余内容见 {@link command:integration verify} 和 {@link generic:checks}。',
          ],
        },
      ],
    },
  ],
};
