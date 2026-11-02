# Lightpanda 文档汉化术语表

> 本表是全站翻译的统一依据。侧边栏标题（_meta.ts 译文）与各页 frontmatter title 必须一致，定稿见「标题定稿表」。

## 核心术语

| 英文 | 中文 | 说明 |
|---|---|---|
| headless browser | 无头浏览器 | |
| browser automation | 浏览器自动化 | |
| web scraping | 网页抓取 | |
| crawl / crawler | 抓取 / 爬虫 | |
| fetch（动词） | 获取 / 抓取 | 视语境；CLI 子命令名 fetch 不译 |
| agent | Agent | AI agent 语境不译；泛指"代理/智能体"时仍用 Agent |
| harness | harness（编排框架） | 首次出现附英文 |
| MCP | MCP | 不译 |
| CDP | CDP | 首次出现附「Chrome DevTools 协议（CDP）」 |
| WebDriver BiDi | WebDriver BiDi | 不译 |
| endpoint | 端点 | |
| proxy | 代理 | |
| token | token | API 鉴权语境不译 |
| DOM | DOM | 不译 |
| accessibility tree / AX tree | 无障碍树（accessibility tree） | |
| sandbox | 沙箱 | |
| session | 会话 | CDP Session 语境 |
| frame | frame | CDP 结构语境不译，普通语境译"框架" |
| cookie jar | Cookie 存储 | |
| V8 isolate | V8 isolate | 不译 |
| throughput | 吞吐量 | |
| memory footprint | 内存占用 | |
| benchmark | 基准测试 | |
| concurrency | 并发 | |
| Playground | Playground | 产品功能名不译 |
| Skill | Skill | agent 技能语境不译 |
| PandaScript | PandaScript | 产品名不译 |
| Hermes | Hermes | 产品名不译 |
| Stagehand | Stagehand | 产品名不译 |
| lightpanda serve/fetch/mcp/agent | 不译 | CLI 子命令 |
| build from sources | 从源码构建 | |
| nightly builds | Nightly 构建 | |
| one-liner | 一行命令安装 | |
| package manager | 包管理器 | |
| system requirements | 系统要求 | |
| limits | 限额 | |
| billing | 计费 | |
| token（计费语境） | 积分 | Cloud 计费上下文若指消耗单位，按原文语义判断 |
| cloud | Cloud | 指 Lightpanda Cloud 产品时大写不译 |
| local | 本地 | |
| official | 官方 | |
| guide | 指南 | |
| quickstart | 快速上手 | |
| reference | 参考 | |
| usage | 用法 | |

## 排版规则（强制）

- 中文全角标点（，。：；？！、（）""——）；中英文/数字之间一个半角空格；代码内半角。
- 引号统一用 ""；破折号——不带空格。
- 「接入」不用「接线」；「某次变更」不用「一次变更」。
- **粗体闭合**：闭合 `**` 前不能是标点且紧跟文字。句读移出粗体：`**……。**后文` ✗ → `**……**。后文` ✓；`**标题：**正文` → `**标题**：正文`；`**词（gloss）**后文` → `**词**（gloss）后文`。
- 术语首次出现附英文原词：无头浏览器（headless browser）。

## 不译清单

代码块、命令、CLI 子命令、MCP 工具名、环境变量（`XXX_*`）、产品/工具名（Lightpanda、MCP、CDP、Puppeteer、Playwright、Selenium、Chromedp、Stagehand、Hermes、Node、npm、Docker、git、Zig、V8）、配置键、API 方法名、路径、报错原文、表格中的 Method/命令/取值列。代码块内工具输出原样保留；代码块外说明文字要译；` ``` ` 围栏的 info string（如 ```js copy）不动。

## 标题定稿表（sidebar = frontmatter title，两边严格一致）

