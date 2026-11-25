#!/usr/bin/env node
// 解析 translate-site issue 表单（GitHub issue form 产出的 "### 标题" 分节格式）
// → 以 GITHUB_ENV 的 heredoc 块格式打印 KEY=VALUE，workflow 直接追加消费。
// 用法：node scripts/ci-parse-translate-issue.mjs <issue-body.md>
// 校验失败（缺必填/slug 推导不出）→ stderr 说明 + 退出 1，job 转失败回帖路径。
import { readFileSync } from 'node:fs';

const body = readFileSync(process.argv[2], 'utf8');

// key 顺序即输出顺序；label 必须与 .github/ISSUE_TEMPLATE/translate-site.yml 的 label 逐字一致
const LABELS = [
  ['上游 git 仓库 URL', 'UPSTREAM_REPO'],
  ['文档站 URL', 'DOCS_URL'],
  ['站点 slug', 'SLUG'],
  ['仓库内文档子目录', 'SUBDIR'],
  ['范围裁剪', 'SCOPE'],
  ['术语约定补充', 'GLOSSARY_NOTES'],
];

const sections = {};
let cur = null;
for (const line of body.split(/\r?\n/)) {
  const m = /^###\s+(.+?)\s*$/.exec(line);
  if (m) {
    cur = m[1].trim();
    sections[cur] = [];
    continue;
  }
  if (cur) sections[cur].push(line);
}
// GitHub 表单对留空的可选字段填字面量 "_No response_"（或 "No response"），按空值处理
const EMPTY_MARKERS = /^_?\s*no response\s*_?$/i;
const val = (label) => {
  const v = (sections[label] || []).join('\n').trim();
  return EMPTY_MARKERS.test(v) ? '' : v;
};

const out = {};
for (const [label, key] of LABELS) out[key] = val(label);

// slug 缺省推导：仓库名 basename 优先，其次文档站域名（去 www./docs. 前缀取主体段）
let slugDerived = false;
if (!out.SLUG) {
  const slugify = (s) =>
    s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  try {
    if (out.UPSTREAM_REPO) {
      const u = new URL(out.UPSTREAM_REPO);
      const base = u.pathname.split('/').filter(Boolean).pop() || '';
      out.SLUG = slugify(base.replace(/\.git$/i, ''));
    } else if (out.DOCS_URL) {
      const h = new URL(out.DOCS_URL).hostname.replace(/^www\./, '');
      const parts = h.split('.');
      const HEADERS = new Set(['www', 'docs', 'doc', 'developer', 'developers', 'help', 'support', 'learn']);
      const seg = HEADERS.has(parts[0]) && parts.length > 2 ? parts[1] : parts[0];
      out.SLUG = slugify(seg);
    }
    slugDerived = Boolean(out.SLUG);
  } catch {
    /* URL 解析失败走下方校验报错 */
  }
}

const errs = [];
if (out.UPSTREAM_REPO && !/^https?:\/\//i.test(out.UPSTREAM_REPO))
  errs.push('「上游 git 仓库 URL」必须是 http(s) 地址（闭源站请留空）');
if (!out.DOCS_URL) errs.push('缺少「文档站 URL」');
if (!/^[A-Za-z0-9][A-Za-z0-9_-]*$/.test(out.SLUG))
  errs.push('无法推导出合法 slug——请在「站点 slug」字段直接填写（只允许字母/数字/连字符）');
if (errs.length) {
  console.error(errs.map((e) => `- ${e}`).join('\n'));
  process.exit(1);
}

const DELIM = '__TRANSLATE_ENV_EOF__';
for (const [, key] of LABELS) {
  console.log(`${key}<<${DELIM}`);
  console.log(out[key]);
  console.log(DELIM);
}
console.error(
  `表单解析成功：slug=${out.SLUG}${slugDerived ? '（自动推导）' : ''} ` +
    `mode=${out.UPSTREAM_REPO ? 'git 源翻译' : '闭源站镜像汉化'} scope=${out.SCOPE || '全站'}`,
);
