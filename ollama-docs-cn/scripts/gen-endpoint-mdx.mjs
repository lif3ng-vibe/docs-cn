#!/usr/bin/env node
/**
 * gen-endpoint-mdx.mjs —— 把 openapi.yaml 的 Endpoints 页生成为 MDX 参考页
 *
 * 背景：Mintlify CLI（4.2.x 本地渲染）无法渲染 docs.json Endpoints 组的
 * OpenAPI 页面（"POST /api/generate" 语法，本地 export 一律 404；线上是
 * Mintlify 云端构建不受限）。改为构建期从 openapi.yaml 生成静态 MDX：
 *   - title 用 spec 的 summary（线上 page-title 即 summary，规律一致）
 *   - sidebarTitle 保留 "METHOD /path" 形态，与原侧边栏一致
 *   - 请求示例 = x-codeSamples 原样嵌入 CodeGroup
 *   - 请求体/响应 = schema 顶层字段表（$ref 展开一层，嵌套引用写类型名）
 * 之后 docs.json 的 Endpoints 组改为普通页面列表，并删掉 openapi 字段。
 *
 * 用法: node scripts/gen-endpoint-mdx.mjs [--dry]
 * 生成清单与 docs.json Endpoints 组一致（不含已是 MDX 的 balance/cloud-usage）。
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import yaml from 'js-yaml';

const ROOT = process.cwd();
const DRY = process.argv.includes('--dry');
const spec = yaml.load(readFileSync(join(ROOT, 'openapi.yaml'), 'utf8'));

// Endpoints 组的 13 个 spec 端点 → [页面路由, method]
const ENDPOINTS = [
  ['api/generate', 'post'],
  ['api/chat', 'post'],
  ['api/embed', 'post'],
  ['v1/systemone', 'post'],
  ['api/tags', 'get'],
  ['api/ps', 'get'],
  ['api/show', 'post'],
  ['api/create', 'post'],
  ['api/copy', 'post'],
  ['api/pull', 'post'],
  ['api/push', 'post'],
  ['api/delete', 'delete'],
  ['api/version', 'get'],
];

const schemas = spec.components?.schemas ?? {};

// x-codeSamples 的 label 是 CodeGroup tab 名（可见文案）；「Choose a label」是上游未填的占位符
const LABEL_CN = {
  'Default': '默认',
  'Non-streaming': '非流式',
  'Thinking': '思考',
  'With options': '带选项',
  'Structured outputs': '结构化输出',
  'With images': '带图片',
  'Load model': '加载模型',
  'Unload model': '卸载模型',
  'Tool calling': '工具调用',
  'Images': '图片',
  'Multiple inputs': '多输入',
  'Truncation': '截断',
  'Dimensions': '维度',
  'List models': '列出模型',
  'List running models': '列出运行中模型',
  'Verbose': '详细输出',
  'Thinking controls': '思考控制',
  'Create from existing': '从现有模型创建',
  'Create from GGUF': '从 GGUF 创建',
  'Copy a model to a new name': '复制模型为新名称',
  'Push model': '推送模型',
  'Delete model': '删除模型',
};

function typeName(schema) {
  if (!schema) return '';
  if (schema.$ref) return schema.$ref.split('/').pop();
  if (schema.type === 'array') return `array<${typeName(schema.items)}>`;
  if (schema.enum) return `enum`;
  return schema.type ?? '';
}

/** 生成一张 schema 顶层字段表（Markdown） */
function schemaTable(name) {
  const def = schemas[name];
  if (!def) return `> 未找到 schema：${name}\n`;
  const props = def.properties ?? {};
  const required = new Set(def.required ?? []);
  const rows = Object.entries(props).map(([key, p]) => {
    const t = typeName(p).replace(/\|/g, '\\|');
    const req = required.has(key) ? '是' : '否';
    const desc = (p.description ?? p.items?.description ?? '').trim().replace(/\r?\n/g, ' ') || '—';
    return `| \`${key}\` | \`${t}\` | ${req} | ${desc} |`;
  });
  if (!rows.length) return `> schema \`${name}\` 无顶层属性。\n`;
  return [
    `**\`${name}\`** 属性：`,
    ``,
    `| 属性 | 类型 | 必填 | 描述 |`,
    `| --- | --- | --- | --- |`,
    ...rows,
    ``,
  ].join('\n');
}

