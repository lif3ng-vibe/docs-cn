#!/usr/bin/env node
/**
 * English-residue check for the translated mirror.
 * Strips <script>/<style>/<code>/<pre> and tags, then flags lines that still
 * look like English prose (3+ consecutive latin words, minus a whitelist).
 *
 *   node tools/residue-check.mjs site/faq/index.html site/docs ...
 */

import fs from 'node:fs';
import path from 'node:path';

const ALLOW = new Set([
  // product / tool names & tech vocabulary that legitimately remain
  'impeccable', 'claude', 'code', 'cursor', 'codex', 'gemini', 'cli', 'copilot',
  'windsurf', 'kiro', 'opencode', 'github', 'visual', 'studio', 'code', 'vite',
  'next', 'sveltekit', 'astro', 'nuxt', 'bun', 'npm', 'npx', 'node', 'js',
  'typescript', 'javascript', 'css', 'html', 'webp', 'png', 'svg', 'json',
  'api', 'url', 'urls', 'slug', 'md', 'mdx', 'skill', 'skills', 'slop', 'live',
  'mode', 'steer', 'pick', 'accept', 'discard', 'variant', 'variants', 'demo',
  'mock', 'wireframe', 'token', 'tokens', 'design', 'system', 'audit', 'polish',
  'critique', 'bolder', 'quieter', 'distill', 'harden', 'onboard', 'animate',
  'colorize', 'typeset', 'layout', 'delight', 'overdrive', 'clarify', 'adapt',
  'optimize', 'document', 'extract', 'init', 'generate', 'shape', 'craft',
  'teach', 'new', 'work', 'doctor', 'improve', 'image', 'generation', 'context',
  'config', 'hooks', 'detector', 'faq', 'privacy', 'changelog', 'gallery',
  'research', 'cases', 'neo', 'mirai', 'designing', 'tutorials', 'getting',
  'started', 'iterate', 'critique', 'overlay', 'brand', 'product', 'labs',
  'stagings', 'worlds', 'shader', 'lab', 'kinpaku', 'steer', 'product',
  'apache', 'license', 'mit', 'bsl', 'trust', 'center', 'vanta', 'posthog',
  'cloudflare', 'pages', 'workers', 'ai', 'llm', 'gpt', 'openai', 'anthropic',
  'harness', 'agent', 'agents', 'harnesses', 'sidebar', 'logo', 'star', 'stars',
  'x', 'linkedin', 'pbakaus', 'paul', 'bakaus', 'readme', 'license', 'vanta',
  'localhost', 'dev', 'server', 'HMR', 'CSP', 'pull', 'request', 'commit',
  'push', 'git', 'repo', 'npx', 'install', 'update', 'check', 'force',
  'project', 'user', 'key', 'your', 'project', 'placeholder', 'lorem', 'ipsum',
  'before', 'after', 'back', 'top', 'search', 'menu', 'close', 'open', 'skip',
  'content', 'main', 'page', 'on', 'this', 'docs', 'reference', 'commands',
  'all', 'command', 'tutorials', 'start', 'here', 'first', 'steps', 'enable',
  'build', 'something', 'new', 'review', 'with', 'visual', 'improve', 'an',
  'existing', 'work', 'a', 'design', 'system', 'iterate', 'in', 'the',
  'browser', 'automatic', 'checks', 'run', 'scan', 'fix', 'setup', 'problems',
  'files', 'configuration', 'ignores', 'created', 'by', 'follow', 'connect',
]);

const WORD = /[A-Za-z][A-Za-z''-]+/g;

function checkFile(file) {
  let t = fs.readFileSync(file, 'utf8');
  t = t.replace(/<script[\s\S]*?<\/script>/gi, ' ')
       .replace(/<style[\s\S]*?<\/style>/gi, ' ')
       .replace(/<(pre|code)[\s\S]*?<\/\1>/gi, ' ')
       .replace(/<!--[\s\S]*?-->/g, ' ');
  t = t.replace(/<[^>]+>/g, ' ');
  t = t.replace(/&[a-z]+;|&#\d+;/g, ' ');
  const hits = [];
  for (const line of t.split('\n')) {
    const words = line.match(WORD) || [];
    const unknown = words.filter((w) => !ALLOW.has(w.toLowerCase()));
    // flag runs of 3+ consecutive latin words with at least one non-whitelisted
    let run = [];
    for (const w of words) {
      if (ALLOW.has(w.toLowerCase())) { run.push(w); continue; }
      run.push(w);
      if (run.length >= 3 && unknown.length > 0) {
        hits.push(line.trim().slice(0, 160));
        break;
      }
      if (run.length > 6) { hits.push(line.trim().slice(0, 160)); break; }
    }
  }
  return hits;
}

const targets = process.argv.slice(2);
let bad = 0;
for (const target of targets) {
  const p = path.resolve(target);
  const stat = fs.statSync(p);
  const files = stat.isDirectory() ? walk(p) : [p];
  for (const f of files) {
    const hits = checkFile(f);
    if (hits.length) {
      bad += hits.length;
      console.log(`\n${f}`);
      for (const h of hits.slice(0, 8)) console.log(`  ${h}`);
    }
  }
}
console.log(bad === 0 ? '\nCLEAN' : `\n${bad} suspicious lines`);
process.exit(bad === 0 ? 0 : 1);

function walk(dir) {
  const out = [];
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) out.push(...walk(p));
    else if (/\.(html|js|json)$/i.test(f)) out.push(p);
  }
  return out;
}
