# 差距分析（2026 年 9 月）

<!-- freshness: 60d -->

本篇记录：检查了什么；自上一轮扫描以来平台与法律发生了什么变化；开发者在公开渠道报告了什么；以及本实战手册据此新增或修正了什么。已于 2026 年 9 月 5 日对照一手来源完成核验。凡是无法从一手来源读到的内容，都列在"未经验证"一节之下，而不是揉进规则里。

## 1. 方法

- Apple：抓取并通读了 2026 年 6 月 1 日以来的每一条 App Store Connect、App Review 与 Developer Program 公告，并把 6 月 8 日的审核指南文本与上一版做了 diff。88% 的条目直接在 developer.apple.com 上读取，其余在 Apple 支持页面上读取。
- Google：自 2026 年 6 月 1 日以来的每一条 Play Console 帮助政策公告与每一篇 Android Developers Blog 文章，外加 Android 17（API 37）的行为变更页面。
- 法规：五轮区域扫描（欧盟、英国、美国联邦、亚太，以及加拿大、澳大利亚、巴西），每轮只返回带日期且附有法规原文引句的条目。federalregister.gov、ecfr.gov、congress.gov、ofcom.org.uk、ico.org.uk 与 meity.gov.in 拒绝了脚本抓取；这些条目改经 govinfo 批量数据、带请求头的浏览器会话或镜像读取，并如实标注。
- 社区：围绕 App Store 与 Play 的拒审，在 Reddit、Hacker News、GitHub 与 YouTube 上做了一轮 30 天扫描，另外针对开发者核验专项扫描了 r/appledevelopers。Reddit 在扫到 15 条后触发限流并封锁了所有直接抓取，因此 Reddit 的覆盖是部分的，此处也如实写为部分覆盖。
- 仓库：在写入任何东西之前，每一条发现都先与 `data/rejection-patterns.json`、`data/regulatory-deadlines.json`、守卫以及文档做了 diff。

## 2. 开发者在说什么（差距背后的痛点）

下面每一项都产出了一条模式、一个截止日期或一处文档变更。引文逐字取自保存在 `~/Documents/Last30Days/` 下的原始文件。

- Play 的拒付（chargeback）损失现在落在开发者身上。来源：r/androiddev，"Google Play's chargeback/dispute changes cost you $28.50 on a $5 sale"。已在 Play Console 帮助答案 17068375 上核验。2026 年 8 月 3 日之后的订单会把有争议的购买金额转由开发者承担，而 Review Refund API 是对拒付提出异议的唯一途径。已新增 GOOGLE-PLAY-CHARGEBACK-LIABILITY，外加一条针对"使用 Play Billing 却未处理退款复核"的守卫检查。
- 捐赠链接会按 Payments 政策被判拒审。来源：AnkiDroid issue 21656（Hacker News 上 921 分）。Google 自己被 issue 引用的原话："501(c)(6) status does not suffice because user donations are not tax-exempt." 已新增 GOOGLE-PAYMENTS-DONATION-LINK，以及一条针对 Android 构建中 Open Collective、Ko-fi、Patreon 及类似链接的守卫检查。
- 外购（external purchase）链接只是仅限美国的例外安排。多份实施报告都指出：全球同一套链接 UI 一旦上线，在美国以外会依据 3.1.1 被拒，而且要"预留两轮拒审的预算"。已新增 APPLE-3.1.1-EXTERNAL-LINK-REGION-GATING，并带有一个按店面（storefront）门控的反向信号。
- Android 开发者核验会让按 bundle id 分别配置的做法感到困惑。来源：r/expo，"my app was automatically verified by Android for the new policy ... However, I do have separate bundle identifiers." 已新增 GOOGLE-PLAY-APP-REGISTRATION-MISSING（每个已分发的包名都要在 2026 年 9 月 30 日前完成登记）以及账号就绪清单。
- Vibe coding 产出的应用很晚才发现要过审。来源："I thought being able to build was enough to launch an app. I was wrong." 提交前清单因此新增了"账号与开发者计划就绪"一节，让那些卡在审核之前的障碍在第一次构建之前就能看见。
- React Native 与 Expo 构建被标记为"App optimization: Low"。来自 r/reactnative 的两个独立帖子。已溯源到 2027 年 2 月的技术质量要求（R8 覆盖率至少 25%）。已新增 ANDROID-R8-OPTIMIZATION-MISSING，并附带一个 Gradle 检查。

