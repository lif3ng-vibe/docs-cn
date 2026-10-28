#!/usr/bin/env node
'use strict';
// HTML/JS English-residue scanner (final check for hallmark-docs-cn).
// HTML: strip script/style/comments/tags, scan visible text nodes.
// JS: strip comments, scan string literals area.
// Usage: node tools/residue-check-html.cjs [dir, default site]
const fs = require('fs');
const path = require('path');
const ROOT = process.argv[2] || path.join(__dirname, '..', 'site');
const STOP = ['the', 'and', 'with', 'your', 'from', 'that', 'which', 'where', 'every', 'into', 'shows'];
const WHITELIST = [
  /The\s+Low\s+Room/i, /Field\s+Office/i, /\bInlet\b/i, /\bOurs\b/i, /whenshot/i,
];
let bad = 0;
function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { walk(p); continue; }
    if (!/\.(html|js|css)$/.test(e.name)) continue;
    const src = fs.readFileSync(p, 'utf8');
    let text = src;
    if (e.name.endsWith('.js')) {
      text = src.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\/\/[^\n]*/g, ' ');
    } else if (e.name.endsWith('.html')) {
      text = src
        .replace(/<script[\s\S]*?<\/script>/gi, ' ')
        .replace(/<style[\s\S]*?<\/style>/gi, ' ')
        .replace(/<!--[\s\S]*?-->/g, ' ')
        .replace(/<[^>]+>/g, ' ');
    } else {
      text = src.replace(/\/\*[\s\S]*?\*\//g, ' ');
    }
    const rel = path.relative(ROOT, p);
    text.split('\n').forEach((line, i) => {
      if (!line.trim()) return;
      for (const w of STOP) {
        const re = new RegExp('\\b' + w + '\\b', 'i');
        if (re.test(line)) {
          if (WHITELIST.some((r) => r.test(line))) continue;
          console.log(rel + ':' + (i + 1) + ': [' + w + '] ' + line.trim().slice(0, 140));
          bad++;
          break;
        }
      }
    });
  }
}
walk(ROOT);
console.log(bad === 0 ? 'CLEAN' : bad + ' hits');
process.exit(bad === 0 ? 0 : 1);
