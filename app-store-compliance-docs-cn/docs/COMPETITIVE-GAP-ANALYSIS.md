# 竞品差距分析。其他仓库发布了什么、我们采纳了什么

本文档是一次调研的成果：我们梳理了已经在发布 App Store 与 Google Play 合规知识的开源仓库，研究每个仓库为何存在、收录了什么，对照本实战手册找出差距，再把缺失的模式回填进来。持续维护这份文档，是为了让本实战手册始终是最完整的开放参考，而不是一份静态快照。

方法：每个仓库都通过 GitHub API 完整读过一遍，提取其结构与独有内容，再逐字段与本实战手册对照。调研中发现的差距逐一列出，我们已采纳的部分则加以标注。

## 调研覆盖的仓库

| 仓库 | Star 数 | 收录内容 | 存在原因 |
|---|---|---|---|
| truongduy2611/app-store-preflight-skills | 约 1,224 | 一个 AI agent 技能，扫描 iOS 或 macOS 项目，通过 asc CLI 拉取 App Store Connect 元数据，并对照按 10 类应用清单组织的、收录 100 多条审核指南的完整索引逐条核查 | 最受欢迎的同类项目。它让 agent 在提交前就抓出拒审风险，与本实战手册目标一致 |
| lukylab/appstore-submission-checklist | 约 17 | 两份实用清单，一份面向新应用首次提交，一份面向版本更新，出自一位有 10 多个在架应用的独立开发者之手 | 新应用与版本更新被拒的原因不同，所以它把两者分开 |
| andrewmcwattersandco/app-store-rejections | 约 14 | 真实、可点名溯源的 App Store 拒审案例社区合集，附链接 | 提醒开发者注意第三方商店（marketplace）渠道的风险，并鼓励自行发行 |
| jaywcjlove/app-rejection-fixes | 少量 | 拒审原因逐条配上让它过审的修复方法 | 一位在职开发者记录自己碰到并解决的拒审 |
| hnxyzhw/AppStoreReviewsAndRejected | 少量 | Apple 拒审邮件原文，按审核指南条目归类，附中文翻译与修复方法 | 保留了审核员（reviewer）的原话，这是判断什么会触发拒审最具体的信号 |
| aashishtamsya/Appstore-Review-Guidelines | 约 90 | 一份较早期、按类别整理的审核指南精选清单 | 社区对提交前参考的早期尝试 |

## 这些仓库暴露出的差距，以及我们的采纳情况

### 1. 按应用类型划分的清单。已采纳

最受欢迎的仓库把检查项按十类应用类型组织，因为游戏应用和金融应用被拒的原因截然不同。本实战手册原本是平铺结构。我们把它采纳为新文档 `BY-APP-TYPE.md`，把每类应用映射到最容易命中它的关键审核指南。这是本次调研带来的最大单项结构性改进。

### 2. macOS 作为一等公民目标平台。已采纳

榜首仓库把 macOS 与 Mac App Store 单独列成一份清单。本实战手册原本只覆盖 iOS 与 Android。macOS 有自己的一套规则：沙盒机制、公证（notarization）、没有 App Store 之外的更新机制，以及 2.4.5 这一组 Mac 专属条款。我们已在按应用类型文档中新增 macOS 一节。

### 3. 拉取真实的 App Store Connect 元数据。已采纳为指导原则

榜首仓库集成了 asc CLI，用来拉取线上商店详情页元数据并加以检查，而不只是扫描源代码。我们的守卫（guard）只扫描源代码。我们已在技能中加入指引：最强的审计应当用 asc CLI 或 App Store Connect API 拉取真实的 App Store Connect 元数据，并核对线上详情页里的文字，因为很大一部分拒审出在元数据上，而不是代码上。

### 4. 具体的元数据拒审规则。已采纳进拒审模式分类

榜首仓库与中文拒审邮件合集点名了一些精确的触发条件（trigger），此前我们的拒审模式分类（rejection pattern taxonomy）中没有对应模式。

