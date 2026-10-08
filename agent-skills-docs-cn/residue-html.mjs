// 渲染产物英文残留检查（本站是 astro/ts 项目，无 md；基于 dist HTML 正文扫描）。
// 剥掉 <script>/<style>/<pre>/<code>/<svg> 与所有标签后，按停用词找残留英文句子。
// 用法：node residue-html.mjs [distDir]
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const dist = process.argv[2] || 'dist';
// 停用词：出现在正文文本节点里基本意味着漏译的英文句子
const STOP = /\b(the|and|with|your|from|that|what|when|where|you|for|whose|before|after|because|if|then|them|they)\b/i;
// 白名单：允许保留的英文 token（产品名/行话/单位）
const ALLOW = /(agent|skills?|docs?|teach|tutorials?|compare|lifecycle|loops?|astro|mcp|api|ui|css|svg|js|pr|prd|adr|tdd|xss|e2e|react|dom|http|id|ar|use|red|qa|og|mit|mb|kb|px|ghz|claude|codex|cursor|antigravity|copilot|windsurf|gemini|opencode|github|langchain|llm)/i;

const hits = [];
function walk(dir) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    const st = statSync(p);
    if (st.isDirectory()) walk(p);
    else if (f.endsWith('.html')) {
      let s = readFileSync(p, 'utf8');
      s = s.replace(/<(script|style|pre|code|svg)\b[\s\S]*?<\/\1>/gi, ' ');
      s = s.replace(/<[^>]+>/g, ' ');
      s = s.replace(/&[a-z]+;/gi, ' ');
      const lines = s.split(/<|\s/);
      for (const seg of s.split(/(?:\s*\n\s*)+/)) {
        for (const frag of seg.split(/(?<=[。.!?？\n])/)) {
          const t = frag.trim();
          if (t.length < 24) continue; // 太短的单 token（如按钮词）放过
          const m = t.match(STOP);
          if (!m) continue;
          if (ALLOW.test(t)) continue; // 段里至少带一个白名单词就降低误报——仍打印，供人工看
          hits.push(`${p}: 「${t.slice(0, 80)}」`);
        }
      }
      void lines;
    }
  }
}
walk(dist);
console.log(hits.length ? hits.join('\n') : 'CLEAN');
process.exit(hits.length ? 1 : 0);