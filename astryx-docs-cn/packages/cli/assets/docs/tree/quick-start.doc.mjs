// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'quick-start',
  placement: {
    parent: 'namespace:authoring',
    slot: 'guides',
    order: 10,
  },
  title: '快速开始',
  category: 'guide',
  keywords: [
    'authoring',
    '创建包',
    '创建集成',
    '第一个集成',
    '集成教程',
    'package.json',
    'exports map',
    'astryx.integration.mjs',
  ],
  description:
    '创建新的集成包，或在你已发布的包中加入 Astryx。',
  sections: [
    {
      id: 'quick-start',
      title: '快速开始',
      content: [
        {
          type: 'heading',
          level: 3,
          text: '创建包',
        },
        {
          type: 'prose',
          text: '集成起初就是一个普通的 npm 包。为它建一个文件夹，在该文件夹内创建 package.json，给包起名，设为 ES module，然后安装 Astryx CLI、Core 和 TypeScript 用于开发。',
        },
        {
          type: 'code',
          lang: 'bash',
          code: 'mkdir acme-widgets && cd acme-widgets\n{@pm-only npm "writes package.json" init -y}\n{@pm-only npm "edits package.json" pkg set name=@acme/astryx-widgets type=module}\n{@pm-only npm "edits package.json" pkg set \'exports={}\' --json}\n{@pm install @astryxdesign/cli @astryxdesign/core typescript@6 --dev}',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '设置 `"type": "module"`：CLI 生成的 `.js` 文件（例如构建出的主题）都是 ES module，Node 无法在标记为 `"type": "commonjs"` 的包中加载它们——npm 11 上 `{@pm-only npm "写入 package.json" init -y}` 写入的正是 commonjs。',
            '以 `"exports": {}` 起步：之后添加的每个组件和模板都会把 `integration verify` 解析的公开 import 写进来。',
            '以 `astryx` 运行 CLI，它会执行你安装为 devDependency 的 `@astryxdesign/cli`。',
            '组件命令要读取 Core，所以需要安装 `@astryxdesign/core`。',
            '检查通过 TypeScript 的 JavaScript 编译器 API 将文档与代码对照，`typescript` 5.0 到 6 都带有该 API。TypeScript 7 不再提供它：在 TypeScript 7 上，还需安装它的 TypeScript 6 API 包 `@typescript/typescript6`，检查会自动使用它。',
          ],
        },
        {
          type: 'heading',
          level: 3,
          text: '添加第一个集成条目',
        },
        {
          type: 'prose',
          text: '集成可以包含多种条目。先从一个名为 `AcmeCarousel` 的组件开始。',
        },
        {
          type: 'code',
          lang: 'bash',
          code: '{@command integration add component AcmeCarousel}',
        },
        {
          type: 'code',
          lang: 'text',
          code: 'component contribution added\n\n[ok] AcmeCarousel\n\nDeclare component root ./components in astryx.integration.mjs.\n\n- components/AcmeCarousel.doc.mjs\n- components/AcmeCarousel.tsx\n- package.json\n- astryx.integration.mjs',
        },
        {
          type: 'prose',
          text: '`integration add` 会创建组件源码、对应的 `.doc.mjs`、包导出以及 `astryx.integration.mjs`。先更新生成的文档让 CLI 理解该组件，再编写组件本身。',
        },
        {
          type: 'prose',
          text: '按应用读取的方式把它读回来。',
        },
        {
          type: 'code',
          lang: 'bash',
          code: '{@command component AcmeCarousel}',
        },
        {
          type: 'prose',
          text: '现在你有了一个包含一个导出组件的集成包。',
        },
        {
          type: 'heading',
          level: 3,
          text: '在每次构建中检查（必需）',
        },
        {
          type: 'prose',
          text: '在每次构建中运行 `integration check --strict`（{@link generic:checks}）：文档、prop、模板或链接一旦与代码脱节，就会让构建失败，而不是让用户的应用出问题。现在就把它配置为 `typecheck` 脚本并运行。',
        },
        {
          type: 'code',
          lang: 'bash',
          code: '{@pm-only npm "edits package.json" pkg set scripts.typecheck="astryx integration check --strict"}\n{@pm run typecheck}',
        },
        {
          type: 'code',
          lang: 'text',
          code: '[ok] 0 errors, 0 warnings, 0 skipped. Every check passed.',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '在 CI 中以及每次发布前运行 `typecheck`。添加 `tsconfig.json` 后，在检查前加上 `tsc --noEmit && `，让同一脚本顺带检查类型。',
            '各项检查覆盖的范围以及 `--strict` 额外增加的内容：{@link generic:checks}。',
          ],
        },
        {
          type: 'heading',
          level: 3,
          text: '校验并打包',
        },
        {
          type: 'prose',
          text: '运行 `integration verify` 确认应用能看到该组件，然后生成下一步要安装的 `.tgz` 文件。`--pack-destination ..` 会把它写到包文件夹旁边，这样下一次打包就不会把它带进去。',
        },
        {
          type: 'code',
          lang: 'bash',
          code: '{@command integration verify}\n{@pm-only npm "builds the publish tarball" pack --pack-destination ..}',
        },
        {
          type: 'code',
          lang: 'text',
          code: 'Integration package ready\n\n[ok] @acme/astryx-widgets@1.0.0\n\n4 packed files; 3/3 required files present.',
        },
        {
          type: 'prose',
          text: '`integration verify` 会把打包好的包装进一个临时应用，确认组件能通过公开 import 解析（{@link generic:checks}）。它不发布任何东西，也不留下 `.tgz` 文件，所以 `{@pm-only npm "构建发布 tarball" pack}` 写出的 `../acme-astryx-widgets-1.0.0.tgz` 留给下一步使用。',
        },
        {
          type: 'heading',
          level: 3,
          text: '在应用中使用',
        },
        {
          type: 'prose',
          text: '在新应用中安装 Core、CLI 和你的 `.tgz` 文件。应用会作为依赖加载你的包，无需任何配置。',
        },
        {
          type: 'code',
          lang: 'bash',
          code: 'cd ..\nmkdir my-app && cd my-app\n{@pm-only npm "writes package.json" init -y}\n{@pm install @astryxdesign/core @astryxdesign/cli ../acme-astryx-widgets-1.0.0.tgz}\n{@command component AcmeCarousel}',
        },
        {
          type: 'code',
          lang: 'text',
          code: "**Import:** `import {AcmeCarousel} from '@acme/astryx-widgets/components/AcmeCarousel';`",
        },
        {
          type: 'prose',
          text: '后面几节会逐一解释包的各个字段与集成文件。要构建真正的组件，请继续阅读 {@link namespace:components}。',
        },
      ],
    },
    {
      id: 'fill-in-package-json',
      title: '填写 package.json',
      content: [
        {
          type: 'prose',
          text: '集成就是一个普通的 npm 包。以下六个字段决定它的命名、开发、检查与发布方式。',
        },
        {
          type: 'prose',
          text: '`peerDependencies` 是由应用提供的包。`devDependencies` 是构建集成时你使用的包。',
        },
        {
          type: 'table',
          headers: ['字段', '设置为', '原因'],
          rows: [
            [
              '`name`',
              '你的包名，例如 `@acme/astryx-widgets`',
              '每次 add 都会把它写进所生成文档的 `import` 里。添加前先改名，或添加后逐个更新 `import`。',
            ],
            [
              '`version`',
              '你发布的版本，例如 `1.0.0`',
              '应用能看到它；`astryx.integration.mjs` 不会重复它。',
            ],
            [
              '`exports`',
              '以 `{}` 起步',
              '每个组件和模板 add 都会把公开 import 写到这里，`integration verify` 据此解析。',
            ],
            [
              '`files`',
              '可选：要发布的路径',
              '排除私有文件。列表存在时，每次 add 会追加自己的根目录和 `astryx.integration.mjs`。',
            ],
            [
              '`peerDependencies`',
              '代码导入 `@astryxdesign/core` 时声明它；发布的特性需要更新版 CLI 时可选声明 `@astryxdesign/cli`（{@link generic:versioning}）',
              '这些包由应用为你的集成提供。',
            ],
            [
              '`devDependencies`',
              '`@astryxdesign/cli`、`@astryxdesign/core` 和 `typescript`',
              '让你在开发集成时运行 CLI、构建组件并执行检查。',
            ],
          ],
        },
        {
          type: 'prose',
          text: 'peer 范围与发布见 {@link generic:versioning}；`files` 与发布流程见 {@link generic:publishing}。在 `scripts` 中加入 `"typecheck": "tsc --noEmit && astryx integration check --strict"`，每次运行都会检查类型，并确认文档、prop 与链接仍与代码一致。它需要 `typescript` 和一个 `tsconfig.json`；见 {@link generic:checks}。',
        },
      ],
    },
    {
      id: 'the-integration-file',
      title: '集成文件',
      content: [
        {
          type: 'prose',
          text: '第一次 `integration add` 会创建 `astryx.integration.mjs`，之后的每次 add 都会更新它。快速开始过程中你无需手写或编辑这个文件。',
        },
        {
          type: 'heading',
          level: 3,
          text: '包中的文件',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '`package.json` 定义 npm 包，包括名称、版本、依赖、发布文件与导出。',
            '`astryx.integration.mjs` 告诉 CLI 包把每类集成条目放在哪里。',
            '集成条目文件存放在这些根目录下。例如一个组件可以有 `AcmeWidget.tsx` 作为源码、`AcmeWidget.doc.mjs` 作为文档。',
          ],
        },
        {
          type: 'heading',
          level: 3,
          text: '集成文件中的字段',
        },
        {
          type: 'code',
          lang: 'javascript',
          label: 'astryx.integration.mjs',
          code: "/** @type {import('@astryxdesign/cli/authoring').AstryxIntegration} */\nexport default {\n  components: './components',\n};",
        },
        {
          type: 'prose',
          text: '这个文件告诉 CLI 本包把集成条目放在哪里。只在需要自定义根目录或其他可选设置时才编辑它。路径相对于 package.json，后续 add 会保留你已设置的自定义路径。',
        },
        {
          type: 'prose',
          text: '全部字段见 {@link schema:integration}。',
        },
        {
          type: 'heading',
          level: 3,
          text: '使用 CLI',
        },
        {
          type: 'prose',
          text: '包文件可以手动编辑，但常规工作流交给 CLI 处理。以下链接始终打开对应命令的权威文档。',
        },
        {
          type: 'reference',
          target: 'command:integration add',
          presentation: 'summary',
        },
        {
          type: 'reference',
          target: 'command:integration verify',
          presentation: 'summary',
        },
        {
          type: 'reference',
          target: 'command:doctor integration',
          presentation: 'summary',
        },
      ],
    },
    {
      id: 'global-mode',
      title: '全局模式',
      content: [
        {
          type: 'prose',
          text: '全局模式下：用户还可以把你的包装到整台电脑上，与全局 CLI 并存（`{@pm install @astryxdesign/cli your-package --global}`）。此时它在任何项目之外的文件夹中生效，在项目内则只有该项目安装了它才生效。见 {@link namespace:global} 和 {@link generic:global-integrations}。',
        },
      ],
    },
  ],
};
