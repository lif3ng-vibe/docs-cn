#!/bin/bash
# ollama-matrix-check.mjs —— 受控矩阵：同一 export 产物分两份后处理，同刻对比水合宽窄
set -e
S=C:/Users/lif3n/src/docs/ollama-docs-cn
W=/tmp/ollama-matrix
rm -rf "$W" && mkdir -p "$W/base"
cd "$S"
npx mintlify export --disable-openapi 2>&1 | tail -1
(cd "$W/base" && unzip -qo ../export.zip -x "export.zip" "Start Docs.bat" "Start Docs.command" "serve.js")
rm -f export.zip
# A: 仅 prefix（pi 原版规则）
cp -r "$W/base" "$W/distA"
MSYS2_ENV_CONV_EXCL="DOCS_BASE" DOCS_BASE=/docs-cn/ollama node scripts/prefix-dist.mjs distA 2>&1 | tail -1 || true
# B: 全链 inject→pagefind→prefix
cp -r "$W/base" "$W/distB"
node scripts/inject-theme.mjs "$W/distB" 2>&1 | tail -1 || true
npx pagefind --site "$W/distB" --force-language zh 2>&1 | grep -E 'Indexed|Discovered' || true
node scripts/prefix-dist.mjs "$W/distB" 2>&1 | tail -1 || true
echo "MATRIX-READY: $W/distA (仅prefix) / $W/distB (全链)"