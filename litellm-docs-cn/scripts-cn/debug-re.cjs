const fs = require('fs');
const t = fs.readFileSync('docs/providers/anthropic.md', 'utf8');
const v = 'translated-openai-params';
const re = new RegExp('#' + v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?![\\w-])', 'g');
console.log('regex source:', re.source);
console.log('test:', re.test(t));
console.log('includes:', t.includes('#' + v));
// 直接看 fix-throw10 的处理路径复现
const path = require('path');
const ROOT = process.cwd();
const cn = require(path.join(ROOT, 'anchors-cn.json'));
console.log('cn key exists:', !!cn['docs/completion/input/index']);