/** x-codeSamples → CodeGroup（代码原样，label 作为围栏标注） */
function codeSamples(op) {
  const samples = op['x-codeSamples'] ?? [];
  if (!samples.length) return '';
  const blocks = samples.map((s) => {
    let label = (s.label && s.label !== s.lang ? s.label : '').trim();
    if (label === 'Choose a label') label = '';
    else if (label) label = LABEL_CN[label] ?? label;
    const lang = s.lang ?? 'bash';
    const fence = label ? '```' + lang + ' ' + label : '```' + lang;
    return `${fence}\n${(s.source ?? '').trim()}\n\`\`\``;
  });
  return ['## 请求示例', '', samples.length > 1 ? '<CodeGroup>' : '', ...blocks, samples.length > 1 ? '</CodeGroup>' : '', ''].join('\n');
}

/** MDX 文本安全化：{ 与非代码 < 会破坏 MDX 语法 */
function safeMd(text) {
  return (text ?? '')
    .replace(/\r\n/g, '\n')
    .replace(/\{/g, '&#123;')
    .replace(/\}/g, '&#125;');
}

for (const [route, method] of ENDPOINTS) {
  const pathItem = spec.paths['/' + route];
  const op = pathItem?.[method];
  if (!op) { console.error(`✗ spec 缺 ${method.toUpperCase()} /${route}`); continue; }
  const title = (op.summary ?? route).trim();
  const sidebar = `${method.toUpperCase()} /${route}`;

  const parts = [];
  parts.push('---');
  parts.push(`title: "${title.replace(/"/g, '\\"')}"`);
  parts.push(`sidebarTitle: "${sidebar}"`);
  parts.push('---');
  parts.push('');
  parts.push(`**${method.toUpperCase()}** \`${'/' + route}\``);
  parts.push('');
  const desc = safeMd(op.description ?? '');
  if (desc) parts.push(desc, '');

  // 参数（path/query/header）
  const params = op.parameters ?? [];
  if (params.length) {
    parts.push('## 参数', '', '| 参数 | 位置 | 类型 | 必填 | 描述 |', '| --- | --- | --- | --- | --- |');
    for (const p of params) {
      parts.push(`| \`${p.name}\` | ${p.in} | \`${p.schema?.type ?? ''}\` | ${p.required ? '是' : '否'} | ${safeMd(p.description ?? '—').replace(/\r?\n/g, ' ')} |`);
    }
    parts.push('');
  }

  const cs = codeSamples(op);
  if (cs) parts.push(cs);

  // 请求体
  const rb = op.requestBody?.content?.['application/json']?.schema;
  if (rb) {
    parts.push('## 请求体', '');
    if (rb.$ref) {
      parts.push(schemaTable(rb.$ref.split('/').pop()), '');
    } else {
      parts.push('```json\n' + JSON.stringify(rb, null, 2) + '\n```', '');
    }
  }

  // 响应
  const responses = op.responses ?? {};
  const codes = Object.keys(responses);
  if (codes.length) {
    parts.push('## 响应', '');
    for (const code of codes) {
      const r = responses[code];
      const rd = safeMd(r.description ?? '').replace(/\r?\n/g, ' ');
      parts.push(`### ${code}`, '', rd, '');
      const rs = r.content?.['application/json']?.schema;
      if (rs?.$ref) parts.push(schemaTable(rs.$ref.split('/').pop()), '');
      else if (rs) parts.push('```json\n' + JSON.stringify(rs, null, 2) + '\n```', '');
    }
  }

  // x-mint 里可能有额外 markdown 内容段（如 SEE ALSO）
  const xm = op['x-mint'];
  if (xm?.content) parts.push(safeMd(typeof xm.content === 'string' ? xm.content : JSON.stringify(xm.content)), '');

  const out = parts.join('\n').replace(/\n{3,}/g, '\n\n') + '\n';
  const file = join(ROOT, route + '.mdx');
  if (DRY) console.log(`[dry] ${route}.mdx (${out.length} bytes)`);
  else { mkdirSync(join(file, '..'), { recursive: true }); writeFileSync(file, out); console.log(`✓ ${route}.mdx (${out.length} bytes)`); }
}
console.log('完成');
