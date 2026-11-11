// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentAnatomyElement[]} */
const anatomy = [
  {
    name: 'Document',
    required: true,
    description: '块级或行内 Markdown 内容的根容器。',
  },
  {
    name: 'Heading',
    required: false,
    description:
      '渲染出的语义标题块；自定义标题渲染器会替换内置部分。',
  },
  {
    name: 'Paragraph',
    required: false,
    description:
      '渲染出的段落块；自定义段落渲染器会替换默认部分。',
  },
  {
    name: 'List',
    required: false,
    description:
      '由 Markdown 项渲染的有序、无序或任务列表块。',
  },
  {
    name: 'Code block',
    required: false,
    description:
      '围栏代码块；长行折行而非横向滚动。自定义代码渲染器会替换默认部分。',
  },
  {
    name: 'Blockquote',
    required: false,
    description:
      '引用块；自定义 blockquote 渲染器会替换默认部分。',
  },
  {
    name: 'Table',
    required: false,
    description:
      '由 Markdown 行列渲染的表格块；其 Table 子组件负责横向滚动。',
  },
  {
    name: 'Divider',
    required: false,
    description:
      '水平分隔线块；自定义 hr 渲染器会替换默认部分。',
  },
  {
    name: 'Image',
    required: false,
    description:
      '块级图片或不安全 URL 的回退；自定义图片渲染器会替换默认的安全图片。',
  },
];

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'Markdown',
  displayName: 'Markdown',
  category: 'Content',
  keywords: [
    'markdown',
    '富文本',
    'prose',
    '渲染器',
    '流式',
    'markup',
    '格式化文本',
    'md',
    'markdown 渲染器',
  ],
  props: [
    {
      name: 'children',
      type: 'string',
      description: '要渲染的 markdown 字符串。',
      required: true,
    },
    {
      name: 'display',
      type: "'block' | 'inline'",
      description:
        "显示类型。Markdown 默认为 block。用 'inline' 渲染嵌入文本内的 markdown 片段。",
      default: "'block'",
    },
    {
      name: 'density',
      type: "\'default\' | \'compact\'",
      description: '控制块级元素之间的间距。',
      default: "\'default\'",
    },
    {
      name: 'headingLevelStart',
      type: '1 | 2 | 3 | 4 | 5 | 6',
      description:
        'markdown # 映射到的 HTML 标题级别。把所有标题级别向下偏移以适应外围页面层级。超过 h6 的级别钳制为 h6。',
      default: '1',
    },
    {
      name: 'isStreaming',
      type: 'boolean',
      description:
        '启用流式模式；使用增量解析与平滑淡入动画逐块呈现文本。',
      default: 'false',
    },
    {
      name: 'onLinkClick',
      type: '(href: string, event: MouseEvent) => void | false',
      description:
        '链接点击处理器。返回 false 可阻止默认导航行为。markdown 中的链接目标遵循 Link `href` prop 所述的共享导航规则：被拦截的目标渲染为纯文本，不会到达该处理器或自定义链接渲染器。图片 URL 适用单独的、更严格的策略（所有 data: URL 都被拒绝）。',
    },
    {
      name: 'sources',
      type: 'Record<string, MarkdownSource>',
      description:
        '按 ID 索引的引用来源。提供后，markdown 中匹配某个 key 的 [id] 与 【id】 标记会渲染为引用标签。',
    },
    {
      name: 'citationStyle',
      type: "'label' | 'number'",
      description:
        "引用的内联展示方式。'label' 显示带来源标题、图标与边框的标签。'number' 显示紧凑的编号徽章。",
      default: "'label'",
    },
    {
      name: 'contentWidth',
      type: 'number | string',
      description:
        '正文内容（段落、标题、列表、引用块）的最大宽度。表格与代码块不受约束，可扩展到完整容器宽度。用于在宽布局中获得可读的行长。',
      default: '680',
    },
    {
      name: 'contentAlign',
      type: "'start' | 'center'",
      description:
        '当 contentWidth 小于可用空间时，正文内容在容器内的对齐方式。',
      default: "'start'",
    },
    {
      name: 'plugins',
      type: 'readonly MarkdownPluginEntry[]',
      description:
        '由 createMarkdownPlugin() 创建的有序扩展。插件可添加有界语法、不可变的类型化 AST 转换与类型化扩展渲染器。用 isMarkdownExtensionNode() 收窄从其他插件观察到的扩展数据。渲染器回调必须纯；需要 hook 时返回子组件。省略或空列表保持已发布的 Markdown 行为。',
    },
    {
      name: 'inlinePlugins',
      type: 'MarkdownInlinePlugin[]',
      description:
        '把已解析文本节点中的正则匹配转换为自定义内联 React 元素。用于带前缀的标识符、用户提及及其他简写模式。行内代码、围栏代码块与数学不受影响。',
    },
    {
      name: 'autolink',
      type: "'gfm'",
      description:
        "可选的裸 URL 与 email 自动链接。'gfm' 应用 GitHub-Flavored Markdown autolink-literal 规则：裸 https?://...、www....、<scheme:url>、<email> 与 user@host 都成为链接。排除句尾标点与不平衡的尾部右括号；跳过代码片段、代码块、现有链接与图片 alt 文本内的匹配。默认行为（未设置该选项）不变。",
    },
    {
      name: 'codeLanguages',
      type: 'ReadonlyArray<CodeLanguage>',
      description:
        '围栏可以命名的 CodeBlock 语言值，每个独立导入（例如 @astryxdesign/core/CodeBlock/languages/graphql 的 graphql）或用 createCodeLanguage 创建。语言词属于所列值标识符之一的围栏用它渲染，优先于内置语言；diff-<identifier> 围栏在其上加 diff 层；后列条目优先。把同一列表传给 RichTextEditor 或 RichTextView，让阅读与编辑一致。',
    },
    {
      name: 'components',
      type: 'MarkdownComponents',
      description:
        '渲染 Markdown 元素的自定义 React 组件覆盖（code、inlineCode、math、link、heading、paragraph、image、blockquote、hr、citation）。提供 math 会启用 `$…$` 行内与 `$$…$$` 块级解析并接收 `{value, display}`；当美元文本应保持字面时省略它。',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于布局定制（边距、定位、尺寸）的 StyleX 样式。必须是 stylex.create() 值，不能是 style={{}} 这样的内联样式对象。',
    },
    {
      name: 'className',
      type: 'string',
      description:
        '根元素的 CSS 类名。样式首选 xstyle；className 为与非 StyleX 系统集成而提供。',
    },
    {
      name: 'style',
      type: 'CSSProperties',
      description:
        '根元素的内联样式。样式首选 xstyle；内联样式绕过 StyleX 优化。',
    },
    {
      name: 'data-testid',
      type: 'string',
      description: '自动化测试框架的测试选择器。',
    },
  ],
  playground: {
    defaults: {
      children:
        "## 快速开始\n\n安装依赖包：\n\n```bash\nnpm install @astryxdesign/core\n```\n\n然后 import 并使用任意组件：\n\n```tsx\nimport {Button} from '@astryxdesign/core/Button';\n```\n\n**粗体**、*斜体* 和 `行内代码` 都可正常工作。",
    },
  },
  theming: {
    targets: [
      {className: 'astryx-markdown', visualProps: ['density']},
      {
        className: 'astryx-markdown-heading',
        visualProps: ['density', 'level'],
      },
      {
        className: 'astryx-markdown-paragraph',
        visualProps: ['density'],
      },
      {
        className: 'astryx-markdown-list',
        visualProps: ['density'],
      },
      {
        className: 'astryx-markdown-codeblock',
        visualProps: ['density'],
      },
      {
        className: 'astryx-markdown-blockquote',
        visualProps: ['density'],
      },
      {
        className: 'astryx-markdown-table',
        visualProps: ['density'],
      },
      {
        className: 'astryx-markdown-hr',
        visualProps: ['density'],
      },
      {
        className: 'astryx-markdown-image',
        visualProps: ['density'],
      },
    ],
  },
  usage: {
    anatomy,
    description:
      '把 markdown 字符串渲染为 Astryx 风格的组件。将 Markdown 用于用户生成内容、AI 回复与文档；它以一致的样式处理标题、列表、表格、代码块与引用。',
    bestPractices: [
      {
        guidance: true,
        description:
          '设置 headingLevelStart 以匹配页面层级，例如 markdown 位于 h2 区块内时从 3 开始。',
      },
      {
        guidance: true,
        description:
          '使用 contentWidth 在宽布局中把正文保持在可读的行长。',
      },
      {
        guidance: true,
        description:
          '强调与加粗按 CommonMark 规则配对，因此 *see **bold** more* 会把加粗放进强调内部。***text*** 渲染为包裹强调的加粗，与 RichText 绘制的顺序一致，并会同时以两者播报。嵌套超过 100 层的强调保持为原样文本。',
      },
      {
        guidance: true,
        description:
          '使用由 createMarkdownPlugin 创建的插件实现可复用语法、不可变 AST 转换与类型化扩展渲染。语法配置未变时保持有序列表稳定。',
      },
      {
        guidance: true,
        description:
          '要在 Markdown 之外渲染插件节点（例如另一个展示同一文档的表面），先用 getMarkdownPluginCapabilities 读取插件声明的内容（仅语法与转换，别无其他），再用仅客户端的 @astryxdesign/core/Markdown/plugin-renderer 子路径中的 MarkdownPluginNodeRenderer 渲染每个解析出的扩展节点。它以与 Markdown 完全一致的方式呈现节点，包括回退与失败报告，自身不产生任何元素。',
      },
      {
        guidance: true,
        description:
          '当单个换行符有意义时添加 markdownSoftBreaksPlugin。对受支持的 Markdown，它与 remark-breaks 行为一致（包括多行链接标签），而代码及其他不透明内容保持不变。',
      },
      {
        guidance: true,
        description:
          '当某个功能需要把渲染后的文档映射回 Markdown 源行（查找、高亮、评审评论）时，添加 markdownSourceLinesPlugin。Markdown 渲染的每个块（含嵌套块）都会带上 data-source-line 与 data-source-line-end（从 1 计、含端点）；components 块渲染器会收到 sourceLines 以放置到自己的元素上，插件渲染器读取 node.position 行。内联元素、表格行与单元格不带。未装该插件时不做任何行处理。',
      },
      {
        guidance: true,
        description:
          '用 createMarkdownTextTransform 做正文匹配；它把代码、链接、图片、引用、数学与受支持的扩展语法保留为受保护上下文。仅当 requiredSubstrings 能保守地覆盖所有可能匹配时才提供它。',
      },
      {
        guidance: true,
        description:
          '对带语义数据的已声明代码围栏语言使用 createMarkdownFenceTransform。createNode 返回自有的块级扩展节点；其标准插件渲染器与 toText 负责呈现。即使提供了 components.code，被认领的围栏也经该插件渲染；components.code 渲染所有未被认领的围栏，并在插件渲染器拒绝、抛错或挂起时充当回退；未提供时，可访问、可复制的 CodeBlock 就是该回退。',
      },
      {
        guidance: true,
        description:
          '用 createMarkdownSourceDecoration 把非视觉元数据——搜索命中、评审标注——附加到源区间触及的块上，并在后续插件中用 getMarkdownSourceDecorations 读回。装饰出现在定稿文档上而非部分流式分块上，且绝不改变渲染、可复制文本、无障碍名称、id、焦点顺序或导航。',
      },
      {
        guidance: true,
        description:
          '当服务端或 React Server Component 代码需要针对规范只读树运行插件时，从 @astryxdesign/core/Markdown/parser import parseMarkdownAst 或 parseInlineAst。parser 与 plugin 子路径没有 use client 边界。Markdown 组件仍归客户端所有，因此携带函数的插件条目不得跨 RSC 序列化边界传递。',
      },
      {
        guidance: true,
        description:
          '使用 decodeMarkdownCharacterReferences（来自 @astryxdesign/core/Markdown/parser 或 @astryxdesign/core/Markdown）按 Markdown 渲染字符引用的方式显示文本：&copy;、&#169; 与 &#xA9; 变成 ©，未知名称与缺少分号的引用保持原样。它解码纯文本、不懂 Markdown，因此请自行跳过代码与反斜杠转义的引用。它使用的表与 Markdown 渲染所用相同。',
      },
      {
        guidance: true,
        description:
          '使用 createMarkdownFrontmatter 处理类型化文档元数据。其 parse() 方法把元数据直接交给宿主；其插件在渲染前移除完整的头部块，并在流式期间扣留未完成的块。',
      },
      {
        guidance: true,
        description:
          "仅当要复用已有的同步 transform-only Remark 插件时，才从 '@astryxdesign/core/Markdown/remark' import createMarkdownRemarkTransform；它不会进入其他任何 bundle。用测试夹具验证每个插件：支持 MDAST 子集之外的任何内容——异步工作、parser 或 compiler 插件、processor 状态、原生 HTML、不支持的节点、伪造的 position、Astryx 无法表达的元数据——都会保留上一份有效文档并报告一条诊断。",
      },
      {
        guidance: true,
        description:
          '对带前缀的标识符、用户提及及其他仅正文简写模式使用 inlinePlugins，而不是预处理 markdown 字符串。',
      },
      {
        guidance: true,
        description:
          '仅为使用美元定界数学的文档提供 components.math。渲染器负责排版与无障碍输出；Astryx 以文本传递表达式，绝不执行原生 HTML。',
      },
      {
        guidance: true,
        description:
          '直接解析时使用 MathParseOptions 并处理 InlineNodeWithMath 或 BlockNodeWithMath。增量数学解析也使用 createIncrementalState<true>() 与 IncrementalParseState<true>；默认调用与 ParseOptions 注解保持旧联合类型。',
      },
      {
        guidance: true,
        description:
          '当文档需要可复制的 h1–h6 永久链接时，通过 plugins 安装 createMarkdownHeadingLinks()。返回的条目携带其经过校验的命名空间与 URL base，可跨兼容的 Core 包副本使用。每个内置标题保留其传入的片段 ID，并新增一个行内尾部 # 复制按钮：在细指针静止时经 useContainerReveal 隐藏，在标题行悬停或键盘聚焦时显现，并在该 hook 的粗指针/触屏语义下保持可见。未修饰的点按、点击、Enter 或 Space 会复制规范 URL，不导航、不改 hash、不滚动；成功时显示 1.5 秒的对勾。无插件路径保持不变，嵌套标题使用与 Markdown 派生 Outline 相同的深度优先同一性投影。',
      },
      {
        guidance: true,
        description:
          '多个文档时，用 headingIdPrefix 为每个文档创建一个 heading-links 插件，并把同一个插件传给 Markdown 与 useOutlineFromMarkdown。当根元素还需要 DOM id 时，给 Markdown id 使用同一个稳定值；permalinkBaseUrl 可在片段之前提供安全的调用方自有 URL。',
      },
      {
        guidance: false,
        description:
          '不要用 Markdown 做手工编排的布局；内容由你掌控时直接使用 Text 与 Heading。',
      },
    ],
  },
  examples: [
    {
      label: '行内显示',
      code: `
import {Text} from '@astryxdesign/core/Text';

<Text>
  This description includes{' '}
  <Markdown display="inline">{'\`inline code\` and **bold text**'}</Markdown>
  .
</Text>;
`,
    },
    {
      label: 'GFM 自动链接',
      code: `
<Markdown autolink="gfm">
  {'Visit https://example.com or email contact@example.com. ' +
    'You can also bracket links: <https://docs.example.com>.'}
</Markdown>;
`,
    },
    {
      label: '可链接标题',
      code: `
import {Markdown} from '@astryxdesign/core/Markdown';
import {createMarkdownHeadingLinks} from '@astryxdesign/core/Markdown/plugins';
import {Outline, useOutlineFromMarkdown} from '@astryxdesign/core/Outline';

const documentId = 'guide';
const headingLinks = createMarkdownHeadingLinks({
  headingIdPrefix: documentId,
});
const plugins = [headingLinks];

function Guide({source}) {
  const items = useOutlineFromMarkdown(source, {plugins});
  return (
    <>
      <Markdown id={documentId} plugins={plugins}>{source}</Markdown>
      <Outline items={items} />
    </>
  );
}
`,
    },
    {
      label: '第一方软换行',
      code: `
import {Markdown} from '@astryxdesign/core/Markdown';
import {markdownSoftBreaksPlugin} from '@astryxdesign/core/Markdown/plugins';

<Markdown plugins={[markdownSoftBreaksPlugin]}>
  {'First line\\nSecond line'}
</Markdown>;
`,
    },
    {
      label: '源行标记',
      code: `
import {Markdown} from '@astryxdesign/core/Markdown';
import {markdownSourceLinesPlugin} from '@astryxdesign/core/Markdown/plugins';

// Each rendered block carries data-source-line / data-source-line-end.
<Markdown plugins={[markdownSourceLinesPlugin]}>
  {'# Title\\n\\n- one\\n- two'}
</Markdown>;
`,
    },
    {
      label: '文本转换助手',
      code: `
import {Markdown} from '@astryxdesign/core/Markdown';
import {
  createMarkdownPlugin,
  createMarkdownTextTransform,
} from '@astryxdesign/core/Markdown/plugins';

const finalLabels = createMarkdownPlugin({
  name: 'final-labels',
  apiVersion: 1,
  transform: createMarkdownTextTransform({
    pattern: /\\bDraft\\b/g,
    requiredSubstrings: ['Draft'],
    replace: () => ({type: 'text', value: 'Final'}),
  }),
});

<Markdown plugins={[finalLabels]}># Draft</Markdown>;
`,
    },
    {
      label: '语义围栏助手',
      code: `
import {Markdown} from '@astryxdesign/core/Markdown';
import {
  createMarkdownFenceTransform,
  createMarkdownPlugin,
  type MarkdownExtensionNode,
} from '@astryxdesign/core/Markdown/plugins';

type DiagramNode = MarkdownExtensionNode<
  'diagrams',
  'diagram',
  {readonly code: string; readonly label?: string},
  'block'
>;

const diagrams = createMarkdownPlugin<'diagrams', DiagramNode>({
  name: 'diagrams',
  apiVersion: 1,
  transform: createMarkdownFenceTransform({
    languages: ['mermaid'],
    createNode: ({code, meta}) => ({
      type: 'extension',
      plugin: 'diagrams',
      name: 'diagram',
      display: 'block',
      data: {code, ...(meta == null ? {} : {label: meta})},
    }),
  }),
  renderers: {
    diagram: {
      render: ({node}) => (
        <Diagram source={node.data.code} label={node.data.label} />
      ),
      toText: node => node.data.code,
    },
  },
});

<Markdown plugins={[diagrams]}>
  {'\`\`\`mermaid Checkout flow\\ngraph LR; A-->B\\n\`\`\`'}
</Markdown>;
`,
    },
    {
      label: '源装饰助手',
      code: `
import {Markdown} from '@astryxdesign/core/Markdown';
import {
  createMarkdownPlugin,
  createMarkdownSourceDecoration,
  getMarkdownSourceDecorations,
} from '@astryxdesign/core/Markdown/plugins';

// Ranges are UTF-16 offsets into the same string Markdown renders. Every
// block a range touches is annotated; rendering, copyable text, and ids
// never change.
const searchHits = createMarkdownPlugin({
  name: 'search-hits',
  apiVersion: 1,
  transform: createMarkdownSourceDecoration({
    name: 'search-hit',
    ranges: [{start: 0, end: 15, data: {query: 'release'}}],
  }),
});

const readDecorations = createMarkdownPlugin({
  name: 'read-decorations',
  apiVersion: 1,
  transform: root => {
    report(root.children.map(getMarkdownSourceDecorations));
    return root;
  },
});

<Markdown plugins={[searchHits, readDecorations]}>{source}</Markdown>;
`,
    },
    {
      label: '原生 frontmatter',
      code: `
import {Markdown} from '@astryxdesign/core/Markdown';
import {createMarkdownFrontmatter} from '@astryxdesign/core/Markdown/plugins';

const frontmatter = createMarkdownFrontmatter({
  name: 'document-metadata',
  parse: fields => ({
    title: fields.title ?? 'Untitled',
    draft: fields.draft === 'true',
  }),
});

const source = '---\\ntitle: Release notes\\ndraft: true\\n---\\n# Shipped';
const result = frontmatter.parse(source);

<Markdown plugins={[frontmatter.plugin]}>{source}</Markdown>;
`,
    },
    {
      label: '兼容的 Remark 插件',
      code: `
import {Markdown} from '@astryxdesign/core/Markdown';
import {createMarkdownPlugin} from '@astryxdesign/core/Markdown/plugins';
import {createMarkdownRemarkTransform} from '@astryxdesign/core/Markdown/remark';

// A synchronous transform-only Remark plugin in the usual attacher shape.
const remarkRename =
  ({from, to}) =>
  tree => {
    const rename = node => {
      if (node.type === 'text') {
        node.value = node.value.split(from).join(to);
      }
      node.children?.forEach(rename);
    };
    rename(tree);
  };

const productName = createMarkdownPlugin({
  name: 'product-name',
  apiVersion: 1,
  transform: createMarkdownRemarkTransform(remarkRename, {
    from: 'Astryx',
    to: 'Astryx Design',
  }),
});

<Markdown plugins={[productName]}># Astryx release notes</Markdown>;
`,
    },
    {
      label: '实体链接',
      code: `
import {Link} from '@astryxdesign/core/Link';

const entityPlugins = [
  {
    pattern: /\\b([A-Z][A-Z0-9]+-\\d+)\\b/g,
    render: (match, key) => (
      <Link key={key} href={\`/entities/\${match[1]}\`}>
        {match[0]}
      </Link>
    ),
  },
];

<Markdown inlinePlugins={entityPlugins}>
  {'See DOC-2048. Inline code stays plain: \`DOC-9999\`.'}
</Markdown>;
`,
    },
    {
      label: '数学渲染器',
      code: `
import {BlockMath, InlineMath} from 'react-katex';

function MathExpression({value, display}) {
  const Component = display === 'block' ? BlockMath : InlineMath;
  return <Component math={value} />;
}

<Markdown components={{math: MathExpression}}>
  {'Inline $x_1 + y$ and display math:\\n\\n$$\\n\\\\sum_i x_i\\n$$'}
</Markdown>;
`,
    },
  ],
};

