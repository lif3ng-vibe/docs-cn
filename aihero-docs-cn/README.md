# AI Hero 官网中文镜像（aihero-docs-cn）

非官方汉化镜像：[AI Hero](https://www.aihero.dev/)（Matt Pocock 的 AI 工程学习平台）整站中文版。

- **上游快照**：https://www.aihero.dev/ ，2026-10-30 抓取（sitemap 205 页 + 补充 app 页，共 208 页）
- **镜像形态**：上游为闭源 Next.js 站（无公开源码仓库）→ 按「HTML 镜像 + flight 数据同步汉化」路线：抓取渲染后 HTML 与全部静态资产（~420 个），译文回填正文文本/属性/meta/RSC flight payload 四层，保留原站全部界面交互与布局样式
- **部署路径**：`/docs-cn/aihero/`（`site/` 目录即最终产物，CI 直接 Collect，无构建）

## 内容范围

| 板块 | 页数 | 说明 |
|---|---|---|
| 文章（posts） | ~70 | Claude Code / MCP / Vercel AI SDK / 提示词工程等 |
| AI 编码词典 | 71 | 上游开源仓库 `mattpocock/dictionary-of-ai-coding` 提供英文源文本 |
| Skills 讲解 | 30 | /grill-me、/tdd、/to-spec 等技能逐篇详解 |
| Learn 系列 | ~12 | LLM/token/上下文窗口/工具/智能体入门 |
| Sandcastle 文档 | 9 | 沙箱产品文档 |
| Workshops | 3 | 研讨课 |
| 落地/app 页 | ~13 | 首页、课程、FAQ、路线图等 |

**有意不做**（指回原站）：
- 视频课程：Mux 播放器 hydration 后替换为占位卡（保布局），链接指向原站观看
- 支付/订阅/报名：cohorts 报名页、登录、checkout 一律指回原站；站内表单提交被镜像脚本拦截并提示
- 运行时端点：`/api/*`、rss、llms.txt 等指回原站

## 管线（pipeline/，仅开发期使用）

```
download.mjs    抓 208 页 + 资产到 site/（英文基线自动存 data/site-en-baseline/）
twins.mjs       抓 .md twins（posts/skills/learn 的官方 markdown 源）
dict-twins.mjs  词典 71 页 twins（来自上游开源仓库）
extract.mjs     从 HTML 正文 + RSC flight payload 抽取翻译字符串 → data/strings/
plan-batches.mjs 按板块分 30 批 → data/batches/
apply.mjs       译文回填（文本/属性/meta/flight 四层）+ URL 前缀 /docs-cn/aihero/
                + 支付外指 + mirror.js 注入 + sitemap 生成
verify.mjs      终检：内链完整性 / flight 可解析 / CJK 覆盖 / 残留扫描
mirror.js       运行时增强：内链整页跳转（镜像无 RSC 端点）、视频占位、表单拦截
```

交互保留说明：内链点击由 mirror.js 拦截降级为整页加载（Next 客户端路由依赖 RSC fetch 端点，静态镜像不存在）；页面内交互（主题、搜索浮层、目录、播放器 UI）经 hydration 原样保留。

## 本地查看

```bash
cd site && python -m http.server 8080   # 或任意静态服务器；注意子路径镜像内链是 /docs-cn/aihero/，本地预览建议直接部署后验证
```

翻译口径见 [GLOSSARY.md](GLOSSARY.md)；术语分歧按 hub 管线在终检统一。
