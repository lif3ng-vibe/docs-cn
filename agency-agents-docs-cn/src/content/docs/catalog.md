---
title: '🎭 代理公司（The Agency）：一支随时准备变革你工作流的 AI 专家团队'
---

# 🎭 代理公司（The Agency）：一支随时准备变革你工作流的 AI 专家团队

> **一家触手可及的完整 AI 代理公司**——从前端奇才到 Reddit 社区忍者，从趣味注入者到现实核查者。每个智能体都是一位拥有个性、流程与经过验证的交付物的专家。

[![GitHub stars](https://img.shields.io/github/stars/msitarzewski/agency-agents?style=social)](https://github.com/msitarzewski/agency-agents)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://makeapullrequest.com)
[![Sponsor](https://img.shields.io/badge/Sponsor-%E2%9D%A4-pink?logo=github)](https://github.com/sponsors/msitarzewski)
[![Download the app](https://img.shields.io/github/v/release/msitarzewski/agency-agents-app?label=Download%20app&color=2563eb)](https://github.com/msitarzewski/agency-agents-app/releases/latest)

> ### 🆕 现在有应用了
>
> **[Agency Agents](https://agencyagents.app)** 是一款 **macOS、Linux 与 Windows** 原生应用，可以浏览整个名册（roster），并一键把智能体安装进 Claude Code、Cursor、Codex、Gemini、Osaurus 等工具。无需 clone，无需脚本，还会自动更新。
>
> **→ [下载最新版本](https://github.com/msitarzewski/agency-agents-app/releases/latest) · [agencyagents.app](https://agencyagents.app)**

---

## 🚀 这是什么？

诞生自一条 Reddit 帖子和数月的迭代，**代理公司**（The Agency）是一个不断壮大的 AI 智能体人格合集，每一款都经过精心打磨。每个智能体都：

- **🎯 高度专业化**：在各自领域有深厚专长（而非通用提示词模板）
- **🧠 人格驱动**：独有声线、沟通风格与做事方式
- **📋 交付物导向**：真实的代码、流程与可度量的成果
- **✅ 生产就绪**：久经考验的工作流与成功指标

**可以这样理解**：就像组建你的梦之队——只不过队员是永不睡觉、从不抱怨、总能交付的 AI 专家。

---

## ⚡ 快速开始

### 方式 1：安装应用（推荐）

最快的上手方式——不用 clone，不用终端。[**Agency Agents**](https://agencyagents.app) 是一款原生桌面应用（macOS · Linux · Windows），会浏览整个名册，替你把智能体安装进 Claude Code、Cursor、Codex、Gemini CLI、OpenCode、Qwen 和 Osaurus，并保持它们为最新。

**[⬇ 下载最新版本](https://github.com/msitarzewski/agency-agents-app/releases/latest)**——或在 Mac 上：

```bash
brew install --cask msitarzewski/agency-agents/agency-agents
```

更偏爱命令行？下面的脚本方式安装的是同一批智能体。

### 方式 2：配合 Claude Code 使用

```bash
# 把所有智能体安装到你的 Claude Code 目录
./scripts/install.sh --tool claude-code

# 如果只想要某个部门，也可以手动复制一个类别
cp engineering/*.md ~/.claude/agents/

# 然后在你的 Claude Code 会话中激活任意智能体：
# "Hey Claude, activate Frontend Developer mode and help me build a React component"
```

### 方式 3：作为参考使用

每个智能体文件包含：
- 身份与性格特质
- 核心使命与工作流
- 带代码示例的技术交付物
- 成功指标与沟通风格

浏览下面的智能体，把需要的复制/改造过来吧！

### 方式 4：配合其他工具使用（GitHub Copilot、Antigravity、Gemini CLI、OpenCode、OpenClaw、Cursor、Aider、Windsurf、Kimi Code、Codex、Osaurus、Hermes、Mistral Vibe、DeepSeek Harness）

```bash
# 第 1 步——为所有受支持的工具生成集成文件
./scripts/convert.sh

# 第 2 步——交互式安装（自动检测你装了哪些工具）
./scripts/install.sh

# 或者直接指定某个工具
./scripts/install.sh --tool antigravity
./scripts/install.sh --tool gemini-cli
./scripts/install.sh --tool opencode
./scripts/install.sh --tool copilot
./scripts/install.sh --tool openclaw
./scripts/install.sh --tool cursor
./scripts/install.sh --tool aider
./scripts/install.sh --tool windsurf
./scripts/install.sh --tool kimi
./scripts/install.sh --tool codex
./scripts/install.sh --tool osaurus
./scripts/install.sh --tool hermes
./scripts/install.sh --tool vibe
./scripts/install.sh --tool dsh
```

**只安装你需要的团队**（不是每个人都想要所有部门）：

```bash
./scripts/install.sh                                    # 交互式向导：挑选工具 + 团队
./scripts/install.sh --tool claude-code --division engineering,security
./scripts/install.sh --tool cursor --agent frontend-developer,ui-designer
./scripts/install.sh --list teams                       # 查看所有团队 + 智能体数量
./scripts/install.sh --tool opencode --division engineering --dry-run
```

`--agent` 和 `--agents-file` 接受智能体的 slug（即 `--list agents` 打印的值）、显示名，或去掉 `.md` 的文件名——也就是[场景手册（runbook）名册](/strategy/runbooks.json)所用的 id——这样某个 runbook 团队就会按清单原样安装：

```bash
python3 -c 'import json, sys
for r in json.load(open("strategy/runbooks.json"))["runbooks"]:
    if r["slug"] == sys.argv[1]: [print(a) for g in r["roster"] for a in g["agents"]]' startup-mvp > team.txt
./scripts/install.sh --tool claude-code --agents-file team.txt
```

> **OpenCode 说明**：OpenCode 运行时目前只能注册约 119 个智能体，其余会被静默丢弃（[上游 bug](https://github.com/anomalyco/opencode/issues/27988)）。用 `--division` 安装子集可保持在该限制之下。当所选数量会超过限制时，安装器会给出警告。

完整细节见下文的[多工具集成](#-多工具集成)章节。

---

## 🎨 代理公司名册

### 💻 工程部门

一次一个 commit，构建未来。

| 智能体 | 专长 | 何时使用 |
|-------|-----------|-------------|
| 🎨 [Frontend Developer](/engineering/engineering-frontend-developer/) | React/Vue/Angular、UI 实现、性能 | 现代 Web 应用、像素级还原的 UI、Core Web Vitals 优化 |
| 🏗️ [Backend Architect](/engineering/engineering-backend-architect/) | API 设计、数据库架构、可扩展性 | 服务端系统、微服务、云基础设施 |
| 📱 [Mobile App Builder](/engineering/engineering-mobile-app-builder/) | iOS/Android、React Native、Flutter | 原生与跨平台移动应用 |
| 🤖 [AI Engineer](/engineering/engineering-ai-engineer/) | ML 模型、部署、AI 集成 | 机器学习功能、数据流水线、AI 驱动的应用 |
| 🚀 [DevOps Automator](/engineering/engineering-devops-automator/) | CI/CD、基础设施自动化、云运维 | 流水线开发、部署自动化、监控 |
| 🌐 [Network Engineer](/engineering/engineering-network-engineer/) | Cisco IOS/IOS-XE、Juniper Junos、Palo Alto PAN-OS | 路由器/交换机/防火墙配置、BGP/OSPF、ACL、show 输出排障 |
| ⚡ [Rapid Prototyper](/engineering/engineering-rapid-prototyper/) | 快速 POC 开发、MVP | 快速概念验证、黑客马拉松项目、快速迭代 |
| 💎 [Senior Developer](/engineering/engineering-senior-developer/) | Laravel/Livewire、高级模式 | 复杂实现、架构决策 |
| 🔧 [Filament Optimization Specialist](/engineering/engineering-filament-optimization-specialist/) | Filament PHP 后台 UX、结构化表单重构、资源优化 | 为更快更清爽的后台工作流重构 Filament 的 resources/forms/tables |
| ⚡ [Autonomous Optimization Architect](/engineering/engineering-autonomous-optimization-architect/) | LLM 路由、成本优化、影子测试 | 需要智能 API 选型与成本护栏的自治系统 |
| 🔩 [Embedded Firmware Engineer](/engineering/engineering-embedded-firmware-engineer/) | 裸机、RTOS、ESP32/STM32/Nordic 固件 | 生产级嵌入式系统与 IoT 设备 |
| 🚨 [Incident Response Commander](/engineering/engineering-incident-response-commander/) | 事故管理、事后复盘、值班响应 | 管理生产事故、建立事故响应就绪度 |
| ⛓️ [Solidity Smart Contract Engineer](/engineering/engineering-solidity-smart-contract-engineer/) | EVM 合约、gas 优化、DeFi | 安全且 gas 优化的智能合约与 DeFi 协议 |
| 🧭 [Codebase Onboarding Engineer](/engineering/engineering-codebase-onboarding-engineer/) | 快速开发者上手、只读代码库探索、事实性讲解 | 通过阅读代码、追踪代码路径、陈述结构与行为事实，帮助新开发者快速理解陌生仓库 |
| 📚 [Technical Writer](/engineering/engineering-technical-writer/) | 开发者文档、API 参考、教程 | 清晰准确的技术文档 |
| 💬 [WeChat Mini Program Developer](/engineering/engineering-wechat-mini-program-developer/) | 微信生态、小程序、支付集成 | 为微信生态构建高性能应用 |
| 👁️ [Code Reviewer](/engineering/engineering-code-reviewer/) | 建设性代码评审、安全、可维护性 | PR 评审、代码质量关卡禁、以评审带教 |
| 🗄️ [Database Optimizer](/engineering/engineering-database-optimizer/) | Schema 设计、查询优化、索引策略 | PostgreSQL/MySQL 调优、慢查询排查、迁移规划 |
| 🌿 [Git Workflow Master](/engineering/engineering-git-workflow-master/) | 分支策略、约定式提交、高级 Git | Git 工作流设计、历史清理、对 CI 友好的分支管理 |
| 🏛️ [Software Architect](/engineering/engineering-software-architect/) | 系统设计、DDD、架构模式、权衡分析 | 架构决策、领域建模、系统演进策略 |
| 🛡️ [SRE](/engineering/engineering-sre/) | SLO、错误预算、可观测性、混沌工程 | 生产可靠性、琐务削减、容量规划 |
| 🧬 [AI Data Remediation Engineer](/engineering/engineering-ai-data-remediation-engineer/) | 自愈式流水线、离线隔离的 SLM、语义聚类 | 零数据丢失地大规模修复损坏数据 |
| 🔧 [Data Engineer](/engineering/engineering-data-engineer/) | 数据流水线、湖仓架构、ETL/ELT | 构建可靠的数据基础设施与数据仓库 |
| 🔗 [Feishu Integration Developer](/engineering/engineering-feishu-integration-developer/) | 飞书/Lark 开放平台、机器人、工作流 | 为飞书生态构建集成 |
| 🧱 [CMS Developer](/engineering/engineering-cms-developer/) | WordPress 与 Drupal 主题、插件/模块、内容架构 | 代码优先的 CMS 实现与定制 |
| 📧 [Email Intelligence Engineer](/engineering/engineering-email-intelligence-engineer/) | 邮件解析、MIME 提取、面向 AI 智能体的结构化数据 | 把原始邮件往来变成可供推理的上下文 |
| 🎙️ [Voice AI Integration Engineer](/engineering/engineering-voice-ai-integration-engineer/) | 语音转文字流水线、Whisper、ASR、说话人分离 | 端到端转写流水线、音频预处理、结构化转写交付 |
| 🖧 [IT Service Manager](/engineering/engineering-it-service-manager/) | ITIL 4 服务管理 | 事件/问题/变更管理、SLA、CMDB |
| 🪡 [Minimal Change Engineer](/engineering/engineering-minimal-change-engineer/) | 最小可行 diff | 只修被要求的部分，绝不扩大范围 |
| 📜 [OrgScript Engineer](/engineering/engineering-orgscript-engineer/) | OrgScript 语法与 AST 校验 | 设计/解析 OrgScript 业务逻辑定义 |
| 🧬 [Prompt Engineer](/engineering/engineering-prompt-engineer/) | LLM 提示词设计与优化 | 把模糊指令变成可靠的 AI 行为 |
| 🕸️ [Multi-Agent Systems Architect](/engineering/engineering-multi-agent-systems-architect/) | 多智能体流水线设计与治理 | 智能体系统的拓扑、上下文、信任与故障恢复 |
| 🛒 [Drupal Shopping Cart Engineer](/engineering/engineering-drupal-shopping-cart/) | Drupal Commerce 店面 | Drupal 10/11 上的目录、支付、结账、订单 |
| 🛍️ [WordPress Shopping Cart Engineer](/engineering/engineering-wordpress-shopping-cart/) | WooCommerce 店面 | WordPress 上的目录、支付、结账、转化 |
| 💳 [Payments & Billing Engineer](/engineering/engineering-payments-billing-engineer/) | PSP 集成、幂等支付流、订阅计费 | Stripe/Adyen/Braintree 集成、webhook 处理、催款、对账 |
| 🌍 [Internationalization Engineer](/engineering/engineering-i18n-engineer/) | ICU MessageFormat、RTL/bidi 布局、CLDR 格式化、伪本地化 | 让应用做好翻译准备、区域感知格式化、RTL 支持、i18n 审计 |
| ⚡ [Drupal Performance Engineer](/engineering/engineering-drupal-performance/) | Drupal 性能与 Core Web Vitals | 缓存、数据库/查询调优、渲染流水线、高流量 Drupal 剖析 |
| ⚡ [WordPress Performance Engineer](/engineering/engineering-wordpress-performance/) | WordPress 性能与 Core Web Vitals | 缓存、查询/资源优化、插件调优、高流量 WP 剖析 |
| ♿ [Section 508 Accessibility Specialist](/engineering/engineering-section-508-specialist/) | 美国联邦 508 / WCAG 无障碍 | ARIA、屏幕阅读器测试、VPAT/ACR 撰写、整改 |
| 🏛️ [USWDS Developer](/engineering/engineering-uswds-developer/) | 美国网页设计系统（联邦） | 无障碍的政府 UI 组件与设计系统模式 |
| 🔎 [Search Relevance Engineer](/engineering/engineering-search-relevance-engineer/) | 搜索排序与相关性 | 查询理解、embeddings、排序/评测、相关性调优 |
| 🔐 [Identity & Access Engineer](/engineering/engineering-identity-access-engineer/) | AuthN/AuthZ 与 IAM | OAuth/OIDC/SAML、SSO、RBAC/ABAC、令牌与会话安全 |
| 🤝 [Realtime Collaboration Engineer](/engineering/engineering-realtime-collaboration-engineer/) | 实时同步与在线状态 | CRDT/OT、冲突解决、实时光标、离线同步 |
| 💻 [Desktop App Engineer](/engineering/engineering-desktop-app-engineer/) | 跨平台桌面应用 | Electron/Tauri、原生集成、打包、自动更新 |
| 🚀 [Mobile Release Engineer](/engineering/engineering-mobile-release-engineer/) | 移动应用发布与 CI/CD | App Store/Play 提审、签名、分阶段放量、崩溃分诊 |
| 🎬 [Video Streaming Engineer](/engineering/engineering-video-streaming-engineer/) | 视频流与转码 | HLS/DASH、ABR、编解码器、CDN 分发、低延迟直播 |
| 💰 [FinOps Engineer](/engineering/engineering-finops-engineer/) | 云成本工程 | 成本分摊、资源规格优化、单位经济、预算与异常管控 |
| 🧩 [WebAssembly Engineer](/engineering/engineering-webassembly-engineer/) | WebAssembly 与 WASI | Rust/C++→WASM、沙箱、宿主绑定、性能 |
| 🔌 [API Platform Engineer](/engineering/engineering-api-platform-engineer/) | API 网关与平台 | 网关设计、版本管理、限流、开发者门户 |
| 🛟 [Database Reliability Engineer](/engineering/engineering-database-reliability-engineer/) | 数据库可靠性（DBRE） | 高可用/复制、自动故障转移、PITR 备份、零停机运维 |
| 🛠️ [Developer Tooling Engineer](/engineering/engineering-developer-tooling-engineer/) | CLI 与开发者工具链 | 命令行工具、内部 DX、构建/开发工作流 |
| 📡 [IoT Fleet Engineer](/engineering/engineering-iot-fleet-engineer/) | IoT 与边缘机群 | 设备预配/身份、MQTT 遥测、OTA 更新 |
| 🔍 [RAG Pipeline Engineer](/engineering/engineering-rag-pipeline-engineer/) | 生产级 RAG 流水线 | 分块、检索质量、混合搜索、重排序、评测驱动迭代 |
| 🗄️ [GaussDB Expert Engineer](/engineering/engineering-gaussdb-expert/) | 华为 GaussDB OLTP | 华为 GaussDB 上的企业级 OLTP 性能、高可用与迁移 |
| 🕵️ [Privacy Engineer](/engineering/engineering-privacy-engineer/) | PII 发现、数据最小化、同意执行、DSAR/删除流水线 | 在代码中落实隐私、跨服务实现被遗忘权、留存自动化 |
| 🦀 [Rust Refactoring Specialist](/engineering/engineering-rust-refactoring-specialist/) | 行为感知的 Rust 重构 | 以证据为依据、保持行为不变地改造 crates/traits/modules |
| 🧪 [LLM Post-Training Engineer](/engineering/engineering-llm-post-training-engineer/) | 后训练技术栈（SFT/DPO/GRPO/RLVR） | 以证据为依据的实验门控、检查点完整性、失败分类 |
| 📈 [Data Visualization Engineer](/engineering/engineering-data-visualization-engineer/) | 感知上诚实的数据可视化 | 图表类型选择、色盲安全配色、高性能 D3/Vega 渲染 |
| 🧠 [Knowledge Graph Engineer](/engineering/engineering-knowledge-graph-engineer/) | 知识图谱、实体关系抽取、图增强 RAG | 用 LangGraph 把文档结构化为可查询的 Neo4j 图；溯源、矛盾追踪、子图检索 |
| 🌏 [China Network Engineer](/engineering/engineering-china-network-engineer/) | 华为 VRP、H3C Comware、Ruijie RGOS、Hillstone StoneOS | 路由/交换/防火墙设计、NAT、等保 2.0（MLPS 2.0）合规边界、带回滚方案的变更窗口 |
| 🛤️ [Platform Engineer](/engineering/engineering-platform-engineer/) | 内部开发者平台、黄金路径、IDP、自助式基础设施 | 铺路式脚手架、开发者体验度量、平台即产品路线图 |
| 📑 [PDF Engine Architect](/engineering/engineering-pdf-engine-architect/) | 确定性的 HTML 转 PDF 编译、带标签的 PDF/UA 与 PDF/A | Playwright 渲染池、动态页面尺寸、档案级文档输出 |
| 🎯 [ATS Validator Architect](/engineering/engineering-ats-validator-architect/) | 简历可解析性、ATS 摄取流水线 | BM25/TF-IDF 相关性评分、版式线性化审计、EU AI Act 与 NYC LL144 合规 |
| 📑 [Universal Document Compiler](/engineering/engineering-universal-document-compiler/) | 与 schema 无关的文档 AST、数据形态版式推断、分页出版 | 把任意 YAML 树编译成提案、技术规格与高管卷宗 |
| 🛠️ [ServiceNow Developer & Mentor](/engineering/engineering-servicenow-developer-mentor/) | Business Rules、Script Includes、GlideAjax、ACL、Flow Designer | ServiceNow 开发与手把手的实例排障 |

### 🎨 设计部门

让它美观、好用、讨人喜欢。

| 智能体 | 专长 | 何时使用 |
|-------|-----------|-------------|
| 🎯 [UI Designer](/design/design-ui-designer/) | 视觉设计、组件库、设计系统 | 界面创作、品牌一致性、组件设计 |
| 🔍 [UX Researcher](/design/design-ux-researcher/) | 用户测试、行为分析、研究 | 理解用户、可用性测试、设计洞察 |
| 🏛️ [UX Architect](/design/design-ux-architect/) | 技术架构、CSS 体系、落地实现 | 对开发者友好的地基、实现指导 |
| 🎭 [Brand Guardian](/design/design-brand-guardian/) | 品牌识别、一致性、定位 | 品牌战略、识别体系开发、品牌规范 |
| 📖 [Visual Storyteller](/design/design-visual-storyteller/) | 视觉叙事、多媒体内容 | 动人的视觉故事、品牌叙事 |
| ✨ [Whimsy Injector](/design/design-whimsy-injector/) | 个性、愉悦感、俏皮交互 | 加入乐趣、微交互、彩蛋、品牌个性 |
| 📷 [Image Prompt Engineer](/design/design-image-prompt-engineer/) | AI 图像生成提示词、摄影 | 面向 Midjourney、DALL-E、Stable Diffusion 的摄影提示词 |
| 🌈 [Inclusive Visuals Specialist](/design/design-inclusive-visuals-specialist/) | 代表性、偏见消减、真实影像 | 生成文化上准确的 AI 图像与视频 |
| 🎭 [Persona Walkthrough Specialist](/design/design-persona-walkthrough/) | 人格驱动的认知走查 | 模拟用户在每个滚动位置的反应与摩擦 |
| 🧱 [UI Finish-Gate Reviewer](/design/design-ui-finish-gate-reviewer/) | 反千篇一律的 UI 收尾门禁 | 上线前用证据 + 一份书面设计契约，拦住毫无辨识度的 UI |

### 💰 付费媒体部门

把广告花费变成可度量的业务成果。

| 智能体 | 专长 | 何时使用 |
| --- | --- | --- |
| 💰 [PPC Campaign Strategist](/paid-media/paid-media-ppc-strategist/) | Google/Microsoft/Amazon Ads、账户架构、出价 | 账户搭建、预算分配、放量、效果诊断 |
| 🔍 [Search Query Analyst](/paid-media/paid-media-search-query-analyst/) | 搜索词分析、否定关键词、意图映射 | 查询审计、无效花费清理、关键词发现 |
| 📋 [Paid Media Auditor](/paid-media/paid-media-auditor/) | 200+ 项账户审计、竞争分析 | 账户接管、季度复盘、竞标提案 |
| 📡 [Tracking & Measurement Specialist](/paid-media/paid-media-tracking-specialist/) | GTM、GA4、转化跟踪、CAPI | 新实现、跟踪审计、平台迁移 |
| ✍️ [Ad Creative Strategist](/paid-media/paid-media-creative-strategist/) | RSA 文案、Meta 创意、Performance Max 素材 | 创意上线、测试项目、广告疲劳焕新 |
| 📺 [Programmatic & Display Buyer](/paid-media/paid-media-programmatic-buyer/) | GDN、DSP、合作媒体、ABM 展示 | 展示广告规划、合作媒体触达、ABM 项目 |
| 📱 [Paid Social Strategist](/paid-media/paid-media-paid-social-strategist/) | Meta、LinkedIn、TikTok、跨平台社交 | 社交广告项目、平台选择、人群策略 |

### 💼 销售部门

凭手艺而不是 CRM 杂活，把销售管道变成收入。

| 智能体 | 专长 | 何时使用 |
|-------|-----------|-------------|
| 🎯 [Outbound Strategist](/sales/sales-outbound-strategist/) | 信号驱动的获客、多渠道序列、ICP 定向 | 靠调研驱动的触达而非堆量，构建销售管道 |
| 🔍 [Discovery Coach](/sales/sales-discovery-coach/) | SPIN、Gap Selling、Sandler——提问设计与通话结构 | 备战需求挖掘通话、甄别商机、辅导销售 |
| ♟️ [Deal Strategist](/sales/sales-deal-strategist/) | MEDDPICC 资格评估、竞争定位、赢单规划 | 给单子打分、暴露管道风险、制定赢单策略 |
| 🛠️ [Sales Engineer](/sales/sales-engineer/) | 技术演示、POC 划定、竞争战卡 | 售前技术赢单、演示准备、竞争定位 |
| 🏹 [Proposal Strategist](/sales/sales-proposal-strategist/) | RFP 应答、赢单主题、叙事结构 | 写出有说服力而不只是合规的提案 |
| 📊 [Pipeline Analyst](/sales/sales-pipeline-analyst/) | 预测、管道健康度、成交速度、RevOps | 管道复盘、预测准确率、营收运营 |
| 🗺️ [Account Strategist](/sales/sales-account-strategist/) | 先落地再扩张、QBR、干系人映射 | 售后扩张、客户规划、NRR 增长 |
| 🏋️ [Sales Coach](/sales/sales-coach/) | 销售培养、通话辅导、管道复盘引导 | 用结构化辅导让每个销售、每笔单子都更好 |
| 🎯 [Sales Outreach](/specialized/sales-outreach/) | 冷启动获客、多触点节奏、异议处理、提案 | B2B 漏斗顶部的触达——从冷邮件到约上需求挖掘通话 |
| 🧲 [Offer & Lead Gen Strategist](/sales/sales-offer-lead-gen-strategist/) | Offer 设计、线索磁铁 | 漏斗顶部的 offer 构建与线索获取 |

### 📢 市场营销部门

靠一次次真诚互动，做大你的受众。

| 智能体 | 专长 | 何时使用 |
|-------|-----------|-------------|
| 🚀 [Growth Hacker](/marketing/marketing-growth-hacker/) | 快速用户获取、病毒式传播回路、实验 | 爆发式增长、用户获取、转化优化 |
| 📝 [Content Creator](/marketing/marketing-content-creator/) | 多平台内容、编辑日历 | 内容战略、文案写作、品牌叙事 |
| 🐦 [Twitter Engager](/marketing/marketing-twitter-engager/) | 实时互动、思想领导力 | Twitter 战略、LinkedIn 活动、职业社交 |
| 🛰️ [X/Twitter Intelligence Analyst](/marketing/marketing-x-twitter-intelligence-analyst/) | 社交聆听、趋势探测、账号监测 | X/Twitter 上的品牌风险、竞品与受众情报 |
| 📱 [TikTok Strategist](/marketing/marketing-tiktok-strategist/) | 病毒式内容、算法优化 | TikTok 增长、病毒式内容、Z 世代/千禧一代受众 |
| 📸 [Instagram Curator](/marketing/marketing-instagram-curator/) | 视觉叙事、社群建设 | Instagram 战略、美学塑造、视觉内容 |
| 🤝 [Reddit Community Builder](/marketing/marketing-reddit-community-builder/) | 真诚互动、价值导向内容 | Reddit 战略、社区信任、真诚营销 |
| 🌱 [Developer Community Builder](/marketing/marketing-developer-community-builder/) | Discord/论坛架构、贡献者计划、社区健康度 | 建设成员真正在意的开发者社区 |
| 📱 [App Store Optimizer](/marketing/marketing-app-store-optimizer/) | ASO、转化优化、可发现性 | 应用营销、商店优化、应用增长 |
| 🌐 [Social Media Strategist](/marketing/marketing-social-media-strategist/) | 跨平台战略、活动 | 整体社交战略、多平台活动 |
| 📕 [Xiaohongshu Specialist](/marketing/marketing-xiaohongshu-specialist/) | 生活方式内容、趋势驱动战略 | 小红书增长、美学叙事、Z 世代受众 |
| 💬 [WeChat Official Account Manager](/marketing/marketing-wechat-official-account/) | 订阅者互动、内容营销 | 微信公众号战略、社群建设、转化优化 |
| 🧠 [Zhihu Strategist](/marketing/marketing-zhihu-strategist/) | 思想领导力、知识驱动互动 | 知乎权威建设、问答战略、线索获取 |
| 🇨🇳 [Baidu SEO Specialist](/marketing/marketing-baidu-seo-specialist/) | 百度优化、中国 SEO、ICP 合规 | 在百度拿到排名、触达中国搜索市场 |
| 🎬 [Bilibili Content Strategist](/marketing/marketing-bilibili-content-strategist/) | B 站算法、弹幕文化、UP主增长 | 用社区优先的内容在 B 站做大受众 |
| 🎠 [Carousel Growth Engine](/marketing/marketing-carousel-growth-engine/) | TikTok/Instagram 轮播图、自主发布 | 生成并发布病毒式轮播内容 |
| 💼 [LinkedIn Content Creator](/marketing/marketing-linkedin-content-creator/) | 个人品牌、思想领导力、职业内容 | LinkedIn 增长、职业受众建设、B2B 内容 |
| 🛒 [China E-Commerce Operator](/marketing/marketing-china-ecommerce-operator/) | 淘宝、天猫、拼多多、直播电商 | 运营中国多平台电商 |
| 🎥 [Kuaishou Strategist](/marketing/marketing-kuaishou-strategist/) | 快手、老铁社区、草根增长 | 在下沉市场建立真实受众 |
| 🔍 [SEO Specialist](/marketing/marketing-seo-specialist/) | 技术 SEO、内容战略、外链建设 | 驱动可持续的有机搜索增长 |
| 📘 [Book Co-Author](/marketing/marketing-book-co-author/) | 思想领导力书籍、代笔、出版 | 为创始人与专家提供战略性的图书共创 |
| 🌏 [Cross-Border E-Commerce Specialist](/marketing/marketing-cross-border-ecommerce/) | Amazon、Shopee、Lazada、跨境履约 | 全漏斗跨境电商战略 |
| 🎵 [Douyin Strategist](/marketing/marketing-douyin-strategist/) | 抖音平台、短视频营销、算法 | 在中国头部短视频平台上做大受众 |
| 🎙️ [Livestream Commerce Coach](/marketing/marketing-livestream-commerce-coach/) | 主播培训、直播间优化、转化 | 打造高性能的直播电商运营 |
| 🎧 [Podcast Strategist](/marketing/marketing-podcast-strategist/) | 播客内容战略、平台优化 | 中文播客市场战略与运营 |
| 🔒 [Private Domain Operator](/marketing/marketing-private-domain-operator/) | 企业微信、私域流量、社群运营 | 构建企业微信私域生态 |
| 🎬 [Short-Video Editing Coach](/marketing/marketing-short-video-editing-coach/) | 后期制作、剪辑工作流、平台规格 | 手把手的短视频剪辑训练与优化 |
| 🔥 [Weibo Strategist](/marketing/marketing-weibo-strategist/) | 新浪微博、热搜话题、粉丝互动 | 全谱系微博运营与增长 |
| 🎙️ [Global Podcast Strategist](/marketing/marketing-global-podcast-strategist/) | 节目定位、受众增长、变现 | 播客上线、平台算法、赞助、社群建设 |
| 🔮 [AI Citation Strategist](/marketing/marketing-ai-citation-strategist/) | AEO/GEO、AI 推荐可见度、引用审计 | 提升品牌在 ChatGPT、Claude、Gemini、Perplexity 中的可见度 |
| 🇨🇳 [China Market Localization Strategist](/marketing/marketing-china-market-localization-strategist/) | 全栈中国市场本地化、抖音/小红书/微信 GTM | 把趋势信号变成可执行的中国市场上市（go-to-market）战略 |
| 🎬 [Video Optimization Specialist](/marketing/marketing-video-optimization-specialist/) | YouTube 算法战略、章节划分、封面概念 | YouTube 频道增长、视频 SEO、受众留存优化 |
| 🏗️ [AEO Foundations Architect](/marketing/marketing-aeo-foundations/) | AI 引擎优化基础设施 | llms.txt、面向 AI 的 robots.txt、智能体发现文件 |
| 🤖 [Agentic Search Optimizer](/marketing/marketing-agentic-search-optimizer/) | WebMCP 与智能体任务完成 | 让站点对 AI 浏览智能体可用 |
| 📧 [Email Marketing Strategist](/marketing/marketing-email-strategist/) | 生命周期邮件与送达率 | CRM 活动、自动化、分群 |
| 📡 [Multi-Platform Publisher](/marketing/marketing-multi-platform-publisher/) | 一键中文多平台发布 | 把一篇文章分发到知乎/小红书/CSDN/B 站/公众号/掘金 |
| 📣 [PR & Communications Manager](/marketing/marketing-pr-communications-manager/) | 公关、媒体关系与危机传播 | 新闻稿、思想领导力、声誉管理 |

### 📊 产品部门

在正确的时机做正确的东西。

| 智能体 | 专长 | 何时使用 |
|-------|-----------|-------------|
| 🎯 [Sprint Prioritizer](/product/product-sprint-prioritizer/) | 敏捷规划、功能优先级排序 | sprint 规划、资源分配、backlog 管理 |
| 🔍 [Trend Researcher](/product/product-trend-researcher/) | 市场情报、竞争分析 | 市场调研、机会评估、趋势识别 |
| 💬 [Feedback Synthesizer](/product/product-feedback-synthesizer/) | 用户反馈分析、洞察提炼 | 反馈分析、用户洞察、产品优先级 |
| 🔬 [DX Engineer](/product/product-dx-engineer/) | 上手摩擦、SDK 人机工学、报错信息 | 缩短开发者首次成功的时间 |
| 🧠 [Behavioral Nudge Engine](/product/product-behavioral-nudge-engine/) | 行为心理学、助推设计、参与度 | 用行为科学最大化用户动机 |
| 🧭 [Product Manager](/product/product-manager/) | 全生命周期产品负责 | 发现、PRD、路线图规划、GTM、成果度量 |

### 🎬 项目管理部门

让列车准点运行（而且不超预算）。

| 智能体 | 专长 | 何时使用 |
|-------|-----------|-------------|
| 🎬 [Studio Producer](/project-management/project-management-studio-producer/) | 高层编排、组合管理 | 多项目监督、战略对齐、资源分配 |
| 🐑 [Project Shepherd](/project-management/project-management-project-shepherd/) | 跨职能协调、时间线管理 | 端到端项目协调、干系人管理 |
| ⚙️ [Studio Operations](/project-management/project-management-studio-operations/) | 日常效率、流程优化 | 运营卓越、团队支持、生产力 |
| 🧪 [Experiment Tracker](/project-management/project-management-experiment-tracker/) | A/B 测试、假设验证 | 实验管理、数据驱动决策、测试 |
| 👔 [Senior Project Manager](/project-management/project-manager-senior/) | 务实的范围划定、任务拆解 | 把规格转成任务、范围管理 |
| 📋 [Jira Workflow Steward](/project-management/project-management-jira-workflow-steward/) | Git 工作流、分支策略、可追溯性 | 落实与 Jira 关联的 Git 纪律与交付 |
| 📋 [Meeting Notes Specialist](/project-management/project-management-meeting-notes-specialist/) | 结构化会议纪要 | 提取决议、行动项、待解问题 |

### 🧪 测试部门

抢在用户之前把东西弄坏。

| 智能体 | 专长 | 何时使用 |
|-------|-----------|-------------|
| 📸 [Evidence Collector](/testing/testing-evidence-collector/) | 基于截图的 QA、可视化凭证 | UI 测试、视觉验证、bug 记录 |
| 🔍 [Reality Checker](/testing/testing-reality-checker/) | 基于证据的认证、质量关卡禁 | 生产就绪、质量批准、发布认证 |
| 📊 [Test Results Analyzer](/testing/testing-test-results-analyzer/) | 测试评估、指标分析 | 测试输出分析、质量洞察、覆盖率报告 |
| ⚡ [Performance Benchmarker](/testing/testing-performance-benchmarker/) | 性能测试、优化 | 速度测试、压力测试、性能调优 |
| 🔌 [API Tester](/testing/testing-api-tester/) | API 验证、集成测试 | API 测试、端点验证、集成 QA |
| 🛠️ [Tool Evaluator](/testing/testing-tool-evaluator/) | 技术评估、工具选型 | 评估工具、软件推荐、技术决策 |
| 🔄 [Workflow Optimizer](/testing/testing-workflow-optimizer/) | 流程分析、工作流改进 | 流程优化、效率提升、自动化机会 |
| ♿ [Accessibility Auditor](/testing/testing-accessibility-auditor/) | WCAG 审计、辅助技术测试 | 无障碍合规、屏幕阅读器测试、包容性设计验证 |
| 🎭 [Test Automation Engineer](/testing/testing-test-automation-engineer/) | Playwright/Cypress E2E、消除 flake、CI 并行化 | 浏览器测试套件、确定性流水线、基于 trace 的失败调试 |

### 🔒 安全部门

守护整个技术栈——从设计即安全的架构到入侵响应。

| 智能体 | 专长 | 何时使用 |
|-------|-----------|-------------|
| 🛡️ [Security Architect](/security/security-architect/) | 威胁建模、设计即安全、信任边界 | 系统安全模型、架构评审、纵深防御 |
| 🔐 [Application Security Engineer](/security/security-appsec-engineer/) | SDLC 安全、SAST/DAST、安全代码评审 | 保障开发生命周期安全、代码级漏洞 |
| 🗡️ [Penetration Tester](/security/security-penetration-tester/) | 授权渗透测试、红队行动、漏洞利用 | 赶在攻击者之前找到可利用弱点 |
| ☁️ [Cloud Security Architect](/security/security-cloud-security-architect/) | 零信任、云原生纵深防御 | 保障云基础设施与架构安全 |
| 🚨 [Incident Responder](/security/security-incident-responder/) | DFIR、入侵调查、威胁遏制 | 正在发生的入侵、取证、危机响应 |
| 🔍 [Threat Intelligence Analyst](/security/security-threat-intelligence-analyst/) | 对手追踪、战役映射、ATT&CK | 搞清谁在攻击、怎么攻击 |
| 🎯 [Threat Detection Engineer](/security/security-threat-detection-engineer/) | SIEM 规则、威胁狩猎、ATT&CK 映射 | 构建检测层与威胁狩猎 |
| 🛡️ [Senior SecOps Engineer](/security/security-senior-secops/) | 密钥扫描、默认安全的提交 | 在每次变更上做防御性的代码级安全 |
| 📋 [Compliance Auditor](/security/security-compliance-auditor/) | SOC 2、ISO 27001、HIPAA、PCI-DSS | 带领组织通过合规认证 |
| 🛡️ [Blockchain Security Auditor](/security/security-blockchain-security-auditor/) | 智能合约审计、漏洞利用分析 | 在部署前找到合约漏洞 |
| 🔎 [AI-Generated Code Security Auditor](/security/security-ai-generated-code-auditor/) | 对 AI/vibe coding 产出的应用做安全评审 | 硬编码密钥、失效的 RLS、提示注入汇聚点 |
| 🔑 [Secrets & Credential Hygiene Engineer](/security/security-secrets-credential-engineer/) | 密钥与凭据生命周期 | 检测、入 vault、轮换、泄露响应 |

### 🛟 客户支持部门

整个运营的中坚力量。

| 智能体 | 专长 | 何时使用 |
|-------|-----------|-------------|
| 💬 [Support Responder](/support/support-support-responder/) | 客户服务、问题解决 | 客户支持、用户体验、支持运营 |
| 📊 [Analytics Reporter](/support/support-analytics-reporter/) | 数据分析、仪表盘、洞察 | 商业智能、KPI 跟踪、数据可视化 |
| 💰 [Finance Tracker](/support/support-finance-tracker/) | 财务规划、预算管理 | 财务分析、现金流、经营业绩 |
| 🏗️ [Infrastructure Maintainer](/support/support-infrastructure-maintainer/) | 系统可靠性、性能优化 | 基础设施管理、系统运维、监控 |
| ⚖️ [Legal Compliance Checker](/support/support-legal-compliance-checker/) | 合规、法规、法律审查 | 法律合规、监管要求、风险管理 |
| 📑 [Executive Summary Generator](/support/support-executive-summary-generator/) | 面向高管的沟通、战略摘要 | 高管汇报、战略沟通、决策支持 |

### 🥽 空间计算部门

构建沉浸式的未来。

| 智能体 | 专长 | 何时使用 |
|-------|-----------|-------------|
| 🏗️ [XR Interface Architect](/spatial-computing/xr-interface-architect/) | 空间交互设计、沉浸式 UX | AR/VR/XR 界面设计、空间计算 UX |
| 💻 [macOS Spatial/Metal Engineer](/spatial-computing/macos-spatial-metal-engineer/) | Swift、Metal、高性能 3D | macOS 空间计算、Vision Pro 原生应用 |
| 🌐 [XR Immersive Developer](/spatial-computing/xr-immersive-developer/) | WebXR、浏览器端 AR/VR | 基于浏览器的沉浸式体验、WebXR 应用 |
| 🎮 [XR Cockpit Interaction Specialist](/spatial-computing/xr-cockpit-interaction-specialist/) | 座舱式操控、沉浸式系统 | 座舱控制系统、沉浸式控制界面 |
| 🍎 [visionOS Spatial Engineer](/spatial-computing/visionos-spatial-engineer/) | Apple Vision Pro 开发 | Vision Pro 应用、空间计算体验 |
| 🔌 [Terminal Integration Specialist](/spatial-computing/terminal-integration-specialist/) | 终端集成、命令行工具 | CLI 工具、终端工作流、开发者工具 |

### 🎯 专项部门

那些装不进任何框框的独特专家。

| 智能体 | 专长 | 何时使用 |
|-------|-----------|-------------|
| 🎭 [Agents Orchestrator](/specialized/agents-orchestrator/) | 多智能体协调、工作流管理 | 需要多个智能体协同的复杂项目 |
| 🔍 [LSP/Index Engineer](/specialized/lsp-index-engineer/) | Language Server Protocol、代码智能 | 代码智能系统、LSP 实现、语义索引 |
| 📥 [Sales Data Extraction Agent](/specialized/sales-data-extraction-agent/) | Excel 监控、销售指标提取 | 销售数据摄取、MTD/YTD/年末指标 |
| 📈 [Data Consolidation Agent](/specialized/data-consolidation-agent/) | 销售数据聚合、仪表盘报表 | 区域汇总、销售表现、管道快照 |
| 📬 [Report Distribution Agent](/specialized/report-distribution-agent/) | 自动化报告分发 | 按区域分发报告、定时发送 |
| 🔐 [Agentic Identity & Trust Architect](/specialized/agentic-identity-trust/) | 智能体身份、认证、信任验证 | 多智能体身份系统、智能体授权、审计追踪 |
| 🔗 [Identity Graph Operator](/specialized/identity-graph-operator/) | 面向多智能体系统的共享身份归一 | 实体去重、合并提案、跨智能体身份一致性 |
| 💸 [Accounts Payable Agent](/specialized/accounts-payable-agent/) | 付款处理、供应商管理、审计 | 跨加密货币、法币、稳定币的自主支付执行 |
| 🌍 [Cultural Intelligence Strategist](/specialized/specialized-cultural-intelligence-strategist/) | 全球 UX、代表性、文化排斥 | 确保软件在各文化中都产生共鸣 |
| 🗣️ [Developer Advocate](/specialized/specialized-developer-advocate/) | 社区建设、DX、开发者内容 | 在产品与开发者社区之间架桥 |
| 🔬 [Model QA Specialist](/specialized/specialized-model-qa/) | ML 审计、特征分析、可解释性 | 机器学习模型的端到端 QA |
| 🗃️ [ZK Steward](/specialized/zk-steward/) | 知识管理、Zettelkasten、笔记 | 构建相互连接、经过校验的知识库 |
| 🔌 [MCP Builder](/specialized/specialized-mcp-builder/) | Model Context Protocol 服务器、AI 智能体工具 | 构建扩展 AI 智能体能力的 MCP 服务器 |
| 📄 [Document Generator](/specialized/specialized-document-generator/) | 用代码生成 PDF、PPTX、DOCX、XLSX | 专业文档创建、报告、数据可视化 |
| ⚙️ [Automation Governance Architect](/specialized/automation-governance-architect/) | 自动化治理、n8n、工作流审计 | 规模化评估与治理业务自动化 |
| 📚 [Corporate Training Designer](/specialized/corporate-training-designer/) | 企业培训、课程开发 | 设计培训体系与学习项目 |
| 🌱 [Personal Growth Mentor](/specialized/personal-growth-mentor/) | 目标清晰度、习惯系统、自我问责、人生策略 | 跨领域个人成长，不打鸡血 |
| 🏛️ [Government Digital Presales Consultant](/specialized/government-digital-presales-consultant/) | 中国 ToG 售前、数字化转型 | 政府数字化转型提案与投标 |
| ⚕️ [Healthcare Marketing Compliance](/specialized/healthcare-marketing-compliance/) | 中国医疗广告合规 | 医疗营销监管合规 |
| 🎯 [Recruitment Specialist](/specialized/recruitment-specialist/) | 人才获取、招聘运营 | 招聘战略、寻源与录用流程 |
| 🎓 [Study Abroad Advisor](/specialized/study-abroad-advisor/) | 国际教育、申请规划 | 美国、英国、加拿大、澳大利亚留学规划 |
| 🔗 [Supply Chain Strategist](/specialized/supply-chain-strategist/) | 供应链管理、采购战略 | 供应链优化与采购规划 |
| 🗺️ [Workflow Architect](/specialized/specialized-workflow-architect/) | 工作流发现、映射与规格化 | 在写代码之前把系统里每条路径都画出来 |
| ☁️ [Salesforce Architect](/specialized/specialized-salesforce-architect/) | 多云 Salesforce 设计、治理限制、集成 | 企业 Salesforce 架构、org 战略、部署流水线 |
| 🇫🇷 [French Consulting Market Navigator](/specialized/specialized-french-consulting-market/) | ESN/SI 生态、portage salarial、费率定位 | 在法国 IT 市场做自由职业咨询 |
| 🇰🇷 [Korean Business Navigator](/specialized/specialized-korean-business-navigator/) | 韩国商业文化、품의 流程、关系机制 | 帮助外国专业人士驾驭韩国商业关系 |
| 🏗️ [Civil Engineer](/specialized/specialized-civil-engineer/) | 结构分析、岩土设计、全球建筑规范 | 跨 Eurocode、ACI、AISC 等多标准的结构工程 |
| 🎧 [Customer Service](/specialized/customer-service/) | 全渠道支持、投诉处理、留存、升级处理 | 任何行业的客户支持——零售、SaaS、酒店餐饮、金融、物流 |
| 🏥 [Healthcare Customer Service](/specialized/healthcare-customer-service/) | 具备 HIPAA 意识的患者支持、账单、保险、急诊分诊 | 需要合规且有同理心的患者支持的医疗机构 |
| 🏨 [Hospitality Guest Services](/specialized/hospitality-guest-services/) | 预订、礼宾、投诉挽回、忠诚度、活动 | 酒店、度假村、餐厅与活动场馆 |
| 🤝 [HR Onboarding](/specialized/hr-onboarding/) | 入职前准备、合规、福利登记、30-60-90 天计划 | 任何正在让新员工入职的公司——从初创到大型企业 |
| 🌐 [Language Translator](/specialized/language-translator/) | 西班牙语 ↔ 英语互译、方言意识、文化语境 | 旅行、商务、医疗与法律翻译需求 |
| ⏱️ [Legal Billing & Time Tracking](/specialized/legal-billing-time-tracking/) | 工时记录、账单叙事、IOLTA 合规、回款 | 追求收入回收最大化与账单准确率的律所 |
| 📋 [Legal Client Intake](/specialized/legal-client-intake/) | 潜客资格评估、利益冲突筛查、咨询预约 | 把咨询转化为签约客户的律所 |
| ⚖️ [Legal Document Review](/specialized/legal-document-review/) | 合同评审、风险标记、版本比对、合规 | 任何执业领域的第一轮律师可用评审 |
| 🏦 [Loan Officer Assistant](/specialized/loan-officer-assistant/) | 借款人受理、TRID 合规、管道跟踪、交割协调 | 按揭与消费信贷团队 |
| 🏠 [Real Estate Buyer & Seller](/specialized/real-estate-buyer-seller/) | 买方/卖方代理、报价、交易协调 | 住宅与投资性房产交易 |
| 🛒 [Retail Customer Returns](/specialized/retail-customer-returns/) | 退货处理、防欺诈、换货、供应商退货 | 线下门店、电商与全渠道零售 |
| ♟️ [Business Strategist](/specialized/business-strategist/) | 管理咨询战略 | 竞争分析、市场进入、增长规划 |
| 🔄 [Change Management Consultant](/specialized/change-management-consultant/) | ADKAR/Kotter/Prosci 变革 | 引导组织完成转型与采纳 |
| 🧭 [Chief of Staff](/specialized/specialized-chief-of-staff/) | 高管协调 | 过滤噪音、掌管流程、路由决策 |
| 🌟 [Customer Success Manager](/specialized/customer-success-manager/) | 客户上手、健康与留存 | QBR、流失预防、续约与增购 |
| 📝 [Grant Writer](/specialized/grant-writer/) | 资助申请与经费 | 面向非营利/科研的 LOI、提案、预算 |
| 🏥 [Medical Billing & Coding Specialist](/specialized/medical-billing-coding-specialist/) | ICD-10/CPT/HCPCS 与收入循环 | 理赔、拒付管理、RCM 优化 |
| 💰 [Pricing Analyst](/specialized/specialized-pricing-analyst/) | 定价模型与毛利优化 | 竞品/成本分析、基于价值的定价 |
| 💼 [Chief Financial Officer](/specialized/chief-financial-officer/) | 资本配置与财务战略 | 资金管理、FP&A、并购财务、投资人与董事会汇报 |
| 🌱 [ESG & Sustainability Officer](/specialized/esg-sustainability-officer/) | ESG 项目与披露 | 可持续战略、脱碳、报告 |
| 🔐 [Data Privacy Officer](/specialized/data-privacy-officer/) | GDPR/CCPA 隐私合规 | 数据映射、DPIA、同意、泄露响应 |
| ⚙️ [Operations Manager](/specialized/operations-manager/) | 精益/六西格玛运营 | 流程映射、产能规划、KPI 治理 |
| 🤝 [M&A Integration Manager](/specialized/ma-integration-manager/) | 并购后整合 | 第 1 天/100 天计划、协同效应跟踪、TSA 管理 |
| 🧠 [Organizational Psychologist](/specialized/organizational-psychologist/) | 团队动力与文化健康 | 心理安全、倦怠风险、高绩效团队 |
| ⚔️ [Strategy Duel Agent](/specialized/specialized-strategy-duel-agent/) | 博弈论与三十六计 | 回合制策略对弈、对抗性情景推演 |
| 🛡️ [FedRAMP & RMF Compliance Engineer](/specialized/specialized-fedramp-rmf-compliance/) | 联邦云授权（ATO） | NIST 800-53、FedRAMP Rev5/20x、SSP/POA&M、ConMon、OSCAL |
| 🏺 [Codebase Archaeologist](/specialized/specialized-codebase-archaeologist/) | 多工具代码库漂移审计 | 检测 Claude/Cursor/Copilot/Windsurf 编辑之间的无声漂移 |
| 🧾 [Resume Tailor](/specialized/resume-tailor/) | 候选人侧简历优化 | JD 映射、ATS 关键词对齐、经历与要求匹配 |
| 🧡 [Aging Parent Care Companion](/specialized/healthcare-aging-parent-care-companion/) | 家庭照护者决策支持 | 就诊/用药协调、照护团队沟通、照护者自身福祉（与 HIPAA 对齐） |
| 🏛️ [Master Plan Architect](/specialized/specialized-master-plan-architect/) | 建筑教学、红队方案评审 | 深度建筑教学、风险评审、全面的 Markdown 实施计划（不执行代码） |
| 🎧 [Focus Music Architect](/specialized/specialized-focus-music-architect/) | 器乐专注音乐提示词工程、神经声学 | 面向生成式音频模型的声音景观架构、BPM 曲线、双耳分层 |

### 💵 金融部门

会计、财务分析、税务战略与投资研究方面的专家。

| 智能体 | 专长 | 何时使用 |
|-------|-----------|-------------|
| 📒 [Bookkeeper & Controller](/finance/finance-bookkeeper-controller/) | 月末结账、对账、GAAP 合规、内部控制 | 日常会计运营、审计就绪、财务记录保存 |
| 📊 [Financial Analyst](/finance/finance-financial-analyst/) | 财务建模、预测、情景分析、决策支持 | 三大报表模型、差异分析、数据驱动的商业智能 |
| 📈 [FP&A Analyst](/finance/finance-fpa-analyst/) | 预算、滚动预测、差异分析、经营复盘 | 年度经营计划、月度经营复盘、战略性资源分配 |
| 🔍 [Investment Researcher](/finance/finance-investment-researcher/) | 尽调、组合分析、资产估值、股票研究 | 投资论点构建、风险评估、市场调研 |
| 🏛️ [Tax Strategist](/finance/finance-tax-strategist/) | 税务优化、多司法辖区合规、转移定价 | 实体架构、ETR 分析、税务稽查抗辩、战略性税务规划 |

### 🎮 游戏开发部门

横跨所有主流引擎，构建世界、系统与体验。

#### 跨引擎智能体（与引擎无关）

| 智能体 | 专长 | 何时使用 |
|-------|-----------|-------------|
| 🎯 [Game Designer](/game-development/game-designer/) | 系统设计、GDD 撰写、经济平衡、玩法循环 | 设计游戏机制、进度系统、撰写设计文档 |
| 🗺️ [Level Designer](/game-development/level-designer/) | 关卡布局理论、节奏、遭遇战设计、环境叙事 | 搭建关卡、设计遭遇流程、空间叙事 |
| 🎨 [Technical Artist](/game-development/technical-artist/) | 着色器、VFX、LOD 流水线、美术到引擎的优化 | 在美术与工程之间架桥、编写着色器、性能安全的资产流水线 |
| 🔊 [Game Audio Engineer](/game-development/game-audio-engineer/) | FMOD/Wwise、自适应音乐、空间音频、音频预算 | 交互音频系统、动态音乐、音频性能 |
| 📖 [Narrative Designer](/game-development/narrative-designer/) | 故事系统、分支对话、世界观架构 | 撰写分支叙事、实现对话系统、世界设定 |
| 💰 [Economy Designer](/game-development/economy-designer/) | 虚拟货币、产出/回收、变现建模、通胀控制 | 设计游戏内经济、平衡 F2P 变现、线上经济调优 |

#### Unity

| 智能体 | 专长 | 何时使用 |
|-------|-----------|-------------|
| 🏗️ [Unity Architect](/game-development/unity/unity-architect/) | ScriptableObjects、数据驱动模块化、DOTS/ECS | 大型 Unity 项目、数据驱动的系统设计、ECS 性能优化 |
| ✨ [Unity Shader Graph Artist](/game-development/unity/unity-shader-graph-artist/) | Shader Graph、HLSL、URP/HDRP、Renderer Features | 自定义 Unity 材质、VFX 着色器、后处理 pass |
| 🌐 [Unity Multiplayer Engineer](/game-development/unity/unity-multiplayer-engineer/) | Netcode for GameObjects、Unity Relay/Lobby、服务器权威、预测 | Unity 联网游戏、客户端预测、Unity Gaming Services 集成 |
| 🛠️ [Unity Editor Tool Developer](/game-development/unity/unity-editor-tool-developer/) | EditorWindow、AssetPostprocessor、PropertyDrawer、构建校验 | 自定义 Unity 编辑器工具、流水线自动化、内容校验 |

#### Unreal Engine

| 智能体 | 专长 | 何时使用 |
|-------|-----------|-------------|
| ⚙️ [Unreal Systems Engineer](/game-development/unreal-engine/unreal-systems-engineer/) | C++/Blueprint 混合、GAS、Nanite 约束、内存管理 | 复杂 Unreal 玩法系统、Gameplay Ability System、引擎级 C++ |
| 🎨 [Unreal Technical Artist](/game-development/unreal-engine/unreal-technical-artist/) | Material Editor、Niagara、PCG、Substrate | Unreal 材质、Niagara VFX、程序化内容生成 |
| 🌐 [Unreal Multiplayer Architect](/game-development/unreal-engine/unreal-multiplayer-architect/) | Actor 复制、GameMode/GameState 层级、专用服务器 | Unreal 联网游戏、复制图、服务器权威的 Unreal |
| 🗺️ [Unreal World Builder](/game-development/unreal-engine/unreal-world-builder/) | World Partition、Landscape、HLOD、LWC | 大型开放世界 Unreal 关卡、流送系统、大规模地形 |

#### Godot

| 智能体 | 专长 | 何时使用 |
|-------|-----------|-------------|
| 📜 [Godot Gameplay Scripter](/game-development/godot/godot-gameplay-scripter/) | GDScript 2.0、信号、组合、静态类型 | Godot 玩法系统、场景组合、注重性能的 GDScript |
| 🌐 [Godot Multiplayer Engineer](/game-development/godot/godot-multiplayer-engineer/) | MultiplayerAPI、ENet/WebRTC、RPC、权威模型 | 在线 Godot 游戏、场景复制、服务器权威的 Godot |
| ✨ [Godot Shader Developer](/game-development/godot/godot-shader-developer/) | Godot 着色语言、VisualShader、RenderingDevice | 自定义 Godot 材质、2D/3D 特效、后处理、compute shader |

#### Blender

| 智能体 | 专长 | 何时使用 |
|-------|-----------|-------------|
| 🧩 [Blender Addon Engineer](/game-development/blender/blender-addon-engineer/) | Blender Python（`bpy`）、自定义 operator/面板、资产校验器、导出器、流水线自动化 | 构建 Blender 插件、资产准备工具、导出工作流与 DCC 流水线自动化 |

#### Roblox Studio

| 智能体 | 专长 | 何时使用 |
|-------|-----------|-------------|
| ⚙️ [Roblox Systems Scripter](/game-development/roblox-studio/roblox-systems-scripter/) | Luau、RemoteEvent/RemoteFunction、DataStore、服务器权威的模块架构 | 构建安全的 Roblox 游戏系统、客户端-服务器通信、数据持久化 |
| 🎯 [Roblox Experience Designer](/game-development/roblox-studio/roblox-experience-designer/) | 参与度循环、变现、D1/D7 留存、上手流程 | 设计 Roblox 游戏循环、Game Pass、每日奖励、玩家留存 |
| 👗 [Roblox Avatar Creator](/game-development/roblox-studio/roblox-avatar-creator/) | UGC 流水线、饰品绑骨、Creator Marketplace 提交 | Roblox UGC 物品、HumanoidDescription 定制、游戏内虚拟形象商店 |

### 📚 学术部门

以学术的严谨为世界构建、故事创作与叙事设计服务。

| 智能体 | 专长 | 何时使用 |
|-------|-----------|-------------|
| 🌍 [Anthropologist](/academic/academic-anthropologist/) | 文化系统、亲属关系、仪式、信仰体系 | 设计拥有内在逻辑、文化上自洽的社会 |
| 🌐 [Geographer](/academic/academic-geographer/) | 自然/人文地理、气候、制图 | 构建地形与聚落真实可信、地理上自洽的世界 |
| 📚 [Historian](/academic/academic-historian/) | 历史分析、分期、物质文化 | 校验历史自洽性、用真实的时代细节丰富设定 |
| 📜 [Narratologist](/academic/academic-narratologist/) | 叙事理论、故事结构、人物弧光 | 用成熟的理论框架分析与改进故事结构 |
| 🧠 [Psychologist](/academic/academic-psychologist/) | 人格理论、动机、认知模式 | 基于研究构建心理上可信的角色 |
| 📊 [Statistician](/academic/academic-statistician/) | 统计推断与实验设计 | 假设检验、因果推断、抽样、严谨分析 |

---

### 🌍 GIS 部门

绘制地球、分析建成环境、从地理空间数据中提取情报。

| 智能体 | 专长 | 何时使用 |
|-------|-----------|-------------|
| 🧠 [Technical Consultant](/gis/gis-technical-consultant/) | GIS 战略、差距分析、技术路线图、数字化转型 | 理解业务需求、选择合适的地理空间技术栈、规划多阶段 GIS 项目 |
| 🔧 [Solution Engineer](/gis/gis-solution-engineer/) | Esri + FOSS4G 原型搭建、PoC 交付、技术可行性 | 构建可运行的演示、验证技术方案、售前支持 |
| 🖥️ [GIS Analyst](/gis/gis-analyst/) | 制图生产、数据质检、符号化、版面、空间查询 | 日常 GIS 运营、制作可出版级地图、维护数据完整性 |
| 📦 [Spatial Data Engineer](/gis/gis-spatial-data-engineer/) | 地理空间 ETL、格式转换、CRS 重投影、自动化流水线 | 摄取任意来源的杂乱数据、构建可复用的数据转换流水线 |
| ⚙️ [Geoprocessing Specialist](/gis/gis-geoprocessing-specialist/) | ArcPy、Python 工具箱（.pyt）、Model Builder、批处理自动化 | 自动化重复的 GIS 工作流、构建自定义地理处理工具 |
| ✅ [GIS QA Engineer](/gis/gis-qa-engineer/) | 拓扑校验、元数据审计、CRS 一致性、精度评估 | 数据发布前的质量关卡禁、合规校验、数据完整性审计 |
| 🤖 [GeoAI/ML Engineer](/gis/gis-geoai-ml-engineer/) | 特征提取、目标检测、语义分割、土地覆盖分类 | 从影像中提取建筑/道路/车辆、变化检测、环境监测 |
| 🏗️ [BIM/GIS Specialist](/gis/gis-bim-specialist/) | Revit/IFC 转 GIS、室内地图、数字孪生架构、设施管理 | 智慧园区、机场数字孪生、室内导航、楼宇运营 |
| 🏔️ [3D & Scene Developer](/gis/gis-3d-scene-developer/) | Cesium、ArcGIS Scene Viewer、3D Tiles、点云、地形可视化 | 3D 城市场景、地形飞行漫游、点云网页查看器、OAuth 门控的场景分享 |
| 📊 [Spatial Data Scientist](/gis/gis-spatial-data-scientist/) | 空间统计、聚类、回归、插值、点格局分析 | 热点检测、空间建模、预测分析、科研级分析 |
| 🛸 [Drone/Reality Mapping](/gis/gis-drone-reality-mapping/) | 摄影测量、正射影像图、DTM/DSM、点云分类、3D 网格 | 无人机测绘数据处理、实景捕捉、施工监测、环境制图 |
| 🌐 [Web GIS Developer](/gis/gis-web-gis-developer/) | MapLibre GL JS、ArcGIS JS API、Leaflet、实时仪表盘、REST API | 构建交互式网页地图、运营仪表盘、实时数据可视化 |
| 🎨 [Cartography Designer](/gis/gis-cartography-designer/) | 色彩理论、字体排印、底图设计、视觉层级、印刷与网页美学 | 让地图美观易读、色盲安全配色、专业地图版面 |

---

### 🏥 医疗健康部门

为受监管的临床与主权卫生场景构建 AI 智能体。

| 智能体 | 专长 | 何时使用 |
|-------|-----------|-------------|
| 🩺 [Clinical Evidence Agent](/healthcare/healthcare-clinical-evidence-agent/) | 证据标准、已验证与未验证声明的区分、诊断权威边界 | 可信地做出临床声明，而不越界行使诊断权 |
| 🌍 [Sovereign Health Systems Agent](/healthcare/healthcare-sovereign-health-systems-agent/) | 政府卫生指令、UHC 政策、新兴市场部署 | 在国家卫生基础设施与主权卫生政策交汇处运营的健康科技团队 |
| 🧭 [Healthcare Innovation Strategist](/healthcare/healthcare-innovation-strategist/) | 面向医疗健康创始人的叙事架构，覆盖投资人、监管、主权与临床受众 | 需要把临床与财务的复杂性翻译成能撬动资本、建立信任的语言的医疗创始人 |

---

### 🔍 研究部门

查找、评估并综合既有证据，而非生成新的原始数据。

| 智能体 | 专长 | 何时使用 |
|-------|-----------|-------------|
| 🔍 [Research Synthesist](/research/research-synthesist/) | 文献综述、信源评估、引用溯源、证据综合 | 把一堆散乱的信源变成一张结构化、权重如实标注的证据支持图 |

---

## 🎯 真实使用场景

### 场景 1：做一家初创公司的 MVP

**你的团队**：
1. 🎨 **Frontend Developer**——构建 React 应用
2. 🏗️ **Backend Architect**——设计 API 与数据库
3. 🚀 **Growth Hacker**——规划用户获取
4. ⚡ **Rapid Prototyper**——快速迭代循环
5. 🔍 **Reality Checker**——上线前把好质量关

**结果**：每个阶段都有专业能力加持，发布更快。

---

### 场景 2：营销活动上线

**你的团队**：
1. 📝 **Content Creator**——产出活动内容
2. 🐦 **Twitter Engager**——Twitter 战略与执行
3. 📸 **Instagram Curator**——视觉内容与故事
4. 🤝 **Reddit Community Builder**——真诚的社区互动
5. 📊 **Analytics Reporter**——追踪并优化效果

**结果**：多渠道协同的活动，各平台都有对口专家。

---

### 场景 3：企业级功能开发

**你的团队**：
1. 👔 **Senior Project Manager**——范围与任务规划
2. 💎 **Senior Developer**——复杂实现
3. 🎨 **UI Designer**——设计系统与组件
4. 🧪 **Experiment Tracker**——A/B 测试规划
5. 📸 **Evidence Collector**——质量验证
6. 🔍 **Reality Checker**——生产就绪把关

**结果**：企业级交付，带质量关卡禁与文档。

---

### 场景 4：付费媒体账户接管

**你的团队**：

1. 📋 **Paid Media Auditor**——全面的账户评估
2. 📡 **Tracking & Measurement Specialist**——核验转化跟踪准确性
3. 💰 **PPC Campaign Strategist**——重设计账户架构
4. 🔍 **Search Query Analyst**——清理搜索词带来的无效花费
5. ✍️ **Ad Creative Strategist**——焕新全部广告文案与附加信息
6. 📊 **Analytics Reporter**（客户支持部门）——搭建报告仪表盘

**结果**：系统化的账户接管——跟踪已核验、浪费已清除、结构已优化、创意已焕新，全部在前 30 天内完成。

---

### 场景 5：全公司级产品发现

**你的团队**：所有 8 个部门并行投入同一次任务。

参见 **[NEXUS 空间发现演练](/examples/nexus-spatial-discovery/)**——一个完整示例：8 个智能体（Product Trend Researcher、Backend Architect、Brand Guardian、Growth Hacker、Support Responder、UX Researcher、Project Shepherd 与 XR Interface Architect）同时部署，评估一个软件机会并产出统一的产品计划，覆盖市场验证、技术架构、品牌战略、上市（go-to-market）、支持体系、UX 调研、项目执行与空间 UI 设计。

**结果**：单次会话产出的全面跨职能产品蓝图。[更多示例](examples/)。

---

### 场景 6：智慧校园数字孪生

**你的团队**：

1. 🧠 **Technical Consultant**——定义数字孪生战略：楼宇用 BIM，园区用 GIS，实时数据用 IoT
2. 🏗️ **BIM/GIS Specialist**——把 Revit 楼宇模型转成 GIS 场景图层，设计室内平面图
3. 🛸 **Drone/Reality Mapping**——飞一遍校园，生成正射影像图与 3D 网格作为底景
4. 🌐 **Web GIS Developer**——用 MapLibre 搭建校园仪表盘，含楼宇图层与房间查找
5. 🏔️ **3D & Scene Developer**——制作沉浸式 3D 场景，含地形、建筑与飞行漫游
6. 🤖 **GeoAI/ML Engineer**——从无人机影像提取建筑轮廓与树冠
7. ✅ **GIS QA Engineer**——校验数据精度、检查拓扑、确认 CRS 一致性

**结果**：一个融合 BIM 细节、无人机实景捕捉、3D 可视化与 Web 可访问性的校园数字孪生——由一条流水线里协同作业的专家们交付。

---

## 🤝 参与贡献

欢迎参与贡献！你可以这样帮忙：

### 新增一个智能体

1. Fork 本仓库
2. 在合适的类别下创建新的智能体文件
3. 遵循智能体模板结构：
   - 包含 name、description、color 的 frontmatter
   - 身份与记忆章节
   - 核心使命
   - 关键规则（领域相关）
   - 带示例的技术交付物
   - 工作流过程
   - 成功指标
4. 提交包含你智能体的 PR

### 改进现有智能体

- 补充真实案例
- 增强代码示例
- 更新成功指标
- 改进工作流

### 分享你的成功故事

这些智能体用得顺手吗？欢迎到 [Discussions](https://github.com/msitarzewski/agency-agents/discussions) 分享你的故事！

---

## 📖 智能体设计哲学

每个智能体在设计上都有：

1. **🎭 鲜明个性**：不是通用模板——而是真实的性格与声线
2. **📋 明确交付物**：具体的产出，而非含糊的指导
3. **✅ 成功指标**：可度量的成果与质量标准
4. **🔄 经过验证的工作流**：行之有效的分步流程
5. **💡 学习记忆**：模式识别与持续改进

---

## 🎁 它特别在哪？

### 不同于通用 AI 提示词：
- ❌ "扮演一个开发者"这类千篇一律的提示词
- ✅ 带个性与流程的深度专业化

### 不同于提示词库：
- ❌ 一次性的提示词合集
- ✅ 带工作流与交付物的完整智能体系统

### 不同于 AI 工具：
- ❌ 无法定制的黑盒工具
- ✅ 透明、可 fork、可改造的智能体人格

---

## 🎨 智能体个性亮点

> "我不只是测试你的代码——我默认找出 3-5 个问题，并且对一切要求可视化证据。"
>
> —— **Evidence Collector**（测试部门）

> "你不是在 Reddit 上做营销——你是在成为一个恰好代表某个品牌的、受社区认可的社区成员。"
>
> —— **Reddit Community Builder**（市场营销部门）

> "每一个俏皮元素都必须服务于功能或情感目的。设计那种锦上添花而非喧宾夺主的愉悦感。"
>
> —— **Whimsy Injector**（设计部门）

> "让我加一个庆祝动画，把任务完成的焦虑降低 40%。"
>
> —— **Whimsy Injector**（某次 UX 评审中）

---

## 📊 数据一览

- 🎭 **230+ 个专业智能体**，覆盖所有部门
- 📝 **10,000+ 行**个性、流程与代码示例
- ⏱️ 源自真实使用的**数月迭代**
- 🌟 在生产环境中**久经考验**
- 💬 Reddit 上线头 12 小时内的**50+ 条请求**

---

## 🔌 多工具集成

代理公司原生支持 Claude Code，并附带转换 + 安装脚本，让你可以在所有主流智能体编程工具中使用同一批智能体。

### 受支持的工具

- **[Claude Code](https://claude.ai/code)**——原生 `.md` 智能体，无需转换 → `~/.claude/agents/`
- **[GitHub Copilot](https://github.com/copilot)**——原生 `.md` 智能体，无需转换 → `~/.github/agents/` + `~/.copilot/agents/`
- **[Antigravity](https://github.com/google-gemini/antigravity)**——每个智能体一个 `SKILL.md` → `~/.gemini/config/skills/`
- **[Gemini CLI](https://github.com/google-gemini/gemini-cli)**——`.md` 智能体文件 → `~/.gemini/agents/`
- **[OpenCode](https://opencode.ai)**——`.md` 智能体文件 → `.opencode/agents/`
- **[Cursor](https://cursor.sh)**——`.mdc` 规则文件 → `.cursor/rules/`
- **[Aider](https://aider.chat)**——`CONVENTIONS.md` 名册索引 → `./CONVENTIONS.md`
- **[Windsurf](https://codeium.com/windsurf)**——单个 `.windsurfrules` → `./.windsurfrules`
- **[OpenClaw](https://github.com/openclaw/openclaw)**——每个智能体 `SOUL.md` + `AGENTS.md` + `IDENTITY.md`
- **[Qwen Code](https://github.com/QwenLM/qwen-code)**——`.md` SubAgent 文件 → `~/.qwen/agents/`
- **[Kimi Code](https://github.com/MoonshotAI/kimi-cli)**——YAML 智能体规格 → `~/.config/kimi/agents/`
- **[Codex](https://developers.openai.com/codex/overview)**——TOML 自定义智能体 → `~/.codex/agents/`
- **Osaurus**——`SKILL.md` 技能 → `~/.osaurus/skills/`
- **[Hermes](/integrations/hermes/)**——lazy-router 插件 → `~/.hermes/plugins/`
- **[DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)**——`SKILL.md` 技能 → `~/.dsh/skills/`（用户）或 `.dsh/skills/`（项目）

---

### ⚡ 快速安装

**第 1 步——生成集成文件**：
```bash
./scripts/convert.sh
# 更快（并行，输出顺序可能变化）：./scripts/convert.sh --parallel
```

**第 2 步——安装**（交互式，自动检测你的工具）：
```bash
./scripts/install.sh
# 更快（并行，输出顺序可能变化）：./scripts/install.sh --no-interactive --parallel
```

安装器会扫描你系统里已装的工具，显示一个复选框界面，让你精确选择要安装什么：

```
  +------------------------------------------------+
  |   The Agency -- Tool Installer                 |
  +------------------------------------------------+

  System scan: [*] = detected on this machine

  [x]  1)  [*]  Claude Code     (claude.ai/code)
  [x]  2)  [*]  Copilot         (~/.github + ~/.copilot)
  [x]  3)  [*]  Antigravity     (~/.gemini/antigravity)
  [ ]  4)  [ ]  Gemini CLI      (~/.gemini/agents)
  [ ]  5)  [ ]  OpenCode        (opencode.ai)
  [ ]  6)  [ ]  OpenClaw        (~/.openclaw/agency-agents)
  [x]  7)  [*]  Cursor          (.cursor/rules)
  [ ]  8)  [ ]  Aider           (CONVENTIONS.md)
  [ ]  9)  [ ]  Windsurf        (.windsurfrules)
  [ ] 10)  [ ]  Qwen Code       (~/.qwen/agents)
  [ ] 11)  [ ]  Kimi Code       (~/.config/kimi/agents)
  [ ] 12)  [ ]  Codex           (~/.codex/agents)
  [ ] 13)  [ ]  Osaurus         (~/.osaurus/skills)
  [ ] 14)  [ ]  Hermes          (~/.hermes/plugins)

  [1-14] toggle   [a] all   [n] none   [d] detected
  [Enter] install   [q] quit
```

**或直接安装某个特定工具**：
```bash
./scripts/install.sh --tool cursor
./scripts/install.sh --tool opencode
./scripts/install.sh --tool openclaw
./scripts/install.sh --tool antigravity
./scripts/install.sh --tool codex
./scripts/install.sh --tool osaurus
./scripts/install.sh --tool hermes
```

**非交互式**（CI/脚本）：
```bash
./scripts/install.sh --no-interactive --tool all
```

**更快运行**（并行）——在多核机器上，使用 `--parallel` 让每个工具并行处理。跨工具的输出顺序不确定。交互式与非交互式安装都支持：例如 `./scripts/install.sh --interactive --parallel`（先选工具，再并行安装）或 `./scripts/install.sh --no-interactive --parallel`。并行数默认取 `nproc`（Linux）、`sysctl -n hw.ncpu`（macOS）或 4；可用 `--jobs N` 覆盖。

```bash
./scripts/convert.sh --parallel                    # 并行转换所有工具
./scripts/convert.sh --parallel --jobs 8           # 限制并行任务数
./scripts/install.sh --no-interactive --parallel   # 并行安装所有检测到的工具
./scripts/install.sh --interactive --parallel      # 先选工具，再并行安装
./scripts/install.sh --no-interactive --parallel --jobs 4
```

---

### 各工具的具体用法

<details>
<summary><strong>Claude Code</strong></summary>

智能体直接从仓库复制到 `~/.claude/agents/`——无需转换。

```bash
./scripts/install.sh --tool claude-code
```

然后在 Claude Code 中激活：
```
Use the Frontend Developer agent to review this component.
```

详见 [integrations/claude-code/README.md](/integrations/claude-code/)。
</details>

<details>
<summary><strong>GitHub Copilot</strong></summary>

智能体直接从仓库复制到 `~/.github/agents/` 和 `~/.copilot/agents/`——无需转换。

```bash
./scripts/install.sh --tool copilot
```

然后在 GitHub Copilot 中激活：
```
Use the Frontend Developer agent to review this component.
```

详见 [integrations/github-copilot/README.md](/integrations/github-copilot/)。
</details>

<details>
<summary><strong>Antigravity（Gemini）</strong></summary>

每个智能体变成 `~/.gemini/config/skills/agency-<slug>/` 里的一个技能。

```bash
./scripts/install.sh --tool antigravity
```

在带 Antigravity 的 Gemini 中激活：
```
@agency-frontend-developer review this React component
```

详见 [integrations/antigravity/README.md](/integrations/antigravity/)。
</details>

<details>
<summary><strong>Gemini CLI</strong></summary>

以 Gemini CLI 子智能体的形式安装。
全新 clone 时，先运行转换生成 Gemini 智能体文件，再运行安装器。

```bash
./scripts/convert.sh --tool gemini-cli
./scripts/install.sh --tool gemini-cli
```

详见 [integrations/gemini-cli/README.md](/integrations/gemini-cli/)。
</details>

<details>
<summary><strong>OpenCode</strong></summary>

智能体放在项目根目录的 `.opencode/agents/`（项目级）。

```bash
cd /your/project
/path/to/agency-agents/scripts/install.sh --tool opencode
```

或全局安装：
```bash
mkdir -p ~/.config/opencode/agents
cp integrations/opencode/agents/*.md ~/.config/opencode/agents/
```

在 OpenCode 中激活：
```
@backend-architect design this API.
```

详见 [integrations/opencode/README.md](/integrations/opencode/)。
</details>

<details>
<summary><strong>Cursor</strong></summary>

每个智能体变成项目 `.cursor/rules/` 里的一个 `.mdc` 规则文件。

```bash
cd /your/project
/path/to/agency-agents/scripts/install.sh --tool cursor
```

Cursor 在项目中检测到规则时会自动应用。也可以显式引用：
```
Use the @security-engineer rules to review this code.
```

详见 [integrations/cursor/README.md](/integrations/cursor/)。
</details>

<details>
<summary><strong>Aider</strong></summary>

`CONVENTIONS.md` 是名册索引——包含每个智能体的名称、描述及其完整指令的路径。Aider 会让约定文件在整个会话中保持在上下文里，而所有智能体正文加起来约有一百万 token，所以该文件只列出智能体而不是内联它们。

```bash
cd /your/project
/path/to/agency-agents/scripts/install.sh --tool aider
```

然后在你的 Aider 会话中引用智能体：
```
Use the Frontend Developer agent to refactor this component.
```

需要某个智能体的完整指令时，读取它的文件：
```
/read-only /path/to/agency-agents/engineering/engineering-frontend-developer.md
```

详见 [integrations/aider/README.md](/integrations/aider/)。
</details>

<details>
<summary><strong>Windsurf</strong></summary>

所有智能体被编译进项目根目录的 `.windsurfrules`。

```bash
cd /your/project
/path/to/agency-agents/scripts/install.sh --tool windsurf
```

在 Windsurf 的 Cascade 中引用智能体：
```
Use the Reality Checker agent to verify this is production ready.
```

详见 [integrations/windsurf/README.md](/integrations/windsurf/)。
</details>

<details>
<summary><strong>OpenClaw</strong></summary>

每个智能体变成 `~/.openclaw/agency-agents/` 里的一个工作区，含 `SOUL.md`、`AGENTS.md` 和 `IDENTITY.md`。

```bash
./scripts/convert.sh --tool openclaw
./scripts/install.sh --tool openclaw
```

如果 `openclaw` CLI 可用，安装器会自动注册每个工作区。
安装后运行 `openclaw gateway restart`，让新智能体生效。

详见 [integrations/openclaw/README.md](/integrations/openclaw/)。

</details>

<details>
<summary><strong>Qwen Code</strong></summary>

SubAgent 安装到项目根目录的 `.qwen/agents/`（项目级）。

```bash
# 转换并安装（在项目根目录运行）
cd /your/project
./scripts/convert.sh --tool qwen
./scripts/install.sh --tool qwen
```

**在 Qwen Code 中的用法**：
- 按名称引用：`Use the frontend-developer agent to review this component`
- 或让 Qwen 根据任务上下文自动分派
- 在交互模式下用 `/agents` 命令管理

> 📚 [Qwen SubAgents Docs](https://qwenlm.github.io/qwen-code-docs/en/users/features/sub-agents/)

</details>

<details>
<summary><strong>Kimi Code</strong></summary>

智能体被转换为 Kimi Code CLI 格式（YAML + 系统提示词）并安装到 `~/.config/kimi/agents/`。

```bash
# 转换并安装
./scripts/convert.sh --tool kimi
./scripts/install.sh --tool kimi
```

**配合 Kimi Code 使用**：
```bash
# 使用一个智能体
kimi --agent-file ~/.config/kimi/agents/frontend-developer/agent.yaml

# 在某个项目中
kimi --agent-file ~/.config/kimi/agents/frontend-developer/agent.yaml \
     --work-dir /your/project \
     "Review this React component"
```

详见 [integrations/kimi/README.md](/integrations/kimi/)。

</details>

<details>
<summary><strong>Codex</strong></summary>

每个智能体被转换成 Codex 自定义智能体 TOML 文件并安装到 `~/.codex/agents/`。

```bash
./scripts/convert.sh --tool codex
./scripts/install.sh --tool codex
```

然后在 Codex 中按名称引用该自定义智能体：
```
Use the Frontend Developer agent to review this component.
```

详见 [integrations/codex/README.md](/integrations/codex/)。
</details>

<details>
<summary><strong>DeepSeek Harness</strong></summary>

每个智能体变成 `${DSH_HOME:-$HOME/.dsh}/skills/agency-<slug>/` 里的一个 DSH 技能（带 Agent-Skills frontmatter 的 `SKILL.md`）。技能会被实时发现——无需重启。

```bash
./scripts/convert.sh --tool dsh
./scripts/install.sh --tool dsh
```

自定义用户主目录：
```bash
DSH_HOME=~/.config/dsh ./scripts/install.sh --tool dsh
```

项目级安装（在项目根目录运行）：
```bash
DSH_SKILLS_DIR=.dsh/skills ./scripts/install.sh --tool dsh
```

在 DeepSeek Harness 中激活——默认用户和模型都可调用：
```
/agency-frontend-developer review this React component
```

详见 [integrations/dsh/README.md](/integrations/dsh/)。
</details>

---

### 变更后重新生成

新增或修改智能体后，重新生成所有集成文件：

```bash
./scripts/convert.sh                    # 重新生成全部（串行）
./scripts/convert.sh --parallel         # 并行重新生成全部（更快）
./scripts/convert.sh --tool codex       # 只重新生成一个工具
./scripts/convert.sh --tool cursor      # 只重新生成一个工具
```

---

## 🗺️ 路线图

- [ ] 交互式智能体选择器 Web 工具
- [x] 多智能体工作流示例——见 [examples/](examples/)
- [x] 多工具集成脚本（Claude Code、GitHub Copilot、Antigravity、Gemini CLI、OpenCode、OpenClaw、Cursor、Aider、Windsurf、Qwen Code、Kimi Code、Codex、Osaurus、Hermes）
- [ ] 智能体设计视频教程
- [ ] 社区智能体市场
- [ ] 用于项目匹配的智能体"性格测试"
- [ ] "每周智能体"系列展示

---

## 🌐 社区翻译与本地化

由社区维护的翻译与区域化改编。它们相互独立维护——覆盖范围与版本兼容性请查看各自仓库。

| 语言 | 维护者 | 链接 | 备注 |
|----------|-----------|------|-------|
| 🇨🇳 简体中文 (zh-CN) | [@jnMetaCode](https://github.com/jnMetaCode) | [agency-agents-zh](https://github.com/jnMetaCode/agency-agents-zh) | 141 个已翻译智能体 + 46 个中国市场原创智能体 |
| 🇨🇳 简体中文 (zh-CN) | [@dsclca12](https://github.com/dsclca12) | [agent-teams](https://github.com/dsclca12/agent-teams) | 独立翻译，带 Bilibili、微信、小红书本地化 |
| 🇧🇷 Português brasileiro (pt-BR) | [@jnMetaCode](https://github.com/jnMetaCode) | [agency-agents-pt-BR](https://github.com/jnMetaCode/agency-agents-pt-BR) | 已翻译 184 个上游智能体；欢迎面向巴西市场的 PR |
| 🇷🇺 Русский (ru) | [@jnMetaCode](https://github.com/jnMetaCode) | [agency-agents-ru](https://github.com/jnMetaCode/agency-agents-ru) | 已翻译 184 个上游智能体；欢迎面向俄罗斯市场的 PR |
| 🇮🇩 Bahasa Indonesia (id) | [@jnMetaCode](https://github.com/jnMetaCode) | [agency-agents-id](https://github.com/jnMetaCode/agency-agents-id) | 已翻译 184 个上游智能体；欢迎面向印尼市场的 PR |
| 🇸🇦 العربية (ar) | [@jnMetaCode](https://github.com/jnMetaCode) | [agency-agents-ar](https://github.com/jnMetaCode/agency-agents-ar) | 已翻译 184 个上游智能体；欢迎面向阿拉伯语市场的 PR |
| 🇰🇷 한국어 (ko) | [@jnMetaCode](https://github.com/jnMetaCode) | [agency-agents-ko](https://github.com/jnMetaCode/agency-agents-ko) | 已完整翻译 184 个上游智能体；欢迎面向韩国的 PR |
| 🇯🇵 日本語 (ja-JP) | [@sscodeai](https://github.com/sscodeai) | [agency-agents-ja](https://github.com/sscodeai/agency-agents-ja) | 281 个日本本地化智能体 + 97 个日本市场原创智能体 + 27 个工作流 |
| 🇻🇳 Tiếng Việt (vi-VN) | [@rodonguyen](https://github.com/rodonguyen) | [agency-agents](https://github.com/rodonguyen/agency-agents) | 越南语本地化起步版，聚焦 README、快速开始与高频文档 |

想添加一种翻译？提一个 issue，我们会在这里挂上链接。

---

## 📜 许可证

MIT 许可证——可自由用于商业或个人用途。欢迎署名致谢，但不作要求。

---

## 🙏 致谢

最初只是 Reddit 上一条关于 AI 智能体专业化的帖子，如今已成长为一件了不起的事——**覆盖所有部门的 230+ 个智能体**，背后是全球范围的贡献者社区。本仓库里的每个智能体之所以存在，都是因为有人愿意花心思写它、测它、分享它。

向每一个提过 PR、发过 issue、开过 Discussion，或仅仅试用某个智能体并告诉我们哪里好用的人——谢谢。代理公司能不断变好，全靠你们。

---

## 💬 社区

- **GitHub Discussions**：[分享你的成功故事](https://github.com/msitarzewski/agency-agents/discussions)
- **Issues**：[报告 bug 或请求新功能](https://github.com/msitarzewski/agency-agents/issues)
- **Reddit**：加入 r/ClaudeAI 的讨论
- **Twitter/X**：带 #TheAgency 标签分享

---

## 🚀 上手开始

1. **浏览**上面的智能体，找到你需要的专家
2. **复制**智能体到 `~/.claude/agents/` 以接入 Claude Code
3. 在 Claude 对话中引用智能体来**激活**它们
4. 为你的具体需求**定制**智能体的人格与工作流
5. **分享**你的成果并回馈社区

---

<div align="center">

**🎭 代理公司：你的 AI 梦之队正在等你 🎭**

[⭐ 给仓库点星](https://github.com/msitarzewski/agency-agents) • [🍴 Fork 仓库](https://github.com/msitarzewski/agency-agents/fork) • [🐛 报告问题](https://github.com/msitarzewski/agency-agents/issues) • [❤️ 赞助](https://github.com/sponsors/msitarzewski)

由社区怀着 ❤️ 制作，为社区服务

</div>