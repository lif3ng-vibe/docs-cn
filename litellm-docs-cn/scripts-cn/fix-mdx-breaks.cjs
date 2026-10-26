// 修复三处翻译引入的 MDX 破坏：gemini 残渣已删；routing 补围栏；email 裸 URL 加反引号。
const fs = require('fs');

// routing.md：补回丢失的 yaml 块开头
let r = fs.readFileSync('docs/routing.md', 'utf8');
const F = '`';
const anchor = F + F + F + '\n\n    litellm_params:\n      model: anthropic/{{anthropic}}\n      api_key: <anthropic-key>\n';
if (!r.includes(anchor)) { console.error('routing anchor NOT FOUND'); process.exit(1); }
const fix = F + F + F + '\n\n' + F + F + F + 'yaml showLineNumbers title="Load Balancing config.yaml"\nmodel_list:\n  - model_name: sonnet-4              # Primary: Anthropic Direct\n    litellm_params:\n      model: anthropic/{{anthropic}}\n      api_key: <anthropic-key>\n';
r = r.replace(anchor, fix);
fs.writeFileSync('docs/routing.md', r);
console.log('routing fixed');

// email.md：三处裸 URL 加反引号
let e = fs.readFileSync('docs/proxy/email.md', 'utf8');
const subs = [
  ['| string | http://0.0.0.0:4000 |', '| string | ' + F + 'http://0.0.0.0:4000' + F + ' |'],
  ['### 为什么邮件链接中显示 "http://0.0.0.0:4000"？', '### 为什么邮件链接中显示 ' + F + 'http://0.0.0.0:4000' + F + '？'],
  ['邮件链接中就会显示 "http://0.0.0.0:4000"。', '邮件链接中就会显示 ' + F + 'http://0.0.0.0:4000' + F + '。'],
];
for (const [a, b] of subs) {
  if (!e.includes(a)) { console.error('email anchor NOT FOUND:', a); process.exit(1); }
  e = e.replace(a, b);
}
fs.writeFileSync('docs/proxy/email.md', e);
console.log('email fixed');
