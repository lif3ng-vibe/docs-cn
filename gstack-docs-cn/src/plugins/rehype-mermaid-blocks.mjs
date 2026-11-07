/// 把 ```mermaid 围栏代码块改写为客户端渲染容器 `<pre class="mermaid">`，
/// 跳过 Shiki/expressive-code 的代码高亮包装。必须在 syntaxHighlight 之前
/// 运行（Astro 顶层 markdown.rehypePlugins 恰好如此）；改写后节点没有
/// `code.language-*` 结构，Shiki 不会再处理。
/// 渲染由 head 注入的 inline 脚本按需完成（public/vendor/mermaid.min.js）。
export function rehypeMermaidBlocks() {
  return (tree) => {
    function visit(node) {
      if (!node) return;
      if (node.type === 'element' && node.tagName === 'pre') {
        const code = node.children?.find(
          (c) => c.type === 'element' && c.tagName === 'code',
        );
        const cls = code?.properties?.className;
        const lang = Array.isArray(cls) ? cls.find((c) => typeof c === 'string' && c.startsWith('language-')) : undefined;
        if (lang === 'language-mermaid' && code) {
          const source = extractText(code);
          node.tagName = 'pre';
          node.properties = { className: ['mermaid'] };
          node.children = [{ type: 'text', value: source }];
          return;
        }
      }
      node.children?.forEach(visit);
    }
    visit(tree);
  };
}

function extractText(node) {
  if (node.type === 'text') return node.value;
  return (node.children ?? []).map(extractText).join('');
}
