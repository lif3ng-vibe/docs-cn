#!/bin/bash
# ollama 排查实验管线：复制源 → 改 docs.json 变体 → export → prefix → 报告
# 用法: bash scripts/ollama-exp-pipeline.sh <变体: api|redir|plain>
set -e
W=/tmp/ollama-exp
S=C:/Users/lif3n/src/docs/ollama-docs-cn
rm -rf "$W" && mkdir -p "$W"
cd "$S"
cp -r docs.json styling.css favicon.svg favicon-dark.svg logo.svg ollama-logo.svg ollama.png images api capabilities integrations v1 "$W/"
cp *.mdx "$W/"
cd "$W"
node -e "
const fs=require('fs');
const d=JSON.parse(fs.readFileSync('docs.json','utf8'));
const v=process.argv[2];
switch (v) {
  case 'api': delete d.api; break;
  case 'tabs': d.navigation = { tabs: [ { ...d.navigation.tabs.filter(t=>t.tab==='指南')[0] } ] }; break;
  case 'redir': delete d.redirects; break;
  case 'plain': delete d.api; delete d.redirects; d.navigation={groups:[{group:'G',pages:['index','quickstart','cloud']}]}; break;
  default: break;
}
fs.writeFileSync('docs.json',JSON.stringify(d,null,2));
console.log('变体', v, '| tabs=', (d.navigation.tabs||[]).length, '| api=', !!d.api, '| redirects=', (d.redirects||[]).length);
" "$1"
npx --yes mintlify@4.2.994 export --disable-openapi 2>&1 | tail -1
mkdir -p dist && (cd dist && unzip -qo ../export.zip -x "export.zip" "Start Docs.bat" "Start Docs.command" "serve.js") && rm -f export.zip
MSYS2_ENV_CONV_EXCL="DOCS_BASE" DOCS_BASE=/docs-cn/ollama node "$S/scripts/prefix-dist.mjs" 2>&1 | tail -1
echo "EXP-DONE 变体=$1 产物=$W/dist"