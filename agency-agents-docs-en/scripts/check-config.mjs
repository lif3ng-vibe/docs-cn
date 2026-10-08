import { pathToFileURL } from 'node:url';
import { readFileSync } from 'node:fs';
const cfg = (await import(pathToFileURL('astro.config.mjs', process.cwd()))).default;
// 校验不靠运行时对象（集成已被归一化），直接正读源文件抽 sidebar
const src = readFileSync('astro.config.mjs', 'utf8');
console.log('base:', cfg.base, '| site:', cfg.site);
const labels = [...src.matchAll(/^\s*\['([^']+)',\s*'[a-z-]+'\],/gm)].map((m) => m[1]);
console.log('sidebar groups:', labels.length);
console.log(labels.join(' | '));