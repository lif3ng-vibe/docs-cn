// 英文残留扫描：剥 script/style/注释/SVG 路径数据后提取文本节点，
// 报告仍含连续英文单词（≥3 词）的可见文本。白名单：产品名/命令/专有技术词。
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const files = ['index.html', ...fs.readdirSync(path.join(ROOT, 'site', 'examples')).map(f => 'examples/' + f)];

// 允许保留英文的词（小写匹配）
const ALLOW = new Set(('diagram design diagramdesign.dev skill.md html svg npx plugin install marketplace add update skills ' +
  'copilot codex pi droid qoder cursor cline gemini windsurf kiro opencode claude figma github readme mit ' +
  'id segment union windows ctrl alt shift esc enter tab page home end space simp usb soc oled postgres api ' +
  'cloudflare astro mdx cms redis minio s3 ceph trino superset airflow kubernetes postgresql typescript ' +
  'drawio mermaid excalidraw plantuml medallion wardley sbgn uml er ci e2e ml lint wip mvp pos crm pos api ' +
  'star trending utd dashboard beta zip git clone symlink profiles com dev http https www x.com littlemight nontechnical ' +
  'fans follower').split(/\s+/));

const out = [];
for (const rel of files) {
  const full = path.join(ROOT, 'site', rel);
  let html = fs.readFileSync(full, 'utf8');
  // 剥掉不参与残留判定的区域
  html = html.replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<pre[\s\S]*?<\/pre>/gi, '')
    .replace(/<code[\s\S]*?<\/code>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<path\b[^>]*>/gi, '');
  // 提取文本节点（标签之间）
  const texts = html.split(/<[^>]+>/).map(s => s.trim()).filter(Boolean);
  for (const t of texts) {
    const decoded = t.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#\d+;/g, ' ');
    // 找连续英文词序列
    const words = decoded.match(/[A-Za-z][A-Za-z'.-]*/g) || [];
    let run = 0, sample = [];
    for (const w of words) {
      if (ALLOW.has(w.toLowerCase()) || /^\d+$/.test(w)) { run = 0; continue; }
      run++; if (run === 1) sample = [w]; else sample.push(w);
      if (run >= 3) break;
    }
    if (run >= 3) out.push(`${rel}: ${decoded.slice(0, 100)}`);
  }
}
if (out.length) { console.log(out.join('\n')); console.log(`\n${out.length} residue lines`); process.exit(1); }
console.log('CLEAN');
