// 一次性脚本：给拷贝来的英文源 md 加 Starlight frontmatter（title/description/source）。
// title 取首个 # 标题去掉 Markdown 记法；description 取首个非引用/非表格的正文段落，截 180 字符。
// 已有 frontmatter 的文件跳过。
const fs = require('fs');
const path = require('path');

const DIR = process.argv[2];
const SRC_BASE = 'https://github.com/akitaonrails/ai-memory/blob/main/';

const TITLE_OVERRIDES = {
	'index.md': null, // 已手工维护
	'auto-improve-eval.md': 'Auto-Improve Eval Example Scorers',
};

function firstHeading(text) {
	const m = text.match(/^#\s+(.+)$/m);
	return m ? m[1].trim() : null;
}

function stripMd(s) {
	return s
		.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
		.replace(/[*_`]/g, '')
		.replace(/\s+/g, ' ')
		.trim();
}

function firstParagraph(text) {
	const lines = text.split('\n');
	let inCode = false;
	const out = [];
	for (const line of lines) {
		if (line.trim().startsWith('```')) { inCode = !inCode; continue; }
		if (inCode) continue;
		if (line.startsWith('#') || line.startsWith('>') || line.startsWith('|') || line.startsWith('![')) continue;
		if (!line.trim()) { if (out.length) break; continue; }
		if (line.trim().startsWith('- ') || /^\s/.test(line)) { if (out.length) break; continue; }
		out.push(line.trim());
	}
	return stripMd(out.join(' ')).slice(0, 180);
}

for (const f of fs.readdirSync(DIR)) {
	if (!f.endsWith('.md')) continue;
	const p = path.join(DIR, f);
	const raw = fs.readFileSync(p, 'utf8');
	if (raw.startsWith('---')) { console.log('skip (has fm):', f); continue; }
	const title = TITLE_OVERRIDES[f] ?? firstHeading(raw) ?? f.replace(/\.md$/, '');
	const desc = firstParagraph(raw);
	const source = SRC_BASE + (f === 'auto-improve-eval.md' ? 'docs/examples/auto-improve-eval/README.md' : (f === 'index.md' ? '' : 'docs/' + f));
	const fm = `---\ntitle: "${title.replace(/"/g, '\\"')}"\ndescription: "${desc.replace(/"/g, '\\"')}"\nsource: "${source}"\n---\n\n`;
	fs.writeFileSync(p, fm + raw);
	console.log('ok:', f);
}
