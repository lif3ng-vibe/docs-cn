type MarkdownNode = {
  type: string;
  depth?: number;
  value?: string;
  children?: MarkdownNode[];
  data?: { hProperties?: Record<string, unknown> };
};

export function legacyHeadingId(text: string): string {
  return text
    .toLowerCase()
    // 中文标题：\w 不含 CJK 会把整串删空，改用 Unicode 字母数字类，
    // 中文 id 与 github-slugger（保留 CJK）口径一致。
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .trim();
}

function text(node: MarkdownNode): string {
  if (node.type === "image" || node.type === "mdxTextExpression") return "";
  return node.children ? node.children.map(text).join("") : (node.value ?? "");
}

export function remarkLegacyHeadings() {
  return function walk(node: MarkdownNode) {
    if (node.type === "heading" && node.depth && node.depth <= 3) {
      node.data ??= {};
      node.data.hProperties ??= {};
      node.data.hProperties.id = legacyHeadingId(text(node));
    }
    node.children?.forEach(walk);
  };
}
