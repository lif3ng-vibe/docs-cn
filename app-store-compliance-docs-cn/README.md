# app-store-compliance-docs-cn

App Store Compliance Playbook 官方文档站中文镜像（**非官方翻译**）。

- 原站：<https://mjmirza.github.io/app-store-compliance/>
- 上游仓库：<https://github.com/mjmirza/app-store-compliance>（快照 `5ee6c45c`，2026-11-25）
- 上游站点形态：GitHub Pages 内建 Jekyll（`docs/` 源目录 + `jekyll-theme-primer`）
- 本仓库部署路径：<https://lif3ng-vibe.github.io/docs-cn/app-store-compliance/>

## 目录结构

```text
app-store-compliance-docs-cn/
├── docs/                  # 汉化 Markdown 源（Jekyll 工程：_config.yml + 33 篇 md + llms.txt）
│   └── _layouts/default.html   # 覆盖主题 layout：仅页脚两句 UI 文案汉化，其余与主题 gem 逐字节一致
├── site/                  # 构建产物（静态镜像，hub CI 纯拷贝部署的就是它）
├── tools/build.sh         # site/ 的重建脚本（上游原班 Jekyll 工具链）
├── GLOSSARY.md            # 术语表（翻译注入材料 + 终检 grep 清单）
└── .translation-state/    # CI 翻译状态（STATUS / progress）
```

## 本地构建

前置：Ruby ≥ 3.0 与上游同款 gem：

```bash
gem install jekyll jekyll-theme-primer jekyll-sitemap jekyll-seo-tag \
  jekyll-relative-links jekyll-optional-front-matter jekyll-titles-from-headings
./tools/build.sh   # docs/ → site/（baseurl 已带 /docs-cn/app-store-compliance/）
```

## 翻译范围与口径

- 全站 33 篇 Markdown + `llms.txt` 全量汉化；`_config.yml` 的 title/description 同译。
- 只译可见正文与 UI 文案；URL、法条编号、指南编号、代码、数据一律不动。
- 上游站点配置改动仅四处（详见 `docs/_config.yml` 注释）：`url`/`baseurl`/`lang`，
  增加 `defaults.layout`（复现 GitHub Pages 服务端的默认 layout 注入），
  增加 `repository`/`github` 块（页脚"改进此页"指回上游），
  不迁移上游的站长验证（`webmaster_verifications` 与验证 txt，属上游站点所有权声明）。
- 5 处指向仓库根文件的 `](../…)` 链接在上游线上站本就是死链，已改指 GitHub blob URL。

## 声明

本项目是对上游文档的一次性快照翻译（非官方），仅供中文读者参考；内容的时效性与准确性以
[上游原文](https://mjmirza.github.io/app-store-compliance/) 为准。上游后续更新不会自动同步，
重新翻译请以快照 commit `5ee6c45c` 为底稿 diff。
