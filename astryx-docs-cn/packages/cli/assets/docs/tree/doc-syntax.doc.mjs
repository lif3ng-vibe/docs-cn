// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs authoring/building-blocks/docs/doc-syntax`: the
 * tokens a doc writes for what the CLI shows each reader differently: a link,
 * an Astryx command, a package-manager step, and a step only one package
 * manager can do.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'doc-syntax',
  placement: {parent: 'namespace:docs', slot: 'guides', order: 15},
  title: '文档语法',
  category: 'guide',
  description:
    '文档为链接、Astryx 命令与包管理器步骤书写的令牌，CLI 会按每位读者自己的包管理器显示它们。',
  keywords: [
    '文档语法',
    '令牌',
    '包管理器',
    'npm',
    'pnpm',
    'yarn',
    'bun',
    '安装命令',
    'pm 令牌',
    'command 令牌',
  ],
  sections: [
    {
      id: 'the-tokens',
      title: '令牌',
      content: [
        {
          type: 'prose',
          text: '文档从不点名包管理器或运行器：读者可能使用 npm、pnpm、Yarn 或 Bun，并通过自己所用的那套运行 CLI。请改写令牌，CLI 会向每位读者显示其应运行的命令。令牌可用于正文、列表项、表格单元格与代码块。',
        },
        {
          type: 'table',
          headers: ['写法', '用途', 'pnpm 读者看到的'],
          rows: [
            [
              '`{@@link generic:deploying}`',
              '另一篇文档',
              '打开该文档的命令',
            ],
            [
              '`{@@command docs theme}`',
              '一条 Astryx 命令',
              '`pnpm exec astryx docs theme`',
            ],
            [
              '`{@@pm install @acme/widgets --dev}`',
              '一个包管理器步骤',
              '`pnpm add -D @acme/widgets`',
            ],
            [
              '`{@@pm-only npm "why" pkg set name=x}`',
              '仅一个包管理器能执行的步骤',
              '`npm pkg set name=x`（仅限 npm：why）',
            ],
            [
              '`{@@@pm install x}`',
              '按原样显示的令牌',
              '`{@@pm install x}`',
            ],
          ],
        },
        {
          type: 'prose',
          text: '在正文中，令牌会打印成一段行内代码；在行内代码或代码块中，它只打印命令本身。`--json` 携带同样的命令，其中 `{@@command}` 令牌显示为以 astryx 开头的裸命令，由展示该文档的读取方自行加前缀。',
        },
      ],
    },
    {
      id: 'package-manager-steps',
      title: '包管理器步骤',
      content: [
        {
          type: 'prose',
          text: '`{@@pm}` 令牌由一个动词、若干名称及其接受的标志组成。下表每一行在任何包管理器中的执行效果都相同；CLI 会写出读者自己所用的命令。',
        },
        {
          type: 'table',
          headers: ['令牌', 'npm', 'pnpm', 'Yarn', 'Bun'],
          rows: [
            [
              '`{@@pm install}`',
              '`npm install`',
              '`pnpm install`',
              '`yarn install`',
              '`bun install`',
            ],
            [
              '`{@@pm install x}`',
              '`npm install x`',
              '`pnpm add x`',
              '`yarn add x`',
              '`bun add x`',
            ],
            [
              '`{@@pm install x --dev}`',
              '`npm install -D x`',
              '`pnpm add -D x`',
              '`yarn add -D x`',
              '`bun add -d x`',
            ],
            [
              '`{@@pm install x --global}`',
              '`npm install -g x`',
              '`pnpm add -g x`',
              '`yarn global add x`（Yarn 1）；Yarn 2 及更新版本用 npm',
              '`bun add -g x`',
            ],
            [
              '`{@@pm remove x}`',
              '`npm uninstall x`',
              '`pnpm remove x`',
              '`yarn remove x`',
              '`bun remove x`',
            ],
            [
              '`{@@pm update x --latest}`',
              '`npm install x@latest`',
              '`pnpm update --latest x`',
              '`yarn up x`',
              '`bun update --latest x`',
            ],
            [
              '`{@@pm run build --watch}`',
              '`npm run build -- --watch`',
              '`pnpm run build --watch`',
              '`yarn run build --watch`',
              '`bun run build --watch`',
            ],
            [
              '`{@@pm exec tsc}`',
              '`npx tsc`',
              '`pnpm exec tsc`',
              '`yarn run tsc`',
              '`bunx tsc`',
            ],
            [
              '`{@@pm dlx @astryxdesign/cli init}`',
              '`npx @astryxdesign/cli init`',
              '`pnpm dlx @astryxdesign/cli init`',
              '`yarn dlx …`（Yarn 1 用 `npx`）',
              '`bunx @astryxdesign/cli init`',
            ],
            [
              '`{@@pm create vite}`',
              '`npm create vite`',
              '`pnpm create vite`',
              '`yarn create vite`',
              '`bun create vite`',
            ],
          ],
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '标志：`--dev` 与 `--exact` 配合 `install`，`--global` 配合 `install` 与 `remove`，`--latest` 配合 `update`。`--exact` 只接受单个版本，不接受范围：只有 npm 能锁定范围。',
            '脚本名（`run`）、二进制名（`exec`）或包名（`dlx`、`create`）之后的一切都会按原样传给它。',
            '在 pnpm 上使用 `{@@pm install x --global}` 需要每台电脑先执行一次 `pnpm setup`。',
          ],
        },
      ],
    },
    {
      id: 'one-package-manager',
      title: '仅一个包管理器能执行的步骤',
      content: [
        {
          type: 'prose',
          text: '有些命令只存在于某一个包管理器中，例如 `npm pkg set` 或 `pnpm setup`。此时写 `{@@pm-only <manager> "<reason>" <command>}`：manager 取 npm、pnpm、yarn、yarn-classic 或 bun 之一；reason 用双引号包裹，会随命令一起展示给读者。只有当没有 `{@@pm}` 步骤能实现同样效果时才用它：doctor 会指出那些每个包管理器都能运行的单一管理器步骤，并给出应写的 `{@@pm}` 令牌。',
        },
      ],
    },
    {
      id: 'what-doctor-checks',
      title: 'doctor 检查什么',
      content: [
        {
          type: 'prose',
          text: '`doctor integration validate`（`integration check` 亦同）会把下列每种情况列为一条提示，附文件、行号与应写的令牌。这些提示目前不会导致失败；下一个次要版本会把它们升级为警告，因此 `integration check --strict --next` 现在就会因它们而失败。请提前运行它，先行修复。',
        },
        {
          type: 'table',
          headers: ['提示', '何时出现'],
          rows: [
            [
              '`package_manager_command`',
              '为某一个包管理器写死的行内代码或 shell 行，如 `npm install -D x`',
            ],
            [
              '`runner_command`',
              '带运行器书写的 Astryx 命令，如 `pnpm exec astryx docs`',
            ],
            [
              '`plain_command`',
              '裸写的 Astryx 命令，`{@@command docs}` 会检查该命令是否存在',
            ],
            [
              '`doc_token`',
              '无法解析的令牌，或不是文档令牌的名称',
            ],
          ],
        },
        {
          type: 'prose',
          text: '在全局模式下：在项目之外，`{@@command}` 令牌按你的全局安装打印每条命令的方式打印，`{@@pm}` 步骤默认按 npm 打印，除非 CLI 检测到其他包管理器。在项目内，由项目自己的运行器与包管理器决定。见 {@link namespace:global}。',
        },
      ],
    },
  ],
};
