/// 把 ```mermaid / ```mermaid-zh 围栏代码块改写为客户端渲染容器
/// `<pre class="mermaid">` 与 `<pre class="mermaid-zh">`（隐藏，承载中文版图源），
/// 跳过 Shiki/expressive-code 的代码高亮包装。必须在 syntaxHighlight 之前
/// 运行（Astro 顶层 markdown.rehypePlugins 恰好如此）。
/// 客户端 head 脚本把两者聚拢进 figure 并按需渲染（public/vendor/mermaid.min.js）。
export function rehypeMermaidBlocks() {
  return (tree) => {
    function visit(node) {
      if (!node) return;
      if (node.type === 'element' && node.tagName === 'pre') {
        const code = node.children?.find(
          (c) => c.type === 'element' && c.tagName === 'code',
        );
        const cls = code?.properties?.className;
        const lang = Array.isArray(cls)
          ? cls.find((c) => typeof c === 'string' && c.startsWith('language-mermaid'))
          : undefined;
        if (lang && code) {
          if (lang === 'language-mermaid') {
            node.tagName = 'pre';
            node.properties = { className: ['mermaid'] };
            node.children = [{ type: 'text', value: extractText(code) }];
          } else if (lang === 'language-mermaid-zh') {
            node.tagName = 'pre';
            node.properties = { className: ['mermaid-zh'], hidden: true };
            node.children = [{ type: 'text', value: extractText(code) }];
          }
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
