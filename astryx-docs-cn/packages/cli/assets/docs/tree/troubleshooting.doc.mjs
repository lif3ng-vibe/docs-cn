// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs authoring/help/troubleshooting`: the messages the CLI
 * prints while you build, verify, and install an integration, and the fix
 * for each.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'troubleshooting',
  placement: {parent: 'namespace:help', slot: 'guides', order: 10},
  title: '故障排除',
  category: 'guide',
  keywords: ['集成错误', '集成未加载'],
  description:
    '查找 CLI 在构建、验证或安装集成时打印的消息，并按对应的修复方法处理。',
  sections: [
    {
      id: 'fix-setup-errors',
      title: '修复初始化错误',
      content: [
        {
          type: 'prose',
          text: '这些错误出现在初始化包或在其中运行 CLI 时。每行都引用了 CLI 打印的原文。',
        },
        {
          type: 'table',
          headers: ['消息', '修复'],
          rows: [
            [
              '`No package.json found. Run this command inside an integration package.`',
              '先在包文件夹里运行 `{@pm-only npm "写入 package.json" init -y}` 和 `{@pm-only npm "编辑 package.json" pkg set name=@acme/astryx-widgets}`。',
            ],
            [
              '`Error: Could not find @astryxdesign/core package`',
              '组件命令需要读取 Core。在包中运行 `{@pm install @astryxdesign/core --dev}`。',
            ],
            [
              '`core_not_found`: `Could not resolve @astryxdesign/core, so component names could not be checked.`',
              '修复方式相同。该检查会以退出码 1 失败。',
            ],
            [
              "`Error: unknown subcommand 'integration verify'`, or `Error: Pass --check to verify the integration tarball.`",
              '你的 CLI 版本早于 `integration verify`。运行 `{@pm install @astryxdesign/cli@latest --dev}`。在旧版 CLI 上，同一检查是 `integration pack --check`。',
            ],
            [
              'Note: `integration pack --check` is deprecated.',
              '旧名称仍会执行同一检查。请改用 `{@command integration verify}`；旧名称将在后续版本中移除。',
            ],
          ],
        },
      ],
    },
    {
      id: 'fix-verify-failures',
      title: '修复 integration verify 失败',
      content: [
        {
          type: 'prose',
          text: '`{@command integration verify}` 会把每条失败输出为一行 `[fail]`。加上 `--json` 可查看其问题码，例如 `component_export_missing`。',
        },
        {
          type: 'table',
          headers: ['消息', '修复'],
          rows: [
            [
              '`component_export_missing`: `Component "AcmeCarousel" advertises import "@acme/astryx-widgets/components/AcmeCarousel", but that packed module does not export "AcmeCarousel".`',
              "package.json 缺少 `exports` 映射，或该模块没有导出该名称。保留 `export function AcmeCarousel`，并添加条目：`{@pm-only npm \"编辑 package.json\" pkg set 'exports[./components/AcmeCarousel]=./components/AcmeCarousel.tsx'}`。当被引用的名称是文件名（例如 `acme-carousel`）时，把文档的 `name` 设为该文件导出的组件。仅类型的导出不算数。",
            ],
            [
              '`template_export_missing`: `Template "acme-dashboard" public import "@acme/astryx-widgets/templates/acme-dashboard" does not have a default export.`',
              '运行 `{@pm-only npm "编辑 package.json" pkg set \'exports[./templates/acme-dashboard]=./templates/acme-dashboard.tsx\'}`，并在源码中保留 `export default`。新包以 `"exports": {}` 起步，这样每次 add 都会写入这些条目。',
            ],
            [
              '`component_import_unresolvable` or `template_import_unresolvable`: `…Package subpath \'./components/AcmeCarousel\' is not defined by "exports"…`',
              "`exports` 映射中没有对应条目。运行 `{@pm-only npm \"编辑 package.json\" pkg set 'exports[./components/AcmeCarousel]=./components/AcmeCarousel.tsx'}`，模板则运行 `'exports[./templates/acme-dashboard]=./templates/acme-dashboard.tsx'`。",
            ],
            [
              "`component_import_unresolvable`: `…but a consumer cannot resolve it: Cannot find package '@acme/old-name'`",
              "你在 add 写入各文档的 `import` 之后重命名了包。把每个组件文档中的 `import` 改为新名称。",
            ],
            [
              '`Declared templates root "templates" has 0 of 2 expected files in the pack list. Add "templates" to "files" in package.json.`',
              '运行 `{@pm-only npm "编辑 package.json" pkg set \'files[]=templates\'}`。',
            ],
            [
              '`docs_tree_needs_cli`: `The package ships a namespace doc or a placed guide but declares no @astryxdesign/cli peer.`',
              '运行 `{@pm-only npm "编辑 package.json" pkg set \'peerDependencies.@astryxdesign/cli=>=0.6.4\'}` 和 `{@pm-only npm "编辑 package.json" pkg set \'peerDependenciesMeta.@astryxdesign/cli.optional=true\' --json}`。',
            ],
            [
              '`replaces_needs_cli`: The package has a template that sets `replaces` but declares no @astryxdesign/cli peer.',
              '运行 `{@pm-only npm "编辑 package.json" pkg set \'peerDependencies.@astryxdesign/cli=>=0.6.4\'}` 和 `{@pm-only npm "编辑 package.json" pkg set \'peerDependenciesMeta.@astryxdesign/cli.optional=true\' --json}`。0.6.4 之前的稳定版 CLI 会拒绝 `replaces`、丢弃该模板并隐藏你的文档话题。',
            ],
            [
              '`component_replaces_needs_cli` (a warning): The package has a component that sets `replaces` but declares no @astryxdesign/cli peer, or a peer range that admits an earlier CLI.',
              '运行 `{@pm-only npm "编辑 package.json" pkg set \'peerDependencies.@astryxdesign/cli=>=0.6.7\'}` 和 `{@pm-only npm "编辑 package.json" pkg set \'peerDependenciesMeta.@astryxdesign/cli.optional=true\' --json}` 以启用替换。在此之前应用看不到任何变化（{@link generic:replace-a-core-component}）。',
            ],
            [
              '`keywords_needs_cli`: The package has a template that sets `keywords` but declares no @astryxdesign/cli peer.',
              '运行 `{@pm-only npm "编辑 package.json" pkg set \'peerDependencies.@astryxdesign/cli=>=0.6.6\'}` 和 `{@pm-only npm "编辑 package.json" pkg set \'peerDependenciesMeta.@astryxdesign/cli.optional=true\' --json}`。旧版 CLI 对该字段的处理见 {@link generic:template-doc-overview}。',
            ],
            [
              '`themes_need_cli`: The package ships a theme but declares no @astryxdesign/cli peer.',
              '运行 `{@pm-only npm "编辑 package.json" pkg set \'peerDependencies.@astryxdesign/cli=>=0.6.4\'}` 和 `{@pm-only npm "编辑 package.json" pkg set \'peerDependenciesMeta.@astryxdesign/cli.optional=true\' --json}`。已发布的 0.6.4 之前的 CLI 无法读取带类型的主题描述符，因此会丢弃你的主题，还可能隐藏你的文档话题。',
            ],
            [
              '`section_ids_need_cli`: The package has a doc section that sets `id` but declares no @astryxdesign/cli peer.',
              '修复方式与 `themes_need_cli` 相同，或去掉各 section 的 `id`：已发布的 0.6.4 之前的 CLI 会拒绝这些 id 并隐藏你的文档话题。',
            ],
            [
              '`doc_tokens_need_cli`: The package writes doc tokens (`{@@command …}`, `{@@pm …}`, `{@@pm-only …}`) in its docs, but its @astryxdesign/cli peer admits a CLI before 0.7.4.',
              '运行 `{@pm-only npm "编辑 package.json" pkg set \'peerDependencies.@astryxdesign/cli=>=0.7.4\'}` 和 `{@pm-only npm "编辑 package.json" pkg set \'peerDependenciesMeta.@astryxdesign/cli.optional=true\' --json}`。0.7.4 之前的 CLI 会按原样打印每个 token，读者会看到裸 token。',
            ],
          ],
        },
      ],
    },
    {
      id: 'fix-problems-in-an-app',
      title: '修复应用中的问题',
      content: [
        {
          type: 'prose',
          text: '这些症状出现在安装了你包的应用中，或出现在能够预测它们的 doctor 检查里。',
        },
        {
          type: 'table',
          headers: ['症状', '修复'],
          rows: [
            [
              '`Error: No component named "AcmeCarousel"`——出现在你的包有文档记录的组件上。',
              "它的文档仍然写的是文件名。把 `name` 设为导出名，例如 `acme-carousel.doc.mjs` 中的 `name: 'AcmeCarousel'`。仅当其 family 文档导入的模块确实导出该成员时，家族成员才会被列出（{@link generic:component-family}）。",
            ],
            [
              "`{@command component Dialog}` 打开的是 Core 的 `Dialog`，不是你的。",
              "已被 Core、旧版文档包或其他包的文件占用的名称仍归其所有者。运行 `{@command component Dialog --package @acme/astryx-widgets}`，或给你的组件起一个自己的名字。",
            ],
            [
              '`Error: Template "dashboard" is ambiguous — narrow it with --type and/or --package.`',
              "你的模板 id 与 Core 的 id 相同。重命名它（例如 `acme-dashboard`），或设置 `replaces: 'dashboard'` 取而代之。`{@command doctor integration templates}` 会在发布前对此发出警告。",
            ],
            [
              '`invalid_doc_graph`: `placement.parent "namespace:nope" names no namespace; @acme/astryx-widgets declares "acme".`',
              '在该指南的 `placement` 指向你包所声明的命名空间（namespace）和插槽之前，它会一直隐藏。若报 `"…" names no doc`，请修正链接目标。',
            ],
            [
              'Error: Unknown topic "acme". The docs of @acme/astryx-widgets did not load; run `{@command doctor integration docs}` in that package to see why.',
              '一个无效文档会隐藏你的全部文档。在该包中运行 `{@command doctor integration docs}`，并修复它指出的 `invalid_doc`。',
            ],
            [
              '`cli-command` warns: `Loaded integrations declare different CLI commands`',
              "应用加载的两个包设置了不同的 `cliCommand` 值，因此 CLI 会打印包管理器的命令。统一为一个命令，或移除不属于此处的包。见 {@link generic:cli-command}。",
            ],
            [
              '`invalid_cli_command`',
              '你的 `cliCommand` 不是至多 120 字符的单行纯文本，因此被忽略。修正该值即可；清单的其余部分仍会加载。',
            ],
            [
              '`{@command upgrade}` 没有运行你的任何 codemod',
              '应用必须在 `astryx.config` 的 `integrations` 中列出你的包，或传入 `--integration @acme/astryx-widgets`。codemod 文件夹只有在其版本晚于 `--from` 且不超过已安装的 `@astryxdesign/core` 时才会运行。',
            ],
            [
              '你的文档 section、模板或主题只在部分应用中缺失',
              "那些应用运行的 CLI 版本太旧而读不了它们（{@link generic:checks} 列出了哪个字段需要哪个 CLI）。在那里更新 `@astryxdesign/cli`，并保留你的可选 `@astryxdesign/cli` peer 依赖，这样应用安装你的包时 npm 会以其 CLI 版本进行对照检查。",
            ],
          ],
        },
        {
          type: 'prose',
          text: '各项检查分别能发现什么见 {@link generic:checks}。',
        },
      ],
    },
  ],
};
