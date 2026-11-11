// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs authoring/building-blocks/components/describe-the-component/check-the-props`:
 * compare each component doc's props table with the component's TypeScript
 * props, read each finding, and fix the doc or the code.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'check-the-props',
  placement: {
    parent: 'namespace:describe-the-component',
    slot: 'guides',
    order: 50,
  },
  title: '核对 props 表',
  category: 'guide',
  keywords: [
    'props 表',
    '文档化的 props',
    'prop 漂移',
    'props 未比对',
  ],
  description:
    '将每个 props 表与组件的 TypeScript props 进行比对，然后修正文档或代码。',
  sections: [
    {
      id: 'run-the-props-check',
      title: '运行 props 检查',
      content: [
        {
          type: 'prose',
          text: '`doctor integration components` 会将组件文档中的每个 props 表——包括隐藏文档和每个组件族条目——与组件 TypeScript 声明的 props 进行比对。更改组件或其文档后，请在包内运行它。',
        },
        {
          type: 'code',
          lang: 'bash',
          code: '{@command doctor integration components}',
        },
        {
          type: 'code',
          lang: 'text',
          code: `severity:  [warn]
component: AcmeCarousel
prop:      loop
kind:      not_in_code
message:   "loop" is documented, but AcmeCarousel's props have no "loop".
doc:       components/AcmeCarousel.doc.mjs
source:    components/AcmeCarousel.tsx
docType:   boolean

1 prop(s) differ between the docs and the code in 1 of 1 component(s) compared (TypeScript 6.0.3). These are warnings: update the doc, or the code if the doc is right.`,
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '文档自身的 `props` 描述其 `name` 所指的导出。在组件族文档中，每个条目描述各自的导出。Hook 条目记录的是参数与返回值，因此不参与比对。',
            '它使用你包安装的 `typescript` 读取 props，并按 `tsc -p` 的方式读取你包的 `tsconfig.json`。它查找 TypeScript 的方式与文档检查相同，包括 TypeScript 7（见 {@link generic:check-your-docs}）。找不到可用的 TypeScript 时，会打印 `[skip] Props not compared` 及原因。',
            '发现项是警告，退出码保持 0。发布前请先阅读它们。使用 `--json` 时，它们位于 `data.propDrift.findings`。',
          ],
        },
      ],
    },
    {
      id: 'fix-each-finding',
      title: '修复每个发现项',
      content: [
        {
          type: 'prose',
          text: '每个发现项的 `kind` 表明差异所在。修正文档；如果文档是对的，就修正代码。',
        },
        {
          type: 'table',
          headers: ['类别', '含义', '修复方式'],
          rows: [
            [
              '`not_in_code`',
              '文档列出了组件 props 中不存在的 prop',
              '从文档中删除它，或在代码中添加它。索引签名能匹配的名称（如 `data-*`）视为存在',
            ],
            [
              '`not_in_doc`',
              "你的包声明了文档未列出的 prop，或用映射类型构建 prop，如 `Partial<Record<'sm' | 'md', string>>`",
              '将其写入文档。来自 React、DOM 或其他包的 prop 不会被要求写入；键由其他包定义的 prop（`keyof CSSProperties`，无论是否经由别名）、`className`、`style`、`xstyle`、`data-testid`、`ref`、`key`，以及 JSDoc 带 `@internal` 的 prop 也不会。已弃用的 prop 仍是 prop：在删除它之前要一直保留其文档。映射类型从检查无法追溯的键构建的 prop（比如模板字符串），会改列在 `[info] Props not checked for a doc entry` 之下',
            ],
            [
              '`required_mismatch`',
              '`required` 与代码不一致',
              '仅当每个调用方都必须传该 prop 时才设 `required: true`。你的 `defaultProps` 会填充的 prop 视为可选（对 JSX 调用方也是如此）；联合类型中只有部分成员要求的 prop 同样视为可选，因为调用方可以不传：请在描述中说明哪些变体需要它。同时命名多个 prop 的条目（`value / onChange`）对每个 prop 作出相同声明：它们不一致时请拆成各自条目',
            ],
            [
              '`type_mismatch`',
              '文档写的 `type` 与代码不一致（仅对两侧都能精确读取的情形判定）',
              '从源码复制类型，或修正代码。下一节说明哪些类型会被判定',
            ],
            [
              '`default_mismatch`',
              "文档写的 `default` 与组件在 props 解构中写的字面量默认值不一致，如 `size = 'md'`",
              "从源码复制默认值，并按代码形式加引号：`default: \"'md'\"`。引号与空格差异会被忽略；任一侧不是字面量的默认值（常量、函数调用、prose）不参与比对",
            ],
          ],
        },
      ],
    },
    {
      id: 'write-types-the-check-can-judge',
      title: '写出检查能判定的类型',
      content: [
        {
          type: 'prose',
          text: '对于你包声明的 prop，检查还会比对文档写的 `type`，但仅在两侧都能精确读取时。它从不猜测，无法判定的类型会被列出而非上报。它需要 TypeScript 4.8 或更高版本：版本更旧时会打印 `[skip] Prop types not judged`，且不判定任何类型。',
        },
        {
          type: 'code',
          lang: 'text',
          code: `severity:  [warn]
component: AcmeCarousel
prop:      interval
kind:      type_mismatch
message:   "interval" is documented as string, but the code declares number.
doc:       components/AcmeCarousel.doc.mjs
source:    components/AcmeCarousel.tsx
docType:   string
codeType:  number`,
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '类型按源码的写法写，例如 `ReactNode[]` 或 `(index: number) => void`。参数名、成员顺序、引号和空白可以有差异。写了 `readonly` 的文本必须精确匹配，参数名也在内；只有空白可以有差异。`React.X` 指的是 prop 声明处 React 自己的 `X`，因此只有在该名称属于 React 时才与裸写的 `X` 匹配：`React.KeyboardEvent` 不是 DOM 的 `KeyboardEvent`。',
            '类型名按声明该 prop 的文件的叫法写，因此该文件中重命名的导入（`Item as BaseItem`）也要按该文件的写法写。字段（`cfg.level`）以它的 prop 所在文件为准，即使字段自身的类型声明在另一个文件中。',
            '以其他方式写的类型，只有当两侧都由精确部件构成时才被判定：`string`、`number` 等基本类型，字符串、数字与布尔字面量，字符串枚举成员，由这些构成的数组与联合，以及代表它们的类型名。联合成员顺序不限；已被另一成员覆盖的成员不会造成差异，TypeScript 在此也接受这种写法：`undefined` 可与 `void` 并列，`string[]` 可与 `(string | number)[]` 并列。',
            '可变数组类型可以匹配只读数组，因为调用方可以传可变的。为可变数组写只读类型则是不匹配。',
            '当 prop 的各变体给某字段不同类型时（如 `{value: string} | {value: number}`），要写出所有变体的类型（`string | number`）。只写部分变体的类型会被列出：prop 的变体给该字段不同类型。变体类型超过六种时，任何其他类型也会被列出。',
            "要写出别名并展示其取值，写作 `AcmeSize = 'sm' | 'md'` 或 `AcmeSize ('sm' | 'md')`。两部分都必须匹配。",
            '可选 prop 的 `undefined` 在两侧都会被搁置。启用 `exactOptionalPropertyTypes` 时，只有代码显式声明了 `undefined`，文档才显示 `undefined`。',
            '其余情形——如对象、元组、带参数的泛型、`keyof`、交叉类型，或以其他方式写的映射/条件类型——不参与比对。',
          ],
        },
        {
          type: 'prose',
          text: '检查会打印它判定了多少个文档类型，然后按原因列出其余：不是检查能精确判定的形式、prop 的变体给某字段不同类型、标准 prop，或在包外声明的 prop。使用 `--json` 时，它们位于 `data.propDrift.typesNotCompared`。',
        },
        {
          type: 'code',
          lang: 'text',
          code: '[info] Documented prop types judged: 2; not compared: 0. A type is judged when the doc writes it the same as the source (exactly, if it contains `readonly`), or when both are primitives, literals, arrays and unions of those, or names for them.',
        },
      ],
    },
    {
      id: 'when-a-component-is-not-compared',
      title: '组件未被比对时',
      content: [
        {
          type: 'prose',
          text: '当检查无法精确读取组件的 props 时，它会把该组件列在 `[info] Props not compared` 之下并附原因，而不是上报可能有误的发现项。',
        },
        {
          type: 'code',
          lang: 'text',
          code: `[info] Props not compared for 1 documented component(s):

component: AcmeCarousel
doc:       components/AcmeCarousel.doc.mjs
reason:    AcmeCarousel depends on \`@acme/motion\` (imported in AcmeCarousel.tsx), which the compiler could not resolve, usually a dependency that is not installed. Install the package's dependencies and run this check again`,
        },
        {
          type: 'table',
          headers: ['原因', '修复方式'],
          rows: [
            [
              '它依赖编译器无法解析的包或文件',
              '安装包的依赖，然后重新运行检查',
            ],
            [
              '它依赖编译器无法解析的类型',
              '用 `{@pm exec tsc --noEmit}` 让类型通过编译，然后重新运行检查',
            ],
            [
              '包的 TypeScript 配置有错误',
              '修复 `tsconfig.json`，直到 `{@pm exec tsc -p .}` 能读取它',
            ],
            ['它的 props 类型为 `any`', '给组件一个 props 类型'],
            [
              '部分 prop 名称来自类型参数',
              '无需修复：渲染由调用方所选元素的组件，其 props 只在使用处才能确定',
            ],
            [
              '文件中没有文档 `name` 所指的导出',
              '修改 `name` 或导出，使二者一致',
            ],
          ],
        },
      ],
    },
  ],
};
