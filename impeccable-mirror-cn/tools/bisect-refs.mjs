#!/usr/bin/env node
// bisect：同一 chunk，两种内容来源，比对提取结果
import fs from 'node:fs';

const p = 'site/_astro/gallery.astro_astro_type_script_index_0_lang.BI2mr3tc.js';
const asString = fs.readFileSync(p, 'utf8');
const asBuffer = Buffer.from(asString, 'utf8').toString('utf8');
console.log('sources equal:', asString === asBuffer);

const JS_REL_RE = /(?:from|import)\s*["'](\.\.?\/[^"']+)["']/g;
for (const [name, text] of [['asString', asString], ['asBuffer', asBuffer]]) {
  const hits = [...text.matchAll(JS_REL_RE)].map((m) => m[1]);
  console.log(name, 'rel hits:', hits);
}

// 再现 crawl.mjs 的 extractRefs（逐字符一致的拷贝）
const HTML_RE = /(?:href|src|poster|data-src)="(\/[^"]*)"/g;
const SRCSET_RE = /srcset="([^"]*)"/g;
const CSS_URL_RE = /url\(\s*['"]?(\/[^'")]+)['"]?\s*\)/g;
const JS_ABS_RE = /["'](\/(?:_astro|assets|js|_data|antipattern-[a-z]+)\/[^"'\s)]+)["']/g;
function extractRefs(kind, base, text) {
  const refs = [];
  const regexes = kind === 'html' ? [HTML_RE, SRCSET_RE, CSS_URL_RE] : kind === 'css' ? [CSS_URL_RE] : [JS_REL_RE, JS_ABS_RE];
  for (const re of regexes) {
    for (const m of text.matchAll(re)) {
      const candidates = re === SRCSET_RE ? m[1].split(',') : [m[1]];
      for (const cand of candidates) {
        let ref = cand.trim().split(/\s+/)[0];
        if (!ref || !ref.startsWith('/')) continue;
        if (ref.startsWith('./') || ref.startsWith('../')) {
          ref = new URL(ref, 'https://x.test' + base).pathname;
        }
        refs.push(ref);
      }
    }
  }
  return refs;
}
console.log('extractRefs js:', extractRefs('js', '/_astro/gallery.astro_astro_type_script_index_0_lang.BI2mr3tc.js', asBuffer));
