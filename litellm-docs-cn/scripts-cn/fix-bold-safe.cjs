// CJK 粗体闭合安全修复 v2：邻接感知（前置边界排除字母与 *，杜绝拆散相邻粗体对）。
// B) ** 文本 ** → **文本**
// C) **……句读**CJK → **……**句读 CJK
// A) **词（gloss）**CJK → **词**（gloss）CJK
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

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

// 前置边界：行首、空白、或非字母/数字/*/井块的字符（全角标点与 CJK 均可）
const PRE = '(^|[^\\w*`])';
const counts = {B: 0, C: 0, A: 0};
for (const file of files) {
  const src = fs.readFileSync(file, 'utf8');
  let t = src;
  // C) 粗体内容非空、以全角句读收尾、闭合 ** 后紧跟非空白非*：句读移出
  t = t.replace(new RegExp(PRE + '\\*\\*([^*\\n]+?)([：，；、。！？])\\*\\*(?=[^\\s*|])', 'g'),
    (m, pre, w, p) => { counts.C++; return pre + '**' + w + '**' + p; });
  // B) 粗体两内侧有空格：去空格
  t = t.replace(new RegExp(PRE + '\\*\\* +([^*\\n]+?) +\\*\\*(?![\\w*])', 'g'),
    (m, pre, w) => { counts.B++; return pre + '**' + w + '**'; });
  // A) 粗体以）收尾（括注在内）且 ** 后紧跟 CJK：括注移出
  t = t.replace(new RegExp(PRE + '\\*\\*([^*\\n（）]+)（([^*\\n]+?)）\\*\\*(?=[一-鿿])', 'g'),
    (m, pre, w, g) => { counts.A++; return pre + '**' + w + '**（' + g + '）'; });
  if (t !== src) fs.writeFileSync(file, t);
}
console.log('C(句读出粗体):', counts.C, 'B(去内空格):', counts.B, 'A(括注出粗体):', counts.A);