## 3. r/appledevelopers 核验问题的验证结果

这个问题要问的是：r/appledevelopers 上有多少人报告自己真的通过了核验，以及实战手册是否覆盖了这些步骤。

- 子版块证据：last30days 对 r/appledevelopers 的扫描在窗口期内返回了四个帖子（一个 Individual 账号的 Team Name 修改、一例因审核期间隐藏功能而被以 Guideline 5.6 下架的案例、一个计时器应用上线，以及一个 Private Cloud Compute entitlement 问题）。其中没有任何一个是核验帖。Reddit 在中途返回 HTTP 429，并封锁了包括无头浏览器会话在内的所有直接抓取，因此这只是部分覆盖，并不能证明该话题不存在。
- 论坛证据——痛点真正显形的地方。Apple Developer Forums 的帖子 817247 上有五条回复，讨论 Developer Program 注册卡在身份验证环节：四条仍在等待，一条约一个月后获批，一条已退款。帖子 816626 报告身份材料上传链接持续失败超过 45 天，报错为"Sorry, you don't have access. Your account isn't authorized to upload files"。帖子 816864、817185、813667、821680、814930 与 767809 报告的情况如出一辙，另有一桩个人转组织（individual-to-organization）迁移已挂起 61 天。来源：[帖子 817247](https://developer.apple.com/forums/thread/817247)、[帖子 816626](https://developer.apple.com/forums/thread/816626)。
- 实战手册此前有没有覆盖它。没有。注册与账号就绪只以"VPN 组织注册"一行和"Health 组织迁移"一行的形式出现过。没有任何内容指出账号会在审核开始之前把上线卡住数周；Guideline 5.6 也只是表格中的一行。
- 改了什么。新增 APPLE-ENROLLMENT-VERIFICATION-PENDING（人工维护模式、六周注册提前量、接受 ADPLA 附件、迁移提前一个季度启动）、`docs/PRE-SUBMISSION-CHECKLIST.md` 中的"账号与开发者计划就绪"一节，以及 Apple 2026 变更清单中的账号就绪条目。基于所读证据的诚实计数：六份给出明确结果的注册报告中，一份已核验，一份已退款，四份仍在等待。

## 4. Apple：已核实的差异

| 变更 | 来源 | 仓库动作 |
|---|---|---|
| 社交媒体能力声明自 2026 年 9 月起成为提交闸口，最低 13+，未满 13 岁须走 Declared Age Range | [0d2gpmml](https://developer.apple.com/news/?id=0d2gpmml), [tlur8uvi](https://developer.apple.com/news/?id=tlur8uvi) | APPLE-2.3.6-SOCIAL-MEDIA-DECLARATION、截止日期、APPLE.md 行 |
| Sign in with Apple 的中继地址也会来自 private.icloud.com | [1ptvdtcm](https://developer.apple.com/news/?id=1ptvdtcm) | APPLE-4.0-SIWA-RELAY-DOMAIN、守卫检查 |
| 年龄核验（age assurance）要求 iOS 26.2 SDK，并要求处理 RESCIND_CONSENT | [年龄核验支持](https://developer.apple.com/support/age-assurance) | APPLE-5.1.1-RESCIND-CONSENT-UNHANDLED、守卫检查 |
| 明确点名 Guideline 1.2 的 UGC 升级与 4.5.3 的 Live Activities（2026 年 6 月 8 日） | [审核指南](https://developer.apple.com/app-store/review/guidelines/) | 模式更新、APPLE-4.5.3-LIVE-ACTIVITY-SPAM |
| On-Demand Resources 自 27 OS 家族起废弃 | [WWDC26 App Store 指南](https://developer.apple.com/wwdc26/guides/app-store/) | APPLE-ODR-DEPRECATED-27、守卫检查 |
| App Store Connect API 4.3 与 4.4 移除了旧的年龄分级端点 | [API 4.4 发布说明](https://developer.apple.com/documentation/appstoreconnectapi/app-store-connect-api-4-4-release-notes) | APPLE-ASCAPI-AGERATING-ENDPOINT-REMOVED、守卫检查 |
| Rosetta 退场：按 9 月 1 日公告是 macOS 27，按 9 月 9 日公告是 macOS 26 | [w5ngl9k2](https://developer.apple.com/news/?id=w5ngl9k2), [k1mtkt1k](https://developer.apple.com/news/?id=k1mtkt1k) | APPLE-MACOS-ROSETTA-SUNSET |
| 2027 年 4 月起上传须满足 SDK 27 下限（iOS、iPadOS、tvOS、visionOS、watchOS） | [k1mtkt1k](https://developer.apple.com/news/?id=k1mtkt1k) | APPLE-SDK-27-REQ 截止日期、PLATFORM-MECHANICS 第 1.6 节 |
| App Review 联系电话须用国际格式；每种类型的首个应用内购买（In-App Purchase，IAP）都需要新的应用版本（2026 年 8 月 19 日） | [App Store Connect 发布说明](https://developer.apple.com/help/app-store-connect/release-notes/) | 提交前清单、APPLE.md 的 Notes for Review |
| iPhone Duo、iPhone 18 Pro 与 Pro Max、Apple Watch Ultra 4 与 Series 12 的截屏规格（2026 年 9 月 9 日） | [截屏规格](https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications) | PLATFORM-MECHANICS 第 1.6 节、清单 |
| 欧盟统一条款自 2026 年 10 月 1 日起，CTC 取代 CTF，附件 14（Attachment 14） | [gmws0jgp](https://developer.apple.com/news/?id=gmws0jgp), [0cgo95n6](https://developer.apple.com/news/?id=0cgo95n6) | EU-DMA-UNIFIED-TERMS-2026、EU-REGULATORY 第 2.3 节已重写 |
| 巴西替代分发自 iOS 26.5 起，附件 12（Attachment 12）须在 2026 年 7 月 6 日前完成 | [dhwadr2x](https://developer.apple.com/news/?id=dhwadr2x), [umq9wxmm](https://developer.apple.com/news/?id=umq9wxmm) | 截止日期、GLOBAL-REGULATORY 第 3.3 节 |
| 澳大利亚移除 15+ 档，越南 Decree 147 分级，韩国描述词调整 | [yrrb45pw](https://developer.apple.com/news/?id=yrrb45pw), [oj3r9pvw](https://developer.apple.com/news/?id=oj3r9pvw) | 截止日期、GLOBAL-REGULATORY 第 3.2、3.5、3.10 节 |
| 巴西投注牌照检查需要新的二进制文件 | [x4eyetnp](https://developer.apple.com/news/?id=x4eyetnp) | APPLE-GAMBLING-BRAZIL-LICENSE 的修复方法文本 |

已修正的过期条目：`docs/PLATFORM-MECHANICS-2026.md` 为 2026 年 6 月的 Guideline 4.3 收紧所引用的公告 id 有误（现为 a233fmpw），且仍写着 API 35（现为 API 36，并附带 2026 年 11 月 1 日的宽展）。`docs/EU-REGULATORY-2026.md` 第 2.3 节曾说统一费率模式尚未实施——实际已实施，自 2026 年 10 月 1 日起。

## 5. Google Play 与 Android：已核实的差异

| 变更 | 来源 | 仓库动作 |
|---|---|---|
| 拒付（chargeback）成本转嫁，2026 年 8 月 3 日 | [Play Console 帮助 17068375](https://support.google.com/googleplay/android-developer/answer/17068375) | GOOGLE-PLAY-CHARGEBACK-LIABILITY、守卫检查、截止日期、GOOGLE-PLAY.md 行 |
| Payments 政策下的捐赠链接 | [Payments 政策](https://support.google.com/googleplay/android-developer/answer/9992660) | GOOGLE-PAYMENTS-DONATION-LINK、守卫检查 |
| 受监管类目须用组织账号，2026 年 9 月 30 日 | [Play Console 要求](https://support.google.com/googleplay/android-developer/answer/10788890) | GOOGLE-ORG-REGISTRATION-REQUIRED、守卫检查、截止日期 |
| 为开发者核验登记每一个包名，2026 年 9 月 30 日 | [2026 年 7 月 15 日公告](https://support.google.com/googleplay/android-developer/answer/17134731) | GOOGLE-PLAY-APP-REGISTRATION-MISSING、截止日期 |
| READ_CALL_LOG 不再允许用于电话核验，2026 年 8 月 26 日 | 同上 | GOOGLE-PERM-SMS-CALLLOG 检测已更新 |
| 匿名与随机聊天应用纳入儿童安全标准（Child Safety Standards）范围 | [17036597](https://support.google.com/googleplay/android-developer/answer/17036597) | GOOGLE-ANON-CHAT-MINOR-BLOCK、守卫检查 |
| 生成式 AI 的 NCII（未经同意的亲密影像）管控，2026 年 8 月 25 日 | [Android Developers Blog](https://android-developers.googleblog.com/2026/08/ensuring-safety-genai-preventing-non-consensual-intimate-content.html) | GOOGLE-GENAI-NCII-CONTROLS、守卫检查 |
| 禁止未分级应用；用户数据政策纳入第三方 AI | [17134731](https://support.google.com/googleplay/android-developer/answer/17134731) | GOOGLE-UNRATED-APP-BANNED |
| API 37 目标：Contact Picker、位置按钮、地理围栏退出前台服务（2027 年 1 月 27 日） | [16909972](https://support.google.com/googleplay/android-developer/answer/16909972), [16965181](https://support.google.com/googleplay/android-developer/answer/16965181) | 三条模式、按目标 SDK（TSDK）门控的守卫区块、截止日期 |
| 技术质量（R8、内存）为 2027 年 2 月，Restore Credentials 为 2027 年 4 月 | [17492799](https://support.google.com/googleplay/android-developer/answer/17492799) | ANDROID-R8-OPTIMIZATION-MISSING、ANDROID-RESTORE-CREDENTIALS-REQUIRED、多个截止日期 |
| Android 17 的 ACCESS_LOCAL_NETWORK、只读原生库、按应用内存上限 | [Android 17 行为变更](https://developer.android.com/about/versions/17/behavior-changes-17) | 新增 ANDROID-LOCAL-NETWORK-PERMISSION；ANDROID-DYNAMIC-CODE-LOADING 已更新 |
| 目标 API 36，宽展至 2026 年 11 月 1 日；Billing v8 阶梯延至 2028 年 | [Target SDK](https://developer.android.com/google/play/requirements/target-sdk) | 截止日期文本已更新；GOOGLE-TARGET-API 已更新 |
| 美国替代计费报告义务自 2026 年 10 月 1 日起；Play Catalog Access 自 2026 年 7 月 22 日起为默认 | [16497028](https://support.google.com/googleplay/android-developer/answer/16497028), [17117200](https://support.google.com/googleplay/android-developer/answer/17117200) | 截止日期；GOOGLE-PLAY.md 一节 |

更正（2026 年 11 月 23 日）：上面 READ_CALL_LOG 一行记录的 2026 年 8 月 26 日出自 2026 年 7 月 15 日的公告（Play Console 帮助答案 17134731）。该公告点名了这项变更，但没有给出具体日期。2026 年 11 月 23 日读到的答案 10208820 说明：以电话呼叫做账号核验自 2027 年 1 月 27 日起不再是 READ_CALL_LOG 的允许用途，且该页的例外表在此之前仍列出这一用途。2026 年 10 月 29 日的公告（答案 18100766）给出同一日期，并新增了 SMS User Consent API。替代方案是 Digital Credentials API（可直接使用，或经由构建于其上的核验服务商）、SMS Retriever API 以及 SMS User Consent API。9 月那一行按原样保留。

## 6. 法规：已核实的差异

共新增 38 个截止日期，修正 8 个。带日期的完整清单在 `data/regulatory-deadlines.json`，汇总视图在 `docs/REGULATORY-TIMELINE.md`。

- 美国：DOJ 的 ADA Title II 与 HHS 的 Section 504 移动应用无障碍日期，已被 2026 年的临时最终规则（interim final rule）延至 2027 年 4 月 26 日和 2027 年 5 月 11 日（大型实体），以及 2028 年 4 月 26 日和 2028 年 5 月 10 日（小型实体）。FTC 关于 COPPA 年龄验证的政策声明（2026 年 2 月 25 日）仍是有效的安全港。COPPA 2.0 已过参议院，KIDS Act 已过众议院，但两者都还不是法律。COPPA 第 312.11 条的例外约束的是安全港（Safe Harbor）项目而非开发者——这是对早先文本的一处更正。
- 英国：DUAA 于 2026 年 2 月 5 日生效，投诉流程自 2026 年 6 月 19 日起。ICO 的存储与访问指引于 2026 年 4 月 29 日发布。DMCCA 订阅制度推迟至 2027 年 1 月（此前的估计是 2027 年春）。16 岁以下社交媒体禁令的配套法规将于 2026 年底前提交议会、2027 年春生效，并对 AI 浪漫伴侣设 18+ 下限。Ofcom 的应用商店报告须在 2027 年 1 月前提交。
- 欧盟：Regulation (EU) 2026/1744 已生效，因此附件 III 与附件 I 的高风险日期（2027 年 12 月 2 日、2028 年 8 月 2 日）已是法律，且 2026 年 12 月 2 日带来标识义务的追溯适用以及 NCII 与 CSAM 禁令。Data Act 在 2026 年 9 月 12 日落地的是 access-by-design（设计上即可访问），而非应用切换（切换费用于 2027 年 1 月 12 日归零）。Product Liability Directive 自 2026 年 12 月 9 日起适用。eIDAS 钱包接受义务的期限为 2027 年 12 月 24 日。CSAM 的 ePrivacy 减损条款于 2028 年 4 月 3 日到期。并不存在一个笼统的 EAA 2027 日期。
- 亚太：韩国 PIPA 修正案于 2026 年 9 月 11 日生效。中国 AI 拟人化服务管理规定于 2026 年 7 月 15 日生效（不得向未成年人提供陪伴式服务）。新加坡 OSRAA 于 2026 年 6 月 29 日部分生效。印度 Consent Manager（同意管理者）批次为 2026 年 11 月 13 日。日本 APPI 修正案最迟于 2028 年 7 月 16 日生效，并设未满 16 岁的阈值。
- 加拿大、澳大利亚、巴西：澳大利亚《App Distribution Services Code》的年龄核验义务自 2026 年 9 月 9 日起生效（读自存档副本，请对照实时页面再次确认）；《Privacy Act》的自动化决策披露与《Children's Online Privacy Code》于 2026 年 12 月 10 日落地。巴西的 Decreto 12.880（2026 年 3 月 18 日）把年龄信号加到商店和操作系统上，ANPD 自 2027 年 1 月起开始执法。加拿大没有新增带日期的应用义务。
- 美国各州：犹他州推迟到 2027 年 5 月 6 日（HB 498），路易斯安那州推迟到 2027 年 7 月 1 日（HB 977）；最高法院让第五巡回法院的暂缓令维持原状之后，得克萨斯州自 2026 年 1 月 1 日起已生效；阿拉巴马州确认在 2027 年 1 月 1 日。新增 2027 年日期的有：加利福尼亚州（AB 1043、SB 976、AB 56、CPPA 自动化决策）、纽约州 SAFE for Kids（2027 年 1 月 25 日）、佛蒙特州、华盛顿州、俄克拉何马州，以及科罗拉多州（2028 年）。

## 7. 随本轮扫描一并交付的流程改进

- "账号与开发者计划就绪"现在是提交者读到的第一节，因为社区证据表明：2026 年卡住首次上线的不是二进制文件，而是账号。
- 每一个已过期的截止日期都带有 `absorbed_into`，`scripts/deadline-checker.py` 会指向现在接手它的模式或文档章节，而不是一味喊"逾期"。
- 守卫的 gauntlet 用例从 26 个增至 42 个，其静默用例检查现在与发现行保持一致，因此写有模式 id 的截止日期不会再让静默测试误报失败。
- 守卫在缺少显式项目路径时现在会放行（fail open），而不是静默扫描当前工作目录。

## 8. 未经验证：刻意不写入规则的内容

- 2026 年 9 月社交媒体声明闸口开放的确切日期、Play 技术质量与 Restore Credentials 在 2027 年 2 月与 4 月的确切日期，以及 DMCCA 制度在 2027 年 1 月的确切日期。均按当月 1 日跟踪，并引用原文措辞。
- 27 SDK 上传下限在 2027 年 4 月的确切日期。Apple 只给了月份。按 2027 年 4 月 1 日跟踪，并引用原文措辞。iPhone Duo 素材上传日期已在 2026 年 10 月 5 日得到解决：Apple 当日开放 Duo 提交与截屏，并规定 Duo 截屏自 2027 年 4 月起变为必填（[Apple](https://developer.apple.com/news/?id=kkphp5qo)）。
- Android 开发者核验在巴西、印度尼西亚、新加坡和泰国之外的全球铺开日期。Google 尚未公布。
- DOJ 的 ADA 临时最终规则是否已定稿，以及 FTC 的 AI 准确性政策声明是否在 2026 年 7 月 31 日之后获得通过。
- 日本 APPI 的法律编号与六个月后罚则的启动、韩国强制认证（2027 年 7 月 1 日）、韩国 MyData 扩展的日期。仅有二手来源。
- 印度 DPDP Rules 的宪报文本是从镜像确认的，因为 meity.gov.in 返回了 403。
- 已于 2026 年 11 月 14 日对照一手来源复查过（#659）。Apple 社交媒体闸口、Play 在 2027 年 2 月与 4 月的要求、SDK 27 下限与 Duo 截屏规则仍只给到月份。Android 开发者核验在 2027 年全球铺开，无具体日期。DOJ 的 ADA Title II 规则仍是临时最终规则，FTC 的 AI 准确性声明仍列为"已提案"。英国的订阅制度已有写明 2027 年 1 月 1 日的法规草案。日本 APPI 修正案为 2026 年第 56 号法（Act No. 56 of 2026），按推算罚则自 2027 年 1 月 17 日起适用。韩国的强制隐私认证自 2027 年 7 月 1 日开始。印度宪报已在 meity.gov.in 上读取。eSafety 实时名册上的澳大利亚《App Distribution Services Code》仍未读取。韩国 MyData 的日期已于 2026 年 11 月 23 日在 law.go.kr 的《PIPA 施行令》（Enforcement Decree）中读到：健康与电信数据传输方为 2025 年 3 月 13 日，能源为 2026 年 6 月 1 日，公共系统运营者为 2026 年 8 月 20 日，大型私人处理者为 2027 年 2 月 20 日。
- r/appledevelopers 的覆盖是部分的：Reddit 扫描在 15 条之后被限流，且所有直接抓取均被封锁。
