#!/bin/bash
# build-until-good.sh —— 循环 export 直到浏览器装配判据通过（云渲染偶发坏轮对策）
# 判据：1920 视口硬导航 quickstart，装配后 main ≥800px（坏轮 185）
set -e
S=C:/Users/lif3n/src/docs/ollama-docs-cn
W=/tmp/fresh
V=/tmp/pwtest
cd "$S"

for i in 1 2 3 4; do
  echo "== 第 $i 轮 export"
  rm -rf "$W/docs-cn/ollama"
  npx mintlify export --disable-openapi 2>&1 | tail -1
  mkdir -p "$W/docs-cn/ollama"
  (cd "$W/docs-cn/ollama" && unzip -qo "$S/export.zip" -x "export.zip" "Start Docs.bat" "Start Docs.command" "serve.js")
  rm -f "$S/export.zip"
  node "$S/scripts/inject-theme.mjs" "$W/docs-cn/ollama" 2>&1 | tail -1
  npx pagefind --site "$W/docs-cn/ollama" --force-language zh 2>&1 | grep -E 'Indexed [0-9]+ pages'
  MSYS2_ENV_CONV_EXCL="DOCS_BASE" DOCS_BASE=/docs-cn/ollama node "$S/scripts/prefix-dist.mjs" "$W/docs-cn/ollama" 2>&1 | tail -1
  echo "== 装配判据"
  if node "$V/ollama-verify-hydration.mjs" "http://localhost:3500" 2>/dev/null; then
    echo "GOOD: 第 $i 轮产物装配健康，位于 $W/docs-cn/ollama"
    exit 0
  fi
  echo "  ⚠ 第 $i 轮装配塌陷，重 export"
done
echo "连续 4 轮失败"; exit 1