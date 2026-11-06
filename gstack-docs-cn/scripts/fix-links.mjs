// 锚点回修：翻译后把站内链接的 #片段 从英文锚点改写成中文锚点
// 数据源：.anchor-maps/**/<file>.map.md（原英文标题 | 中文标题 | 新锚点）+ scripts/custom-anchors.tsv（Fern 自定义锚点）
// 用法：node scripts/fix-links.mjs   （干跑加 --dry）
import fs from 'node:fs';
import path from 'node:path';
import SluggerMod from 'github-slugger';

const Slugger = SluggerMod.default || SluggerMod;
const PROJ = path.resolve(import.meta.dirname, '..');
const DOCS = path.join(PROJ, 'src/content/docs');
const MAPS = path.join(PROJ, '.anchor-maps');
const DRY = process.argv.includes('--dry');

function* walk(dir, ext) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p, ext);
    else if (e.name.endsWith(ext)) yield p;
  }
}

// ---- 载入映射表：contentPath -> { enSlug -> cnSlug } ----
const maps = new Map(); // contentPath (相对 docs，无扩展名) -> Map(enSlug -> cnSlug)
for (const f of walk(MAPS, '.map.md')) {
  const rel = path.relative(MAPS, f).replaceAll('\\', '/');
  const contentPath = rel.replace(/\.map\.md$/, '').replace(/\.mdx$/, '').replace(/\/index$/, '') || 'index';
  const table = new Map();
  for (const line of fs.readFileSync(f, 'utf8').split('\n')) {
    const parts = line.split('|').map((s) => s.trim());
    if (parts.length < 2 || !parts[0] || parts[0].startsWith('```')) continue;
    const [en, zh] = parts;
    // EN/CN 各用独立 slugger：同一实例连算会把不译标题（Snap/macOS 等）去重成 -1
    // 标题行可带 ## 前缀（子代理按「原英文标题 | 中文标题 | 新锚点」写），slug 前剥掉。
    // 取第二列（中文标题原文）而非第三列手写锚点：slug(标题原文) 与页面实际渲染 id 必然一致
    table.set(
      new Slugger().slug(en.replace(/^#+\s*/, '')),
      new Slugger().slug(zh.replace(/^#+\s*/, '')),
    );
  }
  if (table.size) maps.set(contentPath, table);
}

// ---- Fern 自定义锚点：file \t heading-en \t fern-anchor → 挂进对应文件的表 ----
const tsvPath = path.join(PROJ, 'scripts/custom-anchors.tsv');
if (fs.existsSync(tsvPath)) {
  for (const line of fs.readFileSync(tsvPath, 'utf8').split('\n').slice(1)) {
    const [file, en, fern] = line.split('\t');
    if (!file || !fern) continue;
    const table = maps.get(file.replace(/\.mdx$/, ''));
    if (!table) { console.warn('tsv 无对应映射文件:', file); continue; }
    const slugger = new Slugger();
    const cn = table.get(slugger.slug(en.replace(/^#+\s*/, '')));
    if (cn) table.set(fern, cn);
    else console.warn('tsv 标题未命中映射:', file, en);
  }
}

// ---- 链接目标解析：/about/overview → docs 下实际文件 ----
function resolveTarget(linkPath, fromContentPath) {
  if (!linkPath) return fromContentPath;
  let p = linkPath.replace(/^\/docs-cn\/[^/]+\//, '/').replace(/\.html?$/, '').replace(/\/$/, '');
  p = p.replace(/^\//, '');
  const candidates = [p, p + '.mdx', p + '.md', p + '/index.mdx', p + '/index.md', p === '' ? 'index.mdx' : null];
  for (const c of candidates) {
    if (c && fs.existsSync(path.join(DOCS, c))) {
      const noExt = c.replace(/\.(mdx|md)$/, '').replace(/\/index$/, '');
      // ''（根链接 / 与 /index 双形态在 Windows path.join 下都归一到这）与 'index' 都指首页
      return noExt || 'index';
    }
  }
  return null;
}

// 片段 → 中文片段：查映射；EN 同名标题的去重后缀（-1、-2…）原样保留到中文侧
function mapFrag(table, fragKey) {
  const direct = table.get(fragKey) ?? table.get(decodeURIComponent(fragKey));
  if (direct) return direct;
  const m = fragKey.match(/^(.*)-(\d+)$/);
  if (m) {
    const base = table.get(m[1]) ?? table.get(decodeURIComponent(m[1]));
    if (base) return `${base}-${m[2]}`;
  }
  return null;
}


function segmentsOutsideFences(src) {
  const segs = [];
  const lines = src.split('\n');
  let pos = 0;
  let open = null; // { ch, len }
  let fenceStart = 0;
  for (const line of lines) {
    const m = line.match(/^(\s*)(```+|~~~+)(.*)$/);
    if (m) {
      const ch = m[2][0];
      const len = m[2].length;
      const info = (m[3] || '').trim();
      if (open) {
        // 闭合围栏：同字符、长度不小于开场、info 为空（CommonMark）
        if (ch === open.ch && len >= open.len && info === '') {
          segs.push([fenceStart, pos + line.length + 1, true]);
          open = null;
        }
      } else {
        // 反引号围栏的 info 串不得含反引号，否则是行内代码而非围栏
        if (ch === '`' && info.includes('`')) {
          pos += line.length + 1;
          continue;
        }
        open = { ch, len };
        fenceStart = pos;
      }
    }
    pos += line.length + 1;
  }
  if (open) segs.push([fenceStart, src.length, true]);
  segs.sort((a, b) => a[0] - b[0]);
  const out = [];
  let cur = 0;
  for (const [s, e] of segs) { if (s > cur) out.push([cur, s]); cur = e; }
  if (cur < src.length) out.push([cur, src.length]);
  return out;
}

let changedFiles = 0, rewritten = 0;
const unmapped = [];
for (const file of walk(DOCS, '.md')) {
  const src = fs.readFileSync(file, 'utf8');
  const fromContentPath = path.relative(DOCS, file).replaceAll('\\', '/').replace(/\.md$/, '');
  const segs = segmentsOutsideFences(src);
  const edits = [];
  const patterns = [
    // markdown 链接 ](path#frag)
    { re: /\]\(([^)#\s]*)(#[^)\s]*)?\)/g, fragGroup: 2 },
    // JSX/HTML 属性 href="/path#frag"
    { re: /href="(\/[^"\s]*)#([^"\s]+)"/g, fragGroup: 2, attr: true },
  ];
  for (const [s, e] of segs) {
    const chunk = src.slice(s, e);
    for (const { re, fragGroup, attr } of patterns) {
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(chunk))) {
        const full = m[0];
        const linkPath = attr ? m[1] : m[1];
        const frag = attr ? '#' + m[fragGroup] : m[fragGroup];
        if (!frag || frag === '#') continue;
        const target = resolveTarget(linkPath, fromContentPath);
        if (!target) continue;
        const table = maps.get(target);
        if (!table) { unmapped.push(`${fromContentPath} → ${full}（无映射）`); continue; }
        const fragKey = frag.slice(1);
        const cn = mapFrag(table, fragKey);
        if (!cn) { unmapped.push(`${fromContentPath} → ${full}（片段未命中）`); continue; }
        if (cn !== fragKey) {
          const fragStart = s + m.index + full.lastIndexOf(frag);
          edits.push([fragStart, fragStart + frag.length, '#' + cn]);
        }
      }
    }
  }
  if (edits.length && !DRY) {
    let out = src;
    edits.sort((a, b) => b[0] - a[0]);
    for (const [s2, e2, rep] of edits) out = out.slice(0, s2) + rep + out.slice(e2);
    fs.writeFileSync(file, out);
    changedFiles++;
  }
  rewritten += edits.length;
}
console.log(`rewritten=${rewritten} files=${changedFiles}${DRY ? ' (dry)' : ''}`);
if (unmapped.length) {
  console.log('未命中（需人工核对）:');
  for (const u of [...new Set(unmapped)]) console.log('  ', u);
}
