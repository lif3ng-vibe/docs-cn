// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs cli/experimental/icon-sets`: make an
 * icon set: register icons against icon definitions with the CLI, check the
 * set, and know how apps find its icons and how templates follow it.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'icon-sets',
  placement: {parent: 'namespace:experimental', slot: 'guides', order: 10},
  stability: 'experimental',
  title: '图标集',
  category: 'guide',
  keywords: [
    '图标集',
    '添加图标',
    '发布图标',
    '图标库',
    '图标定义',
    'icons.json',
    '集成图标',
  ],
  description:
    '发布一个图标集：把每个图标注册到某个图标定义上，让应用按含义查找图标、模板使用你的图标。',
  sections: [
    {
      id: 'experimental',
      title: '实验性',
      content: [
        {
          type: 'prose',
          text: '图标集是实验性的：`astryx experimental icon` 命令、astryx.config 中的 `experimental.iconSet` 键、集成清单中的 `experimental.iconSets` 键、数据文件、图标定义，以及它们全部的输出与 JSON，都可能在任意补丁版本中更改或移除，没有弃用期。未设置 `experimental.iconSet` 的项目在任何稳定命令中都看不到变化，除了：help 与 `astryx manifest` 中标记的 `experimental` 组（其命令及其 `responseTypes` 与 `jsonSupported` 条目）；CLI 参考列表中标记为实验性的条目；以及搜索 \"experimental\"，它也会找到字段参考中稳定的 `stability` 字段。模板、discover 与 doctor 的表现与未安装图标集时相同。在安装了随附图标集的包且未选择启用时，旧版 CLI 关于清单键 `experimental` 的警告（出现在 `astryx doctor` 与 `astryx doctor integration validate <package>` 中，以及其他命令打印到 stderr 的一行提示）都不再出现。`astryx search` 永不返回图标或这些文档；要按含义查找图标，请用 `astryx experimental icon <words>`。',
        },
      ],
    },
    {
      id: 'how-it-works',
      title: '工作原理',
      content: [
        {
          type: 'prose',
          text: 'Astryx 维护一份图标定义列表：每个含义一个文件，例如 `close` 或 `delete`（见 `astryx docs cli/experimental/icon-definitions`）。图标集在其数据文件的 `map` 中注册自己的哪个图标绘制哪个定义；一个图标可以绘制多个定义（`file` 与 `document` 都可以是你的 `document` 图标）。模板声明其每个图标绘制哪个定义，因此使用你的集合的项目对你映射的每个定义都会得到你的图标。每个集合都必须映射内置定义——即 Core 自行渲染的那些名称。',
        },
        {
          type: 'prose',
          text: 'CLI 不认识任何图标库。由你或你的智能体从你包装的库中挑选每个图标；下面的命令会验证它、写入文件并检查集合。',
        },
      ],
    },
    {
      id: 'add-an-icon-set',
      title: '添加一个图标集',
      content: [
        {
          type: 'code',
          lang: 'bash',
          code: 'astryx experimental icon new-set outline',
        },
        {
          type: 'prose',
          text: '`outline.doc.mjs` 是描述符：名称、显示名称与描述（`--display-name`、`--description`），以及 `license`——图稿的 SPDX 许可证（初始为你的包自己的许可证）。`outline.icons.json` 起始时没有图标、`map` 为空；其 `module` 是你的包名。你重命名包之后，下一个写数据文件的命令（在现有集合上运行 `new-set`，带或不带 `--from`，或 `add`、`map`、`new-definition --icon`）会写入新名称并保留任何子路径（`@acme/old-icons/outline` 变为 `@acme/new-icons/outline`），其回执也会说明这一点。`outline.generated.js` 是该集合的生成模块，附带声明文件 `outline.generated.d.ts`：两者都由 CLI 写入，每个图标与主题映射都是它的导出。每个字段详见 {@link schema:icon-set-doc} 与 {@link schema:icon-set-data}。',
        },
        {
          type: 'prose',
          text: '该集合的图标按名称从你的包中 import，因此你的包入口必须重新导出（re-export）生成的模块。命令只写集合自己的文件：你的入口、`exports`、`main`、`types`、`files`、peers 与 scripts 都归你管，回执会把每一处需要的修改写成可复制的文本。对包内的入口文件（以及 package.json 所指的声明文件），那就是一行 `export * from \'./icon-sets/outline/outline.generated.js\';`，相对该文件而言；对没有入口的包，则是带该行的 `index.js` 与 `index.d.ts`，以及指向它们的 package.json `main`、`types` 与 `exports`；对构建产物或 CommonJS 入口，则是加到其构建源中的一行。在你完成修改之前，`integration check` 会一直指出同一处修改，回执还会指出需要添加的 peers 与 `typecheck` 脚本。`integration check --strict` 会用你包自带的 TypeScript 对集合的文档文件做类型检查；缺失时回执会说明（`npm install -D typescript@6`）。',
        },
      ],
    },
    {
      id: 'add-icons',
      title: '逐个添加图标',
      content: [
        {
          type: 'prose',
          text: '从库里挑一个图标，询问哪些定义适合它。此时还没有写入任何东西。要查看集合已有的每个图标——每行一个，含其词与它绘制的定义——运行 `astryx experimental icon --set <set> --all-icons`；`astryx experimental icon <set>/<id>` 读取单个图标，或提示该 id 不存在：',
        },
        {
          type: 'code',
          lang: 'bash',
          code: 'astryx experimental icon add Bin --from @acme/glyph-library',
        },
        {
          type: 'prose',
          text: '每行是一个 Astryx 定义（或你的集合声明的定义），并附有为它添加图标的准确命令。运行其中一条：',
        },
        {
          type: 'code',
          lang: 'bash',
          code: 'astryx experimental icon add Bin --from @acme/glyph-library --definition delete',
        },
        {
          type: 'prose',
          text: 'CLI 不执行库代码即可读取其导出，并拒绝模块未导出的名称，同时建议相近的名称。它会把图标添加为 `BinIcon`（id 为 `bin`，词来自其名称），把 `export {Bin as BinIcon} from \'@acme/glyph-library\';` 写入集合的生成模块，并设置 `map.delete = \"bin\"`。重复运行不会有任何改变。不要把定义的词复制进图标：`astryx experimental icon` 依据图标自身的词以及它映射到的每个定义的名称与词来匹配图标。',
        },
        {
          type: 'prose',
          text: '当没有合适的 Astryx 定义时，在同一条命令里添加你自己的定义。不需要提交 pull request：',
        },
        {
          type: 'code',
          lang: 'bash',
          code: "astryx experimental icon add Dice5 --from @acme/glyph-library --new-definition random --description 'Pick something at random.' --words dice,shuffle,chance",
        },
        {
          type: 'prose',
          text: '`experimental icon map <definition> <icon>` 把一个定义指向集合已有的图标（定义用 camelCase 命名，如 `eyeSlash`，或用定义列表显示的 kebab id，如 `eye-slash`；图标用其 id、任意大小写的导出名，或库导出它的其他名称，如 `trash-2`，绝不能用 id 中的单个词），`experimental icon map --pairs close=x-mark,search=magnifying-glass` 一次写入多条条目（整体校验，要么全写要么不写；map 已有的条目会被替换，回执显示原值），`--remove` 删除一条条目。`experimental icon new-definition <name> --description ... --words ... --icon <id>` 为你已有的图标添加自己的定义。`experimental icon --definitions` 列出每个 Astryx 定义——内置与否皆可——及其词（脚本用 `--json`）。',
        },
      ],
    },
    {
      id: 'wrap-a-library',
      title: '或者包装整个库',
      content: [
        {
          type: 'code',
          lang: 'bash',
          code: 'astryx experimental icon new-set outline --from @acme/glyph-library',
        },
        {
          type: 'prose',
          text: '库里导出的每个组件都会成为一个图标（同一组件的别名只记录一次），命名为 `<Name>Icon`，id 由其名称得来（`Squares2X2Icon` 是 `squares-2x2`：尺寸规格保持为一个词）。导出名不能以数字开头，因此去掉库前缀后 id 会以数字开头的图标会保留前缀（`fa0` 的 id 是 `fa-0`，导出为 `Fa0Icon`），而用 `--id` 给出的 id 必须以字母开头。只有当定义名与图标 id 相同时才填充 `map`（`delete` → 图标 `delete`），回执把这些条目列在 Mapped by name 之下：库可能在同一名称下画的是另一个含义（有的库 `delete` 是退格键），所以要逐个核对。id 只覆盖某个定义一词的图标（如用 `trash` 对 `delete`）在这个库里可能另有所指，因此回执把它列在 Suggestions 之下，并为每条附上 `experimental icon map <definition> <icon>` 命令，且不为其写入任何东西：核对含义后再运行合适的命令。库发版后再次运行即可刷新该库提供的图标；图标仍存在的 `map` 条目会保留，回执会点名库删除的图标、`--exclude` 排除的图标，以及各自随之带走的 `map` 条目。你从自己的文件或其他库添加的图标保持原样。你以一次一个文件的方式从同一包添加的图标（`--from <package>/dist/XIcon`），当你从包根刷新且根导出同一图标时会迁移到根导入；在那次刷新及其后的每次刷新中，各自保留其 id、导出、`map` 条目、变体与词，回执在 `moved` 之下列出。与已迁移图标 id 或名称相同的库图标会被排除。当集合中已有另一图标读取同一根导出时，该图标留在自己的文件上，回执会说明原因。你已有的图标按它所再导出的库导出识别，因此完全保留其导出名、`map` 条目、变体与词——即使更新版 CLI 对其 id 拼写不同，或你的 `--exclude` 让新 id 去掉了库前缀；回执在 `renamed` 之下列出每个变化的 id。你自己选定的、并非库名拼写的 id（如对 `XIcon` 用 `dismiss`）会保留。带 `--dry-run` 的刷新不写任何东西，并再次打印 Mapped by name 与 Suggestions 列表；刷新时的 `--display-name` 与 `--description` 会重写描述符。用 `add --variant … --all` 添加的变体也会保留；再次运行那条 `add` 即可拾取该版本新增的图标。`experimental icon --list` 显示该集合映射了多少个定义。',
        },
        {
          type: 'prose',
          text: '指定包或包子路径时，命令还会把已安装库及其版本记录为数据文件的 `source`，因此当你的依赖换到另一个版本时 `integration check` 会警告；它还会把库的 LICENSE（及 NOTICE）文件复制进集合目录，并把描述符的 `license` 设为该库的许可证。未带 `--from` 创建的集合，在刷新首次记录其 source 时也会得到同样处理——除非你已改过 `license`：你设置的 `license` 会保留（回执会指出库的许可证），其后的每次刷新也都会保留。你的 package.json `license` 永远不会被更改。当图稿的许可证与库的包许可证不同时，请自行编辑 `license`。当库没有随附可复制的许可证文件时，回执会在 `licenseNoticeMissing` 与其说明中说明，且 CLI 不写任何东西：请在集合目录中添加一个 `NOTICE` 文件（`icon-sets/<set>/NOTICE`），写明该库、其版本及其许可证。`integration check` 接受名为 `LICENSE`、`LICENCE`、`NOTICE` 或 `COPYING` 的文件——大小写任意，可带可选后缀如 `NOTICE.md` 或 `LICENSE-MIT`——位于集合目录或包根；没有则报告 `icon_license_notice_missing`。',
        },
        {
          type: 'prose',
          text: '每个样式一个模块的库会提供变体。创建集合时先声明它们，然后一次性为每个图标添加变体：',
        },
        {
          type: 'code',
          lang: 'bash',
          code: `astryx experimental icon new-set heroicons --from @heroicons/react/24/outline --variants outline,solid --default-variant outline --description 'Heroicons, outline and solid.'
astryx experimental icon add --variant solid --from @heroicons/react/24/solid --all`,
        },
        {
          type: 'prose',
          text: '为小尺寸重绘图稿的库（Heroicons 的 20px mini 与 16px micro）会把每种尺寸作为独立集合放在独立包中发布（其导出名与 24px 的对应），而不是作为变体：变体的尺寸来自 CSS。`--variants` 列出变体；`--default-variant` 指明每个图标自身导出所绘的变体（省略时：若库为各外观命名，则为该库通常绘制的外观；否则为集合当前默认；若集合尚无图标，则为第一个变体；已有图标的集合只有在带 `--from` 时才会更改它，且仅限为外观命名的库）。`--all` 为 id 出现在 `--from` 导出中的每个图标添加该变体（solid 模块中的 `TrashIcon` 变为 `TrashSolidIcon`，即 `trash` 的 solid 变体），回执会列出模块没有对应导出的图标。库也可能把每种外观作为独立包发布（Font Awesome 的 solid 与 regular 包）：此时 `--from` 可以指定另一个包，图标从那里的同名导出获得该变体；回执列出该包没有对应导出的图标。重复运行不会有任何改变。',
        },
        {
          type: 'prose',
          text: '图标是数据（对象或 SVG 字符串）的库没有组件可找：先创建集合，在其数据文件中声明一个 `adapter`（见库形态一节），再运行一次命令；此后每个数据导出都会经适配器变成图标。当所有图标导出共享同一个前导词时——如 `featherEye` 与 `featherSun` 中的 `feather`——id 与导出名会把它略去：`featherEye` 的 id 是 `eye`，导出为 `EyeIcon`。前缀只在疑似图标的导出上识别：SCREAMING_CASE 常量（`README`、`VERSION`）、数字与布尔导出，以及在组件或图标对象旁边的普通字符串，都不是图标。名为 `…Provider` 或 `…Context` 的组件也不是图标，包（pack）同样不是——即键全是该模块其他导出的对象，如 `faXmark` 旁的 `fas`。用 `--exclude meta,version` 排除其他非图标导出：数据文件会在 `exclude` 中保存该列表，刷新时同样排除。当库用多个名称导出同一图标（`Trash2` 与 `Trash`）时，图标只记录一次，其他名称成为其词，因此 `experimental icon trash-2` 能找到它，`experimental icon map delete trash-2` 能映射它。`experimental icon add` 以同样方式读取前缀，并复用导出已有的图标，因此其命令不需要 `--id`。',
        },
      ],
    },
    {
      id: 'export-the-icons',
      title: '图标的导出方式',
      content: [
        {
          type: 'prose',
          text: '每个图标都是你包公共入口的一个具名导出，因此应用、模板与主题映射都从同一处导入组件：',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '数据文件的 `module` 是你的包名或其 package.json `exports` 的某个子路径，绝不是文件路径。否则 `integration check` 失败。',
            '变体是集合提供的一种具名外观（例如 outline 或 solid）；尺寸来自 CSS。把名称列在数据文件的 `variants` 中，并把每个图标自身导出所绘的那个列在 `default` 中。',
            '每个导出命名为 `<Name>Icon`，变体为 `<Name><Variant>Icon`，如 `TrashSolidIcon`。`experimental icon add` 按此命名；其他名称会被 `integration check` 警告。',
            '每个导出是一个 React 组件：函数、类、`forwardRef` 或 `memo`，或你的适配器返回的东西。普通对象或字符串会让 `integration check` 失败。',
            '它接受 SVG props（`className`、`style`、`aria-*`、`width`、`height`），用 `currentColor` 绘制，并填满其容器（`1em` 或 `100%`），因此 `<Icon icon={TrashIcon} size="sm" />` 能像内置图标那样控制其尺寸与颜色。CLI 无法静态检查这一点；下面的测试可以。',
          ],
        },
        {
          type: 'prose',
          text: '`experimental icon add` 会写入集合的生成模块（数据文件中的 `generated`）及其声明文件，后者重新导出每个组件自身的类型，并把每个适配图标类型标注为 `ComponentType<SVGProps<SVGSVGElement>>`。把这一行加进你包的入口及其类型；`experimental icon new-set` 会在回执中写明确切的行与文件（见添加一个图标集一节）：',
        },
        {
          type: 'code',
          lang: 'js',
          code: "export * from './icon-sets/outline/outline.generated.js';",
        },
        {
          type: 'prose',
          text: '一份可选的渲染测试，可直接复制。把它保存在你的包目录内并在那里运行，因为它按名称经 `exports` 导入你的包；先安装 `react-dom`（`npm install -D react-dom`）。库可能在你的类之外再加自己的类，所以它检查的是类列表。自行写入 `width` 与 `height` 属性（如来自 `size` prop 的 24）的组件，只要把 `style` 透传给其 svg，就仍会填满容器：`Icon` 组件与 `themeIcons` 用 CSS 控制 svg 尺寸，CSS 会覆盖尺寸属性。测试也检查这一点。',
        },
        {
          type: 'code',
          lang: 'js',
          code: `import {renderToStaticMarkup} from 'react-dom/server';
import {createElement} from 'react';
import * as icons from '@acme/icons';

for (const [name, Icon] of Object.entries(icons)) {
  if (!name.endsWith('Icon')) continue;
  const html = renderToStaticMarkup(createElement(Icon, {className: 'x'}));
  if (!/class="([^"]* )?x( [^"]*)?"/.test(html)) throw new Error(\`\${name} drops className\`);
  if (!html.includes('currentColor')) throw new Error(\`\${name} has a fixed color\`);
  const styled = renderToStaticMarkup(createElement(Icon, {style: {width: '1em'}}));
  if (!styled.includes('width:1em')) throw new Error(\`\${name} drops style, so CSS cannot size it\`);
}`,
        },
      ],
    },
    {
      id: 'library-shapes',
      title: '库形态',
      content: [
        {
          type: 'prose',
          text: '`--from` 可以是任意 import 说明符：一个包、一个包子路径，或你包内的 `./` 路径。按你的库选用对应的行：',
        },
        {
          type: 'table',
          headers: ['库的发布形态', '命令'],
          rows: [
            [
              '单个模块中的组件',
              '`experimental icon add Bin --from @acme/glyph-library --definition delete`',
            ],
            [
              '每种样式一个子路径',
              '`experimental icon add --variant solid --from @acme/glyph-library/solid --all` 一次添加所有图标，或 `experimental icon add Bin --from @acme/glyph-library/solid --id bin --variant solid` 添加单个（集合必须先声明该变体：`new-set --variants`）',
            ],
            [
              '外观编码在导出名中（`XOutline24WGHT500Icon`、`XFilled24WGHT500Icon`）',
              '`experimental icon new-set meta --from @acme/vector-icons` 把每个字形包装一次为 `x`（`XIcon`），外观取 `--default-variant` 指定的或该库的惯用默认（outline，中间字重）。要另一种外观：先就地用 `experimental icon new-set meta --variants outline,filled` 声明，再 `experimental icon add --variant filled --from @acme/vector-icons --all`',
            ],
            [
              '每个图标一个文件，默认导出',
              '`experimental icon add Rocket --from @acme/glyph-library/rocket --default --definition rocket`',
            ],
            [
              '图标数据对象',
              '声明一个 `adapter`，然后 `experimental icon add Rocket --from @acme/glyph-data --definition rocket`',
            ],
            [
              'SVG 字符串或 URL',
              '声明一个能渲染它们的 `adapter`，然后按上文执行 `experimental icon add`',
            ],
            [
              '你自己的组件文件',
              '`experimental icon add Rocket --from ./src/icons/rocket.js --definition rocket`；其他外观用 `--id rocket --variant solid`。文件导出的组件按原样命名（不去除任何库前缀），旁边有声明文件（`rocket.d.ts`）或以 TypeScript 编写，因为集合的类型会再导出其自身类型；当 package.json 列出 `files` 且没有覆盖它时，回执会点名应发布其文件夹的 `files` 数组。',
            ],
          ],
        },
        {
          type: 'prose',
          text: '不是组件的导出会经过你的适配器：包中把它转换为组件的函数。在数据文件中声明它：`"adapter": {"module": "./src/adapt.js", "export": "adapt"}`，然后 `experimental icon add` 会写入 `export const RocketIcon = adaptIcon(RocketIconSource);`：',
        },
        {
          type: 'code',
          lang: 'js',
          code: `// src/adapt.js
import {createElement} from 'react';

/** Turn one icon data object ({path}) into an icon component. */
export function adapt(data) {
  return function AdaptedIcon(props) {
    return createElement(
      'svg',
      {'viewBox': '0 0 24 24', 'width': '1em', 'height': '1em', 'fill': 'currentColor', ...props},
      createElement('path', {d: data.path}),
    );
  };
}`,
        },
      ],
    },
    {
      id: 'theme-map',
      title: '主题映射',
      content: [
        {
          type: 'prose',
          text: '生成模块还会导出 `themeIcons`：`map` 中每个内置定义一条条目，每条都是你自己图标的元素，对辅助技术隐藏，并通过其属性与 CSS（其 `style`）定为 `1em`，因此即使你的组件自己写尺寸属性，它也能填满主题的图标框。CLI 在每次 `experimental icon add` 与 `experimental icon map` 时都会重写它，你永远无需手写，`integration check` 会证明它与 `map` 一致。主题只需一行即可使用它：',
        },
        {
          type: 'code',
          lang: 'tsx',
          code: `import {defineTheme} from '@astryxdesign/core/theme';
import {themeIcons} from '@acme/icons';

export const brand = defineTheme({name: 'brand', icons: themeIcons});`,
        },
      ],
    },
    {
      id: 'check-the-set',
      title: '检查集合',
      content: [
        {
          type: 'prose',
          text: '`astryx integration check` 不运行你的图标即可读取集合。未映射的内置定义是一个错误，会给出该定义的描述与词，以及修复它的 `experimental icon map <definition> <icon id>` 命令，让你或你的智能体挑选图标。只有当搜索（`experimental icon <word> --set <set>`）能找到图标时它才会提到该搜索，并只建议一个图标：`experimental icon new-set` 为该定义给出的第一条建议。它绝不匹配词的一部分，也绝不写入建议。它的图标集错误码：',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '`invalid_icon_set`（错误）：描述符、数据文件或某个定义文件无效，例如重复的 `id`、没有词的图标，或既非 Astryx 定义也不在你 `definitions` 文件夹中的 `map` key。该集合被撤回：应用看不到它。',
            '`icon_builtin_definition_missing`（错误）：某个内置定义不在 `map` 中。',
            '`icon_definition_unused`（警告）：你声明的某个定义不在 `map` 中。',
            '`icon_definition_shadowed`（警告）：你声明的某个定义如今 Astryx 也有；映射到 Astryx 的并移除你自己的。',
            '`icon_module_not_public`（错误）、`icon_export_name`（警告）、`icon_not_component`（错误）：即上文所述的导出契约。',
            '`icon_export_missing`（错误）：某个导出、生成模块或适配器不存在。',
            '`icon_module_invalid`（错误）：集合的模块、它再导出的某个文件，或生成模块无法解析；只报告一次，而不是每个图标一条缺失导出。',
            '`icon_generated_types_mismatch`（错误）：生成模块的声明文件缺失或与之不匹配。',
            '`icon_theme_map_mismatch`（错误）：主题映射与 `map` 的内置条目不一致。',
            '`icon_source_version_drift` 与 `icon_license_notice_missing`（警告）：数据记录的库版本与包依赖的不一致，或带上游的集合未随附许可证声明。',
          ],
        },
        {
          type: 'prose',
          text: '你的集合未映射的其他 Astryx 定义不是问题：库不必绘制每个定义。它们列在 "Unmapped icon definitions (optional)" 之下，在 JSON 中则位于校验结果的 `iconSets`：每个集合有 `unmappedDefinitions`（每条 `{name, description, words}`）与 `suggestions`（每条 `{definition, icon}`，针对你的某个图标适合的未映射定义）。它们从不计数，也从不导致检查失败。',
        },
        {
          type: 'prose',
          text: '只有当读取方能证明导出不存在时才会失败；无法判定的同样不失败。模块是你尚未构建的 `exports` 目标的图标导出；无法证明有无的图标或适配器导出（藏于无法跟进的再导出之后、绑定到默认或命名空间导入，或从未安装的包导入）；以及无法读取的主题映射或主题映射条目，都列在 "Not checked" 之下，在 JSON 中则是每个集合的 `unchecked`（每条 `{icon}`、`{adapter}` 或 `{entry}`，并带 `reason`）。构建该包、安装它导入的包、按名称导出图标，或把条目写成绑定或元素，即可使其被检查。你构建后的模块缺失的导出仍是错误。',
        },
        {
          type: 'prose',
          text: '错误使检查失败。警告仅在 `--strict` 下失败。映射了每个内置定义与自己所声明的每个定义的集合可通过 `--strict`，集成会在其构建中运行它（{@link generic:checks}）。从头到尾的流程：`experimental icon new-set` → 回执要求时 `npm install -D typescript@6` → `integration check` → 对其列出的每个定义执行 `experimental icon add`（或 `experimental icon map`）→ `integration check` 通过。',
        },
      ],
    },
    {
      id: 'publish',
      title: '发布之前',
      content: [
        {
          type: 'list',
          style: 'unordered',
          items: [
            '发布前自行运行 `astryx integration verify`。不要把它放进 `prepublishOnly`：在 `npm publish --dry-run` 下它自己的 `npm pack` 也会变成 dry run，从而什么都检查不了。',
            '把 `@astryxdesign/cli` 声明为可选 peer（`peerDependenciesMeta`）。应用无法满足的必选 peer 会让 npm 毫无声息地移除该应用的 CLI。图标集是实验性的，因此没有任何版本范围对其做出承诺，格式可能在补丁版本中更改。CLI 只有认识集合数据文件使用的每个 key 才会读取该集合：不认识的 key 会撤回该集合并点名该 key。`exclude` 只有在其数据文件参考列出它的 CLI 才会读取（{@link schema:icon-set-data}）；没有 `exclude` 的集合可被任何具有 `astryx experimental icon` 的 CLI 读取。没有该参考的 CLI 会把 `experimental` 当作不认识的清单 key：那里的 `astryx doctor` 会警告你的包是对着更新的 Astryx CLI 发布的，其他命令打印一行提示去运行它，而你的图标、图标定义与模板图标映射不会出现（{@link generic:versioning}）。',
            '每个内置定义都需要一个图标，因为 Core 会渲染它。当你的库没有含义完全一致的图标时，映射最接近的那个，或把自己的图稿作为组件文件加进你的包（`experimental icon add <Name> --from ./src/icons/<name>.js --definition <definition>`；`./` 路径按原样书写）。你绘制的图稿归你所有：在库的许可证旁注明其许可证，例如写在集合目录的 NOTICE 文件中。',
            '生成的声明文件会导入 React 类型，因此请为 TypeScript 用户把 `@types/react` 声明为可选 peer。',
            '把被包装的库留在 `dependencies` 中：你的生成模块会再导出其组件，因此应用随你的包一起获得它，且 `integration check` 会把它的范围与数据文件记录的版本比较。',
            '`integration check --strict` 会对集合的文档文件做类型检查；它不会对照 React 类型检查生成的声明文件。要检查那些，请安装 `@types/react` 后运行 `tsc`。',
            '你的包需要把 `react`（主题映射与适配器会用到）声明为 peer，与 Core 相同。`experimental icon new-set` 回执会点名你的 package.json 尚未声明的 peers，以可添加的 JSON 形式给出：`react`（`>=18`）；`@types/react` 与 `@astryxdesign/cli`（来自写入该集合的发行版）作为可选 peer；以及尚无时的 `typecheck` 脚本（`astryx integration check --strict`）。',
          ],
        },
      ],
    },
    {
      id: 'share-a-definition',
      title: '与所有集合共享一个定义',
      content: [
        {
          type: 'prose',
          text: '你自己的定义不需要改动 Astryx。要与所有集合共享一个定义，请开一个 pull request，把它的文件复制进 CLI 的图标定义文件夹，附上描述与词。其名称不得与其他定义冲突。',
        },
      ],
    },
    {
      id: 'how-apps-use-it',
      title: '应用如何使用它',
      content: [
        {
          type: 'code',
          lang: 'bash',
          code: `astryx experimental icon delete              # ranked matches with import lines
astryx experimental icon outline/bin         # one icon and every variant
astryx experimental icon --list              # installed sets and their definition coverage
astryx experimental icon use outline         # make it the project's icon set`,
        },
        {
          type: 'prose',
          text: '模板在其描述符的 `icons` 中声明每个导入图标绘制的定义（`{TrashIcon: \'delete\'}`）。一旦项目在 astryx.config 中设置 `experimental.iconSet`（`experimental icon use` 会写入），每个声明的图标就变为该集合中此定义的图标。集合未映射的图标保留原导入，复制时会报告每个图标是 mapped 还是 kept。绝不从名称猜测。被映射的图标会失去其库的尺寸 props（`size`、`strokeWidth`、`absoluteStrokeWidth`），因为集合的图标尺寸来自 CSS；报告中把它们标为 `dropped`。被重写的导入行上的注释会保留。',
        },
        {
          type: 'prose',
          text: '每个 `icons` key 是模板从其模块导入的名称，不是本地别名。当模板从两个模块导入同名符号——例如从库的 outline 与 solid 模块都导入 `TrashIcon`——一个 key 覆盖两者：二者绘制同一定义。当其模块属于声明了该变体的已安装集合时，各自变为项目集合的同名变体（因此 solid 保持 solid），否则用集合默认。',
        },
      ],
    },
    {
      id: 'reference',
      title: '图标集出现的位置',
      content: [
        {
          type: 'prose',
          text: 'CLI 读取或报告图标集的所有位置，全部是实验性的。除 `astryx experimental icon` 外，每处只出现在设置了 `experimental.iconSet` 的项目中；`astryx search` 永不返回图标：',
        },
        {
          type: 'table',
          headers: ['位置', '内容'],
          rows: [
            [
              'astryx.config 中的 `experimental.iconSet`',
              '项目的图标集，用集合名或 `<package>/<set>` 表示，也是启用开关：只有设置了它，模板、discover 与 doctor 才会读取图标集。`astryx experimental icon` 会把它的图标排在最前，未设置时把唯一已安装的集合当作项目的集合。`astryx experimental icon use` 负责写入。',
            ],
            [
              '集成清单中的 `experimental.iconSets`',
              '存放该包图标集的文件夹，相对 package.json。由 `astryx experimental icon new-set` 声明。',
            ],
            [
              '模板描述符的 `icons`',
              '每个导入图标绘制的图标定义（`{TrashIcon: \'delete\'}`）：具名导入按其导入名，默认导入按其本地名。`astryx template` 在展示或复制时写入集合的图标并报告 `icons`（status、set、mapped、kept）：每个 key 要么 mapped，要么 kept 并说明原因（无匹配、命名空间或仅类型导入、再导出、Astryx 或项目集合导入，或根本没有导入）。`integration check` 会提示模板源码从未导入的 key（`template_icon_not_imported`），但从不失败。',
            ],
            [
              '`astryx discover`',
              '包的集合（`iconSets`）；对 `@scope/name/<set>` 还有集合的显示名称、许可证、图标数与定义；`--type icon-set` 只保留集合。',
            ],
            [
              '`astryx doctor`',
              '在应用中是 `icon-sets` 检查：当 `experimental.iconSet` 指向未安装或已撤回的集合（无效集合，或模块无法解析的集合）时失败并说明原因；当两个包发布同名集合或某集合被撤回时给出警告。在你自己的图标集包中，请改用 `astryx integration check`：普通 `doctor` 诊断的是应用。',
            ],
            [
              'JSON 类型',
              '`icon.search`、`icon.detail`、`icon.list`、`icon.setIcons`、`icon.definitions`、`icon.use`、`icon.map`、`icon.mapMany`、`icon.add`、`icon.addVariants`、`icon.definitionMatches`、`icon.newSet`、`icon.newDefinition`，来自对应的 `astryx experimental icon` 命令。',
            ],
          ],
        },
      ],
    },
  ],
};