- 应用图标或截图中出现 Apple 设备图片或 Apple 商标——审核指南 5.2.5。
- 预览视频里给应用套上设备边框——审核指南 2.3.4。
- 订阅定价把月度价格展示得比实际扣费金额更醒目——审核指南 3.1.2。
- 订阅缺少使用条款（Terms of Use）或 EULA 以及隐私政策链接——审核指南 3.1.2。
- 在中国店面（storefront），提及 ChatGPT、Gemini 之类外部 AI 服务可能触发区域性拒审。
- 新提交的审核备注（review notes）缺少屏幕录像、应用用途、测试凭据、外部服务细节、地区信息或监管文件——审核指南 2.1。

### 5. 用户生成内容的 24 小时规则。已采纳

中文合集收录的 Safety 1.2 真实拒审邮件写明了确切要求：开发者必须在 24 小时内针对不良内容举报采取行动，移除内容并将该用户逐出。我们原本对 1.2 的覆盖写到了过滤、举报与屏蔽，但没写 24 小时行动窗口，也没写零容忍的 EULA。现在两者都已收录。

### 6. 金融类应用需要公司开发者账号。已采纳

PLA 1.2 的拒审邮件表明：金融类应用以个人账号提交会被拒。这进一步印证了我们关于 5.1.1(ix) 受监管领域的规则，如今已针对金融类应用明确写明。

### 7. 新应用与版本更新的拆分。已采纳进清单

版本更新被拒的原因与首次提交不同。我们的清单如今按这样的框架组织：首次提交事项——演示账号（demo account）、审核备注、元数据——明确是最吃重的部分，而更新事项聚焦在这次改动了什么。

### 8. 真实拒审案例。已采纳进错误模式文档

社区合集收录了可点名溯源的真实拒审，比抽象规则更有教育意义：Halide 相机应用因没有说明为何使用相机而被拒、iDOS 模拟器被下架，以及长青应用因久未更新而被撤下的模式。这些如今都是错误模式文档中的案例。

### 9. 审核指南沿革参考。已采纳为参考资料

那份清单仓库指向 App Store Review Guidelines History 网站，它追踪审核指南随时间的沿革变化。当某次拒审引用了一条刚被改写过措辞的规则时，这个参考就很有用。

## 我们已有而它们没有的部分

本次调研也确认了本实战手册领先的地方。

- Google Play 深度。大多数同类仓库只覆盖 iOS。本实战手册携带完整的 Google Play 政策映射、四级执法阶梯、12 名测试人员规则，以及数据安全（Data safety）。
- 法律层。调研覆盖的仓库没有一个深入到 GDPR 合法依据、欧盟 AI 法案、DSA 或 COPPA 的深度。本实战手册做到了，并明确指出：商店合规不等于法律合规。
- 跨商店覆盖。华为、中国各商店、Samsung、Amazon、Microsoft 与 RuStore，见 `OTHER-STORES.md`。
- 一个带测试套件、真正可运行的自动化守卫，而不只是一份纸面清单。

## 榜首仓库曾有的两处领先，现已抹平

本分析的第一轮就如实指出：最受欢迎的仓库有两处领先于我们。如今这两处都已抹平。

1. 实时元数据拉取与自动修复闭环。我们构建了 `scripts/metadata-audit.py`，对照元数据拒审规则审计真实的商店详情页——名称、副标题、关键词、描述、宣传文本、审核备注与 URL，并带有一个提案并复验的循环；另加 `scripts/pull-metadata.sh`，通过 asc CLI 拉取 Apple 线上详情页。元数据层已有测试覆盖。
2. 逐条规则的检测命令。`references/rules/` 目录树中的每条规则现在都带一条具体的检测命令，由 `data/detection-recipes.json` 生成。agent 或开发者可以对每条规则运行精确的 grep、plist 或 manifest 检查。

