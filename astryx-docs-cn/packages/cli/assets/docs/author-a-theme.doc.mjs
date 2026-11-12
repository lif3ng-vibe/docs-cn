// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */

export const docs = {
  name: 'author-a-theme',
  title: '创作主题',
  category: 'guide',
  keywords: ['defineTheme', '创建主题', '自定义主题', 'extends', '组件覆盖', '自定义变体', 'adaptations 适配', '断点', 'theme build', '主题家族', 'tokenVar', 'resolveThemeTokens', 'useTheme', '调色板', '生成调色板', '种子色', '色阶', '图标注册表'],
  description: '创建、定制并构建主题：defineTheme、调色板生成、令牌覆盖、组件样式覆盖、自定义变体、响应式适配与生产构建。',

  sections: [
    {
      id: 'creating-a-custom-theme',
      title: '自定义主题',
      content: [
        {type: 'prose', text: "普通定制场景，以已安装的构建主题为基础。在你的源码中导入它，并作为 `extends` 传给 `defineTheme({extends: importedTheme, ...})`。构建结果，然后用 theme add 登记本地 slug。只有当你需要持有并维护一份完整源码分叉时，才使用弹出（eject）。"},
        {type: 'prose', text: "本地主题是 `src/themes/<slug>/` 下的一个文件夹，其中包含一个导出 `<name>Theme` 的 `<name>Theme.ts` 源文件，以及一个同词干、供 `theme add` 读取的 `<name>Theme.doc.mjs` 描述符。词干必须是合法的导出名，因此带连字符的 slug 会去掉连字符：`brand-dark` 位于 `src/themes/brand-dark/brandDarkTheme.ts`，导出 `brandDarkTheme`，旁边是 `brandDarkTheme.doc.mjs`。描述符的 `name` 就是文件夹的 slug，而且它必须声明自己的 type，否则 `theme add` 与 `theme list` 会拒绝它。{@command docs authoring theme-doc} 列出了每个字段。"},
        {type: 'code', lang: 'js', label: 'src/themes/brand-dark/brandDarkTheme.doc.mjs', code: "/** @type {import('@astryxdesign/cli/authoring').ThemeDoc} */\nexport default {\n  type: 'theme',\n  name: 'brand-dark',\n  displayName: 'Brand Dark',\n  description: 'The brand accent, tuned for dark mode.',\n  maintained: false,\n};"},
        {type: 'code', lang: 'bash', label: '登记以使用，弹出以分叉', code: '{@command theme list}\n{@command theme add stone}\n{@command theme eject stone}\n{@command theme build src/themes/stone/stoneTheme.ts}\n{@command theme add stone}'},
        {type: 'prose', text: "要获得整个接口面的带注释总览（每个 defineTheme 字段、各令牌家族，以及组件覆盖语法，各自附有打印对应参考的 CLI 命令），请运行 `{@command theme template}`。它会把 `theme.template.ts` 写入你的项目，供阅读和复制（`{@command init --features theme}` 会在项目初始化时一并写入）。"},
        {type: 'prose', text: '要应用你创建的主题，见 {@link generic:use-a-theme}。要从种子值生成颜色，见下文的调色板一节。在决定改为弹出包主题之前，请先在 {@link generic:use-a-theme} 中确认那是否合适。'},
      ],
    },
    {
      id: 'palette',
      title: '生成调色板',
      content: [
        {type: 'prose', text: '命名几个种子色，即可生成主题所需的全部色阶，浅色与深色皆有；{@link generic:generate-a-palette} 说明了调色板里有什么。'},
        {type: 'code', lang: 'json', label: '最小调色板配置（palette.config.json）', code: '{"families": [{"id": "ocean", "seed": "#0074e2"}]}'},
        {type: 'code', lang: 'bash', label: '生成并预览', code: '# Print the palette without writing files\n{@command theme palette generate palette.config.json}\n\n# Write palette + receipt, and open a visual preview\n{@command theme palette generate palette.config.json} \\\n  --out src/themes/ocean/tokens/ocean.palette.ts \\\n  --preview preview.html'},
        {type: 'prose', text: "该命令会写出一个 `.ts` 文件，为浅色与深色各导出 21 个色阶（档位 0–100），另加一个供日后重新生成的 `.receipt.json`。把主题的令牌指向该调色板，然后运行 defineTheme（见下文）。"},
        {type: 'prose', text: '完整的调色板配置字段与 CLI 标志，请运行 `{@command docs cli/commands/theme-palette-generate}`。将调色板接入主题令牌的集成编写指南，请运行 `{@command docs authoring/building-blocks/themes/generate-a-palette}`。'},
      ],
    },
    {
      title: 'defineTheme',
      content: [
        {type: 'prose', text: 'defineTheme 基于显式令牌覆盖与可选的刻度配置创建主题。现有主题可能使用 `color` 把一个强调色种子扩展为中性色、表面色、文字色、边框色及相关取值；这并不是只改强调色的编辑。在需要保持既有输出时请保留该配置。对于新的完整调色板，请生成并审阅一个已提交的调色板模块，然后导入其 `palette` 导出，并从语义令牌引用稳定的档位。这样，当已采纳的调色板重新生成时，映射的角色仍保持一致；生成本身不会改写主题。其他刻度配置则依据参数生成排版、圆角与动效取值。显式令牌覆盖总是逐令牌地优先于刻度生成的取值。当现有的 `color` 配置生效时，在 `tokens` 中覆盖 `--color-accent` 会连带改指 `--color-accent-muted`、`--color-text-accent` 与 `--color-icon-accent`，但 `--color-on-accent` 仍固化自 `color.accent` 种子。与其只覆盖 `--color-accent`，更推荐为 `color.accent` 使用 `[light, dark]` 元组。localTokens 接受任何合法的 CSS 自定义属性名；前缀并不构成所有权。'},
        {type: 'code', lang: 'tsx', label: '带生成调色板引用与非颜色刻度配置的 defineTheme', code: "import {defineTheme} from '@astryxdesign/core/theme';\nimport {palette} from './palette.generated';\n\nconst myTheme = defineTheme({\n  name: 'my-theme',\n  typography: {\n    scale: { base: 14, ratio: 1.2 },\n    body: { family: 'Inter', fallbacks: '-apple-system, sans-serif' },\n  },\n  radius: { base: 4, multiplier: 1 },\n  motion: { fast: 175, medium: 410, ratio: 0.75 },\n  tokens: {\n    '--color-background-surface': [\n      palette.neutral.light[100],\n      palette.neutral.dark[15],\n    ],\n  },\n});"},
        {type: 'table', headers: ['配置', '生成', '参数'], rows: [
          ['color（现有主题）', '--color-accent, --color-background-*, --color-text-*, --color-border, etc.', '支持的宽刻度：accent?（hex 或 [light, dark] 元组）、neutralStyle?（warm|cool|neutral）、contrast?（standard|high）。新的完整调色板请使用 theme palette generate。'],
          ['typography.scale', '--text-heading-*-size/weight/leading, --text-body-size/weight/leading', 'base（px）、ratio'],
          ['typography.body/heading/code', '--font-family-body, --font-family-heading, --font-family-code', 'family、fallbacks?、url?、weight?'],
          ['radius', '--radius-inner, --radius-element, --radius-container, --radius-page, --radius-chat', 'base（px）、multiplier（0–2）'],
          ['motion', '全部 --duration-* 令牌，以及 --ease-entrance 与 --ease-move（tempo 还为触摸弹簧计时）', 'tempo?（0.75–1.5）、character?（crisp|standard|expressive）；以及/或一份时长刻度：fast（ms）、medium（ms）、ratio、slow?、easing?。就其设定的时长而言，刻度优先于 tempo，显式令牌又优先于两者。无论旋钮如何设置均保持固定：拖拽与惯性、橡皮筋、键盘、按压 onset/cancel/flash、悬停意图、手势阈值、Spinner/Skeleton 循环，以及 200 ms 的减弱动效上限。见 {@link generic:motion}。'],
        ]},
        {type: 'prose', text: '关于令牌取值中的深色模式元组，见 {@link generic:use-a-theme} 的 Dark mode 一节。'},
      ],
    },
    {
      title: '扩展主题',
      content: [
        {type: 'prose', text: "`extends` 让你从一个现有主题派生新主题，继承其令牌、组件覆盖、图标与字体。只需指定想改的部分；其余内容都从基础主题原样继承。"},
        {type: 'code', lang: 'tsx', label: '扩展 neutral 主题', code: "import {defineTheme} from '@astryxdesign/core/theme';\nimport {neutralTheme} from '@astryxdesign/theme-neutral';\nimport {myIcons} from './icons';\n\nconst brandTheme = defineTheme({\n  name: 'brand',\n  extends: neutralTheme,\n  icons: myIcons,\n  tokens: {\n    '--color-accent': ['#7B61FF', '#9B85FF'],\n  },\n});"},
        {type: 'table', headers: ['字段', '合并行为'], rows: [
          ['tokens', '先复制基础主题的令牌，再由子主题的令牌在其上覆盖。'],
          ['components', '深合并：子主题的组件规则覆盖基础主题中匹配的键。'],
          ['icons', '浅合并：子主题的图标覆盖基础主题中的同名图标。'],
          ['iconVariants', '整体替换，从不合并：设置了 iconVariants 的子主题会替换基础列表；省略它的子主题则继承该列表。'],
          ['componentIcons', '按插槽合并：子主题条目会整体替换该插槽的基础条目；省略或为 undefined 的条目保留继承值。'],
          ['indicators', '浅合并：子主题的指示器覆盖基础主题中的同名指示器。'],
          ['onDark, onLight', "按表面深合并：先取基础主题解析出的表面，再叠加子主题的覆盖。"],
          ['motion', "逐字段：子主题的 `fast`、`medium` 与 `ratio` 会重新生成快、中时长令牌；`slow` 与 `easing` 未设置则保留基础主题的令牌，因此继承来的慢速档仍保持基础主题的比率。子主题未设置的每个旋钮（`tempo`、`character`）也都沿用基础主题的取值。"],
          ['typography, radius, color', '子主题配置会整体替换基础主题（这些是刻度输入，不做叠加）。'],
          ['adaptations', '宽度断点覆盖按固定名称合并。继承的有序规则保持相对顺序；子主题规则追加在后，并依据子主题的根轴重新解析。'],
        ]},
        {type: 'prose', text: "继承在主题定义之时即已解析，因此扩展出的主题是扁平的：`{@command theme build}` 会产出自含的样式表，装着子主题继承到的全部内容，基础主题的 CSS 无需随之一并加载。若传入的 base 并不是主题（最常见的是导入落空），`defineTheme` 运行时会直接抛错，而不是产出一个默默什么都没继承的主题。"},
        {type: 'prose', text: '扩展时将调色板映射到令牌的集成专项指南，见 `{@command docs authoring/building-blocks/themes/define-the-theme}`。'},
      ],
    },
    {
      title: '组件样式覆盖',
      content: [
        {type: 'prose', text: 'defineTheme 的 `components` 字段使用语义化的组件键与样式键，而非裸 CSS 选择器。用 `base` 覆盖所有实例，用 `variant:value` 或 `stateName` 针对特定 prop/状态，底层选择器交给主题管线挑选。至于裸外部 CSS 的逃生通道，优先使用 {@link generic:styling-advanced} 记载的 data 属性选择器接口。'},
        {type: 'code', lang: 'tsx', label: '以标准 CSS 覆盖组件', code: "components: {\n  card: {\n    base: { borderRadius: '20px', padding: '24px' },\n  },\n  button: {\n    base: {\n      borderRadius: '9999px',\n      textTransform: 'uppercase',\n      '--button-focus-offset': '3px',\n    },\n    'variant:ghost': { borderWidth: '2px', borderStyle: 'solid' },\n  },\n}"},
        {type: 'prose', text: "运行 `{@command theme targets}` 查看系统内全部可主题化的键（`{@command theme targets <Name>}` 限定范围，`--json` 据此对主题做 lint）；运行 `{@command component <Name>}` 查看单个组件的主题化目标、公开 CSS 变量，以及支持哪些标准 CSS 属性。"},
        {type: 'list', style: 'do', items: ['书写标准 CSS 属性（borderRadius、padding）；管线会将其展开为内部变量。', '在没有等价标准属性时，直接设置公开 CSS 变量。']},
        {type: 'list', style: 'dont', items: ['直接设置私有 CSS 变量（--_ 前缀）。应改用标准 CSS 属性，否则 `{@command theme build}` 会报错。', '设置组件并未定义的公开 CSS 变量。它编译出的 CSS 永远不会生效，构建也不会警告。名称请以 `{@command component <Name>}` 为准。']},
      ],
    },
    {
      title: '自定义变体',
      content: [
        {type: 'prose', text: "主题可以为任何组件新增 prop 取值。任何取值并非内置的 `prop:value` 键都会被视作新变体。使用 `{@command theme build}` 生成 TypeScript 增强，以获得类型安全。"},
        {type: 'code', lang: 'tsx', label: '添加自定义变体', code: "components: {\n  button: {\n    'variant:secondary': { backgroundColor: 'rgba(0,0,0,0.06)' },\n    'variant:primary-muted': {\n      backgroundColor: 'light-dark(#F2F4F6, #28292C)',\n      color: 'var(--color-text-primary)',\n    },\n  },\n  banner: {\n    'status:neutral': {\n      backgroundColor: 'var(--color-background-muted)',\n      color: 'var(--color-text-secondary)',\n    },\n  },\n}"},
        {type: 'code', lang: 'tsx', label: '使用自定义变体', code: "// TypeScript knows about 'primary-muted' after astryx theme build\n<Button variant=\"primary-muted\" label=\"Save draft\" />\n<Banner status=\"neutral\" title=\"Note\" />"},
        {type: 'prose', text: "自定义变体仅在定义它的主题处于激活状态时生效。组件的变体映射通过模块增强（module augmentation）扩展，无需改动组件源码。"},
      ],
    },
    {
      title: '主题适配',
      content: [
        {type: 'prose', text: "使用 `adaptations` 实现按需开启的令牌、主题本地令牌与组件变更，依据条件为视口宽度、主指针精度、对比度偏好或动效偏好。同一 `when` 中的条件按 AND 组合。规则就是普通的有序对象，后匹配的写入胜出。"},
        {type: 'code', lang: 'tsx', label: '宽度与指针适配', code: "const acmeTheme = defineTheme({\n  name: 'acme',\n  adaptations: {\n    widthBreakpoints: {\n      sm: 640, md: 768, lg: 1024, xl: 1280, '2xl': 1536,\n    },\n    rules: [\n      {\n        when: {width: {below: 'md'}},\n        value: {tokens: {'--spacing-4': '12px'}},\n      },\n      {\n        when: {pointer: 'coarse'},\n        value: {tokens: {'--size-element-sm': '36px', '--size-element-md': '40px', '--size-element-lg': '44px'}},\n      },\n    ],\n  },\n});"},
        {type: 'table', headers: ['条件', '取值'], rows: [
          ['width.from / width.below', 'sm | md | lg | xl | 2xl'],
          ['pointer', 'coarse | fine'],
          ['contrast', 'more | less | no-preference'],
          ['motion', 'reduce | no-preference'],
        ]},
        {type: 'prose', text: "`widthBreakpoints` 是一组固定的具名起点。默认值为 640 / 768 / 1024 / 1280 / 1536 CSS 像素。`from` 包含其起点，`below` 不包含。仅配置断点不会产出任何 CSS。"},
      ],
    },
    {
      id: 'adaptation-rules',
      title: '适配顺序与校验',
      content: [
        {type: 'prose', text: "优先级遵循规则顺序。根主题取值先应用，随后按声明顺序应用每条匹配的规则。靠后的规则可以有意恢复某个根取值。`onDark` 与 `onLight` 的媒体表面覆盖在适配之后应用，并在同一叶子节点上胜出。"},
        {type: 'prose', text: "`extends` 保留基础主题的规则顺序并追加子主题规则。继承来的条件使用子主题的有效断点映射。空的子规则是空操作，不是移除运算符。"},
        {type: 'prose', text: "只有当某个精确名称已由根 `localTokens` 或某个已登记的 base 登记在册时，规则才能替换该主题本地令牌。规则中的组件写入与根 `components` 的校验完全一致：相同的目标、轴与取值域。唯一的附加约束是：规则不能是某个自定义取值唯一的登记之处——仅因主题登记才合法的取值会生成无条件的类型增强，因此先在根主题上声明它，再让规则去改样式。内置取值无需根声明。当多条规则可能同时匹配时，它们有序的可移植令牌与本地令牌写入会作为一个有效图统一校验；任何可达的环都会在产出 CSS 之前失败。"},
        {type: 'prose', text: "适配会编译为 CSS 媒体查询，没有 resize 监听器，也没有样式重渲染。运行时与 `{@command theme build}` 使用同一编译器，但在 SSR 应用中，首次绘制时在场的只有构建好的主题。"},
      ],
    },
    {
      id: 'building-themes-for-production',
      title: '构建主题',
      content: [
        {type: 'prose', text: '`{@command theme build}` 将 defineTheme 文件编译为生产可用的产物。推荐用于样式必须在首次绘制时就位的 SSR 应用（Next.js、Remix）。'},
        {type: 'code', lang: 'bash', label: '构建主题', code: '{@command theme build ./src/themes/ocean.ts}'},
        {type: 'table', headers: ['文件', '说明'], rows: [
          ['ocean.css', '预编译 CSS，包含令牌覆盖、组件覆盖，以及 @scope 规则中的正文元素样式'],
          ['ocean.js', '导出主题对象的 ES 模块，带 `__built: true` 与预解析的令牌取值。'],
          ['ocean.d.ts', '主题与图标注册表导出的 TypeScript 声明'],
          ['ocean.variants.d.ts', "（可选）自定义组件 prop 取值的模块增强"],
        ]},
        {type: 'prose', text: '`__built: true` 标志告诉 Theme 跳过运行时 `<style>` 注入；这件事交给 CSS 文件。在加载模块的同一处加载生成的 CSS 即可。'},
        {type: 'code', lang: 'tsx', label: '使用自定义的构建主题', code: "import {Theme} from '@astryxdesign/core/theme';\nimport {oceanTheme} from './themes/ocean';\nimport './themes/ocean.css';\n\n<Theme theme={oceanTheme}>\n  <App />\n</Theme>"},
        {type: 'prose', text: "升级 Astryx 之后，为每个自定义预构建主题重新运行 `{@command theme build}`。重新生成的文件须一起部署。运行时有意信任 `__built: true`，不会修复旧构建遗留的过期 CSS。当主题声明了它并未加载的字体系时，构建也会警告。完整做法见 {@link generic:font-setup}。"},
        {type: 'prose', text: '关于运行时与构建的取舍，见 {@link generic:use-a-theme} 的 Runtime vs Built 一节。'},
      ],
    },
    {
      id: 'icon-registry',
      title: '带图标注册表的构建主题',
      content: [
        {type: 'prose', text: "`theme build` 检测到主题 `icons:` 字段使用的具名导入时，会产出一个图标导入。它不会编译那个注册表模块。请把注册表移到单独的模块中，并使用具名导入。"},
        {type: 'code', lang: 'bash', label: '编译图标注册表伴随模块', code: "# Emit the built theme\n{@command theme build ./src/themes/ocean.ts -o dist/theme.css --icons-specifier ./icons.mjs}\n\n# Compile the icon registry alongside it\nesbuild src/themes/icons.tsx --bundle --format=esm --outfile=dist/icons.mjs \\\n  --external:react --external:lucide-react --jsx=automatic"},
        {type: 'prose', text: '在上面的示例中，生成的主题从 `dist` 导入 `./icons.mjs`。如果跳过第二条命令，`theme build` 仍会成功，但生成模块在加载或打包时会失败，因为 `dist/icons.mjs` 并不存在。`--icons-specifier` 只改变产出的导入语句；它不会创建或校验目标文件。请让 specifier 对应一个能从生成的 JS 文件解析到的模块。'},
        {type: 'prose', text: '不使用 `--icons-specifier` 时，检测到的源导入 specifier 会原样产出。在不带 `--out` 的默认流程中，打包器可以把无扩展名的 `./icons` 解析到相邻的 `icons.tsx` 源码，但 Node ESM 不做这种查找，而是报 `ERR_MODULE_NOT_FOUND`。用 `--out` 移动输出位置，也会改变相对导入的解析基准。'},
        {type: 'prose', text: '把 `react` 与图标库保持为 external，这样注册表不会打包自己那份依赖。'},
        {type: 'prose', text: "注册表条目可以是 `{size, variant}` 的函数。构建主题会保留该函数，因此 `Icon` 会像运行时主题那样向它询问所渲染的尺寸与变体——对从构建主题或包主题继承来的条目同样如此。构建主题的 `icons` 字段及其模块再导出的注册表都是 React 节点，其中每个函数按尺寸 `md` 读取。写在主题文件本身里的函数无法携带，因此构建会失败；请把它移进注册表模块。"},
        {type: 'prose', text: "列出 `iconVariants` 的主题还会把 `IconVariantMap` 增强写入 `<theme>.variants.d.ts`，于是在主题类型加载之处，`Icon` 的 `variant` 都接受这些名称。其声明也携带该列表，因此扩展该构建主题的主题，其图标条目的 `variant` 类型即由该列表收窄。"},
        {type: 'prose', text: "构建主题保留其 `componentIcons`。名称、`null` 值与静态请求都会写进模块。插槽函数仍是函数：模块从主题源码导入它的那个模块导入它，因此组件插槽在构建主题与运行时主题中的解析完全一致。构建主题的 `componentIcons` 字段不含插槽函数，运行时主题亦然。定义在主题文件里的插槽函数会让构建失败：把它移到独立模块再导入。在 `--family` 输出中，成员通过具名导入其整个 `componentIcons` 映射来提供自己的插槽函数。模块按主题源码的书写原样保留每个插槽导入，`--icons-specifier` 不会改变它，因此当 `--out` 位于另一个目录时，要让一个模块在输出目录下响应该 specifier，做法与图标注册表相同。"},
      ],
    },
    {
      title: '构建主题家族',
      content: [
        {type: 'prose', text: '当应用在一个基础主题及其选定的后代主题之间切换时，使用 family 模式。构建会在根源码旁写出一个包含全部成员的带键 CSS 文件，外加一个带键 JavaScript 模块与一个声明文件。'},
        {type: 'code', lang: 'bash', label: '构建一个主题家族', code: "{@command theme build} --family \\\n  ./src/themes/ocean.mjs \\\n  ./src/themes/ocean-calm.mjs \\\n  ./src/themes/ocean-calm-deep.mjs \\\n  --family-key ocean-family"},
        {type: 'prose', text: '主题家族样式表会提前下载所有选定的成员，确保首次绘制完整。切换成员只改变主题标识；不会新增、移除或重排样式表。'},
      ],
    },
    {
      title: '令牌工具',
      content: [
        {type: 'prose', text: '当非 StyleX 的样式库需要 CSS 变量引用时，使用 `tokenVar()`；当 JavaScript 需要在脱离 React 上下文的情况下取得特定主题与模式的令牌取值时，使用 `resolveThemeTokens()`。用 `defineTheme()` 创建的主题会按名称注册；对需要按名称做 SSR 查找的预构建或对象字面量主题，请调用 `registerTheme(theme)`。'},
        {type: 'code', lang: 'ts', label: '供样式库配置使用的 CSS 变量引用', code: "import {tokenVar, tokenVars} from '@astryxdesign/core/theme/tokens';\n\nconst pandaOrEmotionTheme = {\n  colors: {\n    text: tokenVar('--color-text-primary'),\n    surface: tokenVars['--color-background-surface'],\n  },\n};"},
        {type: 'code', lang: 'ts', label: '不借助 Hook 解析令牌取值', code: "import {resolveThemeTokens} from '@astryxdesign/core/theme/tokens';\nimport {neutralTheme} from '@astryxdesign/theme-neutral';\n\nconst lightTokens = resolveThemeTokens(neutralTheme, {mode: 'light'});\nconst chartTheme = {\n  textColor: lightTokens['--color-text-primary'],\n  seriesColor: lightTokens['--color-data-categorical-blue'],\n};"},
        {type: 'prose', text: '`@astryxdesign/core/theme/tokens` 子路径可在服务端安全使用，且不依赖 React。主 `@astryxdesign/core/theme` barrel 也会再导出这些助手函数，方便已导入主题 API 的客户端代码。'},
        {type: 'prose', text: '样式库互操作模式见 {@link namespace:styling-libraries}。'},
      ],
    },
    {
      title: 'useTheme Hook',
      content: [
        {type: 'prose', text: '`useTheme()` 从 React 上下文读取最近的 Theme 与生效的颜色模式。对于可用于 CSS 的 SVG 与 DOM 取值，优先使用 `dataVars`。本 Hook 适用于 canvas、图表、地图、第三方配置对象，或需要具体 JavaScript 颜色而非 `var(...)` 引用的 SVG API。'},
        {type: 'code', lang: 'tsx', label: '在 React 中访问已解析的令牌取值', code: "import {useMemo} from 'react';\nimport {useTheme} from '@astryxdesign/core/theme';\n\nfunction ChartConfig() {\n  const {mode, tokens} = useTheme();\n  const options = useMemo(() => ({\n    mode,\n    textColor: tokens['--color-text-primary'],\n    gridColor: tokens['--color-border'],\n    seriesColor: tokens['--color-data-categorical-blue'],\n  }), [mode, tokens]);\n  return <Chart options={options} />;\n}"},
        {type: 'prose', text: '日常样式仍优先使用 CSS 变量。Provider 的设置见 {@link generic:use-a-theme}，完整令牌参考见 {@link namespace:tokens}。'},
      ],
    },
  ],
};
