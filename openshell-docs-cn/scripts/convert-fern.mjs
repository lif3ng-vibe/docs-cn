// Fern MDX → Starlight MDX 机械转换（一次性基线脚本，翻译前跑；幂等可重跑）
// 处理：组件改名、barrel import 注入、className→class、llms 标签、{#id} 记录、补 frontmatter。不改散文。
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '../src/content/docs');

// Starlight 0.42 桶导出：@astrojs/starlight/components
const STARLIGHT_NAMES = ['Aside', 'Tabs', 'TabItem', 'LinkCard', 'CardGrid'];
const CUSTOM_IMPORTS = {
  Accordion: "@components/Accordion.astro",
  Badge: "@components/Badge.astro",
  ParamField: "@components/ParamField.astro",
  BadgeLinks: "@components/BadgeLinks.astro",
  CommandTerminal: "@components/CommandTerminal.astro",
  Steps: "@components/Steps.astro",
};

const TAG_RENAMES = [
  [/<\/?Note>/g, (m) => (m === '</Note>' ? '</Aside>' : '<Aside type="note">')],
  [/<\/?Tip>/g, (m) => (m === '</Tip>' ? '</Aside>' : '<Aside type="tip">')],
  [/<\/?Info>/g, (m) => (m === '</Info>' ? '</Aside>' : '<Aside type="note">')],
  [/<\/?Warning>/g, (m) => (m === '</Warning>' ? '</Aside>' : '<Aside type="caution">')],
  [/<Warning ([^>]*)>/g, '<Aside type="caution" $1>'],
  [/<Tab(\s|>)/g, (m) => m.replace('<Tab', '<TabItem')],
  [/<TabItem title=/g, '<TabItem label='],
  [/<\/Tab>/g, '</TabItem>'],
  [/<Cards>/g, '<CardGrid>'],
  [/<\/Cards>/g, '</CardGrid>'],
  [/<Card\s/g, '<LinkCard '],
  [/<\/Card>/g, '</LinkCard>'],
  [/<Steps[^>]*>/g, '<Steps>'],
  [/<AccordionGroup>\n?/g, ''],
  [/<\/AccordionGroup>\n?/g, ''],
];

function* walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (e.name.endsWith('.mdx')) yield p;
  }
}

let touched = 0;
const customAnchors = [];
for (const file of walk(ROOT)) {
  let src = fs.readFileSync(file, 'utf8');
  const orig = src;

  // 0. 清掉上一轮注入的 per-file / barrel import（幂等）
  src = src.replace(/^import\s+(Aside|Tabs|TabItem|Steps|Step|Card|CardGrid)\s+from\s+'@astrojs\/starlight\/components(\/[^']+)?';\n/gm, '');

  // 1. 旧 import 行改写（指向不存在的 _components）
  src = src.replace(/^import\s+\{[^}]*CommandTerminal[^}]*\}\s+from\s+["'].*CommandTerminal["'];?\s*$/gm,
    "import CommandTerminal from '@components/CommandTerminal.astro';");
  src = src.replace(/^import\s+\{[^}]*BadgeLinks[^}]*\}\s+from\s+["'].*BadgeLinks["'];?\s*$/gm,
    "import BadgeLinks from '@components/BadgeLinks.astro';");

  // 2. llms 变体标签：保留 llms-ignore 内容，删 llms-only 块
  src = src.replace(/<llms-ignore>\n([\s\S]*?)<\/llms-ignore>/g, '$1');
  src = src.replace(/\n?<llms-only>\n[\s\S]*?<\/llms-only>\n?/g, '\n');

  // 3. 标签改名
  for (const [re, rep] of TAG_RENAMES) src = src.replace(re, rep);

  // 4. JSX 属性 → HTML 属性
  src = src.replace(/\bclassName=/g, 'class=');

  // 5. 统计用到的组件，注入 import（Starlight 走 barrel 单行，自建走默认导入）
  const usedStarlight = STARLIGHT_NAMES.filter((n) => new RegExp(`<${n}[\\s>/]`).test(src));
  const usedCustom = Object.keys(CUSTOM_IMPORTS).filter((n) => new RegExp(`<${n}[\\s>/]`).test(src));
  const missing = [];
  if (usedStarlight.length && !/^import\s+\{[^}]*\}\s+from\s+'@astrojs\/starlight\/components';/m.test(src)) {
    missing.push(`import { ${usedStarlight.join(', ')} } from '@astrojs/starlight/components';`);
  }
  for (const n of usedCustom) {
    if (!new RegExp(`^import\\s+.*\\b${n}\\b\\s+from`, 'm').test(src)) {
      missing.push(`import ${n} from '${CUSTOM_IMPORTS[n]}';`);
    }
  }
  if (missing.length) {
    const block = missing.join('\n') + '\n';
    const fmEnd = src.match(/^---\n[\s\S]*?\n---\n/);
    if (fmEnd) {
      let after = fmEnd[0] + block;
      if (!src.slice(fmEnd[0].length).startsWith('\n')) after += '\n';
      src = after + src.slice(fmEnd[0].length);
    } else {
      src = block + '\n' + src;
    }
  }

  // 6. 补缺失 frontmatter（migrate-gateway-config 无 frontmatter）
  if (!/^---\n/.test(src)) {
    src = '---\ntitle: "Migrate Helm Gateway Configuration to gatewayConfig"\ndescription: "Chart schema v2 replaces application-specific Helm values with one non-secret gatewayConfig map."\n---\n\n' + src;
  }

  // 7. Fern 标题自定义锚点 {#id}：MDX 非法，剥掉并记录（Fern 线上站旧锚点，对照阶段用）
  const headingAnchors = [];
  src = src.replace(/^(#{2,4}\s+[^{\n]*?)\s*\{#([A-Za-z0-9-]+)\}\s*$/gm, (m, text, id) => {
    headingAnchors.push([text.trim(), id]);
    return text.trim();
  });
  if (headingAnchors.length) {
    const rel = path.relative(ROOT, file).replaceAll('\\', '/');
    for (const [text, id] of headingAnchors) customAnchors.push([rel, text, id]);
  }

  if (src !== orig) {
    fs.writeFileSync(file, src);
    touched++;
    console.log('converted', path.relative(ROOT, file));
  }
}
if (customAnchors.length) {
  const out = customAnchors.map(([f, t, id]) => `${f}\t${t}\t${id}`).join('\n');
  fs.writeFileSync(path.resolve(import.meta.dirname, '../scripts/custom-anchors.tsv'),
    'file\theading-en\tfern-anchor\n' + out + '\n');
  console.log('custom anchors recorded:', customAnchors.length);
}
console.log('done,', touched, 'files changed');
