# progress — cli-anything-docs-cn

任务：clianything.cc 全站汉化（issue #1，slug cli-anything，RESUME=0 全新开工）
源：HKUDS/CLI-Anything @ 34f5195 `docs/hub/`（快照 2026-11-25，与线上站逐字节一致已验证）
形态：静态镜像（diagram-design 先例），site/ 即部署产物，零构建

## 阶段

- [x] 探边：sitemap 13 URL；站点源码在上游仓库 docs/hub/；正文全部直接在 HTML 里（无 JS 渲染红线）；Apache-2.0 许可无阻碍
- [x] 批次 0：脚手架（site/ 拷贝 + 4 个数据 JSON 本地化 + 7 处 `../../` 改同目录相对 + GLOSSARY + README + tools/serve.cjs）
- [x] 批次 1：index.html（落地页静态层 + 注册表应用 UI 文案：调色板名/筛选分类全量中文映射/卡片模板/翻转控件/复制反馈/空态；残留扫描 CLEAN）
- [x] 批次 2：docs.html（文档页：TOC/8 节正文/命令卡/退出码/调用块全量汉化，概念树 token 与命令保留英文；残留扫描 CLEAN）
- [x] 批次 3：demos.html（演示页：6 个演示条目标题/简介/元信息/媒体 chrome 全量汉化，harness 名与命令保留；残留扫描 CLEAN）
- [ ] 批次 4：index.md + pricing.md
- [ ] 批次 5：llms.txt + llms-full.txt
- [ ] 批次 6：index-modern.html（线上可达备选首页）
- [ ] 终检：英文残留扫描（剥 script/style/pre/code）+ JS 内 UI 文案复核 + 子路径冒烟
- [ ] 阶段 C：五处同步（sites.json / gen-index / deploy-pages.yml / README 三处 / commit）

## 范围裁决记录

- `matrix.html`：上游 sitemap 死条目（线上 404）→ 不镜像不翻译
- 数据 JSON（registry / public_registry / matrix_registry / registry-dates / openapi / .well-known/*）：红线不译，仅本地拷入保证镜像自包含
- `sitemap.xml` / `robots.txt` / `_config.yml`：快照原样保留（不动）
- 代码块内 `#` 注释译、命令与输出（.ot/.pr/.hl token）不译
- JS 内仅译渲染进 DOM 的 UI 文案（按钮/标签/状态提示/空态），数据字符串与逻辑不动

## 下一步

批次 4：index.md + pricing.md
