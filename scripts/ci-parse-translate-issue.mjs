#!/usr/bin/env node
// 解析 translate-site issue 表单（GitHub issue form 产出的 "### 标题" 分节格式）
// → 以 GITHUB_ENV 的 heredoc 块格式打印 KEY=VALUE，workflow 直接追加消费。
// 用法：node scripts/ci-parse-translate-issue.mjs <issue-body.md>
// 校验失败（缺必填/slug 非法）→ stderr 说明 + 退出 1，job 转失败回帖路径。
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
const val = (label) => (sections[label] || []).join('\n').trim();

const out = {};
for (const [label, key] of LABELS) out[key] = val(label);

const errs = [];
if (!out.UPSTREAM_REPO) errs.push('缺少「上游 git 仓库 URL」——上游无公开源码仓库的闭源站不支持 CI 翻译，请走本地流程');
else if (!/^https?:\/\//i.test(out.UPSTREAM_REPO)) errs.push('「上游 git 仓库 URL」必须是 http(s) 地址');
if (!out.DOCS_URL) errs.push('缺少「文档站 URL」');
if (!/^[A-Za-z0-9][A-Za-z0-9_-]*$/.test(out.SLUG)) errs.push('「站点 slug」只能含字母/数字/连字符（目录名将用 <slug>-docs-cn）');
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
console.error(`表单解析成功：slug=${out.SLUG} upstream=${out.UPSTREAM_REPO} scope=${out.SCOPE || '全站'}`);