export const docsZh = {
  name: 'Markdown',
  displayName: 'Markdown',
  props: [
    {
      name: 'children',
      type: 'string',
      description: '要渲染的 Markdown 字符串。',
      required: true,
    },
    {
      name: 'display',
      type: "'block' | 'inline'",
      description:
        "显示类型。Markdown 默认为 block。使用 'inline' 可在文本内嵌入 Markdown 片段。",
      default: "'block'",
    },
    {
      name: 'density',
      type: "'default' | 'compact'",
      description: '控制块级元素之间的间距。',
      default: "'default'",
    },
    {
      name: 'headingLevelStart',
      type: '1 | 2 | 3 | 4 | 5 | 6',
      description:
        'Markdown # 映射到的 HTML 标题级别。将所有标题级别向下偏移以适应页面层次结构。超过 h6 的级别将被限制为 h6。',
      default: '1',
    },
    {
      name: 'isStreaming',
      type: 'boolean',
      description: '启用流式模式，使用增量解析和淡入动画处理分块文本。',
      default: 'false',
    },
    {
      name: 'onLinkClick',
      type: '(href: string, event: MouseEvent) => void | false',
      description: '链接点击处理器。返回 false 可阻止默认导航行为。',
    },
    {
      name: 'sources',
      type: 'Record<string, MarkdownSource>',
      description:
        '按 ID 索引的引用来源。提供后，Markdown 中匹配的 [id] 和 【id】 标记将渲染为引用标签。',
    },
    {
      name: 'citationStyle',
      type: "'label' | 'number'",
      description:
        "引用的内联显示方式。'label' 显示带标题、图标和边框的标签。'number' 显示紧凑编号徽章。",
      default: "'label'",
    },
    {
      name: 'contentWidth',
      type: 'number | string',
      description:
        '正文内容的最大宽度（段落、标题、列表、引用块）。表格和代码块不受限制，可扩展到完整容器宽度。用于在宽布局中保持可读行长。',
      default: '680',
    },
    {
      name: 'contentAlign',
      type: "'start' | 'center'",
      description:
        '当 contentWidth 小于可用空间时，正文内容在容器内的对齐方式。',
      default: "'start'",
    },
    {
      name: 'plugins',
      type: 'readonly MarkdownPluginEntry[]',
      description:
        '由 createMarkdownPlugin() 创建的有序扩展。插件可添加有界语法、不可变的类型化 AST 转换和类型化扩展渲染器。使用 isMarkdownExtensionNode() 缩小从其他插件观察到的扩展数据类型。渲染回调必须是纯函数；需要 Hook 时请返回子组件。省略或传入空列表时保持已发布的 Markdown 行为。',
    },
    {
      name: 'inlinePlugins',
      type: 'MarkdownInlinePlugin[]',
      description:
        '将已解析文本节点中的正则匹配转换为自定义内联 React 元素。适用于带前缀的标识符、用户提及等简写模式。内联代码、围栏代码块和数学表达式不受影响。',
    },
    {
      name: 'autolink',
      type: "'gfm'",
      description:
        "可选的裸 URL 和电子邮箱自动链接。设为 'gfm' 启用 GitHub Flavored Markdown 自动链接规则：裸 https?://、www.、<scheme:url>、<email> 以及 user@host 都会变成链接。末尾句末标点和不平衡的末尾右括号会被排除；代码块、现有链接和图片替代文本内部的匹配会被跳过。默认为关闭。",
    },
    {
      name: 'codeLanguages',
      type: 'ReadonlyArray<CodeLanguage>',
      description:
        '代码块可以命名的 CodeBlock 语言值，每个单独导入（例如从 @astryxdesign/core/CodeBlock/languages/graphql 导入 graphql），或用 createCodeLanguage 创建。语言词属于所列值标识符的代码块用该值渲染，优先于内置语言；后列出的条目优先。',
    },
    {
      name: 'components',
      type: 'MarkdownComponents',
      description:
        '用于覆盖 Markdown 渲染元素的自定义 React 组件（code、inlineCode、math、link、heading、paragraph、image、blockquote、hr、citation）。提供 math 会启用 `$…$` 行内数学和 `$$…$$` 块级数学解析，并接收 `{value, display}`；不提供时美元符号保持原样。',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于布局自定义的 StyleX 样式。必须是 stylex.create() 的值，而非内联样式对象。',
    },
    {
      name: 'className',
      type: 'string',
      description:
        '根元素的 CSS 类名。建议使用 xstyle，className 适用于非 StyleX 系统集成。',
    },
    {
      name: 'style',
      type: 'CSSProperties',
      description:
        '根元素的内联样式。建议使用 xstyle，内联样式会绕过 StyleX 优化。',
    },
    {
      name: 'data-testid',
      type: 'string',
      description: '用于自动化测试框架的测试选择器。',
    },
  ],
  theming: {
    targets: [
      {className: 'astryx-markdown', visualProps: ['density']},
      {
        className: 'astryx-markdown-heading',
        visualProps: ['density', 'level'],
        description:
          '每个渲染的标题块（h1–h6）。覆盖 marginBlockStart/marginBlockEnd 可调整标题周围的间距；反映 data-density 和 data-level，因此主题可按密度和标题层级设置间距。仅适用于默认标题渲染——自定义的 components.heading 拥有自己的样式。',
      },
      {
        className: 'astryx-markdown-paragraph',
        visualProps: ['density'],
        description:
          '每个渲染的段落块。覆盖 marginBlockStart/marginBlockEnd 可调整段落之间的间距。反映 data-density，因此主题可以为不同密度设置不同的间距。',
      },
      {
        className: 'astryx-markdown-list',
        visualProps: ['density'],
        description:
          '每个渲染的列表块（有序、无序和任务列表）。覆盖 marginBlockStart/marginBlockEnd 可调整列表周围的间距；反映 data-density。',
      },
      {
        className: 'astryx-markdown-codeblock',
        visualProps: ['density'],
        description:
          '每个渲染的代码块外层容器。覆盖 marginBlockStart/marginBlockEnd 可调整代码块周围的间距；反映 data-density。仅适用于默认渲染——自定义的 components.code 拥有自己的样式。',
      },
      {
        className: 'astryx-markdown-blockquote',
        visualProps: ['density'],
        description:
          '每个渲染的引用块（与 astryx-blockquote 目标共用同一元素）。覆盖 marginBlockStart/marginBlockEnd 可调整引用块周围的间距；反映 data-density。仅适用于默认渲染——自定义的 components.blockquote 拥有自己的样式。',
      },
      {
        className: 'astryx-markdown-table',
        visualProps: ['density'],
        description:
          '每个渲染的表格外层容器。覆盖 marginBlockStart/marginBlockEnd 可调整表格周围的间距；反映 data-density。',
      },
      {
        className: 'astryx-markdown-hr',
        visualProps: ['density'],
        description:
          '每个渲染的水平分隔线。覆盖 marginBlockStart/marginBlockEnd 可调整分隔线周围的间距；反映 data-density。仅适用于默认渲染——自定义的 components.hr 拥有自己的样式。',
      },
      {
        className: 'astryx-markdown-image',
        visualProps: ['density'],
        description:
          '每个渲染的块级图片外层容器（以及损坏图片的占位符）。覆盖 marginBlockStart/marginBlockEnd 可调整图片周围的间距；反映 data-density。仅适用于默认渲染——自定义的 components.image 拥有自己的样式。',
      },
    ],
  },
  usage: {
    anatomy,
    description:
      'Renders a markdown string as Astryx-styled components. Use Markdown for user-generated content, AI responses, and documentation; it handles headings, lists, tables, code blocks, and citations with consistent styling.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Set headingLevelStart to match the page hierarchy, e.g. start at 3 if the markdown sits inside an h2 section.',
      },
      {
        guidance: true,
        description:
          'Use contentWidth to keep prose at a readable line length in wide layouts.',
      },
      {
        guidance: true,
        description:
          'Emphasis and strong pair as CommonMark specifies, so *see **bold** more* puts the bold inside the emphasis. ***text*** renders as strong around emphasis, the order RichText draws, and is announced as both. Emphasis nested more than 100 levels deep stays as written text.',
      },
      {
        guidance: true,
        description:
          'Use plugins created by createMarkdownPlugin for reusable syntax, immutable AST transforms, and typed extension rendering. Keep the ordered list stable while its syntax configuration is unchanged.',
      },
      {
        guidance: true,
        description:
          'To render a plugin node outside Markdown, as another surface showing the same document does, read what the plugin declares with getMarkdownPluginCapabilities (syntax and transform, nothing else), and render each parsed extension node with MarkdownPluginNodeRenderer from the client-only @astryxdesign/core/Markdown/plugin-renderer subpath. It presents the node exactly as Markdown does, fallbacks and failure reports included, with no element of its own.',
      },
      {
        guidance: true,
        description:
          'Add markdownSoftBreaksPlugin when single line endings are meaningful. It matches remark-breaks for supported Markdown, including multiline link labels, while code and other opaque content stay unchanged.',
      },
      {
        guidance: true,
        description:
          'Add markdownSourceLinesPlugin when a feature maps the rendered document back to Markdown source lines (find, highlights, review comments). Every block Markdown renders, nested blocks included, then carries data-source-line and data-source-line-end (1-based, inclusive); components block renderers receive sourceLines to place on their own element, and plugin renderers read node.position lines. Inline elements, table rows, and cells carry none. Without the plugin no line work runs.',
      },
      {
        guidance: true,
        description:
          'Use createMarkdownTextTransform for prose matching; it preserves code, links, images, citations, math, and accepted extension syntax as protected contexts. Provide requiredSubstrings only when they conservatively cover every possible match.',
      },
      {
        guidance: true,
        description:
          'Use createMarkdownFenceTransform for declared code-fence languages with semantic data. createNode returns an owned block extension node; its standard plugin renderer and toText own presentation. A claimed fence renders through that plugin even when components.code is supplied; components.code renders every unclaimed fence and is the fallback when the plugin renderer declines, throws, or suspends, and without it the accessible, copyable CodeBlock is that fallback.',
      },
      {
        guidance: true,
        description:
          'Use createMarkdownSourceDecoration to attach non-visual metadata — search hits, review annotations — to the blocks a source range touches, and getMarkdownSourceDecorations to read it back in a later plugin. Decorations appear on the settled document rather than on partial streaming chunks, and never change rendering, copyable text, accessible names, ids, focus order, or navigation.',
      },
      {
        guidance: true,
        description:
          'Import parseMarkdownAst or parseInlineAst from @astryxdesign/core/Markdown/parser when server or React Server Component code needs to run plugins against the canonical readonly tree. The parser and plugin subpaths have no use-client boundary. The Markdown component remains client-owned, so function-bearing plugin entries must not be passed across an RSC serialization boundary.',
      },
      {
        guidance: true,
        description:
          'Use createMarkdownFrontmatter for typed document metadata. Its parse() method gives the host metadata directly; its plugin removes a complete leading block before rendering and withholds an unfinished block during streaming.',
      },
      {
        guidance: true,
        description:
          "Import createMarkdownRemarkTransform from '@astryxdesign/core/Markdown/remark' only to reuse an existing synchronous transform-only Remark plugin; it stays out of every other bundle. Prove each plugin with fixtures: anything outside the supported MDAST subset — async work, parser or compiler plugins, processor state, raw HTML, unsupported nodes, forged positions, or metadata Astryx cannot represent — keeps the last valid document and reports one diagnostic.",
      },
      {
        guidance: true,
        description:
          'Use inlinePlugins for prefixed identifiers, mentions, and other prose-only shorthand instead of preprocessing the markdown string.',
      },
      {
        guidance: true,
        description:
          'Provide components.math only for documents that use dollar-delimited math. The renderer owns typesetting and accessible output; Astryx passes the expression as text and never executes raw HTML.',
      },
      {
        guidance: true,
        description:
          'For direct parsing, use MathParseOptions and handle InlineNodeWithMath or BlockNodeWithMath. Incremental math parsing also uses createIncrementalState<true>() and IncrementalParseState<true>; default calls and ParseOptions annotations keep the legacy unions.',
      },
      {
        guidance: true,
        description:
          'Install createMarkdownHeadingLinks() through plugins when a document needs copyable h1–h6 permalinks. The returned entry carries its validated namespace and URL base across compatible Core package copies. Each built-in heading keeps its incoming fragment ID and gains an inline trailing # copy button: it is hidden at fine-pointer rest through useContainerReveal, reveals on heading-row hover or keyboard focus, and stays visible under the hook’s coarse/touch semantics. Unmodified tap, click, Enter, or Space copies the canonical URL without navigation, hash mutation, or scrolling; a check confirms success for 1.5 seconds. The no-plugin path stays unchanged, and nested headings use the same depth-first identity projection as Markdown-derived Outline.',
      },
      {
        guidance: true,
        description:
          'For multiple documents, create one heading-links plugin per document with headingIdPrefix and pass that same plugin to Markdown and useOutlineFromMarkdown. Use the same stable value for Markdown id when the root also needs a DOM id; permalinkBaseUrl may supply a safe caller-owned URL before the fragment.',
      },
      {
        guidance: false,
        description:
          'Use Markdown for hand-authored layouts; use Text and Heading directly when you control the content.',
      },
    ],
  },
};

