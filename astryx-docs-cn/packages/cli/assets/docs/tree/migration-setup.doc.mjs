// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs migration/migration-setup`: theme and CSS setup,
 * cascade layer safety, layer audit, and the foundation smoke test.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */

export const docs = {
  type: 'generic',
  name: 'migration-setup',
  title: '设置',
  placement: {parent: 'namespace:migration', slot: 'guides', order: 10},
  category: 'guide',
  description:
    '安装主题、接好 CSS 层级、审计 reset，并在迁移任何表面之前先跑基础冒烟测试。',
  keywords: [
    '设置',
    '主题',
    '重置',
    '冒烟测试',
    '层级审计',
    '级联层',
    'Tailwind 共存',
  ],

  sections: [
    {
      title: '概述',
      content: [
        {
          type: 'prose',
          text: '把迁移看作产品外壳与工作流的迁移，而不是全局 class 替换。先把应用包进 Theme 与 AppShell，再逐个路由或表面迁移到设计系统原语，同时保持既有数据、路由与业务逻辑不动。',
        },
        {
          type: 'prose',
          text: '迁移期间 Tailwind 可以共存。用它承载遗留包装层与局部布局，同时用组件替换交互控件、导航、命令表面、表单、警告条、对话框与设置界面。',
        },
      ],
    },
    {
      title: '推荐顺序',
      content: [
        {
          type: 'list',
          style: 'ordered',
          items: [
            '安装各依赖包并运行 `{@command init}` 获取智能体（agent）文档，然后加入 reset、`astryx.css` 与主题 CSS 的导入（见下方"主题与 CSS 设置"）。',
            '用 Theme 包裹应用根节点，并选择初始的浅色、深色或跟随系统模式行为。',
            '在替换组件之前，先显式声明 Tailwind 与设计系统 CSS 的层级顺序。',
            '先渲染基础冒烟测试页面，确认原语组件保住自己的 padding，再迁移任何表面。',
            '先迁移常驻框架：AppShell、TopNav、SideNav、页面内容与移动端导航。参见 {@link generic:component-migration}。',
            '替换共享原语：Button、IconButton、TextInput、NumberInput、Switch、CheckboxInput、RadioList、Selector、TabList、Dialog、AlertDialog、Banner、Toast、Badge、Card、Table 与 ListItem。参见 {@link generic:component-migration}。',
            '替换全局工作流：命令面板、设置弹层、主题切换、搜索、筛选器、创建流程与破坏性操作确认对话框。',
            '在每个完成的表面移除遗留 Tailwind class，只保留由 token 驱动的布局工具类或仍待迁移的局部包装层。',
            '进入下一个路由之前，验证浅色与深色两种模式、键盘导航、响应式布局以及空态/错误/加载状态。参见 {@link generic:migration-verification}。',
          ],
        },
      ],
    },
    {
      title: 'CLI 工作流',
      content: [
        {
          type: 'prose',
          text: '把 CLI 当作迁移清单来用。先读即将触及模式的文档，查看匹配的模板骨架，再在动手编辑前读对应组件的文档。',
        },
        {
          type: 'code',
          lang: 'bash',
          label: '面向迁移的 CLI 一遍走',
          code: `{@command docs migration}
{@command docs theme}
{@command docs styling}
{@command template --list --type block}
{@command template AppShellTopNavWithSideNav --skeleton}
{@command template PopoverSettingsPanel --skeleton}
{@command component AppShell}
{@command component SideNav}
{@command component TopNav}
{@command component CommandPalette}
{@command component Button}
{@command component TextInput}`,
        },
        {
          type: 'prose',
          text: '要一份可粘贴进 AI 编码工具的更短读物，参见 {@link generic:working-with-ai}。构建自动化迁移报告时使用 `--json`。',
        },
        {
          type: 'code',
          lang: 'bash',
          label: '精简与 JSON 模式',
          code: `{@command docs migration --full --detail brief}
{@command component Button --json}`,
        },
      ],
    },
    {
      title: '主题与 CSS 设置',
      content: [
        {
          type: 'prose',
          text: '在应用根节点挂载 Theme，让每个迁移后的组件读取同一套 token。如果用户可在浅色与深色主题间切换，把模式保存在应用状态里。',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: '带显式模式的根 Provider',
          code: `import {Theme} from '@astryxdesign/core/theme';
import {neutralTheme} from '@astryxdesign/theme-neutral/built';
import {useState} from 'react';
import '@astryxdesign/theme-neutral/theme.css';

export function AppRoot({children}: {children: React.ReactNode}) {
  const [mode, setMode] = useState<'system' | 'light' | 'dark'>('system');

  return (
    <Theme theme={neutralTheme} mode={mode}>
      <SettingsContext.Provider value={{mode, setMode}}>
        {children}
      </SettingsContext.Provider>
    </Theme>
  );
}`,
        },
        {
          type: 'prose',
          text: '当应用中仍保留 Tailwind 时，在全局 CSS 文件里一次性声明层级顺序。先加载 Astryx 的 reset 与主题 CSS，再加载 Tailwind 工具类，让迁移后的组件保住设计系统默认样式，同时遗留工具类仍然生效。Tailwind v4 的导入与层级顺序见 {@link generic:tailwind}。',
        },
        {
          type: 'prose',
          text: '在根布局或应用入口最先导入全局 CSS 文件，先于任何会导入 Astryx 或主题 CSS 的模块，包括 `astryx-themes` 模块与上文 `AppRoot` 这类根组件。顺序为何重要、无法最先导入时该怎么办，见 {@link generic:tailwind}。',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: '根布局或应用入口',
          code: `import './globals.css'; // first: declares the cascade-layer order

import {AppRoot} from './AppRoot';`,
        },
        {
          type: 'prose',
          text: 'Tailwind v3 没有可导入的 preflight.css，因此改为把 @tailwind base 指令包进一个具名 layer。工具类保持不分层，让应用既有的工具类在任何地方继续胜出。把 `@layer` 顺序行放进单独的 `layers.css` 并最先导入、先于 `globals.css`：Next.js（webpack 或 Turbopack）等会上提 CSS 导入的打包器会把被导入文件移到内联 `@layer` 行之前，顺序声明就会来得太晚。',
        },
        {
          type: 'code',
          lang: 'css',
          label: 'layers.css（最先导入）',
          code: `@layer reset, tw-preflight, astryx-base, astryx-theme;`,
        },
        {
          type: 'code',
          lang: 'css',
          label: 'globals.css（Tailwind v3 共存）',
          code: `@import "@astryxdesign/core/reset.css";
@import "@astryxdesign/core/astryx.css";
@import "@astryxdesign/theme-neutral/theme.css";

@layer tw-preflight {
  @tailwind base; /* layered: astryx-theme now wins over preflight */
}
@tailwind components;
@tailwind utilities; /* unlayered: legacy utility classes keep winning */`,
        },
        {
          type: 'code',
          lang: 'tsx',
          label: '根布局或应用入口（Tailwind v3）',
          code: `import './layers.css'; // first: declares the cascade-layer order
import './globals.css';

import {AppRoot} from './AppRoot';`,
        },
      ],
    },
    {
      id: 'cascade-layer-safety',
      title: '为什么 reset 会破坏级联层',
      content: [
        {
          type: 'prose',
          text: '在完全不分层的样式表里，`* { padding: 0 }` 这种零特异性 reset 会输给任何 class 选择器，所以多数开发者把 reset 视为无害。层级规则改变了两点：不分层样式胜过所有具名层级，靠后的层级胜出靠前的层级，两者都不看特异性。因此同一个 reset 要么保持不分层、要么落进声明在 astryx-base 之后的层级，就能压过所有组件样式。同样的 CSS，结果相反，而且发生时没有任何报错或警告。',
        },
        {
          type: 'prose',
          text: '这是落地失败最常见的路径，经由两种 @import 机制之一发生。不带 layer() 关键字的顶层 @import 会让遗留 reset 保持不分层，从而覆盖设计系统的所有层级；而嵌套在被导入进某个层级的文件里的 @import 会继承外层层级，reset 就可能悄悄落进 astryx-base 之上的消费方层级。两种情况的修法相同：把遗留 reset 显式导入最低层。',
        },
        {
          type: 'code',
          lang: 'css',
          label: '遗留 reset，显式分层',
          code: `/* was: @import "./legacy-reset.css";  (unlayered: beats every layer) */
@import "./legacy-reset.css" layer(reset);`,
        },
        {
          type: 'prose',
          text: '在构建界面之前，用下方的级联层审计逐份检查每个样式表。',
        },
      ],
    },
    {
      id: 'layer-audit',
      title: '级联层审计',
      content: [
        {
          type: 'prose',
          text: '构建界面之前，用这份清单审计设计系统周边的层级。',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '一次性声明权威 @layer 顺序，置于任何 @import 之前。在 Next.js（webpack 或 Turbopack）等会上提 CSS 导入的打包器里，顺序声明必须放在单独的 CSS 文件中并最先导入（如 layers.css），因为打包器会把 @import 内容上提到其后内联 CSS 的上方。',
            '审计所有既有的全局或 reset 样式表，并为每份显式指定所属层级。不带 layer() 的顶层导入保持不分层并胜过所有层级；嵌套在分层文件内的导入会继承该层级。',
            '移除或降级应用自带的遗留 reset。设计系统在最低层自带 :where() reset，因此应用的 reset 应放进同一个 reset 层，绝不能放进 astryx-base 之上的层级。',
            '给 Tailwind preflight 分层。Tailwind v4 用 layer(base) 导入 preflight.css；Tailwind v3 把 @tailwind base 指令包进具名 layer（见"主题与 CSS 设置"中的片段）。不分层的 preflight 会悄悄覆盖主题 CSS。',
            '将 moduleResolution 设为 bundler 或更新的 node16，让 @astryxdesign/core/reset.css 这类子路径导入可以解析。',
            '用 defineTheme 与 accent 色系 API 做主题定制，而不是手写单个颜色 token。--color-on-accent 这类派生 token 会从 accent 色阶自动生成；只手写 --color-accent 会让 --color-on-accent 停留在过期的白色默认值，与新 accent 之间没有任何对比度保证。',
            '迁移任何路由之前，先运行下方的基础冒烟测试，并在浅色与深色模式下查看若干组件。',
          ],
        },
        {
          type: 'prose',
          text: '再一个思维转变：写在组件上的 className 或工具类无论如何都会到达 DOM，但它能否覆盖组件样式取决于层级，而不是源码顺序。把应用工具类放进 utilities 层，让它们继续胜出。',
        },
      ],
    },
    {
      title: '基础冒烟测试',
      content: [
        {
          type: 'prose',
          text: '层级顺序一旦出错，会在每个页面以同样的方式静默失败，所以要在功能开发之前抓住它，而不是在迁移了 N 个界面之后。第一步先渲染一个只放几个原语组件的一次性页面。',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: '基础检查页面',
          code: `import {useState} from 'react';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Table} from '@astryxdesign/core/Table';
import {TextInput} from '@astryxdesign/core/TextInput';
import {VStack} from '@astryxdesign/core/VStack';

export default function FoundationCheck() {
  const [email, setEmail] = useState('');

  return (
    <div data-foundation-check>
      <VStack gap={4}>
        <Button label="Primary action" variant="primary" />
        <TextInput
          label="Email"
          placeholder="you@example.com"
          value={email}
          onChange={setEmail}
        />
        <Card>One card with default padding</Card>
        <Table
          data={[{name: 'Foundation', status: 'ok'}]}
          columns={[
            {key: 'name', header: 'Name'},
            {key: 'status', header: 'Status'},
          ]}
        />
      </VStack>
    </div>
  );
}`,
        },
        {
          type: 'prose',
          text: '如果按钮渲染出可见 padding 与实心 primary 背景，输入框与卡片有边框和内部间距，基础就是完好的。若需要能在任意测试运行器里执行、或放进仅开发环境生效的 effect 的断言，可检查原语组件的 padding 是否非零：',
        },
        {
          type: 'code',
          lang: 'ts',
          label: '基础断言',
          code: `const button = document.querySelector<HTMLButtonElement>(
  '[data-foundation-check] button',
);
if (!button) {
  throw new Error('Foundation check page did not render a button.');
}
if (getComputedStyle(button).paddingInline === '0px') {
  throw new Error(
    'Foundation broken: an unlayered reset or a later cascade layer is ' +
      'overriding component styles. Check that no app reset sits outside ' +
      'the reset layer.',
  );
}`,
        },
        {
          type: 'prose',
          text: '断言失败时，修复几乎总在层级顺序上：找到把 padding 归零的样式表，把它移进 reset 层或直接删除。',
        },
      ],
    },
  ],
};