剩下的不是能力差距，而是采用与积累。最受欢迎的仓库握有那些 star，那是靠发布、传播与贡献随时间挣来的，而通往那一步的入口通道已经就位。

## 第二次调研：2026 年 11 月 15 日

一个月后重复了这次调研。上述六个仓库中，只有 `truongduy2611/app-store-preflight-skills` 有变化（同步到了 2026 年 10 月 16 日的审核指南，而这一版本实战手册早已收录）。以下新仓库均为 2026 年 11 月 15 日通过 GitHub API 读取。

| 仓库 | Star 数 | 最近推送 | 收录内容 |
|---|---|---|---|
| RevylAI/greenlight | 2474 | 2026-08-05 | Go 扫描器，覆盖源代码、隐私清单（privacy manifest）、构建出的 IPA 与 AAB 文件、App Store Connect 元数据，支持 SARIF 输出与运行时流程检查 |
| safaiyeh/app-store-review-skill | 454 | 2026-10-17 | 一个 agent 技能，规则按审核指南章节拆分 |
| devsemih/appstore-review-skill | 106 | 2026-11-11 | iOS 与 Play 审计，含构建产物检查、修复方法与拒审回复起草 |
| dabodamjan/app-store-rejection-checker | 88 | 2026-11-05 | 一个技能，带拒审模式分类与近期变更文件 |
| berkayturk/appstore-precheck | 12 | 2026-10-22 | Bash 关卡，附带每周审核指南漂移检查工作流 |
| wajahatkarim3/play-data-safety-skill | 11 | 2026-11-13 | 从按 SDK 归集的证据映射生成 Play 数据安全（Data safety）CSV |
| RobertoJoseph/appstore-rejections-mcp | 16 | 2026-02-15 | 一个 MCP server，覆盖真实拒审案例 |

### 2.4.0 版已采纳的内容

- 守卫此前漏掉的上传路径。`helm-asc` 上传与 `--submit`、`asc` CLI，以及 Codemagic 的 `app-store-connect publish` 命令，现在都会触发扫描。
- 仅 IPv6 的审核网络（2.5.5）。`inet_addr`、`inet_aton` 与 `gethostbyname` 会被标出，且 C 与 C++ 源代码现在也会被扫描，原生代码不再处于扫描盲区。
- 可调试的 Android 构建、缺少 subtype 属性的 `specialUse` 前台服务，以及只发布 `armeabi-v7a` 而不含 `arm64-v8a` 的 `abiFilters`。
- 同一应用中同时出现 HealthKit 与 iCloud 存储（5.1.3(ii)），作为报告交由人工确认，因为仅凭共存并不能证明健康数据会进入 iCloud。

### 评估后未采纳的内容及原因

- 把 200 MB 蜂窝网络下载上限当成拒审规则。它并不是上传环节的拒审阈值，把它编成规则会误拦正常应用。
- 启动 storyboard 要求。Info.plist 里的 `UILaunchScreen` 是被认可的替代方案，所以检查 storyboard 会误报。
- 用关键词屏蔽试用开关、倒计时与权限预热页面。这些本身并不构成违规，而且 `APPLE-3.1.2-MISLEADING-PRICING` 已经覆盖欺骗性定价。

### 留待后续版本跟进的较大工作

- 检查构建出的 IPA、APK 与 AAB，包括合并后的 Android manifest、16 KB ELF 与 ZIP 对齐，以及内嵌 framework 的隐私清单与签名。
- 用免费的 XCUITest 或 Maestro 流程做运行时验证，证明应用内账号删除、恢复购买与 Sign in with Apple 确实可用。
- 数据安全（Data safety）CSV 生成器、从拒审消息起草回复、基于模式数据的 MCP server，以及每周的审核指南页面 diff。

## 长期固定的流程

这份分析是可重复执行的。每当出现新的同类仓库，就通过 API 读一遍，提取其结构与独有规则，与本实战手册做 diff，再把净新增的模式并入。欢迎把其他开源清单中的模式带过来的贡献，请附上来源链接。
