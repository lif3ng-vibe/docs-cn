// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */

export const docs = {
  name: 'use-a-theme',
  title: '使用主题',
  category: 'guide',
  keywords: ['主题', 'Theme', '深色模式', '浅色', '嵌套', 'provider', 'SSR', '构建', '运行时', 'neutralTheme', '可用主题', 'theme add', '导入', 'astryx-themes', '弹出'],
  description:
    '把主题应用到你的应用：安装、用 CLI 导入、接线生成的模块、切换深色模式、嵌套主题，并为生产选择运行时或构建产物。',

  sections: [
    {
      id: 'quick-start',
      title: '把应用包进主题',
      content: [
        {
          type: 'code',
          lang: 'bash',
          label: '安装并添加主题',
          code: '{@pm install @astryxdesign/theme-neutral}\n{@command theme add neutral}',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: '把生成的模块接线一次',
          code: "import {Theme} from '@astryxdesign/core/theme';\nimport {themes, defaultThemeSlug} from './astryx-themes';\n\nfunction App() {\n  return (\n    <Theme theme={themes[defaultThemeSlug]}>\n      <YourApp />\n    </Theme>\n  );\n}",
        },
        {
          type: 'code',
          lang: 'tsx',
          label: '在已添加的主题间切换',
          code: "import {useState} from 'react';\nimport {Theme} from '@astryxdesign/core/theme';\nimport {themes, type ThemeSlug} from './astryx-themes';\n\nconst [slug, setSlug] = useState<ThemeSlug>('neutral');\nconst app = <Theme theme={themes[slug]}><YourApp /></Theme>;",
        },
        {
          type: 'prose',
          text: '`theme add` 登记一个已安装的包主题，并重新生成 `src/astryx-themes.ts` 或 `.js`，其中包含它的构建模块、生产 CSS 与可选的字体 CSS。在没有 `src` 的项目中，该模块位于项目根目录。第一个导入的主题成为默认主题。`theme use <slug>` 可更改默认值，`theme remove <slug>` 可移除非默认主题。',
        },
        {
          type: 'prose',
          text: '用 `defineTheme({extends: importedTheme, ...})` 定制包主题，然后构建并添加该本地主题。只有想要一份不再接收包作者更新的独立源码分叉时，才使用 `theme eject`。完整创作指南见 {@link generic:author-a-theme}。',
        },
      ],
    },
    {
      title: '迁移早期复制的主题',
      content: [
        {
          type: 'prose',
          text: '由已发布版 `theme add` 复制的主题仍是应用源码。升级不会移动、删除或改写它。它只会补写缺失的同词干描述符并标 `maintained: false`，让该副本成为本地主题。',
        },
        {
          type: 'code',
          lang: 'bash',
          label: '为早期副本补写描述符',
          code: '{@command upgrade --from 0.6.4 --path . --apply}',
        },
        {
          type: 'prose',
          text: '升级运行之前，theme 命令会跳过 `src/themes` 中没有描述符的副本。`theme list` 与 doctor 会把它标记为未迁移并显示升级命令。原本想复制源码的脚本现在以相同参数运行 `theme eject`；原本想让应用使用某主题的脚本则运行 `theme add`。',
        },
        {
          type: 'prose',
          text: '`ASTRYX_THEME` 不再被读取。运行 `theme add <slug>` 与 `theme use <slug>` 在生成的应用主题模块中选择默认主题。当该模块存在时，组件元数据读取其中记录的默认主题。没有该模块时，已发布版 `package.json#astryx.theme` 查找保持原义。',
        },
      ],
    },
    {
      title: '可用主题',
      content: [
        {
          type: 'prose',
          text: '用 `{@pm install @astryxdesign/theme-<name>}` 安装想要的主题包，再用 `theme add <slug>` 导入它的 slug。CLI 会替你导入该包的构建产物。',
        },
        {
          type: 'table',
          headers: ['主题', '添加命令', '说明'],
          rows: [
            ['Neutral', '{@command theme add neutral}', '素净极简的观感，配 Figtree 字体。不错的起点。'],
            ['Butter', 'astryx theme add butter', '金黄奶油色表面配蓝色强调；Sarina + Outfit 字体。'],
            ['Chocolate', 'astryx theme add chocolate', '暖棕色调与温馨米色；Fraunces + Albert Sans 字体。'],
            ['Gothic', 'astryx theme add gothic', '仅深色的氛围主题；深蓝灰表面，做旧展示字体。'],
            ['Matcha', 'astryx theme add matcha', '大地绿；DM Sans + Playwrite US Trad 字体。'],
            ['Stone', 'astryx theme add stone', '暖石与板岩色调；Montserrat + Figtree 字体。'],
            ['Y2K', 'astryx theme add y2k', '俏皮的 Y2K 流行风；长春花蓝正文、全息强调，Poppins + Crimson Text。'],
          ],
        },
        {
          type: 'prose',
          text: '每个第一方包都在 `@astryxdesign/theme-{name}/built` 导出构建主题，`/theme.css` 提供生产 CSS，`/fonts.css` 提供字体加载 CSS。`theme add` 会把这些导入写进生成的应用模块。',
        },
      ],
    },
    {
      title: 'Theme 的 prop',
      content: [
        {
          type: 'prose',
          text: "`<Theme>` 接受 `theme`（必填）、`mode`（默认 `'system'`，或 `'light'`/`'dark'`）与 `children`。全部 prop 见 `{@command component Theme}`。",
        },
      ],
    },
    {
      id: 'integration-themes',
      title: '使用来自集成的主题',
      content: [
        {
          type: 'prose',
          text: '把集成作为直接依赖安装。Astryx 会自动发现它的主题与指南，无需 `astryx.config` 条目。只有当已安装的包导出其构建模块与生产样式表时，才能添加该主题。',
        },
        {
          type: 'code',
          lang: 'bash',
          label: '安装、查看并添加',
          code: '{@pm install @astryxdesign/core @acme/brand-integration}\n{@command theme list --package @acme/brand-integration}\n{@command docs brand-theme}\n{@command theme add ocean --package @acme/brand-integration}',
        },
        {
          type: 'prose',
          text: '`theme add` 会在应用记录中保留所属包，并导入它的构建模块、样式表与可选字体样式表。包的更新会继续到达应用。只有想把源码与描述符作为独立本地分叉复制到 `src/themes/ocean` 时，才运行 `theme eject ocean --package @acme/brand-integration`。',
        },
      ],
    },
    {
      id: 'light-dark-mode',
      title: '深色模式',
      content: [
        {
          type: 'prose',
          text: "在令牌取值中使用 [light, dark] 元组即可自动切换模式。在 Theme 上用 mode='system'（默认）跟随操作系统偏好。",
        },
        {
          type: 'code',
          lang: 'tsx',
          label: '浅色/深色元组',
          code: "'--color-accent': ['#0064E0', '#2694FE'],\n//                   ^light     ^dark",
        },
        {
          type: 'code',
          lang: 'tsx',
          label: '用按钮切换',
          code: "const [mode, setMode] = useState<'light' | 'dark'>('light');\n\n<Theme theme={myTheme} mode={mode}>\n  <Button\n    label={mode === 'light' ? 'Switch to Dark' : 'Switch to Light'}\n    onClick={() => setMode(m => (m === 'light' ? 'dark' : 'light'))}\n  />\n</Theme>;",
        },
        {
          type: 'prose',
          text: '要用自定义深色模式颜色创建主题，见 {@link generic:author-a-theme}。',
        },
      ],
    },
    {
      id: 'nesting-themes',
      title: '嵌套主题',
      content: [
        {
          type: 'prose',
          text: '用独立的 `<Theme>` provider 包裹不同区块。',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: '深色侧栏配浅色内容',
          code: "<Theme theme={lightTheme} mode=\"light\">\n  <Layout\n    header={<LayoutHeader>...</LayoutHeader>}\n    start={\n      <Theme theme={darkTheme} mode=\"dark\">\n        <LayoutPanel>{/* Dark sidebar */}</LayoutPanel>\n      </Theme>\n    }\n    content={<LayoutContent>{/* Light content */}</LayoutContent>}\n  />\n</Theme>",
        },
      ],
    },
    {
      title: '运行时与构建主题',
      content: [
        {
          type: 'prose',
          text: '主题有两种工作模式：',
        },
        {
          type: 'table',
          headers: ['', '运行时（源码）', '构建'],
          rows: [
            ['导入（已发布主题）', '@astryxdesign/theme-{name}', '@astryxdesign/theme-{name}/built + theme.css'],
            ['导入（自定义主题）', '直接使用 defineTheme()', '由 `{@command theme build}` 产出的 .js + .css'],
            ['工作方式', 'useInsertionEffect 在 hydration 时注入 <style>', '随页面加载的预编译 .css 文件'],
            ['组件覆盖', '仅客户端注入', '在静态 CSS 中：SSR 期间就在场'],
            ['SSR 安全', '令牌安全，组件覆盖在 hydration 时闪动', '完全 SSR 安全：无闪动'],
            ['最适合', '作为 `{@command theme build}` 的创作输入', '应用接线，开发与生产皆宜'],
          ],
        },
        {
          type: 'list',
          style: 'do',
          items: [
            '生产应用使用 `theme add`；它接好构建模块与 CSS。',
            '从生成的模块一次性导入 `themes` 与 `defaultThemeSlug`，开发环境也保留这份接线。',
            '编辑本地主题时运行 `{@command theme build --watch}`，让构建文件保持最新。',
            '为自定义主题运行 `{@command theme build}` 获得构建产物。',
          ],
        },
        {
          type: 'list',
          style: 'dont',
          items: [
            '在生产 SSR 应用中使用运行时主题；组件覆盖会在 hydration 时闪动。',
            "只导入 /built 而不带 CSS 文件；组件覆盖不会生效。",
            '把包主题源码导入应用运行时代码。',
            '手改生成的主题模块；`theme add`、`theme remove` 与 `theme use` 会重新生成它。',
          ],
        },
        {
          type: 'prose',
          text: '要为生产构建自定义主题，见 {@link generic:author-a-theme} 的构建一节。',
        },
      ],
    },
  ],
};
