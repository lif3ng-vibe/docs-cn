// 终检清零 v2：遍历全部源文件链接，显式 id 表（中文+编码双形态）与 SPECIAL 旧锚点一次改净。
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const cn = JSON.parse(fs.readFileSync(path.join(ROOT, 'anchors-cn.json'), 'utf8'));

// 显式 id 表：标题中文锚点（已不存在，被 {#} 取代）→ 显式 id
const EXPLICIT = [
  ['1-编写-customguardrail-类', '1-write-a-customguardrail-class'],
  ['语音转写speech-to-text', 'audio-transcription-speech-to-text'],
  ['会话亲和', 'session-affinity'],
  ['azure-批处理-api', 'azure-batches-api'],
  ['完整功能清单', 'full-feature-list'],
  ['用-logging_only_scope-只观察单个方向', 'observe-only-one-direction-with-logging_only_scope'],
  ['工作原理', 'explanation'],
  ['上下文窗口回退', 'context-window-fallbacks'],
];

function cnAnchor(buildKey, kw) {
  const page = cn[buildKey];
  if (!page) return null;
  for (const [id, tagged] of Object.entries(page.anchors || {})) {
    if (tagged.includes(kw)) return id;
  }
  return null;
}

// SPECIAL：旧 EN 锚点 → (构建键, CN 锚点关键词)
const SPECIAL = [
  ['translated-openai-params', 'docs/completion/input/index', '翻译的'],
  ['overwrite-outgoing-user-with-the-key-hash', 'docs/proxy/user_keys/index', '哈希'],
  ['authentication-on-metrics-endpoint', 'docs/proxy/prometheus/index', '认证'],
];

function walk(d, out) {
  for (const e of fs.readdirSync(d, {withFileTypes: true})) {
    const f = path.join(d, e.name);
    if (e.isDirectory()) walk(f, out);
    else if (/\.(md|mdx)$/.test(e.name)) out.push(f);
  }
}
const files = [];
walk(path.join(ROOT, 'docs'), files);
walk(path.join(ROOT, 'src', 'pages'), files);

let n = 0;
const unmatched = new Set();
for (const file of files) {
  let src = fs.readFileSync(file, 'utf8');
  let out = src.replace(/\]\(([^)\s]*)\)/g, (whole, href) => {
    const h = href;
    const ai = h.lastIndexOf('#');
    if (ai < 0) return whole;
    const target = h.slice(0, ai);
    let anchor = h.slice(ai + 1);
    let dec;
    try { dec = decodeURIComponent(anchor); } catch { dec = anchor; }
    // 1) 显式 id 表
    for (const [zh, ex] of EXPLICIT) {
      if (dec === zh || anchor === encodeURIComponent(zh)) {
        n++;
        return '](' + target + '#' + ex + ')';
      }
    }
    // 2) SPECIAL 旧 EN 锚点 → CN 锚点
    for (const [oldA, buildKey, kw] of SPECIAL) {
      if (anchor === oldA || dec === oldA) {
        const newId = cnAnchor(buildKey, kw);
        if (newId) { n++; return '](' + target + '#' + newId + ')'; }
        unmatched.add(oldA + ' (no cn: ' + kw + ')');
        return whole;
      }
    }
    return whole;
  });
  if (out !== src) fs.writeFileSync(file, out);
}
console.log('rewritten:', n);
if (unmatched.size) { console.log('unmatched:'); [...unmatched].forEach((u) => console.log(' ', u)); }
