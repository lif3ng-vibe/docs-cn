// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs authoring/building-blocks/codemods`: add codemods to an
 * integration package, and know which of them `astryx upgrade` runs in an app.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'codemods',
  placement: {parent: 'namespace:building-blocks', slot: 'guides', order: 50},
  title: 'Codemods',
  category: 'guide',
  keywords: ['破坏性变更', '迁移应用', '集成 codemod'],
  description:
    '发布可供 `{@command upgrade}` 运行以迁移应用代码的 codemod，并了解应用会运行其中哪些。',
  sections: [
    {
      id: 'add-a-codemod',
      title: '添加 codemod',
      content: [
        {
          type: 'prose',
          text: '`integration add codemod` 会把 codemod 写入一个以版本命名的文件夹。应用通过 `{@command upgrade}` 运行它来迁移自身代码。',
        },
        {
          type: 'code',
          lang: 'bash',
          code: '{@command integration add codemod rename-delay --to 0.7.0}',
        },
        {
          type: 'code',
          lang: 'text',
          code: `codemods/
  0.7.0/
    rename-delay.mjs         # the codemod
    rename-delay.test.mjs    # skipped: a test file
    __tests__/               # skipped: a test folder`,
        },
        {
          type: 'prose',
          text: "第一次添加会在 `astryx.integration.mjs` 中声明 `codemods: './codemods'`。codemod 的 id 是它在版本文件夹内的路径（去掉扩展名）：`rename-delay`。id 在包内所有版本文件夹中必须唯一。",
        },
        {
          type: 'prose',
          text: '加载器会跳过 `*.test.*`、`*.spec.*` 和 `*.fixture.*` 文件，以及 `__tests__/` 或 `__fixtures__/` 下的所有内容，因此测试文件可以和 codemod 放在一起。文件夹名决定应用何时运行该 codemod；见"选择 codemod 的运行时机"。',
        },
      ],
    },
    {
      id: 'write-the-transform',
      title: '编写 transform',
      content: [
        {
          type: 'prose',
          text: 'codemod 默认导出一个普通对象，包含 `type`、`title` 和一个 `transform` 函数。`transform` 返回新的源码，或返回 `null` 表示保持文件原样。',
        },
        {
          type: 'code',
          lang: 'js',
          code: `// codemods/0.7.0/rename-delay.mjs
/** @type {import('@astryxdesign/cli/authoring').AstryxCodemod} */
export default {
  type: 'code',
  title: 'Rename AcmeCarousel delay to interval',
  description: 'Renames the delay prop on AcmeCarousel.',
  fileExtensions: ['.tsx', '.jsx'],
  transform(file, api) {
    const j = api.jscodeshift;
    const root = j(file.source);
    const props = root
      .find(j.JSXOpeningElement, {name: {name: 'AcmeCarousel'}})
      .find(j.JSXAttribute, {name: {name: 'delay'}});
    if (props.size() === 0) return null;
    props.forEach(path => {
      path.node.name.name = 'interval';
    });
    return root.toSource();
  },
};`,
        },
        {
          type: 'prose',
          text: "`type: 'code'` 会重写应用中匹配 `fileExtensions` 的源码文件。`type: 'config'` 改为重写应用的 `astryx.config` 文件，并在代码类 codemod 之前运行。`title` 显示在 upgrade 输出中，`api.jscodeshift` 是针对该文件的 jscodeshift 实例。所有字段见 {@link schema:codemod}。",
        },
      ],
    },
    {
      id: 'which-codemods-run',
      title: '选择 codemod 的运行时机',
      content: [
        {
          type: 'prose',
          text: '两条规则决定应用的 `{@command upgrade}` 是否运行你的 codemod：应用的 Core 版本，以及应用是否列出了你的包。',
        },
        {
          type: 'list',
          style: 'ordered',
          items: [
            '版本文件夹与应用的 `@astryxdesign/core` 版本匹配，而不是与你的包版本匹配。`upgrade --from <version>` 会运行高于 `--from` 的每个文件夹，直到（含）应用安装的 Core 版本。应用装了 Core 0.7.0 时，`--from 0.6.3` 运行 `0.7.0/`，`--from 0.7.0` 则什么都不运行。以你自己的发布版本命名的文件夹，例如 `1.0.0/`，会等到应用装上 Core 1.0.0 才运行。',
            '只有当应用在其 `astryx.config` 的 `integrations` 中列出你的包，或传入 `--integration @acme/astryx-widgets` 时，`upgrade` 才会运行你的 codemod。仅仅安装了你的包还不够：此时运行会直接跳过你的 codemod，且没有任何警告。',
          ],
        },
      ],
    },
    {
      id: 'run-codemods-in-an-app',
      title: '在应用中运行 codemod',
      content: [
        {
          type: 'prose',
          text: '应用先用 `{@command upgrade}` 预览 codemod，再用 `--apply` 写入变更。不带 `--apply` 时，磁盘上不会有任何改动。',
        },
        {
          type: 'code',
          lang: 'bash',
          code: `# Preview each codemod and the files it would change
{@command upgrade --from 0.6.3 --integration @acme/astryx-widgets}
# Write the changes
{@command upgrade --from 0.6.3 --integration @acme/astryx-widgets --apply}`,
        },
        {
          type: 'code',
          lang: 'text',
          code: `Integrations: @acme/astryx-widgets
<n> codemods to run (dry run)
Applying integration codemods...
  Rename AcmeCarousel delay to interval (v0.7.0, @acme/astryx-widgets)
!     ~ src/Hero.tsx (would change)`,
        },
        {
          type: 'prose',
          text: '`<n>` 也会把 Core 针对相同版本的 codemod 计入：它们先运行，并打印在 `Integrations:` 之上。只想运行你自己的（比如在测试时），加 `--codemod rename-delay`。',
        },
        {
          type: 'prose',
          text: '`--from` 是应用升级前的 Core 版本。运行默认扫描 `./src`，除非应用传入 `--path`；它绝不写入应用标记为生成、vendored 或忽略的文件；见 {@link command:upgrade}。`upgrade --list` 只显示 Core 的 codemod。',
        },
        {
          type: 'prose',
          text: '集成清单没有 `hooks` 字段。codemod 之后运行的命令（如格式化工具）由应用自行设置，写在其 `astryx.config` 的 `hooks.postCodemod` 中。',
        },
      ],
    },
    {
      id: 'global-mode',
      title: '全局模式下',
      content: [
        {
          type: 'prose',
          text: '全局模式下：在应用内，无论用户启动的是哪一份 CLI，`upgrade` 都以与应用 Core 相等的版本运行，且只运行应用安装的集成的 codemod。在项目之外，`upgrade` 只列出 codemod，不做迁移。见 {@link namespace:global} 和 {@link command:upgrade}。',
        },
      ],
    },
  ],
};
