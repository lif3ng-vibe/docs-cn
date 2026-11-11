// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs authoring/building-blocks/docs/add-a-topic`: add a
 * doc topic to an integration package, write its sections, and pick the doc
 * kind for each thing the package ships.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'add-a-topic',
  placement: {parent: 'namespace:docs', slot: 'guides', order: 10},
  title: '添加话题',
  category: 'guide',
  keywords: ['添加文档', '集成文档', '撰写文档'],
  description: '为你的包添加文档话题，并撰写其各节内容。',
  sections: [
    {
      id: 'add-a-topic-with-the-cli',
      title: '用 CLI 添加话题',
      content: [
        {
          type: 'prose',
          text: '在包内运行 `integration add doc` 即可添加话题。它会写入话题文件，并在 `astryx.integration.mjs` 中声明 `docs` 根目录。',
        },
        {
          type: 'code',
          lang: 'bash',
          code: '{@command integration add doc deploying}\n# Read it the way an app will\n{@command docs deploying}',
        },
        {
          type: 'code',
          lang: 'text',
          code: 'doc contribution added\n\n[ok] deploying\n\nDeclare doc root ./docs in astryx.integration.mjs.\n\n- docs/deploying.doc.mjs\n- astryx.integration.mjs',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '话题名用小写 kebab-case，例如 `deploying`。读者会把它作为命令参数输入，因此只能包含字母、数字、`_` 和 `-`。',
            '名称要保持稳定：读者和链接都靠它定位话题。',
            '所选名称不能与 `{@command docs}` 已列出的名称重复：不能用 Core 话题，也不能用 `tokens`、`layout` 这类小节名。要接管或扩充 Core 话题，见 {@link generic:extend-or-replace}。',
          ],
        },
      ],
    },
    {
      id: 'write-the-sections',
      title: '撰写各节',
      content: [
        {
          type: 'prose',
          text: "话题就是一个普通对象，包含 `type: 'generic'`、`name`、`title`、一句话的 `description` 和 `sections`。每个小节有一个 `title` 和一组 `content` 块。",
        },
        {
          type: 'code',
          lang: 'javascript',
          label: 'docs/deploying.doc.mjs',
          code: "/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */\nexport default {\n  type: 'generic',\n  name: 'deploying',\n  title: 'Deploying',\n  description: 'Ship an app built with Acme widgets.',\n  sections: [{\n    id: 'build-before-you-ship',\n    title: 'Build before you ship',\n    content: [\n      {type: 'prose', text: 'Build the app, then upload the `dist` folder.'},\n      {type: 'code', lang: 'bash', code: '{@@pm run build}'},\n      {type: 'list', style: 'unordered', items: ['Keep `dist` out of git.']},\n      {type: 'table', headers: ['Variable', 'Value'], rows: [['`NODE_ENV`', '`production`']]},\n    ],\n  }],\n};",
        },
        {
          type: 'prose',
          text: '示例设置了小节 `id`，因此 `package.json` 需要声明 CLI peer 依赖 `"@astryxdesign/cli": ">=0.6.4"`。已发布的 0.6.3 及更早版本会拒绝 `id`，并隐藏你包发布的所有文档话题；缺少该 peer 依赖时 `integration verify` 也会失败。见 {@link generic:versioning}。',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '替换 `integration add` 写入的 `Overview` 占位内容。',
            '每个字段的定义见 {@link schema:reference-doc}。',
          ],
        },
      ],
    },
    {
      id: 'write-commands-without-a-runner',
      title: '让命令对所有读者通用',
      content: [
        {
          type: 'prose',
          text: "Astryx 命令写作 `{@@command doctor}`，包管理器步骤写作 `{@@pm install @acme/widgets}`，前面绝不要带 npx、pnpm exec 之类的运行器，也不要带包管理器自己的命令。CLI 会把它展示成读者实际运行的命令：`pnpm exec astryx doctor` 或 `yarn astryx doctor`，`pnpm add @acme/widgets` 或 `npm install @acme/widgets`，或集成所设置的 `cliCommand`。所有 token 见 {@link generic:doc-syntax}。直接写出的命令——即 astryx 一词加命令——也会以同样方式展示。`doctor integration validate`（以及 `integration check`）会点名每种以其他方式写出的命令，并给出应替换成的 token；它检查哪些内容见 {@link generic:doc-syntax}。安装步骤在 CLI 安装之前运行，写作 `{@@pm dlx @astryxdesign/cli init}`。",
        },
        {
          type: 'code',
          lang: 'javascript',
          label: 'docs/deploying.doc.mjs',
          code: "{type: 'prose', text: 'Check the app with {@@command doctor} before you ship.'},\n{type: 'code', lang: 'bash', code: '{@@command doctor}'},",
        },
        {
          type: 'code',
          lang: 'text',
          label:
            "在集成设置了 cliCommand: 'acme astryx' 的应用中读取",
          code: 'Check the app with `acme astryx doctor` before you ship.\n\n```bash\nacme astryx doctor\n```',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            'CLI 会自动加前缀的对象包括：以 astryx 一词开头的行内代码段；在 `bash`、`sh`、`shell`、`zsh`、`console`、`text`、`markdown` 或无语言标注的代码块中，出现在行首或 `&&`、`||`、`;`、`|` 之后的命令；以及只含一条命令的表格单元格。',
            '其他语言的代码（如 `js` 示例）以及普通文本段落里的 astryx 一词保持原样。',
            '`--json` 按原样返回文档，因此自行展示文档的阅读端需要自己加命令前缀。',
          ],
        },
      ],
    },
    {
      id: 'pick-the-doc-kind',
      title: '选择文档类型',
      content: [
        {
          type: 'prose',
          text: '每个文档都是一个 `.doc.mjs` 文件，其 `type` 表明它描述的对象。`integration add` 会为每种类型写入正确的 `type` 和文件。',
        },
        {
          type: 'table',
          headers: [
            '你要写的文档',
            '`type`',
            '`integration add` 写入的文件',
          ],
          rows: [
            ['指南或话题', "`'generic'`", '`docs/deploying.doc.mjs`'],
            [
              '你的包的文档分区',
              "`'namespace'`",
              '`docs/acme.doc.mjs`',
            ],
            [
              '组件',
              "`'component'`",
              '`components/AcmeCarousel.doc.mjs`，与 `AcmeCarousel.tsx` 同目录',
            ],
            [
              '模板',
              "`'page'` 或 `'block'`",
              '`templates/acme-dashboard.doc.mjs`，与 `acme-dashboard.tsx` 同目录',
            ],
            [
              '主题',
              "`'theme'`",
              '`themes/ocean/oceanTheme.doc.mjs`，与 `oceanTheme.ts` 同目录',
            ],
          ],
        },
        {
          type: 'prose',
          text: '只有指南、话题和你的文档分区放在 `docs` 根目录。其余类型各有自己的指南：{@link namespace:components}、{@link namespace:templates} 和 {@link namespace:themes}。',
        },
      ],
    },
    {
      id: 'keep-topics-in-the-docs-root',
      title: '把话题放在 docs 根目录',
      content: [
        {
          type: 'prose',
          text: '`astryx.integration.mjs` 中的 `docs` 字段指定存放话题的文件夹。CLI 会读取其下的所有 `.doc.mjs` 文件，包括子文件夹里的。',
        },
        {
          type: 'code',
          lang: 'javascript',
          label: 'astryx.integration.mjs',
          code: "export default {\n  docs: './docs'\n};",
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '读者通过话题的 `name`（而非文件名）打开话题。文件按文档命名（`<name>.doc.mjs`），便于查找。',
            '没有 `placement` 的话题是平铺话题：文档列表会把它归入 Topics 之下，读者按名称打开。',
            '要在文档树中建立自己的分区，见 {@link generic:sections-and-placement}。',
          ],
        },
      ],
    },
    {
      id: 'global-mode',
      title: '全局模式下',
      content: [
        {
          type: 'prose',
          text: '全局模式下：用户把你的包安装到电脑上、与全局 CLI 并列时，你的文档话题会出现在任何项目之外的目录里；在项目内，则只有该项目也安装了你的包时才会出现。见 {@link namespace:global} 和 {@link generic:global-integrations}。',
        },
      ],
    },
  ],
};
