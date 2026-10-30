#!/usr/bin/env node
// strict-residue.mjs — 严苛纯英文残留扫描（可见文本、无中文、拉丁占比过半、含停用词）
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'site');
const STOP = /\b(the|and|with|your|from|that|what|when|how|why|this|these|those|using|build|learn)\b/i;
const strip = (h) => h
  .replace(/<(script|style|code|pre|textarea|svg|template)\b[\s\S]*?<\/\1>/gi, ' ')
  .replace(/<[^>]+>/g, ' ');
let hits = 0, files = 0;
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const f = path.join(d, e.name);
    if (e.isDirectory()) walk(f);
    else if (e.name === 'index.html') {
      files++;
      const text = strip(fs.readFileSync(f, 'utf8'));
      for (const seg of text.split(/\s{2,}|\n/).map(s => s.trim()).filter(s => s.length > 25)) {
        const cjk = (seg.match(/[一-龥]/g) || []).length;
        const latin = (seg.match(/[a-zA-Z]/g) || []).length;
        if (cjk === 0 && latin > seg.length * 0.5 && STOP.test(seg)) {
          hits++;
          if (hits <= 20) {
            const rel = path.relative(SITE, f).split(path.sep).join('/').replace('/index.html', '');
            console.log(' ·', rel, '|', seg.slice(0, 110));
          }
        }
      }
    }
  }
})(SITE);
console.log('纯英文长句残留:', hits, '页面数:', files);
