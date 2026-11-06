/// Prefixes authored absolute links and images in Markdown content with the
/// site base path, so `/skills/` resolves under `/docs-cn/gstack/` without
/// a build-time `sed` pass over the sources (same plugin as worktrunk-docs-cn).
/// Markdown-authored links arrive as parsed `a`/`img` elements; raw HTML
/// blocks are still `raw` text nodes at transformer time, so their
/// `src`/`srcset`/`href` attributes are rewritten in place. `](/…)` text
/// inside fenced code blocks is never touched.
export function rehypeBaseLinks(base) {
  const prefix = base.endsWith('/') ? base.slice(0, -1) : base;

  function absolute(path) {
    return path.startsWith('/') && !path.startsWith('//') && !path.startsWith(`${prefix}/`);
  }

  function rawHtml(value) {
    return value.replace(
      /(\s(?:src|srcset|href)=(["']))([^"'>]*)/gu,
      (match, lead, quote, path) =>
        !path.startsWith('/') || path.startsWith('//') || path.startsWith(`${prefix}/`)
          ? match
          : `${lead}${prefix}${path}`,
    );
  }

  return (tree) => {
    function visit(node) {
      if (!node) return;
      if (node.type === 'element') {
        const { href, src } = node.properties ?? {};
        if (typeof href === 'string' && absolute(href)) {
          node.properties.href = `${prefix}${href}`;
        }
        if (typeof src === 'string' && absolute(src)) {
          node.properties.src = `${prefix}${src}`;
        }
      }
      if (node.type === 'raw' && typeof node.value === 'string') {
        node.value = rawHtml(node.value);
      }
      node.children?.forEach(visit);
    }

    visit(tree);
  };
}
