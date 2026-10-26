// 译态判定：剥代码围栏/行内代码/frontmatter 后按正文行 CJK 占比分类。
// >0.5 = ZH；>0.05 = PARTIAL；否则 EN。（ agency-agents 管线验证过的可靠口径）
// 用法：node scripts-cn/check-zh.cjs <文件或目录>... ；输出 EN/PARTIAL 清单，exit 1 = 有未完成。
const fs = require('fs');
const path = require('path');

const cjk = (s) => (s.match(/[一-龥]/g) || []).length;

function classify(file) {
  const raw = fs.readFileSync(file, 'utf8');
  // 去 frontmatter
  let text = raw.replace(/^---\n[\s\S]*?\n---\n/, '');
  // 去代码围栏
  text = text.replace(/```[\s\S]*?```/g, '').replace(/~~~[\s\S]*?~~~/g, '');
  // 去 import 行与行内代码
  const lines = text.split('\n')
    .filter((l) => !/^import\s/.test(l) && !/^export\s/.test(l))
    .map((l) => l.replace(/`[^`]*`/g, ''));
  const body = lines.filter((l) => l.trim().length > 12);
  if (!body.length) return {ratio: 1, state: 'ZH', body: 0};
  const zh = body.filter((l) => cjk(l) / Math.max(1, l.trim().length) > 0.08).length;
  const ratio = zh / body.length;
  const state = ratio > 0.5 ? 'ZH' : ratio > 0.05 ? 'PARTIAL' : 'EN';
  return {ratio, state, body: body.length};
}

const targets = process.argv.slice(2);
const files = [];
for (const t of targets) {
  const full = path.resolve(t);
  const st = fs.statSync(full);
  if (st.isDirectory()) {
    (function walk(dir) {
      for (const e of fs.readdirSync(dir, {withFileTypes: true})) {
        const f = path.join(dir, e.name);
        if (e.isDirectory()) walk(f);
        else if (/\.(md|mdx)$/.test(e.name)) files.push(f);
      }
    })(full);
  } else files.push(full);
}

const bad = [];
for (const f of files) {
  const r = classify(f);
  if (r.state !== 'ZH') bad.push(`${path.relative(process.cwd(), f).replace(/\\/g, '/')} ${r.state} ratio=${r.ratio.toFixed(2)}`);
}
console.log(`checked: ${files.length}, not-ZH: ${bad.length}`);
for (const b of bad) console.log(b);
process.exit(bad.length ? 1 : 0);
