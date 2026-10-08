// EN mirror version of agency-agents-docs-cn/scripts/import-sources.mjs:
// reads the CN project's snapshot, writes the same docs layout with `title`.
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(root, '..', 'agency-agents-docs-cn', '_snapshot', 'agency-agents-main');
const OUT = join(root, 'src', 'content', 'docs');

const DIVISIONS = [
  'academic', 'design', 'engineering', 'finance', 'game-development', 'gis',
  'healthcare', 'marketing', 'paid-media', 'product', 'project-management',
  'research', 'sales', 'security', 'spatial-computing', 'specialized',
  'support', 'testing',
];

function mapPath(rel) {
  if (rel === 'README.md') return 'catalog.md';
  if (rel === 'CONTRIBUTING.md') return 'contributing.md';
  if (rel === 'CONTRIBUTING_zh-CN.md') return 'contributing-zh-cn.md';
  if (rel === 'SECURITY.md') return 'security.md';
  if (rel === 'integrations/README.md') return 'integrations/index.md';
  if (rel.startsWith('integrations/') && rel.endsWith('README.md')) {
    return rel.replace('README.md', 'index.md');
  }
  const top = rel.split('/')[0];
  if (DIVISIONS.includes(top) || top === 'strategy' || top === 'examples') return rel;
  return null;
}

const yamlScalar = (s) => `'` + s.replaceAll(`'`, `''`) + `'`;

function addTitle(text) {
  if (text.startsWith('---\n')) {
    const end = text.indexOf('\n---', 3);
    const fm = text.slice(4, end);
    const m = fm.match(/^name:\s*(.+)$/m);
    if (m) {
      const title = m[1].replace(/^['"]|['"]$/g, '').trim();
      return '---\ntitle: ' + yamlScalar(title) + '\n' + text.slice(4);
    }
    return text; // 已有 frontmatter 但无 name —— 不动（如 mcp-memory 示例已含 title）
  }
  const h1 = text.match(/^#\s+(.+)$/m);
  const title = h1 ? h1[1].trim() : 'Untitled';
  return '---\ntitle: ' + yamlScalar(title) + '\n---\n\n' + text;
}

let count = 0;
const walk = (dir) => {
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, ent.name);
    if (ent.isDirectory()) walk(p);
    else if (ent.name.endsWith('.md')) {
      const rel = relative(SRC, p).replaceAll('\\', '/');
      if (rel.startsWith('.github/')) continue;
      const outRel = mapPath(rel);
      if (!outRel) continue;
      let text = readFileSync(p, 'utf8');
      if (!/^title:/m.test(text.startsWith('---\n') ? text.slice(4, text.indexOf('\n---', 3)) : '')) {
        text = addTitle(text);
      }
      const outPath = join(OUT, outRel);
      mkdirSync(dirname(outPath), { recursive: true });
      writeFileSync(outPath, text);
      count++;
    }
  }
};
walk(SRC);
// mcp-memory 工作流示例（CN 站有、保持对照成对）
{
  const extra = join(SRC, 'integrations', 'mcp-memory', 'backend-architect-with-memory.md');
  let text = readFileSync(extra, 'utf8');
  if (!/^title:/m.test(text)) {
    text = text.replace(/^---\n/, "---\ntitle: 'Backend Architect (mcp-memory workflow example)'\n");
  }
  const outPath = join(OUT, 'integrations', 'mcp-memory', 'backend-architect-with-memory.md');
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, text);
  count++;
}
console.log('imported ' + count + ' markdown files');