export const docsDense = {
  description:
    '把 markdown 字符串渲染为 Astryx 风格的组件。用于用户生成内容、AI 回复与文档。标题、列表、表格、代码与引用风格一致。',
  usage: {
    anatomy,
    description:
      '把 markdown 字符串渲染为 Astryx 风格的组件。将 Markdown 用于用户生成内容、AI 回复与文档；它以一致的样式处理标题、列表、表格、代码块与引用。',
    bestPractices: [
      {
        guidance: true,
        description:
          '设置 headingLevelStart 以匹配页面层级，例如 markdown 位于 h2 区块内时从 3 开始。',
      },
      {
        guidance: true,
        description:
          '使用 contentWidth 在宽布局中把正文保持在可读的行长。',
      },
      {
        guidance: true,
        description:
          '强调与加粗按 CommonMark 规则配对，因此 *see **bold** more* 会把加粗放进强调内部。***text*** 渲染为包裹强调的加粗，与 RichText 绘制的顺序一致，并会同时以两者播报。嵌套超过 100 层的强调保持为原样文本。',
      },
      {
        guidance: true,
        description:
          '使用由 createMarkdownPlugin 创建的插件实现可复用语法、不可变 AST 转换与类型化扩展渲染。语法配置未变时保持有序列表稳定。',
      },
      {
        guidance: true,
        description:
          '要在 Markdown 之外渲染插件节点（例如另一个展示同一文档的表面），先用 getMarkdownPluginCapabilities 读取插件声明的内容（仅语法与转换，别无其他），再用仅客户端的 @astryxdesign/core/Markdown/plugin-renderer 子路径中的 MarkdownPluginNodeRenderer 渲染每个解析出的扩展节点。它以与 Markdown 完全一致的方式呈现节点，包括回退与失败报告，自身不产生任何元素。',
      },
      {
        guidance: true,
        description:
          '当单个换行符有意义时添加 markdownSoftBreaksPlugin。对受支持的 Markdown，它与 remark-breaks 行为一致（包括多行链接标签），而代码及其他不透明内容保持不变。',
      },
      {
        guidance: true,
        description:
          '当某个功能需要把渲染后的文档映射回 Markdown 源行（查找、高亮、评审评论）时，添加 markdownSourceLinesPlugin。Markdown 渲染的每个块（含嵌套块）都会带上 data-source-line 与 data-source-line-end（从 1 计、含端点）；components 块渲染器会收到 sourceLines 以放置到自己的元素上，插件渲染器读取 node.position 行。内联元素、表格行与单元格不带。未装该插件时不做任何行处理。',
      },
      {
        guidance: true,
        description:
          '用 createMarkdownTextTransform 做正文匹配；它把代码、链接、图片、引用、数学与受支持的扩展语法保留为受保护上下文。仅当 requiredSubstrings 能保守地覆盖所有可能匹配时才提供它。',
      },
      {
        guidance: true,
        description:
          '对带语义数据的已声明代码围栏语言使用 createMarkdownFenceTransform。createNode 返回自有的块级扩展节点；其标准插件渲染器与 toText 负责呈现。即使提供了 components.code，被认领的围栏也经该插件渲染；components.code 渲染所有未被认领的围栏，并在插件渲染器拒绝、抛错或挂起时充当回退；未提供时，可访问、可复制的 CodeBlock 就是该回退。',
      },
      {
        guidance: true,
        description:
          '用 createMarkdownSourceDecoration 把非视觉元数据——搜索命中、评审标注——附加到源区间触及的块上，并在后续插件中用 getMarkdownSourceDecorations 读回。装饰出现在定稿文档上而非部分流式分块上，且绝不改变渲染、可复制文本、无障碍名称、id、焦点顺序或导航。',
      },
      {
        guidance: true,
        description:
          '当服务端或 React Server Component 代码需要针对规范只读树运行插件时，从 @astryxdesign/core/Markdown/parser import parseMarkdownAst 或 parseInlineAst。parser 与 plugin 子路径没有 use client 边界。Markdown 组件仍归客户端所有，因此携带函数的插件条目不得跨 RSC 序列化边界传递。',
      },
      {
        guidance: true,
        description:
          '使用 createMarkdownFrontmatter 处理类型化文档元数据。其 parse() 方法把元数据直接交给宿主；其插件在渲染前移除完整的头部块，并在流式期间扣留未完成的块。',
      },
      {
        guidance: true,
        description:
          "仅当要复用同步 transform-only Remark 插件时才 import createMarkdownRemarkTransform；它不会进入其他任何 bundle，不支持的行为会保留上一份有效文档并报告一条诊断。",
      },
      {
        guidance: true,
        description:
          '对带前缀的标识符、用户提及及其他仅正文简写模式使用 inlinePlugins，而不是预处理 markdown 字符串。',
      },
      {
        guidance: true,
        description:
          '仅为使用美元定界数学的文档提供 components.math；渲染器负责排版与无障碍输出。',
      },
      {
        guidance: true,
        description:
          '直接数学解析调用使用 MathParseOptions 与显式 WithMath 节点联合；增量调用还使用 createIncrementalState<true>() 与 IncrementalParseState<true>。默认调用保持旧联合类型。',
      },
      {
        guidance: true,
        description:
          '通过 plugins 安装 createMarkdownHeadingLinks()，为内置标题添加全层级稳定 ID 与行内尾部 # 复制按钮。useContainerReveal 让按钮在细指针静止时隐藏、键盘/触屏可达。未修饰的激活复制规范 URL，不导航、不改 hash、不滚动，并显示 1.5 秒对勾；失败保持静默。把同一个插件条目传给 Markdown 派生的 Outline；多实例用 headingIdPrefix。',
      },
      {
        guidance: false,
        description:
          '不要用 Markdown 做手工编排的布局；内容由你掌控时直接使用 Text 与 Heading。',
      },
    ],
  },
  propDescriptions: {
    children: 'markdown 字符串',
    density: "块级间距。'default'|'compact'。默认：'default'。",
    headingLevelStart:
      '把 # 映射到该标题级别（1-6）。钳制为 h6。默认：1。',
    isStreaming:
      '流式分块的增量解析 + 淡入。默认：false。',
    onLinkClick:
      '(href, event) => void|false。返回 false 阻止导航。链接目标遵循共享导航规则（见 Link href）；被拦截的渲染为文本。图片 URL：单独的更严格策略。',
    sources:
      'Record<string, MarkdownSource>。按 ID 索引的引用来源。[id]/【id】标记渲染为引用标签。',
    citationStyle:
      "'label'|'number'。label=带标题+图标的标签，number=紧凑徽章。默认：'label'。",
    contentWidth:
      'number|string。正文最大宽度（标题、段落、列表）。表格/代码不受限。',
    contentAlign:
      "'start'|'center'。contentWidth 小于容器时正文的对齐。默认：'start'。",
    plugins:
      'readonly MarkdownPluginEntry[]。来自 createMarkdownPlugin() 的有序语法、不可变 AST 转换与类型化扩展渲染器，以及 createMarkdownHeadingLinks() 等第一方助手。默认：省略或空。',
    inlinePlugins:
      'MarkdownInlinePlugin[]。文本节点中的正则匹配 -> 自定义内联 React 元素。跳过行内/围栏代码与数学。',
    autolink:
      "'gfm'。可选的 GFM 自动链接：裸 URL（https?://、www.）、<scheme:url>、<email>、user@host。跳过代码、代码块、现有链接。默认：关闭。",
    components:
      'MarkdownComponents。自定义渲染器；math({value, display}) 启用 $…$/$$…$$ 解析。渲染器负责输出与无障碍。',
    xstyle: '用于布局（边距、尺寸）的 stylex.create()。',
    className: 'CSS 类名。建议用 xstyle。',
    style: '内联样式。建议用 xstyle。',
    'data-testid': '测试选择器。',
  },
};
