// Import markdown sources from _snapshot/ into src/content/docs/,
// adding a `title` (from frontmatter `name` or first H1) for Starlight.
// Re-run after updating the snapshot; overwrites existing output files.
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(root, '_snapshot', 'agency-agents-main');
const OUT = join(root, 'src', 'content', 'docs');

const DIVISIONS = [
  'academic', 'design', 'engineering', 'finance', 'game-development', 'gis',
  'healthcare', 'marketing', 'paid-media', 'product', 'project-management',
  'research', 'sales', 'security', 'spatial-computing', 'specialized',
  'support', 'testing',
];

// repo-relative path -> docs-relative output path (no .md means skip)
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

// YAML 单引号标量：内部单引号翻倍转义，避免裸冒号/emoji/井号解析失败
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
console.log('imported ' + count + ' markdown files');