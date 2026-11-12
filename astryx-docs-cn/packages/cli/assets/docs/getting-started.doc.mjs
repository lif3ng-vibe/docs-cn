// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */

export const docs = {
  name: 'getting-started',
  title: '上手指南',
  category: 'guide',
  description: '将设计系统加入你的项目并开始构建。',
  keywords: ['快速开始', '安装', '初始化'],

  sections: [
    {
      title: 'AI 快速开始',
      content: [
        {
          type: 'prose',
          text: '把下面这段粘贴到你的 AI 编码工具里，让它来处理安装配置：',
        },
        {
          type: 'code',
          lang: 'text',
          label: '初始化设计系统',
          code: 'Install @astryxdesign/core, @stylexjs/stylex, @astryxdesign/theme-neutral, and @astryxdesign/cli in this project, then run `{@command init}` to set up agent docs. Read the generated files to learn the conventions.',
        },
        {
          type: 'prose',
          text: '然后让它定一个观感。每个应用都会有一个主题，无论有没有人主动挑选——因此在初始化时问一句是值得的，免得日后围绕错误的观感搭好界面再返工：',
        },
        {
          type: 'code',
          lang: 'text',
          label: '确定观感',
          code: 'Ask me what look and feel this app should have. Run `{@command theme list}`, install the closest theme package, and run `theme add <slug>`; use `--package` when owners share a slug. Import `themes` and `defaultThemeSlug` from the generated module once and pass `themes[defaultThemeSlug]` to `<Theme>`. Customize with `defineTheme({extends: importedTheme, ...})`. Use `theme eject` only when I ask for an independent source fork. Default to neutral if I have no preference, and show me the result before moving on.',
        },
      ],
    },
    {
      title: '安装',
      content: [
        {
          type: 'prose',
          text: 'Astryx 要求 React 19 或更高版本：`react` 与 `react-dom` >= 19.0.0 是 `@astryxdesign/core` 的 peer 依赖。',
        },
        {
          type: 'prose',
          text: '添加核心包及其 `@stylexjs/stylex` peer 依赖，再加一个主题和 CLI。',
        },
        {
          type: 'code',
          lang: 'bash',
          label: '终端',
          code: `{@pm install @astryxdesign/core @stylexjs/stylex @astryxdesign/theme-neutral @astryxdesign/cli}`,
        },
        {
          type: 'prose',
          text: "然后运行 `{@command init}` 安装 AI 智能体（agent）速查表（AGENTS.md/CLAUDE.md）。它是非交互式的，没有任何提问，因此对 AI 智能体、CI 和脚本都安全。加 `--all` 可获得主题与页面搭建工作流的指引。",
        },
        {
          type: 'code',
          lang: 'bash',
          label: '终端',
          code: `{@command init}`,
        },
      ],
    },
    {
      id: 'upgrade',
      title: '升级',
      content: [
        {
          type: 'prose',
          text: '用一条命令把应用列出的所有 Astryx 包升级到同一发布版。每个主题都标明与之配套的确切 Core 发布版，因此留在旧发布版的主题会与新 Core 不再匹配。',
        },
        {
          type: 'code',
          lang: 'bash',
          label: '终端',
          code: `{@pm install @astryxdesign/core@latest @astryxdesign/theme-neutral@latest @astryxdesign/cli@latest}\n{@command upgrade --from <old Core version> --apply}`,
        },
        {
          type: 'prose',
          text: "把你应用列出的其余 Astryx 包加进同一条命令，并把之前的 Core 版本传给 `--from`。如果你的包管理器会扣住新发布版，请豁免整个 `@astryxdesign/*` 作用域；在 pnpm 中是 `minimumReleaseAgeExclude: ['@astryxdesign/*']`。只豁免其中一部分包，会让不同发布版的包并排安装。",
        },
      ],
    },
    {
      id: 'install-once',
      title: '安装一次，处处可用',
      content: [
        {
          type: 'prose',
          text: "也可以为整台电脑安装一次 CLI，astryx 命令便能在任意文件夹中使用——为你自己，也为任何编码智能体——甚至在项目尚未创建时。在项目内部，应答的仍是项目自带的版本，因此全局安装绝不改变你的团队与 CI 得到的东西。项目里也保留一份；这是推荐配置。",
        },
        {
          type: 'code',
          lang: 'bash',
          label: '终端',
          code: `{@pm install @astryxdesign/cli --global}`,
        },
        {
          type: 'prose',
          text: '项目、全局还是两者兼有：{@link generic:project-global-or-both}。全局模式的一切细节：{@link namespace:global}。',
        },
      ],
    },
    {
      title: '添加基础 CSS 与主题',
      content: [
        {
          type: 'prose',
          text: '在你的全局 CSS 中导入 reset 与基础样式。然后运行 `{@command theme add neutral}`；生成的应用模块会导入该主题的生产 CSS 与字体 CSS。',
        },
        {
          type: 'code',
          lang: 'css',
          label: 'globals.css',
          code: `@import '@astryxdesign/core/reset.css';
@import '@astryxdesign/core/astryx.css';`,
        },
        {
          type: 'prose',
          text: '运行 `{@command theme list}` 查看全部主题。',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: '应用根组件',
          code: `import {Theme} from '@astryxdesign/core/theme';
import {themes, defaultThemeSlug} from './astryx-themes';

<Theme theme={themes[defaultThemeSlug]}><App /></Theme>`,
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '`@astryxdesign/theme-neutral`：素净极简，不错的起点',
            '`@astryxdesign/theme-butter`：暖金色调配蓝色强调',
            '`@astryxdesign/theme-chocolate`：浓郁的巧克力与焦糖色调',
            '`@astryxdesign/theme-gothic`：仅深色的主题，带水墨与黑色电影气息',
            '`@astryxdesign/theme-matcha`：大地绿与植物色调',
            '`@astryxdesign/theme-stone`：灵感来自砂岩的暖中性色',
            '`@astryxdesign/theme-y2k`：俏皮的 2000 年代早期流行风',
          ],
        },
        {
          type: 'prose',
          text: '这些样式表带级联层：reset 加载在 @layer reset，组件样式在 @layer astryx-base。如果你的项目已有全局 CSS、旧版 reset 或 Tailwind，请显式声明层顺序，并有意识地让每个样式表各归一层：无论优先级高低，未分层样式与靠后的层都会覆盖 astryx-base。搭建界面之前，请先阅读 {@link generic:migration-setup} 中关于级联层的两节。',
        },
        {
          type: 'prose',
          text: '完整主题指南见 {@link generic:use-a-theme}。',
        },
      ],
    },
    {
      title: '添加你的第一个组件',
      content: [
        {
          type: 'prose',
          text: '从各自的入口导入每个组件，路径由 `{@command component <Name>}` 打印。这能让包体保持小巧，意图也更清晰。',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'app/page.tsx',
          code: `import {Button} from '@astryxdesign/core/Button';
import {VStack} from '@astryxdesign/core/VStack';

export default function Page() {
  return (
    <VStack gap={2}>
      <Button label="Hello Astryx" onClick={() => alert('Hi!')} />
    </VStack>
  );
}`,
        },
      ],
    },
    {
      title: '用 StyleX 做定制',
      content: [
        {
          type: 'prose',
          text: 'Astryx 组件支持多种样式方案，从纯 CSS 与 `className` 到 Tailwind 与 CSS-in-JS。完整指南见 {@link namespace:styling}。Astryx 还与 [StyleX](https://stylexjs.com/)（一个原子化 CSS-in-JS 库）深度集成：用 `stylex.create()` 创建样式，再通过 `xstyle` prop 传给组件。',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: '样式覆盖',
          code: `import * as stylex from '@stylexjs/stylex';

const overrides = stylex.create({
  save: { alignSelf: 'flex-end', marginTop: 16 },
});

<Button label="Save" xstyle={overrides.save} />`,
        },
      ],
    },
    {
      title: '示例应用',
      content: [
        {
          type: 'prose',
          text: '要获得完整可运行的项目，可从仓库克隆一个示例应用。它们是路由、主题与组件齐备并接好线的完整配置。',
        },
        {
          type: 'table',
          headers: ['示例', '技术栈', '路径'],
          rows: [
            [
              'Next.js',
              'Next.js + 主题 CSS',
              '[apps/example-nextjs](https://github.com/meta/astryx/tree/main/apps/example-nextjs)',
            ],
            [
              'Next.js + StyleX',
              'Next.js + StyleX 自定义样式',
              '[apps/example-nextjs-stylex](https://github.com/meta/astryx/tree/main/apps/example-nextjs-stylex)',
            ],
            [
              'Next.js + Tailwind',
              'Next.js + Tailwind 桥接',
              '[apps/example-nextjs-tailwind](https://github.com/meta/astryx/tree/main/apps/example-nextjs-tailwind)',
            ],
            [
              'Vite + Tailwind',
              'Vite + Tailwind 桥接',
              '[apps/example-vite-tailwind](https://github.com/meta/astryx/tree/main/apps/example-vite-tailwind)',
            ],
          ],
        },
        {
          type: 'code',
          lang: 'bash',
          label: '克隆并运行示例',
          code: `git clone https://github.com/meta/astryx.git
cd astryx/apps/example-nextjs
{@pm install}
{@pm run dev}`,
        },
      ],
    },
    {
      title: '探索 CLI',
      content: [
        {
          type: 'prose',
          text: 'CLI 是你查询组件、令牌、模板与文档的参考。为了可靠调用（尤其是配合 AI 助手），请把这段脚本加进你的 package.json：',
        },
        {
          type: 'code',
          lang: 'json',
          label: 'package.json',
          code: `"scripts": {
  "astryx": "node node_modules/@astryxdesign/cli/clients/cli/bin/astryx.mjs"
}`,
        },
        {
          type: 'prose',
          text: "然后探索有哪些可用内容：",
        },
        {
          type: 'code',
          lang: 'bash',
          label: '终端',
          code: `{@command component}          # list all components
{@command component Button}   # props, usage, theming for Button
{@command docs}               # list all doc topics
{@command template --list}    # available page templates
{@command docs tokens}        # spacing, color, radius reference`,
        },
      ],
    },
  ],
};
