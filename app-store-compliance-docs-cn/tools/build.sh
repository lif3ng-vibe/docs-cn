#!/usr/bin/env bash
# 从汉化 Markdown 源（docs/）构建静态镜像 site/。
# 工具链 = 上游原班：Jekyll + jekyll-theme-primer（GitHub Pages 内建构建的本地复现）。
# 前置：ruby >= 3.0，gems：jekyll jekyll-theme-primer jekyll-sitemap jekyll-seo-tag
#       jekyll-relative-links jekyll-optional-front-matter jekyll-titles-from-headings
#   gem install jekyll jekyll-theme-primer jekyll-sitemap jekyll-seo-tag \
#     jekyll-relative-links jekyll-optional-front-matter jekyll-titles-from-headings
set -euo pipefail
cd "$(dirname "$0")/../docs"
# 钉住上游仓库：页脚 "改进此页" 指回上游，css 版本参数取上游仓库标识
export PAGES_REPO_NWO=mjmirza/app-store-compliance
export JEKYLL_ENV=production
jekyll build \
  --source . \
  --destination ../site \
  --baseurl /docs-cn/app-store-compliance