| 路径 | 英文 | 中文定稿 |
|---|---|---|
| index | Introduction | 简介 |
| quickstarts/（目录） | Quickstarts | 快速上手 |
| quickstarts/skill | Skill | Skill |
| quickstarts/agent | Agent | Agent |
| quickstarts/mcp | MCP | MCP |
| quickstarts/puppeteer-playwright-clients | Puppeteer, Playwright & other client libraries | Puppeteer、Playwright 及其他客户端库 |
| run-locally/（目录） | Run locally | 本地运行 |
| run-locally/commands | Commands | 命令 |
| run-locally/installation/（目录） | Installation | 安装 |
| run-locally/installation/one-liner | One-liner | 一行命令安装 |
| run-locally/installation/docker | Docker | Docker |
| run-locally/installation/package-managers | Package manager | 包管理器 |
| run-locally/installation/nightly-builds | Nightly builds | Nightly 构建 |
| run-locally/installation/system-requirements | System requirements | 系统要求 |
| run-locally/installation/build-from-sources | Build from sources | 从源码构建 |
| run-on-lightpanda-cloud/（目录） | Run on Lightpanda Cloud | 使用 Lightpanda Cloud |
| run-on-lightpanda-cloud/getting-started | Getting started | 入门 |
| run-on-lightpanda-cloud/playground | Playground | Playground |
| run-on-lightpanda-cloud/limits-and-billing | Limits and billing | 限额与计费 |
| usage/（目录） | Usage | 用法 |
| usage/agent | Agent | Agent |
| usage/api | HTTP API | HTTP API |
| usage/mcp | MCP | MCP |
| usage/pandascript | PandaScript | PandaScript |
| usage/cdp/（目录） | CDP | CDP |
| usage/cdp/puppeteer | Puppeteer | Puppeteer |
| usage/cdp/playwright | Playwright | Playwright |
| usage/cdp/chromedp | Chromedp | Chromedp |
| usage/bidi/（目录） | WebDriver | WebDriver |
| usage/bidi/puppeteer | Puppeteer | Puppeteer |
| usage/bidi/selenium | Selenium | Selenium |
| guides/（目录） | Guides | 指南 |
| guides/lightpanda-agent-tutorial | Use Lightpanda Agent | 使用 Lightpanda Agent |
| guides/retrieve-an-html-webpage | Retrieve an HTML webpage | 获取 HTML 网页 |
| guides/configure-a-proxy | Use a proxy | 使用代理 |
| guides/markdown-axtree | Get Markdown and AX Tree | 获取 Markdown 与无障碍树 |
| guides/interact-with-a-webpage | Interact with a webpage | 与网页交互 |
| guides/use-python | Use the Python SDK | 使用 Python SDK |
| guides/use-stagehand | Use Stagehand | 使用 Stagehand |
| guides/use-hermes | Use Hermes Agent | 使用 Hermes Agent |
| core-concepts/（目录） | Core concepts | 核心概念 |
| core-concepts/what-is-lightpanda | What is Lightpanda? | Lightpanda 是什么？ |
| core-concepts/architecture-overview | Architecture overview | 架构总览 |
| core-concepts/local-vs-cloud | When to use local vs cloud | 本地与 Cloud 的选择 |
| core-concepts/benchmarks | Benchmarks | 基准测试 |
| reference/（目录） | Reference | 参考 |
| reference/cli/（目录） | CLI | CLI |
| reference/cli/index | Overview | 总览 |
| reference/cli/fetch | Fetch | fetch 命令 |
| reference/cli/serve | CDP server | CDP 服务器 |
| reference/cli/mcp | MCP | MCP |
| reference/cli/agent | Agent | Agent |
| reference/cli/common-options | Common options | 通用选项 |
| reference/http-api | HTTP API | HTTP API |
| reference/browser-tools | Browser tools | 浏览器工具 |
| reference/mcp-tools | MCP tools | MCP 工具 |
| reference/pandascript | PandaScript | PandaScript |
| reference/python | Python SDK | Python SDK |

## 锚点映射要求

每个译文文件在 `.anchor-maps/<批次>/<文件名>.map.md` 产出映射行（管道分隔）：

```
原英文标题 | 中文标题 | 新锚点
```

新锚点用 github-slugger 规则：小写、空格转 `-`、保留 CJK、去掉标点（全角标点一并去除）。正文中所有 `#英文锚点` 内链（含本页与其他页）保持原样不动，由主线程统一回修。
