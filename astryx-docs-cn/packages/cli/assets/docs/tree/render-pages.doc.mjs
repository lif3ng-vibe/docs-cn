// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs cli/experimental/render-pages`: turn a page into one
 * self-contained HTML file to share or embed, and turn that file back into
 * the page.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'render-pages',
  placement: {parent: 'namespace:experimental', slot: 'guides', order: 20},
  stability: 'experimental',
  title: '把页面变成单个 HTML 文件',
  category: 'guide',
  keywords: [
    'render',
    '静态 html',
    '单文件',
    '产物',
    '分享页面',
    '快照',
    '嵌入',
    '沙箱 iframe',
    'reverse',
  ],
  description:
    '实验性。把页面渲染成一个自包含 HTML 文件用于分享或嵌入，并可从中还原页面。',
  sections: [
    {
      id: 'experimental',
      title: '实验性',
      content: [
        {
          type: 'prose',
          text: '该命令是实验性的，`astryx docs cli/experimental` 下的所有内容都是如此：其选项、输出文件与 JSON 仍可能变化。CLI 的其他部分不因它的存在而改变。',
        },
      ],
    },
    {
      id: 'make-a-file',
      title: '生成用于分享的文件',
      content: [
        {
          type: 'prose',
          text: '照常用 Astryx 组件构建页面，然后渲染它。页面模块需要一个 default export；它在你机器上用项目安装的 React 与 Astryx 包渲染。在项目之外（该文件夹没有安装或声明 Astryx Core 或 CLI）时，则用 CLI 自身运行所带的 Astryx、React 与 StyleX 渲染，因此单个页面文件在任何地方都能渲染，包括 React 应用。',
        },
        {
          type: 'code',
          lang: 'bash',
          code: 'astryx experimental render src/app/page.tsx --out page.html',
        },
        {
          type: 'prose',
          text: '结果是一个文件、旁边没有任何东西：标记、页面用到的 CSS 规则（来自 Core 以及它导入的任何样式表，如主题）、页面自身的 StyleX 样式，以及以 data: URI 内嵌的本地图片。它不运行任何脚本、不从网络加载任何东西，因此可以从磁盘打开、作为附件发送，并在阻止网络与脚本的沙箱框架内显示。颜色跟随查看者的浅色或深色设置，根元素上的 `data-theme` 为 `light` 或 `dark` 时则采用指定值。文件还携带页面本身及其导入的每个本地模块、样式表、JSON 文件和图片的源码，与你分享的人可以阅读这些代码；不要让页面导入的内容包含机密。',
        },
        {
          type: 'prose',
          text: '它无法保留的：运行时需要浏览器的一切。状态、effect、点击处理器以及首次绘制之后加载的数据都会丢失。用 recharts 制作的图表是例外：渲染会在页面内部绘制页面模块（而非安装的包）按名从 recharts 导入的每个图表与 ResponsiveContainer（`import {LineChart} from \'recharts\'`），因此自定义的刻度、标签或形状能看到页面的 React context。由容器决定尺寸的图表会缩放到页面给它的宽度，其图例不会挤占画面：横向图例在图表下方独占一行（图例要求置顶时在上方），一侧的纵向图例贴在该侧旁边；固定尺寸的图表中，图例保持其 props 指定的位置。图表显示页面首次渲染（effect 运行前）的数据与 props：当页面没有浏览器就无法再次绘制，或其 effect 会改变图表、或重新渲染生成图表的组件时，每个图表都独立绘制，其各部分看到的是 React context 默认值。图表各部分从被 effect 修改的 React context 读取的值，仍可能显示其后来的值。`chart-size` 警告统计渲染无法绘制的图表（例如通过 `import * as R` 使用的图表），并在图表独立绘制时予以说明。window 等仅浏览器可用的值请在 effect 内读取，否则渲染会以 ERR_RENDER_BROWSER_API 终止。',
        },
      ],
    },
    {
      id: 'warnings',
      title: '读懂警告',
      content: [
        {
          type: 'prose',
          text: '每条警告都会指出可能与你预期不符的地方以及如何修改。最常见的是忽略 children 的组件：`<ListItem>Save</ListItem>` 渲染出空行，因为 ListItem 用的是 `label="Save"`。其他警告针对远程图片（沙箱查看器无法加载它们；把图片存到页面旁边并导入）、页面自身渲染的 `<script>`、`<link>` 或 `<iframe>`（该文件承诺不运行、不加载任何东西，所以请移除它们）、缺失的图片，以及页面在渲染期间打印的输出。`node-crash` 警告会指出在 `Intl.Segmenter` 处崩溃的 Node 构建（含其版本与路径）。页面没有用它也照样渲染完成，因此输出可能略有差异：首字母与字符计数（如 Avatar 首字母）可能把相连的 emoji、旗帜或带独立附加符号的字母拆开。普通组合字符的名字（`José`、`Zoë`、`李小龙`）输出不变。用官方 Node.js 构建渲染即可消除差异。',
        },
      ],
    },
    {
      id: 'get-it-back',
      title: '把页面还原回来',
      content: [
        {
          type: 'code',
          lang: 'bash',
          code: 'astryx experimental render --reverse page.html --out page.tsx',
        },
        {
          type: 'prose',
          text: '每个渲染文件都携带其源码，因此该命令会逐字节还原页面；编辑后再次渲染即可。源码块被移除、但标记来自 Astryx 组件的文件，则改为从标记重建：组件、记录的 props 与文本会回来，而样式、图标与行为不会，请把它当作起点。从未是 Astryx 页面的 HTML 会被拒绝并报 ERR_RENDER_NOT_ASTRYX；向 `astryx build` 描述页面即可新建一个。',
        },
        {
          type: 'prose',
          text: '它会写出页面本身、页面通过自身 import 到达的模块、样式表与 JSON 文件，以及渲染时携带的图片、字体与媒体（无论页面如何命名它们，只要字节确实相同）：每一项都落在页面的相对 import 能找到的位置（从你放置页面的地方算起），而页面通过路径别名（`@/components/Header`）导入的文件则落在项目 `tsconfig.json` 或 `jsconfig.json` 别名指向的位置。除页面外的所有文件都放进还原时新建的唯一文件夹（页面路径上尚不存在的最顶层文件夹），绝不进入已存在的文件夹：导入其他文件的页面会被还原进新文件夹（`--out restored/app/page.tsx`），通过路径别名导入的文件只有在该别名指向新文件夹内部时才会还原。它也不会写出测试、story 或基准测试运行器按默认模式会运行的文件（Jest、Vitest、Bun、AVA、Playwright、Storybook、Cypress 与 `node --test`：如 `*.test.*`、`*.spec.*`、`*_test.*`、`*-test.*`、`*.bench.*`、`*.stories.*`、`*.cy.*`，以及 `test/`、`tests/` 或 `__tests__/` 下的任何内容），判断从仓库根（文件之上直到它的每层文件夹）开始，否则从带有 package.json 的最顶层文件夹开始。还原的文件是发送者的代码：运行或导入前先阅读它们。不带 `--out` 时，所有内容都还原到 HTML 文件旁边、以它命名的新文件夹（`page.html` 还原到 `page-restored/`）。收到的文件若携带其他任何东西（页面从不导入的文件、dotfile、`package.json`、工具配置、越出该文件夹的路径），会整体拒绝、一字不写。渲染文件在途中丢失了内嵌源码（消毒器或编辑器剥离了 `<script>` 块）又没有可重建的 Astryx 组件时，会被拒绝并报 `ERR_RENDER_SOURCE_DAMAGED`。已存在的文件绝不替换，除非传入 `--overwrite`，且拒绝时会逐一列出；生成的、vendor 的或被 ignore 的文件，以及任何经过符号链接的路径，即使如此也不写出。加 `--json` 可获得作为数据的返回结果：写了什么、多大，以及每条警告。',
        },
      ],
    },
  ],
};
