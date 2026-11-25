# 全球法规合规时间线

本文档汇总了所有已登记的全球法规截止日期，追踪地区、国家与平台层面的要求。
最后汇总：2026-11-23 07:46:05 UTC

## 正在生效与临近的合规警告

### 已生效/已逾期的截止日期（需要采取行动）

| 优先级 | 司法辖区 | 法律 | 要求 | 生效日期 | 宽限期 | 强制日期 | 执法日期 | 已逾期天数 | 受影响章节 |
|---|---|---|---|---|---|---|---|---|---|
| CRITICAL | 伊利诺伊（USA State） | 生物识别信息隐私法（Biometric Information Privacy Act，BIPA），740 ILCS 14 | 收集生物特征标识符（biometric identifier）前须有书面通知与书面授权，公开保留时间表，3 年内销毁，且禁止出售。 | 2008-06-01 | none | 2008-06-01 | 2008-06-01 | 6749 天 | docs/GLOBAL-REGULATORY-2026.md 第 2.6 节，references/rules/privacy.md |
| HIGH | 英国（UK） | ICO 适龄设计代码（Age Appropriate Design Code，即儿童准则 Children's Code） | 默认高隐私、数据最小化、地理位置默认关闭、画像默认关闭，以及强制性的 DPIA。 | 2020-09-02 | 12 个月 | 2021-09-02 | 2021-09-02 | 1908 天 | docs/GLOBAL-REGULATORY-2026.md 第 3.1 节，references/rules/privacy.md |
| HIGH | 韩国 | 电信事业法（Telecommunications Business Act） | 经批准的支付服务提供方、26% 佣金、com.apple.developer.storekit.external-purchase entitlement、仅限韩国的二进制、模态表单、上报义务。 | 2022-03-15 | none | 2022-03-15 | 2022-03-15 | 1714 天 | docs/GLOBAL-REGULATORY-2026.md 第 3.5 节，references/rules/payments.md |
| HIGH | 欧盟（EU） | 欧盟《数字市场法案》（DMA） | 替代支付与应用外优惠（StoreKit External Purchases 或 Offers Entitlement、ExternalPurchaseCustomLink 披露表单、提供时 In-App Purchase 须以同等显著程度呈现、对未成年人设家长闸门、选项保留 12 个月、按月上报交易）。 | 2024-03-07 | none | 2024-03-07 | 2024-03-07 | 991 天 | docs/EU-REGULATORY-2026.md 第 2 节 |
| CRITICAL | 中国 | 向 MIIT 办理移动应用备案（ICP 备案的延伸） | 强制的中国 MIIT 应用备案、本地合作方/实体、实名验证、PIPL 隐私、数据本地化，以及游戏所需的版号（Banhao）许可。 | 2023-09-01 | 7 个月 | 2024-03-31 | 2024-03-31 | 967 天 | docs/GLOBAL-REGULATORY-2026.md 第 3.9 节，references/rules/metadata.md |
| HIGH | 美国（Federal） | FTC 健康泄露通知规则（Health Breach Notification Rule），16 CFR Part 318 | 遵守 2024 年最终规则（把健康/敏感数据未经授权共享给广告商视为泄露，强制 60 天告知）。 | 2024-06-25 | none | 2024-06-25 | 2024-06-25 | 881 天 | docs/GLOBAL-REGULATORY-2026.md 第 2.6 节，references/guidelines/by-app-type/health-fitness-and-medical.md |
| HIGH | 欧盟（EU） | 《通用产品安全法规》（GPSR），Regulation (EU) 2023/988 | 在线上界面为消费品展示制造商身份、电子与邮寄联系方式，以及产品安全警告。 | 2023-06-12 | 18 个月 | 2024-12-13 | 2024-12-13 | 710 天 | docs/REGULATORY-GAP-REPORT-2026.md 第 1 节，references/rules/safety.md |
| HIGH | 欧盟（EU） | 欧盟 AI 法案（EU AI Act），Regulation (EU) 2024/1689 经 Regulation (EU) 2026/1744 修订，第 4 条 | 第 4 条 AI 素养（AI literacy），经 2026 年 7 月 27 日替换后的版本。提供者与部署者须采取措施，促进其员工以及其他代表其操作与使用 AI 系统的人员发展 AI 素养，并考虑其技术知识、经验、教育与培训、系统使用所处的情境，以及系统所作用于的人员或群体。该义务不要求保证任何个人达到任何特定的 AI 素养水平。书面政策、入职培训与日志是务实的证据，但并非明文的法律要求。 | 2024-08-01 | 6 个月 | 2025-02-02 | 2025-02-02 | 659 天 | docs/EU-REGULATORY-2026.md 第 1.3 节，references/guidelines/by-app-type/ai-and-generative-apps.md |
| CRITICAL | 欧盟（EU） | 欧盟 AI 法案（EU AI Act），Regulation (EU) 2024/1689 | 第 5 条禁止性做法（禁止潜意识操纵、剥削儿童、社会评分、生物特征分类等）。 | 2024-08-01 | 6 个月 | 2025-02-02 | 2025-02-02 | 659 天 | docs/EU-REGULATORY-2026.md 第 1.4 节，references/guidelines/by-app-type/ai-and-generative-apps.md |
| CRITICAL | 欧盟（EU） | 欧盟《数字服务法案》（DSA） | 商家身份（trader status）申报与核验（D-U-N-S、电话、邮箱公布、已验证 2FA），否则应用将从欧盟店面移除。 | 2024-02-17 | 12 个月 | 2025-02-17 | 2025-02-17 | 644 天 | docs/EU-REGULATORY-2026.md 第 3 节，references/rules/metadata.md |
| CRITICAL | Google Play（Global） | Google Play 儿童安全标准政策（Child Safety Standards） | 在全球可访问的网页上公布 CSAE 标准、提供应用内反馈渠道、制定 CSAM 响应协议，并指定儿童安全联系人。 | 2025-03-19 | none | 2025-03-19 | 2025-03-19 | 614 天 | docs/PLATFORM-MECHANICS-2026.md 第 3.2 节，references/rules/android.md |
| CRITICAL | Google Play（Global） | Google Play 照片与视频权限政策 | 具有广泛访问权的 READ_MEDIA_IMAGES/READ_MEDIA_VIDEO 仅限确需广泛访问的应用使用；其他应用必须改用 Android Photo Picker。 | 2025-05-28 | none | 2025-05-28 | 2025-05-28 | 544 天 | docs/PLATFORM-MECHANICS-2026.md 第 2.9 节，references/rules/android.md |
| HIGH | 欧盟（EU） | 《欧洲无障碍法案》（EAA），Directive (EU) 2019/882 | 达到统一标准 EN 301 549 第 11 章 / WCAG 2.1 AA 的移动无障碍合规，并在条款与条件或等效文件中公布附件 V（Annex V）所要求的无障碍信息（第 13(2) 条）。 | 2022-06-28 | 36 个月 | 2025-06-28 | 2025-06-28 | 513 天 | docs/EU-REGULATORY-2026.md 第 4 节，references/rules/design.md |
| CRITICAL | 英国（UK） | UK Online Safety Act 2023 | 使用高效年龄核验（Highly Effective Age Assurance）方法（面部年龄估算、开放银行、信用卡校验）保护儿童免受有害内容侵害。 | 2025-07-25 | none | 2025-07-25 | 2025-07-25 | 486 天 | docs/GLOBAL-REGULATORY-2026.md 第 3.1 节，references/rules/safety.md |
| HIGH | 欧盟（EU） | 欧盟 AI 法案（EU AI Act），Regulation (EU) 2024/1689 | GPAI 模型义务、治理与处罚（第 99 条与第 100 条）。 | 2024-08-01 | 12 个月 | 2025-08-02 | 2025-08-02 | 478 天 | docs/EU-REGULATORY-2026.md 第 1.1 节、第 1.6 节 |
| CRITICAL | Google Play（Global） | Google Play Target API 要求 | 新应用与更新必须以 API 级别 35（Android 15）或更高为目标，既有应用须达到 API 34+。 | 2025-08-31 | none | 2025-08-31 | 2025-08-31 | 449 天 | docs/PLATFORM-MECHANICS-2026.md 第 2.5 节，references/rules/android.md |
| MEDIUM | 欧盟（EU） | 欧盟《数据法案》（Data Act），Regulation (EU) 2023/2854 | 当应用与互联产品及可穿戴设备交互时的核心"设计即访问"（access-by-design）义务。 | 2024-01-11 | 20 个月 | 2025-09-12 | 2025-09-12 | 437 天 | docs/EU-REGULATORY-2026.md 第 5 节 |
| CRITICAL | 澳大利亚 | Online Safety Amendment (Social Media Minimum Age) Act 2024 | 通过可靠的年龄核验阻止 16 岁以下者在社交媒体持有账号；隔离并销毁年龄数据。 | 2024-12-10 | 12 个月 | 2025-12-10 | 2025-12-10 | 348 天 | docs/GLOBAL-REGULATORY-2026.md 第 3.2 节，references/rules/safety.md |
| CRITICAL | 得克萨斯（USA State） | 得克萨斯 SB 2420（App Store Accountability Act） | 面向未成年人的下载、购买与重大更新须做年龄核验并取得可验证的家长同意，删除年龄数据，请求年龄类别。法定生效日期为 2026 年 1 月 1 日。2025 年 12 月 23 日的初步禁令于 2026 年 6 月 4 日被第五巡回法院中止，最高法院于 2026 年 7 月 6 日拒绝撤销该中止，因此在实体上诉待决期间该法仍具效力。 | 2026-01-01 | none | 2026-01-01 | 2026-06-04 | 326 天 | docs/GLOBAL-REGULATORY-2026.md 第 1 节、第 2.2 节，references/rules/privacy.md |
| HIGH | 加利福尼亚（USA State） | 加利福尼亚 CPRA（CPPA 2026 年条例） | 遵循 Global Privacy Control（GPC）、提供隐私政策/收集时告知、对出售/共享/画像的选择退出，以及对敏感个人信息的限制。 | 2026-01-01 | 自动化决策自 2027-04-01 起；网络安全审计自 2028-04-01 起 | 2026-01-01 | 2026-01-01 | 326 天 | docs/GLOBAL-REGULATORY-2026.md 第 2.4 节，references/rules/privacy.md |
| CRITICAL | Apple App Store（Global） | Apple App Store 审核指南（Guideline 2.3.6） | 每个应用都必须回答更新后的年龄分级问卷（13+、16+、18+ 档位，UGC/直播指标），否则更新将被拦截。 | 2025-07-24 | 6 个月 | 2026-01-31 | 2026-01-31 | 296 天 | docs/EU-REGULATORY-2026.md 第 6 节，references/rules/metadata.md |
| CRITICAL | Apple App Store（巴西、澳大利亚、新加坡） | Apple App Store 地区年龄要求 | 阻止巴西、澳大利亚与新加坡的用户下载分级为 18+ 的应用，除非已通过合理方法确认其年龄。 | 2026-02-24 | none | 2026-02-24 | 2026-02-24 | 272 天 | docs/GLOBAL-REGULATORY-2026.md 第 1 节，references/rules/privacy.md |
| HIGH | 美国（Federal） | FTC《推动在 COPPA 规则下采用年龄验证技术》执法政策声明（2026 年 2 月 25 日） | 大众受众或混合受众应用只有满足以下条件，才能为年龄验证收集年龄数据而不冒 COPPA 执法风险：数据仅用于年龄判定、最小化保留、审查第三方、向家长与儿童告知，并保护数据安全。该声明在 COPPA 最终规则修正案公布或声明被撤回之前有效。 | 2026-02-25 | none | 2026-02-25 | 2026-02-25 | 271 天 | docs/GLOBAL-REGULATORY-2026.md 第 2.1 节，references/guidelines/by-app-type/kids-category-and-families.md |
| CRITICAL | 巴西 | Digital ECA（Law 15,211/2025） | 采用认可的年龄验证（证件核验、面部估算、CPF 核查）；禁止使用自声明复选框。 | 2025-09-17 | 6 个月 | 2026-03-17 | 2026-03-17 | 251 天 | docs/GLOBAL-REGULATORY-2026.md 第 3.3 节，references/rules/privacy.md |
| CRITICAL | 巴西 | 2026 年 3 月 18 日 Decreto n. 12.880（Digital ECA 细则），第 21 条与第 25 条 | 应用商店与操作系统须免费提供年龄信号，在创建账号时请求年龄，用 ANPD 认可的方法加以验证，允许提出异议，寻求监护人授权，并在下载前展示年龄分级。商店必须封禁博彩与彩票应用，以及任何缺乏年龄验证方案的应用。 | 2026-03-18 | none | 2026-03-18 | 2026-03-18 | 250 天 | docs/GLOBAL-REGULATORY-2026.md 第 3.3 节，references/rules/privacy.md |
| CRITICAL | 新加坡 | IMDA《应用分发服务在线安全实操守则》（Code of Practice for Online Safety for App Distribution Services） | 应用商店年龄核验（筛查并阻止 18 岁以下用户下载与其年龄不符的应用），年龄核验数据须销毁。这就是年龄核验的"咬合日"（bite date）。该《应用分发服务在线安全实操守则》本身已于 2025 年 3 月 31 日生效。 | 2026-04-01 | none | 2026-04-01 | 2026-04-01 | 236 天 | docs/GLOBAL-REGULATORY-2026.md 第 3.7 节，references/rules/privacy.md |
| CRITICAL | 美国（Federal） | 《儿童在线隐私保护法》（COPPA），16 CFR Part 312 | 遵守修订后的 COPPA 规则（生物特征标识符纳入 PII、向第三方披露/定向广告须单独的选择加入同意、书面保留政策、书面信息安全计划）。第 312.11 条的豁免属于更早的日期（2025 年 4 月 22 日发布后 90 天与六个月），且仅约束经 FTC 批准的 COPPA 安全港（Safe Harbor）项目，不约束应用开发者。 | 2025-06-23 | 10 个月 | 2026-04-22 | 2026-04-22 | 215 天 | docs/GLOBAL-REGULATORY-2026.md 第 2.1 节，references/guidelines/by-app-type/kids-category-and-families.md |
| CRITICAL | Apple App Store（Global） | Apple App Store 提交要求 | 自 2026 年 4 月 28 日起，上传到 App Store Connect 的应用必须以 iOS 26 与 iPadOS 26 SDK 或更高版本构建（以及对应的 watchOS 26、tvOS 26、visionOS 26 SDK）。Apple 以 SDK 而非 Xcode 术语表述该要求，且 macOS 不在 Apple 的清单之列。年龄核验功能另外要求 iOS 26.2 SDK 配 Xcode 26.2（17C52）或更高版本。 | 2026-02-03 | 2 个月 | 2026-04-28 | 2026-04-28 | 209 天 | docs/EU-REGULATORY-2026.md 第 6 节，docs/PLATFORM-MECHANICS-2026.md 第 1.6 节 |
| HIGH | 英国（UK） | ICO《存储与访问技术》最终指南（2026 年 4 月 29 日），PECR 第 6 条，含 DUAA Schedule A1 豁免与上调后的 PECR 罚款（1,750 万英镑或营业额的 4%） | 对照该指南重新审计每一个 SDK、追踪像素与设备指纹调用，而不只是 cookie。同意违规（consent breach）现在适用 UK GDPR 量级的罚款。 | 2026-04-29 | none | 2026-04-29 | 2026-04-29 | 208 天 | docs/GLOBAL-REGULATORY-2026.md 第 3.1 节，references/rules/privacy.md |
| CRITICAL | 美国（Federal） | TAKE IT DOWN Act（Pub. L. 119-12） | 受监管平台须运行清晰醒目的未经同意亲密影像"通知—删除"（notice-and-removal）流程，并在 48 小时内移除被举报内容及其已知完全相同的副本。FTC 执法自 2026 年 5 月 19 日开始。 | 2026-05-19 | none | 2026-05-19 | 2026-05-19 | 188 天 | docs/GLOBAL-REGULATORY-2026.md 第 2.6 节，references/rules/safety.md |
| HIGH | Apple App Store（澳大利亚、越南） | App Store 地区年龄分级变更：澳大利亚移除 15+ 档，越南 Decree 147 第 38 条地区专属分级（Apple Developer news yrrb45pw） | 自 2026 年 6 月 18 日起，澳大利亚不再提供 15+ 分级（受影响应用移至 16+），在越南上架的应用需要与 Decree 147 第 38 条对齐的地区专属年龄分级。请按店面逐一复查你在 App Store Connect 中的年龄分级。 | 2026-05-21 | 至 2026 年 6 月 18 日 | 2026-06-18 | 2026-06-18 | 158 天 | docs/GLOBAL-REGULATORY-2026.md 第 3.2 与 3.10 节 |
| HIGH | 欧盟（EU） | 《金融服务远程营销指令》（Directive (EU) 2023/2673） | 在线上界面（包括应用）上设置显著且易于访问的"撤回按钮"（withdrawal button）或"撤回功能"，以便撤回合同。 | 2023-11-28 | 30 个月 | 2026-06-19 | 2026-06-19 | 157 天 | docs/EU-REGULATORY-2026.md 第 5 节，references/rules/payments.md |
| MEDIUM | 英国（UK） | Data (Use and Access) Act 2025 第 103 条与 Schedule 10，经 SI 2026/82 第 3 条生效 | 运行数据保护投诉处理流程。在 30 天内确认收到数据主体投诉，并在无不当迟延的情况下作出回应。 | 2026-06-19 | none | 2026-06-19 | 2026-06-19 | 157 天 | docs/GLOBAL-REGULATORY-2026.md 第 3.1 节，references/rules/privacy.md |
| HIGH | 新加坡 | 《在线安全（救济与问责）法》2025（Online Safety (Relief and Accountability) Act 2025），部分生效 | 作为平台，按在线安全委员会（Online Safety Commission）的通知处理五类优先危害。其余危害类别将逐步跟进，尚未公布日期。 | 2026-06-29 | none | 2026-06-29 | 2026-06-29 | 147 天 | docs/GLOBAL-REGULATORY-2026.md 第 3.7 节 |
| CRITICAL | Apple App Store（巴西） | Apple Developer Program License Agreement Attachment 12：CADE 裁决下的巴西替代分发（Apple Developer news dhwadr2x 与 umq9wxmm） | 到 2026 年 7 月 6 日，所有 Apple Developer Program 成员都必须接受更新后的 ADPLA。自 iOS 26.5 起，开发者可在巴西通过第三方商店（marketplace）进行替代分发、运营第三方商店，并在 Apple In-App Purchase 之外处理数字商品支付。未接受的协议会阻止新的提交。 | 2026-06-18 | 至 2026 年 7 月 6 日 | 2026-07-06 | 2026-07-06 | 140 天 | docs/GLOBAL-REGULATORY-2026.md 第 3.3 节 |
| CRITICAL | 中国 | 《AI 拟人化互动服务暂行办法》（Interim Measures for AI Anthropomorphic Interactive Services，CAC Order No. 21） | 识别未成年人用户，自动将其切换至未成年人模式，对 14 岁以下者取得监护人同意，且绝不向未成年人提供虚拟陪伴或虚拟亲缘服务。任何在中国上线的聊天、陪伴或角色扮演应用均在范围内。 | 2026-07-15 | none | 2026-07-15 | 2026-07-15 | 131 天 | docs/GLOBAL-REGULATORY-2026.md 第 3.9 节，references/guidelines/by-app-type/ai-and-generative-apps.md |
| HIGH | Google Play（美国） | Play Catalog Access Program（Play Console 帮助文章 17117200 与 15582165） | 自 2026 年 7 月 22 日起，经注册的美国第三方 Android 应用商店可访问 Play 目录，并默认上架你的应用。如果你不希望通过第三方商店分发，请在 Play Console 的 Settings、Catalog Settings 下选择退出。 | 2026-07-22 | none | 2026-07-22 | 2026-07-22 | 124 天 | docs/GOOGLE-PLAY.md 2026 年政策批次 |
| CRITICAL | 欧盟（EU） | 欧盟 AI 法案（EU AI Act），Regulation (EU) 2024/1689 | 第 50 条透明度义务（与 AI 交互的披露、合成内容标记与深度伪造披露）。 | 2024-08-01 | 24 个月 | 2026-08-02 | 2026-08-02 | 113 天 | docs/EU-REGULATORY-2026.md 第 1.2 节，references/guidelines/by-app-type/ai-and-generative-apps.md |
| HIGH | Google Play（Global） | Google Play 拒付（chargeback）成本责任更新（Play Console 帮助文章 17068375） | 对 2026 年 8 月 3 日之后下达的订单，开发者须承担"购买价款减去服务费"再加金融机构的拒付（chargeback）手续费；Google Play 仅承担自己的服务费。须处理 PendingRefundReviewNotification，并在 24 小时内调用 Review Refund API，对不正当争议提出抗辩。 | 2026-08-03 | none | 2026-08-03 | 2026-08-03 | 112 天 | docs/GOOGLE-PLAY.md 的 Payments 行，references/rules/payments.md |
| HIGH | 欧盟（EU） | 电子证据一揽子计划（e-Evidence Package），Regulation (EU) 2023/1543 | 跨境执法可直接访问电子证据（10 天响应时限，以及 8 小时的紧急时限）。 | 2023-08-18 | 36 个月 | 2026-08-18 | 2026-08-18 | 97 天 | docs/EU-REGULATORY-2026.md 第 5 节，references/rules/privacy.md |
| CRITICAL | Google Play（Global） | 年龄受限内容、家庭与儿童安全标准政策扩展至匿名与随机聊天应用（Play Console 帮助文章 17036597、17122218、14747720） | 以与陌生人随机或匿名聊天为核心功能的应用，必须使用 Play Console 工具阻止未成年人，不得在 Families 计划下面向儿童，并被纳入儿童安全标准政策的范围（公布 CSAE 标准、应用内举报、移除 CSAM、儿童安全联系人）。 | 2026-08-26 | none | 2026-08-26 | 2026-08-26 | 89 天 | docs/GOOGLE-PLAY.md 2026 年政策批次，references/rules/safety.md |
| CRITICAL | Google Play（Global） | Google Play Billing 政策 | 自 2026 年 8 月 31 日起，所有新应用与更新必须使用 Play Billing Library 版本 8 或更高，可申请延期至 2026 年 11 月 1 日。这是一道发布闸门，已发布的 v7 二进制包在 2027 年全应用截止日期之前仍可继续交易。 | 2026-05-01 | 3 个月 | 2026-08-31 | 2026-08-31 | 84 天 | docs/PLATFORM-MECHANICS-2026.md 第 2.4 节，references/rules/payments.md |
| HIGH | Google Play（Global） | Google Play Target API 要求 | 自 2026 年 8 月 31 日起，新应用与更新必须以 API 级别 36（Android 16）或更高为目标，可通过 Play Console 申请延期至 2026 年 11 月 1 日。Wear OS 与 Android Automotive OS 应用须以 API 35 或更高为目标，Android TV 与 Android XR 应用为 API 34 或更高。既有应用必须以 API 35 或更高为目标，才能在较新设备上对新用户保持可用。 | 2026-08-31 | none | 2026-08-31 | 2026-08-31 | 84 天 | docs/PLATFORM-MECHANICS-2026.md 第 2.5 节，references/rules/android.md |
| CRITICAL | Apple App Store（Global） | App Store Connect 社交媒体能力声明（Apple Developer news 0d2gpmml 与 tlur8uvi） | Apple 表示，自 2026 年 9 月起（未公布确切日期），要提交新版本或更新，或为替代市场做公证，你必须标明你的应用或游戏是否包含社交媒体功能。申报社交媒体功能后，应用将被归入社交媒体（Social Media）的 Time Allowance 类别，年龄分级最低 13+，且服务 13 岁以下用户须使用 Declared Age Range API。 | 2026-09-01 | none | 2026-09-01 | 2026-09-01 | 83 天 | docs/APPLE.md 第 2 节及 2026 年变更清单，references/rules/metadata.md |
| CRITICAL | 澳大利亚 | 《应用分发服务在线安全守则》（Class 1C 与 Class 2 内容），合并行业代码的附表 7，2025 年 9 月 9 日注册 | 守则生效六个月后，应用商店必须先应用年龄核验与访问控制，才允许下载或购买成人应用；Head Terms 的"努力达成"宽限期于同日结束，首次风险评估也于同日到期。本条目读取自 eSafety 页面最后更新于 2026 年 5 月 19 日的 Wayback 存档（因 esafety.gov.au 无法访问），请在现行登记册上再次确认。 | 2026-03-09 | none | 2026-09-09 | 2026-09-09 | 75 天 | docs/GLOBAL-REGULATORY-2026.md 第 3.2 节，references/rules/safety.md |
| CRITICAL | Apple App Store（Global） | Apple Upcoming Requirements 页面 | 上传到 App Store Connect 的 iOS 与 iPadOS 应用必须以 iOS 13 或更高为目标。已经生效。提交前守卫会对更低的 IPHONEOS_DEPLOYMENT_TARGET 或 Podfile platform 给出标记。 | 2026-09-09 | none | 2026-09-09 | 2026-09-09 | 75 天 | docs/APPLE.md，data/rejection-patterns.json APPLE-MIN-DEPLOYMENT-TARGET-IOS13 |
| MEDIUM | 欧盟（EU） | 《网络弹性法案》（Cyber Resilience Act），Regulation (EU) 2024/2847 | 活跃漏洞报告与安全事件通知义务。 | 2024-12-11 | 21 个月 | 2026-09-11 | 2026-09-11 | 73 天 | docs/EU-REGULATORY-2026.md 第 5 节 |
| HIGH | 韩国 | 《个人信息保护法》修正案（Personal Information Protection Act amendment），Act No. 21445 | 指明 CEO 与法定代表人为最终责任人，在达到规模门槛时设立经董事会批准的首席隐私官，并承受惩罚性附加金与扩大的泄露通知义务。 | 2026-09-11 | none | 2026-09-11 | 2026-09-11 | 73 天 | docs/GLOBAL-REGULATORY-2026.md 第 3.5 节，references/rules/privacy.md |
| MEDIUM | 欧盟（EU） | 欧盟《数据法案》（Data Act），Regulation (EU) 2023/2854 | 面向互联可穿戴设备与相关设备落实"设计即访问"（access-by-design）的技术实现。这是第 3(1) 条针对互联产品的设计即访问义务，不涉及云服务切换。根据第 29(1) 条，切换费用自 2027 年 1 月 12 日起降为零。 | 2024-01-11 | 32 个月 | 2026-09-12 | 2026-09-12 | 72 天 | docs/EU-REGULATORY-2026.md 第 5 节 |
| CRITICAL | Android（巴西、印度尼西亚、新加坡、泰国） | Android 开发者验证政策（Android Developer Verification Policy） | 侧载（sideloading）一侧：自 2026 年 9 月 30 日起，在巴西、印度尼西亚、新加坡与泰国的已认证设备上安装的应用，必须登记到经过验证的开发者身份之下（Android Developer Console，完整分发 25 美元，限量分发账号免费、最多 20 台设备，组织需 D-U-N-S）。全球扩展仅表述为 2027 年，未公布确切日期。另一条独立的 Play 一侧义务（2026 年 9 月 30 日前在 Play Console 登记每个 Play 包名，全球适用）对应 GOOGLE-PLAY-APP-PACKAGE-REGISTRATION。 | 2026-03-15 | 6 个月 | 2026-09-30 | 2026-09-30 | 54 天 | docs/PLATFORM-MECHANICS-2026.md 第 2.1 节，references/rules/android.md |
| CRITICAL | Google Play（Global） | Play Console 要求：金融、健康、VPN 与政府应用的机构注册（Play Console 帮助文章 10788890 与 17125096） | 提供金融产品（银行、贷款、股票交易、投资基金、加密货币钱包与交易所）的应用、健康应用（医疗、人体受试者研究）、经批准使用 VpnService 类的应用，以及政府应用，必须从带有 D-U-N-S 号码的组织账号发布，且该号码须与 Dun and Bradstreet 档案一致。不合规的应用会被移除。 | 2026-07-15 | 至 2026 年 9 月 30 日 | 2026-09-30 | 2026-09-30 | 54 天 | docs/GOOGLE-PLAY.md 2026 年政策批次，references/rules/android.md |
| CRITICAL | Google Play（Global） | Android 开发者验证——Play 一侧：在 Play Console 登记每个 Play 应用包名（Play Console 帮助文章 17125096 与 17134731） | 通过 Play Console 登记你的应用包名，以符合 Android 开发者验证要求。这一条是全球性的，与巴西、印度尼西亚、新加坡、泰国的侧载一侧相互独立。不登记可能被从 Google Play 全球移除。 | 2026-07-15 | 至 2026 年 9 月 30 日 | 2026-09-30 | 2026-09-30 | 54 天 | docs/GOOGLE-PLAY.md 2026 年政策批次，docs/PLATFORM-MECHANICS-2026.md 第 2 节 |
| CRITICAL | Google Play（美国） | 美国替代结算与外链计划：交易报告与服务费（Play Console 帮助文章 16497028） | 加入美国替代结算或外链计划的开发者，自 2026 年 10 月 1 日起必须上报交易与成功下载，并支付相应的 Play 服务费。 | 2026-10-01 | none | 2026-10-01 | 2026-10-01 | 53 天 | docs/GLOBAL-REGULATORY-2026.md 第 2.3 节，docs/GOOGLE-PLAY.md |
| CRITICAL | 欧盟（EU） | Apple 欧盟商业条款更新：核心技术佣金（Core Technology Commission）取代核心技术费（Core Technology Fee），ADPLA Attachment 14（Apple Developer news gmws0jgp 与 0cgo95n6） | 自 2026 年 10 月 1 日起，按安装计收的核心技术费（Core Technology Fee）被对 App Store 之外分发的应用内数字交易按 5% 计收的核心技术佣金（Core Technology Commission）取代，初始获取费（Initial Acquisition Fee）与商店服务费（Store Services Fee）被取消，应用可在 Apple In-App Purchase 之外同时提供替代支付选项，第三方商店（marketplace）与 Web 分发的资格放宽为七项替代标准。必须接受 ADPLA 的 Attachment 14。 | 2026-08-18 | 至 2026 年 10 月 1 日 | 2026-10-01 | 2026-10-01 | 53 天 | docs/EU-REGULATORY-2026.md 第 2.3 节 |
| MEDIUM | Apple App Store（Global） | Apple 多席位订阅购买（Apple Developer news likeohx4） | 自 2026 年 9 月 16 日起，App Store Connect 中订阅的多席位购买默认启用。通过 Apple Business 与 Apple School Manager 的批量采购（Volume Purchasing）于 2026 年 10 月 22 日上线，团体采购（Group Purchases）于今冬上线。在 10 月 22 日之前，请为每个自动续期订阅决定是否允许组织与团体购买席位；在不符合你的定价或 entitlement 逻辑之处，禁用多席位购买，或在 App Store、Apple Business 与 Apple School Manager 全渠道加以限制。来源 https://developer.apple.com/news/?id=likeohx4 | 2026-09-16 | 约 5 周 | 2026-10-22 | 2026-10-22 | 32 天 | docs/APPLE.md 2026 年必须立即行动的变更 |
| HIGH | Apple App Store（Global） | Apple iPhone Duo 平台就绪 | iPhone Duo 是 Apple 的第一款可折叠 iPhone，于 2026 年 10 月 16 日开启预购，2026 年 10 月 23 日发货，随 iOS 27.1 发布。用 Xcode 26 或更早版本构建的应用仍可运行，但不会延伸到状态栏与相机区域之下。请用 Xcode 27.1（2026 年 9 月 18 日起提供 beta）与 iOS 27.1 SDK 构建，在 Duo 模拟器中测试每一种姿态，基于 size classes 与场景边界调整尺寸，处理好保留区域（外部相机、激活时的内部相机、折叠区域），并让导航栏、工具栏与标签栏支持竖向呈现。自 2026 年 10 月 5 日起，App Store Connect 接受针对 iPhone Duo 优化的应用与 Duo 截图（可获得产品页徽章）；自 2027 年 4 月起，使用 iOS 27.1 SDK 或更高版本的应用必须提供 Duo 截图（APPLE-IPHONE-DUO-SCREENSHOTS-REQ）。在 issue #724 中跟踪。来源 https://developer.apple.com/news/?id=kkphp5qo https://www.apple.com/newsroom/2026/09/apple-unveils-iphone-duo/ https://developer.apple.com/documentation/technologyoverviews/preparing-your-app-for-iphone-duo | 2026-09-09 | 约 6 周 | 2026-10-23 | 2026-10-23 | 31 天 | docs/PLATFORM-MECHANICS-2026.md 第 1.8 节，docs/PRE-SUBMISSION-CHECKLIST.md Apple 专属部分，docs/GAP-ANALYSIS-2026-09.md 开放事项 |
| MEDIUM | 印度 | Digital Personal Data Protection Rules 2025，G.S.R. 846(E)，第 4 条 | 注册的同意管理人（Consent Managers）在宪报公布一年后启动（2025 年 11 月 13 日）。请在 2027 年 5 月 13 日的 18 个月批次之前，做好与注册同意管理人互操作的准备。 | 2026-11-13 | none | 2026-11-13 | 2026-11-13 | 10 天 | docs/GLOBAL-REGULATORY-2026.md 第 3.6 节，references/rules/privacy.md |
| LOW | 中国 | CAC 2026 年 10 月 19 日关于认定未成年人用户数量特别巨大或对未成年人有重大影响的网络平台的通知 | 注册未成年人用户达 1,000 万及以上，或月活跃未成年人用户达 100 万及以上（面向未成年人的服务为注册 1,000 万、月活跃 100 万），或对未成年人有重大影响的平台，须在通知发出后 20 个工作日内向省级网信部门提交认定材料与自评估报告。该窗口约于 2026 年 11 月 16 日关闭（推算）。符合条件却未提交的平台，将被认定委员会要求补交。 | 2026-10-19 | 20 个工作日 | 2026-11-16 | 2026-11-16 | 7 天 | docs/GLOBAL-REGULATORY-2026.md 第 3.9 节 |

### 临近的截止日期（90 天内）

| 优先级 | 司法辖区 | 法律 | 要求 | 生效日期 | 宽限期 | 强制日期 | 执法日期 | 剩余天数 | 受影响章节 |
|---|---|---|---|---|---|---|---|---|---|
| HIGH | Google Play（日本） | 面向销往日本或自日本销售的开发者的 Play Console 支付授权（2026 年 10 月 29 日政策公告） | 销往日本或自日本销售的开发者，必须在 2026 年 12 月 1 日前在 Play Console 中填妥支付授权表单，否则 Google 将在全球范围冻结其付款。 | 2026-10-29 | none | 2026-12-01 | 2026-12-01 | 8 天 | docs/GOOGLE-PLAY.md 2026 年政策批次 |
| HIGH | 欧盟（EU） | 欧盟 AI 法案（EU AI Act），Regulation (EU) 2024/1689 经 Regulation (EU) 2026/1744 修订，第 111(4) 条与第 5(1)(ba)、(bb)、(1a) 与 (1b) 点 | 第 111(4) 条：生成合成音频、图像、视频或文本，且在 2026 年 8 月 2 日之前投放市场的 AI 系统（包括通用 AI 系统）的提供者，须在 2026 年 12 月 2 日之前采取必要步骤以符合第 50(2) 条。自同一日起，第 5(1a) 点禁止投放市场或投入使用这样的 AI 系统：它生成或操纵未经同意的亲密材料（第 5(1)(ba) 点）或儿童性虐待材料或表现（第 5(1)(bb) 点，Directive 2011/93/EU 第 2(c) 与 (e) 点），且仅当该生成或操纵属于系统的预期目的，或者系统的设计、训练、架构、能力或面向用户的功能使得在不作重大技术修改的情况下这是合理可预见且可复制的结果，同时系统既缺乏能在考虑合理可预见误用的情况下可靠防止其发生的合理且充分的技术安全措施与其他保障，也缺乏纠正已发现或已被举报误用的手段时，方属禁止。使用行为仅在部署者将该系统用于该目的时才被禁止。第 5(1b) 点：不增加所描绘任何亲密部位暴露程度、也不改变所描绘任何露骨性活动性质的操纵，不属于 (ba) 点下的操纵。 | 2026-12-02 | none | 2026-12-02 | 2026-12-02 | 9 天 | docs/EU-REGULATORY-2026.md 第 1.1 节，references/guidelines/by-app-type/ai-and-generative-apps.md |
| LOW | Apple App Store（博茨瓦纳、哥伦比亚、埃及、卢旺达、土耳其） | Apple 税项与价格更新，2026 年 11 月 17 日（Apple Developer news 4o5ie73a） | 2026 年 12 月 3 日，Apple 将更新博茨瓦纳、哥伦比亚、埃及、卢旺达与土耳其的应用及 In-App Purchase 价格，此前博茨瓦纳新征 14% 增值税、卢旺达新征 18% 增值税（Paid Applications Agreement 的 Exhibit B 现已列明 Apple 在当地代收税款）。如果这五个店面之一是你的基准店面（base storefront），其价格保持你设定的值不变，Apple 会调整其他自动均衡店面上的价格，使其与该基准价一致。自动续期订阅以及你手动管理价格的店面不变。请检查受影响店面在截图、宣传文本或应用内文案中硬编码的任何价格。 | 2026-11-17 | none | 2026-12-03 | 2026-12-03 | 10 天 | docs/APPLE.md 2026 年必须立即行动的变更 |
| MEDIUM | 欧盟（EU） | 《产品责任指令》（Product Liability Directive (EU) 2024/2853），第 21 条与第 22 条 | 自 2026 年 12 月 9 日起，各国严格责任法律把独立软件与应用更新视为产品。在该日或之后投放市场或投入使用的任何东西都落入新制度。 | 2026-12-09 | none | 2026-12-09 | 2026-12-09 | 16 天 | docs/EU-REGULATORY-2026.md 第 5 节，references/rules/safety.md |
| HIGH | 澳大利亚 | Privacy Act 1988 APP 1.7 至 1.9，由 Privacy and Other Legislation Amendment Act 2024 插入 | 自 2026 年 12 月 10 日起，隐私政策必须说明对权利或利益有重大影响的自动化决策所使用的个人信息种类，以及该自动化决策所作出的决定。 | 2026-12-10 | none | 2026-12-10 | 2026-12-10 | 17 天 | docs/GLOBAL-REGULATORY-2026.md 第 3.2 节，references/rules/privacy.md |
| HIGH | 澳大利亚 | Privacy Act 1988 之下的《儿童在线隐私守则》（Children's Online Privacy Code） | 该守则必须在 2026 年 12 月 10 日前定稿并登记，为社交媒体、相关电子服务与指定互联网服务带来有约束力的儿童隐私义务。 | 2026-12-10 | none | 2026-12-10 | 2026-12-10 | 17 天 | docs/GLOBAL-REGULATORY-2026.md 第 3.2 节，references/guidelines/by-app-type/kids-category-and-families.md |
| HIGH | 印度尼西亚 | PP TUNAS（Government Regulation No. 17 of 2025）与 2026 年第 9 号通信与数字部长条例 | 每个电子系统运营者必须在 2026 年 12 月 31 日前为每个产品、服务与功能完成儿童保护自评估。Kemkomdigi 表示，可以把错过该期限的产品直接认定为高风险，从而适用更严格的高风险义务。 | 2026-12-31 | none | 2026-12-31 | 2026-12-31 | 38 天 | docs/GLOBAL-REGULATORY-2026.md 第 3.11 节，references/rules/safety.md |
| CRITICAL | 阿拉巴马（USA State） | 阿拉巴马 HB 161（App Store Accountability Act） | 应用商店须核验年龄类别，把未成年人与家长账号关联，并在每次下载与应用内购买时取得可验证的家长同意。依 HB 161 第 14 节（已通过文本），2027 年 1 月 1 日生效。2026 年 10 月 2 日已存在的账号必须在 2027 年 10 月 1 日前完成带同意的年龄验证。 | 2027-01-01 | none | 2027-01-01 | 2027-01-01 | 39 天 | docs/GLOBAL-REGULATORY-2026.md 第 2.2 节，references/rules/privacy.md |
| HIGH | 英国（UK） | 《数字市场、竞争与消费者法》2024（Digital Markets, Competition and Consumers Act 2024），Part 4 第 2 章订阅合同制度 | 向英国消费者销售的自动续期订阅应用需要合同前信息、续期提醒、两个冷静期、简便的取消路径以及新的退款规则。政府于 2026 年 8 月 9 日宣布该制度于 2027 年 1 月开始施行（确切日期尚未公布），取代此前 2027 年春的估计。其生效文件草案 The Consumer Subscription Contracts (Cancellation and Information) Regulations 2026 写明 2027 年 1 月 1 日，但截至 2026 年 11 月 14 日尚未正式制定，因此在正式制定之前该日期仍属暂定。 | 2027-01-01 | none | 2027-01-01 | 2027-01-01 | 39 天 | docs/GLOBAL-REGULATORY-2026.md 第 3.1 节，references/rules/payments.md |
| HIGH | 巴西 | ANPD Digital ECA 路线图，Etapa II 与 III | ANPD 自 2026 年 8 月起公布关于年龄核验机制的指南与规范性参数，适应期至 2026 年 11 月，并自 2027 年 1 月起开始对 Digital ECA 年龄核验义务进行主动执法。 | 2026-08-01 | none | 2027-01-01 | 2027-01-01 | 39 天 | docs/GLOBAL-REGULATORY-2026.md 第 3.3 节，references/rules/privacy.md |
| CRITICAL | 加利福尼亚（USA State） | AB 1043《数字年龄核验法》（Digital Age Assurance Act），Civil Code Title 1.81.9 | 操作系统与应用商店在设置时收集年龄，并通过 API 暴露年龄区间信号。开发者请求并使用该信号。2027 年 1 月 1 日起施行。 | 2027-01-01 | none | 2027-01-01 | 2027-01-01 | 39 天 | docs/GLOBAL-REGULATORY-2026.md 第 2.4 节，references/rules/privacy.md |
| HIGH | 加利福尼亚（USA State） | SB 976《保护我们的孩子免受社交媒体成瘾法》（Protecting Our Kids from Social Media Addiction Act），Health and Safety Code 第 27001 至 27006 节 | 自 2027 年 1 月 1 日起，在提供成瘾性信息流或在午夜至早 6 点之间、上课时段发送通知之前，除非年龄核验已合理判定并非未成年人，否则须把每位用户当作未成年人对待。州总检察长的年龄核验条例须于同日出台。 | 2027-01-01 | none | 2027-01-01 | 2027-01-01 | 39 天 | docs/GLOBAL-REGULATORY-2026.md 第 2.4 节，references/guidelines/by-app-type/social-and-user-generated-content.md |
| HIGH | 加利福尼亚（USA State） | AB 56，Health and Safety Code 第 25 章（自第 28000 节起） | 受监管的社交媒体平台须展示州卫生总监（Surgeon General）黑框警告：首次使用时每日展示，累计使用 3 小时后再次展示，此后每小时展示。2027 年 1 月 1 日起施行。 | 2027-01-01 | none | 2027-01-01 | 2027-01-01 | 39 天 | docs/GLOBAL-REGULATORY-2026.md 第 2.4 节，references/guidelines/by-app-type/social-and-user-generated-content.md |
| HIGH | 加利福尼亚（USA State） | CPPA 条例，11 CCR 第 7200(b)、7155(b)、7157(a)(1)、7121(a) 节 | 在 2027 年 1 月 1 日前，对用于重大决策的自动化决策技术落实告知、允许选择退出并回应访问请求。2026 年之前处理的风险评估须在 2027 年 12 月 31 日前完成并于 2028 年 4 月 1 日前提交。收入超过 1 亿美元者自 2028 年 4 月 1 日起实施网络安全审计认证。 | 2027-01-01 | none | 2027-01-01 | 2027-01-01 | 39 天 | docs/GLOBAL-REGULATORY-2026.md 第 2.4 节，references/rules/privacy.md |
| HIGH | 佛蒙特（USA State） | 《适龄设计代码法》（Age-Appropriate Design Code Act），Act 63 | 对未成年人实行最高隐私默认设置、最小化收集、不得在深夜发送推送通知，并适用州总检察长的年龄核验规则。2027 年 1 月 1 日生效。规则制定意见截止 2026 年 10 月 2 日。 | 2027-01-01 | none | 2027-01-01 | 2027-01-01 | 39 天 | docs/GLOBAL-REGULATORY-2026.md 第 2.5 节，references/guidelines/by-app-type/kids-category-and-families.md |
| HIGH | 华盛顿（USA State） | HB 2225，2026 年法律第 168 章，规范 AI 陪伴聊天机器人 | 陪伴式聊天机器人披露与未成年人保护，包括对未成年人持续使用时的每小时披露。2027 年 1 月 1 日生效。 | 2027-01-01 | none | 2027-01-01 | 2027-01-01 | 39 天 | docs/GLOBAL-REGULATORY-2026.md 第 2.5 节，references/guidelines/by-app-type/ai-and-generative-apps.md |
| MEDIUM | 俄克拉何马（USA State） | SB 546《俄克拉何马消费者数据隐私法》（Oklahoma Consumer Data Privacy Act） | 自 2027 年 1 月 1 日起，落实访问、更正、删除、可携带权，以及对出售、定向广告与画像的选择退出。 | 2027-01-01 | none | 2027-01-01 | 2027-01-01 | 39 天 | docs/GLOBAL-REGULATORY-2026.md 第 2.5 节，references/rules/privacy.md |
| HIGH | Apple App Store（Global） | App Store Connect 发布说明，2026 年 11 月 12 日 | 自 2027 年年初起，App Store Connect 将不再接受来自新应用或从未使用过该功能的应用、包含 On-Demand Resources 的上传。建议迁移到 Background Assets。Apple 未公布确切日期，因此 2027 年 1 月 1 日是最早可能日期，仅作为尽早迁移的提醒保留，并非 Apple 的执法日期。自该日起，截止日期检查器会把它列为已过期，这正是用来提示你去确认真实日期的安排，一旦 Apple 给出日期即须替换本条目。已经在使用 On-Demand Resources 的应用不在封禁之列。 | 2026-11-12 | 至 2027 年年初 | 2027-01-01 | 2027-01-01 | 39 天 | docs/APPLE.md，data/rejection-patterns.json APPLE-ODR-DEPRECATED-27 |
| MEDIUM | Apple App Store（美国、加利福尼亚） | Apple 税项与价格更新，2026 年 11 月 17 日（Apple Developer news 4o5ie73a） | 自 2027 年 1 月 1 日起，属于 SaaS、App Store Software、Software Training Material、Dating 与 Boosting 税务类别的应用须缴纳加利福尼亚销售税与使用税。美国店面价格显示为不含税，收入不变，但客户支付的总额可能上升。App Store Software、Software Training Material、Dating 与 Boosting 税务类别新增了 Software as a Service（SaaS）属性。请在 2027 年 1 月 1 日前，在 Pricing and Availability 中复查每个应用与 In-App Purchase 的税务类别及 SaaS 属性，并检查应用内价格文案没有向美国买家承诺含税总价。 | 2026-11-17 | none | 2027-01-01 | 2027-01-01 | 39 天 | docs/APPLE.md 2026 年必须立即行动的变更 |
| MEDIUM | 欧盟（EU） | 《数据法案》（Data Act），Regulation (EU) 2023/2854，第 29(1) 条 | 数据处理服务提供者对客户转出不得收费。2025 年 9 月 12 日或之前订立的无限期或长期存量合同，必须在 2027 年 9 月 12 日前达到第 IV 章不公平条款规则的要求。 | 2027-01-12 | none | 2027-01-12 | 2027-01-12 | 50 天 | docs/EU-REGULATORY-2026.md 第 5 节 |
| HIGH | Apple App Store（Global） | Apple 年龄分级内容描述词：共享位置（Shared Location）与约会和恋爱关系（Dating and Relationships）（Apple Developer news yxkh08us） | 自 2026 年 11 月 16 日起，App Store Connect 年龄分级问卷会询问应用是否包含共享位置（Shared Location，与另一个人或群体共享真实世界位置）与约会和恋爱关系（Dating and Relationships，让真实的人之间建立约会或恋爱联系的功能）。每个应用都必须在 2027 年 1 月 12 日前完成这两项申报，在此之前任何更新或问卷变更也必须回答它们。约会和恋爱关系会把最低年龄分级定为 18+。 | 2026-11-16 | none | 2027-01-12 | 2027-01-12 | 50 天 | docs/APPLE.md 2026 年必须立即行动的变更 |
| CRITICAL | 纽约（USA State） | Stop Addictive Feeds Exploitation (SAFE) for Kids Act，州总检察长最终规则于 2026 年 7 月 29 日发布 | 自 2027 年 1 月 25 日起，使用经认证的年龄核验，在没有可验证的家长同意的情况下，限制面向未成年人的成瘾性信息流与午夜至早 6 点的通知。 | 2027-01-25 | none | 2027-01-25 | 2027-01-25 | 63 天 | docs/GLOBAL-REGULATORY-2026.md 第 2.5 节，references/guidelines/by-app-type/social-and-user-generated-content.md |
| HIGH | Google Play（Global） | 面向以 Android 17、API 级别 37 为目标的应用的通讯录权限、位置权限与前台服务政策变更（Play Console 帮助文章 16909972 与 16965181） | 以 API 37 或更高为目标的应用，只有在 Android Contact Picker 不足以支撑核心功能时才可请求 READ_CONTACTS（须作申报）；必须带 onlyForLocationButton manifest 标志实现 Android 位置按钮以获得位置按钮作用域；并且不得再为地理围栏使用前台服务（改用 Geofence API）。自 2026 年 10 月 27 日起，Play Console 的预审核检查会标记通讯录与位置问题。 | 2026-10-27 | 至 2027 年 1 月 27 日 | 2027-01-27 | 2027-01-27 | 65 天 | docs/GOOGLE-PLAY.md 2026 年政策批次，references/rules/android.md |
| MEDIUM | Google Play（Global） | 订阅政策：带持续基于资格折扣的订阅（2026 年 10 月 29 日宣布） | 带持续基于资格折扣的订阅（例如学生计划），必须清楚披露资格标准、资格如何核验，以及资格终止后的价格与权益。 | 2026-10-29 | none | 2027-01-27 | 2027-01-27 | 65 天 | docs/GOOGLE-PLAY.md 2026 年政策批次 |
| HIGH | Google Play（Global） | SMS 或通话记录权限组的使用：通过电话进行账号验证（Play Console 帮助文章 10208820，2026 年 10 月 29 日政策公告中的提醒，帮助文章 18100766） | 自 2027 年 1 月 27 日起，通过电话进行账号验证不再是 READ_CALL_LOG 权限的允许用例。在该日之前，同一页面的例外表仍列有此项。请使用 Digital Credentials API（直接使用，或通过基于它构建的验证服务提供方）、SMS Retriever API 或 SMS User Consent API 验证账号。2026 年 10 月 29 日的公告把 SMS User Consent API 列为账号验证的隐私保护替代方案。 | 2027-01-27 | none | 2027-01-27 | 2027-01-27 | 65 天 | docs/GOOGLE-PLAY.md 2026 年政策批次，references/rules/android.md，data/rejection-patterns.json |
| MEDIUM | 英国（UK） | Online Safety Act 2023，Ofcom 关于儿童使用应用商店的法定报告 | Ofcom 将于 2027 年 1 月前发布其关于应用商店的报告。该报告将支撑国务大臣就是否把应用商店纳入 Online Safety Act 范围作出决定。属观察项，目前尚无直接的开发者义务。 | 2027-01-31 | none | 2027-01-31 | 2027-01-31 | 69 天 | docs/GLOBAL-REGULATORY-2026.md 第 3.1 节 |
| HIGH | Apple App Store（中国大陆） | App Store Connect 中国大陆合规申报（AI-Generated or Synthetic Content 与 Security Assessment） | 在中国大陆 App Store 上架的每个应用，都必须在 App Compliance 页面完成这两项申报（先进入 Apps，再进入相应应用，然后选侧边栏中的 General）。所需角色为 Account Holder 或 Admin。当应用向中国大陆用户提供该功能时选择 Yes；当不提供，或该功能在中国大陆被禁用或地理封锁时选择 No。AI-Generated or Synthetic Content 适用于 AI 聊天机器人、图像或视频生成、语音与人脸变换等服务。回答 Yes 需提供大语言模型或算法的批准备案号与备案名称。若这些功能由他人的技术驱动，还须上传技术所有方出具的授权或使用协议，其中写明基础模型或算法的注册名称与备案编号、标明你或你的组织为被授权方的提供者名称，以及一个名称与中国网信办（Cyberspace Administration of China）批准登记册上所有方一致的授权主体。Security Assessment 适用于分发 AI 生成或合成内容、提供端到端加密即时通信等功能。回答 Yes 需提供全国互联网安全管理服务平台的截图，显示应用名称、提供者名称以及 pass 或 passed review（通过/审核通过）状态，并附 Security Assessment 报告副本，其中包含应用名称、提供者名称与公司公章。涉密或专有信息应作脱敏处理。状态包括 Missing Info、Pending Verification、Verification Failed 与 Active。应用会在其余所有已选国家和地区发布；在合规信息通过核验之前，它不会在中国大陆 App Store 上架。若版本已获批准但核验失败，它在中国大陆仍不可用。请更新并保存 App Compliance 页面。更新后的申报会随下一次提交的应用版本一并审核。核验通过并获批后，应用即在中国大陆变为可用。到 2027 年 1 月 31 日，中国大陆的每个存量应用都必须完成并通过核验的合规申报，才能继续在 App Store 上架。 | 2026-11-17 | 存量应用至 2027 年 1 月 31 日 | 2027-01-31 | 2027-01-31 | 69 天 | docs/GLOBAL-REGULATORY-2026.md 第 3.9 节，docs/APPLE.md 2026 年必须立即行动的变更，docs/PRE-SUBMISSION-CHECKLIST.md Global 专属部分，docs/BY-APP-TYPE.md，references/guidelines/by-app-type/ai-and-generative-apps.md，references/guidelines/by-app-type/social-and-user-generated-content.md |
| HIGH | Google Play（Global） | Play Console 技术质量要求：内存、位图与 DEX 优化阈值（Play Console 帮助文章 17492799） | Google 表示，自 2027 年 2 月起（未公布确切日期），应用必须达到最低优化要求：使用 R8 等工具在优化（optimization）、收缩（shrinking）与混淆（obfuscation）三方面合计覆盖率至少 25%；不得在不可见状态下把位图留在内存中；并须保持在内存不良行为阈值之内。不达标会影响可见性与发布能力。 | 2026-08-26 | 至 2027 年 2 月 | 2027-02-01 | 2027-02-01 | 70 天 | docs/GOOGLE-PLAY.md 2026 年政策批次，references/rules/performance.md |
| HIGH | Apple App Store（Global） | 原始 Developer ID 认证中心（Sub-CA）过期（Apple Developer news w4atic4c） | 原始的 Developer ID Sub-CA 于 2027 年 2 月 1 日过期，其签发的证书当日失效。请在此之前从 Developer ID Certification Authority（G2）生成替代的 Developer ID 证书，并为每一个在 Mac App Store 之外分发的安装包重新签名。 | 2026-10-01 | none | 2027-02-01 | 2027-02-01 | 70 天 | docs/PLATFORM-MECHANICS-2026.md 第 1.1 节 |
| CRITICAL | Google Play（Global） | EEA 与英国法律下的 Play Console 商家身份（trader status）申报（Play Console 帮助文章 17594752） | 每个有效的开发者账号都必须在 Play Console 中依 EEA 与英国法律申报商家身份（trader status）或非商家身份，无论其应用面向何处或在哪里分发。不在 EEA 或英国分发的账号可申报为非商家。新账号在创建时申报。存量账号必须在 2027 年 2 月 1 日前完成申报。商家须自我证明符合适用法律，提供每个应用的服务条款链接；个人账号还须提供联系电话（地址会被展示）。错过该日期可能被阻止更新，并把应用从 Play 全球移除。虚假的非商家申报可能导致全球移除；为绕过验证或自我证明而虚报身份，可能导致账号被全球暂停或终止。 | 2026-10-29 | 存量账号至 2027 年 2 月 1 日 | 2027-02-01 | 2027-02-01 | 70 天 | docs/GOOGLE-PLAY.md 2026 年政策批次，docs/EU-REGULATORY-2026.md 第 3 节 |

## 完整时序时间线

| 强制日期 | 法律 | 要求 | 司法辖区 | 生效日期 | 宽限期 | 执法日期 | 优先级 | 受影响章节 |
|---|---|---|---|---|---|---|---|---|
| 2008-06-01 | 《生物识别信息隐私法》（Biometric Information Privacy Act，BIPA），740 ILCS 14 | 在收集生物识别标识符之前进行书面告知并取得书面同意书（release），执行公开的留存时间表，3 年内销毁，且不得出售。 | 伊利诺伊州（美国州级） | 2008-06-01 | none | 2008-06-01 | CRITICAL | docs/GLOBAL-REGULATORY-2026.md 第 2.6 节，references/rules/privacy.md |
| 2021-09-02 | ICO《适龄设计准则》（Age Appropriate Design Code，儿童准则） | 默认高隐私、数据最小化、地理位置默认关闭、画像默认关闭，以及强制执行 DPIA。 | 英国（UK） | 2020-09-02 | 12 个月 | 2021-09-02 | HIGH | docs/GLOBAL-REGULATORY-2026.md 第 3.1 节，references/rules/privacy.md |
| 2022-03-15 | 《电信事业法》（Telecommunications Business Act） | 经认可的计费服务商、26% 佣金、com.apple.developer.storekit.external-purchase entitlement、仅限韩国的二进制包、模态弹窗（modal sheet）以及上报。 | 韩国 | 2022-03-15 | none | 2022-03-15 | HIGH | docs/GLOBAL-REGULATORY-2026.md 第 3.5 节，references/rules/payments.md |
| 2024-03-07 | 欧盟《数字市场法》（DMA） | 替代支付与应用外优惠（StoreKit External Purchases 或 Offers Entitlement、ExternalPurchaseCustomLink 披露页、提供时以同等显著程度展示 In-App Purchase、面向未成年人的家长门槛、选项保留 12 个月、按月上报交易）。 | 欧盟（EU） | 2024-03-07 | none | 2024-03-07 | HIGH | docs/EU-REGULATORY-2026.md 第 2 节 |
| 2024-03-31 | MIIT 移动应用备案（ICP 延伸） | 强制的中国 MIIT 应用备案、本地合作方/实体、实名制、PIPL 隐私要求、数据本地化，以及游戏所需的版号（Banhao）许可。 | 中国 | 2023-09-01 | 7 个月 | 2024-03-31 | CRITICAL | docs/GLOBAL-REGULATORY-2026.md 第 3.9 节，references/rules/metadata.md |
| 2024-06-25 | FTC《健康泄露通知规则》（Health Breach Notification Rule），16 CFR Part 318 | 遵守 2024 年最终规则（与广告主未经授权共享健康/敏感数据视为泄露，强制 60 天通知）。 | 美国（联邦） | 2024-06-25 | none | 2024-06-25 | HIGH | docs/GLOBAL-REGULATORY-2026.md 第 2.6 节，references/guidelines/by-app-type/health-fitness-and-medical.md |
| 2024-12-13 | 《通用产品安全条例》（GPSR），Regulation (EU) 2023/988 | 在面向消费类产品的线上界面上展示制造商身份、电子与邮寄联系方式以及产品安全警示。 | 欧盟（EU） | 2023-06-12 | 18 个月 | 2024-12-13 | HIGH | docs/REGULATORY-GAP-REPORT-2026.md 第 1 节，references/rules/safety.md |
| 2025-02-02 | 欧盟《人工智能法案》（EU AI Act），Regulation (EU) 2024/1689（经 Regulation (EU) 2026/1744 修订），第 4 条 | 第 4 条 AI 素养（AI literacy）要求，即 2026 年 7 月 27 日替换后的版本。提供者与部署者应采取措施，促进其员工以及其他代表其操作和使用 AI 系统的人员发展 AI 素养，同时考虑其技术知识、经验、教育培训、系统的使用场景，以及系统所作用的人员或群体。该义务不要求保证任何个人达到特定的 AI 素养水平。书面政策、入职培训与日志是务实的证据，但并非明文的法律要求。 | 欧盟（EU） | 2024-08-01 | 6 个月 | 2025-02-02 | HIGH | docs/EU-REGULATORY-2026.md 第 1.3 节，references/guidelines/by-app-type/ai-and-generative-apps.md |
| 2025-02-02 | 欧盟《人工智能法案》（EU AI Act），Regulation (EU) 2024/1689 | 第 5 条禁止性做法（禁止潜意识操纵、剥削儿童、社会评分、生物识别特征归类等）。 | 欧盟（EU） | 2024-08-01 | 6 个月 | 2025-02-02 | CRITICAL | docs/EU-REGULATORY-2026.md 第 1.4 节，references/guidelines/by-app-type/ai-and-generative-apps.md |
| 2025-02-17 | 欧盟《数字服务法》（DSA） | 商家身份（trader status）申报与核验（D-U-N-S、电话、公开邮箱、已验证 2FA），否则应用从欧盟店面下架。 | 欧盟（EU） | 2024-02-17 | 12 个月 | 2025-02-17 | CRITICAL | docs/EU-REGULATORY-2026.md 第 3 节，references/rules/metadata.md |
| 2025-03-19 | Google Play《儿童安全标准》（Child Safety Standards）政策 | 在全球可访问的网页上公布 CSAE 标准、提供应用内反馈、制定 CSAM 响应协议，并指定儿童安全联系人。 | Google Play（全球） | 2025-03-19 | none | 2025-03-19 | CRITICAL | docs/PLATFORM-MECHANICS-2026.md 第 3.2 节，references/rules/android.md |
| 2025-05-28 | Google Play 照片与视频权限政策 | 完整访问权限的 READ_MEDIA_IMAGES/READ_MEDIA_VIDEO 仅限需要完整访问权限的应用使用；其他应用必须使用 Android 照片选择器。 | Google Play（全球） | 2025-05-28 | none | 2025-05-28 | CRITICAL | docs/PLATFORM-MECHANICS-2026.md 第 2.9 节，references/rules/android.md |
| 2025-06-28 | 《欧洲无障碍法案》（EAA），Directive (EU) 2019/882 | 符合统一标准 EN 301 549 第 11 章 / WCAG 2.1 AA 的移动无障碍要求，并按附件 V 在条款与条件或同等文件中公布无障碍信息（第 13(2) 条）。 | 欧盟（EU） | 2022-06-28 | 36 个月 | 2025-06-28 | HIGH | docs/EU-REGULATORY-2026.md 第 4 节，references/rules/design.md |
| 2025-07-25 | 英国《在线安全法 2023》（UK Online Safety Act 2023） | 使用高度有效的年龄核验方法（面部年龄估算、开放银行、信用卡核验）保护儿童免受有害内容侵害。 | 英国（UK） | 2025-07-25 | none | 2025-07-25 | CRITICAL | docs/GLOBAL-REGULATORY-2026.md 第 3.1 节，references/rules/safety.md |
| 2025-08-02 | 欧盟《人工智能法案》（EU AI Act），Regulation (EU) 2024/1689 | GPAI 模型义务、治理与处罚（第 99 条和第 100 条）。 | 欧盟（EU） | 2024-08-01 | 12 个月 | 2025-08-02 | HIGH | docs/EU-REGULATORY-2026.md 第 1.1 节、第 1.6 节 |
| 2025-08-31 | Google Play 目标 API 要求 | 新应用与更新必须面向 API level 35（Android 15）或更高，存量应用须面向 API 34+。 | Google Play（全球） | 2025-08-31 | none | 2025-08-31 | CRITICAL | docs/PLATFORM-MECHANICS-2026.md 第 2.5 节，references/rules/android.md |
| 2025-09-12 | 欧盟《数据法》（Data Act），Regulation (EU) 2023/2854 | 应用与互联产品及可穿戴设备交互时的核心“设计即访问”（access-by-design）义务。 | 欧盟（EU） | 2024-01-11 | 20 个月 | 2025-09-12 | MEDIUM | docs/EU-REGULATORY-2026.md 第 5 节 |
| 2025-12-10 | 《在线安全修正案（社交媒体最低年龄）法 2024》（Online Safety Amendment (Social Media Minimum Age) Act 2024） | 通过严格的年龄核验阻止 16 岁以下者在社交媒体持有账号；隔离并销毁年龄数据。 | 澳大利亚 | 2024-12-10 | 12 个月 | 2025-12-10 | CRITICAL | docs/GLOBAL-REGULATORY-2026.md 第 3.2 节，references/rules/safety.md |
| 2026-01-01 | 得克萨斯州 SB 2420（《应用商店问责法》，App Store Accountability Act） | 对未成年人的下载、购买与重大更新实施年龄核验并取得可验证的家长同意，删除年龄数据，请求年龄段。法定生效日期为 2026 年 1 月 1 日。2025 年 12 月 23 日的初步禁令已于 2026 年 6 月 4 日被第五巡回上诉法院暂缓执行，最高法院又于 2026 年 7 月 6 日拒绝撤销该暂缓，因此在实体上诉待决期间该法持续有效。 | 得克萨斯州（美国州级） | 2026-01-01 | none | 2026-06-04 | CRITICAL | docs/GLOBAL-REGULATORY-2026.md 第 1 节、第 2.2 节，references/rules/privacy.md |
| 2026-01-01 | 加利福尼亚州 CPRA（CPPA 2026 年条例） | 响应 Global Privacy Control（GPC）、收集时提供隐私政策/通知、可退出出售/共享/画像，以及敏感个人信息限制。 | 加利福尼亚州（美国州级） | 2026-01-01 | 自动化决策自 2027-04-01 起；网络安全审计自 2028-04-01 起 | 2026-01-01 | HIGH | docs/GLOBAL-REGULATORY-2026.md 第 2.4 节，references/rules/privacy.md |
| 2026-01-31 | Apple App Store 审核指南（Guideline 2.3.6） | 每个应用都必须填写更新后的年龄分级问卷（13+、16+、18+ 档位，UGC/直播标识），否则无法提交更新。 | Apple App Store（全球） | 2025-07-24 | 6 个月 | 2026-01-31 | CRITICAL | docs/EU-REGULATORY-2026.md 第 6 节，references/rules/metadata.md |
| 2026-02-24 | Apple App Store 区域年龄要求 | 阻止巴西、澳大利亚和新加坡用户下载 18+ 分级的应用，除非通过合理方法确认年龄。 | Apple App Store（巴西、澳大利亚、新加坡） | 2026-02-24 | none | 2026-02-24 | CRITICAL | docs/GLOBAL-REGULATORY-2026.md 第 1 节，references/rules/privacy.md |
| 2026-02-25 | FTC《促进在 COPPA 规则下采用年龄验证技术的执法政策声明》（2026 年 2 月 25 日） | 面向大众或混合受众的应用，只有在将年龄数据仅用于年龄判定、最小化留存、审查第三方、通知家长与儿童并保护数据安全的前提下，才可为年龄验证收集年龄数据而不承担 COPPA 执法风险。该声明在 COPPA 最终规则修正案发布或声明撤回之前有效。 | 美国（联邦） | 2026-02-25 | none | 2026-02-25 | HIGH | docs/GLOBAL-REGULATORY-2026.md 第 2.1 节，references/guidelines/by-app-type/kids-category-and-families.md |
| 2026-03-17 | 《数字 ECA》（Digital ECA，第 15,211/2025 号法律） | 认可的年龄验证方式（证件核验、面部估算、CPF 核验）；禁止使用自行声明的勾选框。 | 巴西 | 2025-09-17 | 6 个月 | 2026-03-17 | CRITICAL | docs/GLOBAL-REGULATORY-2026.md 第 3.3 节，references/rules/privacy.md |
| 2026-03-18 | 2026 年 3 月 18 日第 12.880 号法令（Decreto n. 12.880）第 21 条与第 25 条，规范《数字 ECA》 | 应用商店与操作系统须免费提供年龄信号，在创建账号时请求年龄，以 ANPD 认可的方法核验年龄，允许提出异议，寻求监护人授权，并在下载前展示年龄分级。商店必须阻止博彩与彩票类应用，以及任何缺少年龄验证方案的应用。 | 巴西 | 2026-03-18 | none | 2026-03-18 | CRITICAL | docs/GLOBAL-REGULATORY-2026.md 第 3.3 节，references/rules/privacy.md |
| 2026-04-01 | IMDA《应用分发服务在线安全行为准则》（Code of Practice for Online Safety for App Distribution Services） | 应用商店年龄核验（筛查并阻止 18 岁以下用户下载年龄不适配的应用），核验数据须销毁。这是年龄核验的落地生效日。《应用分发服务在线安全行为准则》本身已于 2025 年 3 月 31 日生效。 | 新加坡 | 2026-04-01 | none | 2026-04-01 | CRITICAL | docs/GLOBAL-REGULATORY-2026.md 第 3.7 节，references/rules/privacy.md |
| 2026-04-22 | 《儿童在线隐私保护法》（COPPA），16 CFR Part 312 | 遵守修订后的 COPPA 规则（将生物识别标识符纳入 PII、向第三方披露/定向广告须单独的选择加入同意、书面留存政策、书面信息安全计划）。第 312.11 条的豁免时点更早（2025 年 4 月 22 日发布后 90 天与 6 个月），且仅约束经 FTC 批准的 COPPA 安全港（Safe Harbor）计划，不约束应用开发者。 | 美国（联邦） | 2025-06-23 | 10 个月 | 2026-04-22 | CRITICAL | docs/GLOBAL-REGULATORY-2026.md 第 2.1 节，references/guidelines/by-app-type/kids-category-and-families.md |
| 2026-04-28 | Apple App Store 提交要求 | 自 2026 年 4 月 28 日起，上传到 App Store Connect 的应用必须使用 iOS 26 与 iPadOS 26 SDK 或更高版本构建（以及配套的 watchOS 26、tvOS 26、visionOS 26 SDK）。Apple 以 SDK 而非 Xcode 表述该要求，且 macOS 不在 Apple 的清单中。年龄核验功能另需 iOS 26.2 SDK 与 Xcode 26.2（17C52）或更高版本。 | Apple App Store（全球） | 2026-02-03 | 2 个月 | 2026-04-28 | CRITICAL | docs/EU-REGULATORY-2026.md 第 6 节，docs/PLATFORM-MECHANICS-2026.md 第 1.6 节 |
| 2026-04-29 | ICO《存储与访问技术最终指南》（2026 年 4 月 29 日），PECR 第 6 条，附 DUAA 附表 A1 豁免与上调后的 PECR 罚款（17.5 million pounds 或营业额的 4 percent） | 依据该指南重新审计每一个 SDK、追踪像素与设备指纹调用，而不仅仅是 cookie。同意违规如今将按 UK GDPR 级别的罚款处罚。 | 英国（UK） | 2026-04-29 | none | 2026-04-29 | HIGH | docs/GLOBAL-REGULATORY-2026.md 第 3.1 节，references/rules/privacy.md |
| 2026-05-19 | 《TAKE IT DOWN 法案》（TAKE IT DOWN Act），Pub. L. 119-12 | 受监管平台须运行清晰醒目的非自愿亲密影像通知与移除流程，并在 48 小时内移除被举报内容及其已知的完全相同副本。FTC 已于 2026 年 5 月 19 日开始执法。 | 美国（联邦） | 2026-05-19 | none | 2026-05-19 | CRITICAL | docs/GLOBAL-REGULATORY-2026.md 第 2.6 节，references/rules/safety.md |
| 2026-06-18 | App Store 区域年龄分级变更：澳大利亚取消 15+、越南 Decree 147 第 38 条区域专属分级（Apple Developer news yrrb45pw） | 自 2026 年 6 月 18 日起，澳大利亚不再提供 15+ 分级（受影响应用调整为 16+），在越南上架的应用需要符合 Decree 147 第 38 条的区域专属年龄分级。请按店面逐个检查 App Store Connect 的年龄分级。 | Apple App Store（澳大利亚、越南） | 2026-05-21 | 至 2026 年 6 月 18 日 | 2026-06-18 | HIGH | docs/GLOBAL-REGULATORY-2026.md 第 3.2 节与第 3.10 节 |
| 2026-06-19 | 《金融服务远程营销指令》（Distance Marketing of Financial Services），Directive (EU) 2023/2673 | 在在线界面（包括应用）上提供显著且易于访问的“撤回按钮”（withdrawal button）或“撤回功能”（withdrawal function），以便用户撤回合同。 | 欧盟（EU） | 2023-11-28 | 30 个月 | 2026-06-19 | HIGH | docs/EU-REGULATORY-2026.md 第 5 节，references/rules/payments.md |
| 2026-06-19 | 《数据（使用与访问）法 2025》（Data (Use and Access) Act 2025）第 103 条与附表 10，经 SI 2026/82 第 3 条生效 | 运行数据保护投诉处理流程：在 30 天内确认数据主体投诉，并在无不合理延迟的情况下作出回应。 | 英国（UK） | 2026-06-19 | none | 2026-06-19 | MEDIUM | docs/GLOBAL-REGULATORY-2026.md 第 3.1 节，references/rules/privacy.md |
| 2026-06-29 | 《在线安全（救济与问责）法 2025》部分生效 | 作为平台，根据在线安全委员会（Online Safety Commission）的通知处理五项优先危害。其余危害类别将逐步推进，尚未公布日期。 | 新加坡 | 2026-06-29 | none | 2026-06-29 | HIGH | docs/GLOBAL-REGULATORY-2026.md 第 3.7 节 |
| 2026-07-06 | Apple 开发者计划许可协议附件 12：依据 CADE 裁决的巴西替代分发（Apple Developer news dhwadr2x 与 umq9wxmm） | 在 2026 年 7 月 6 日之前，所有 Apple Developer Program 成员都必须接受更新后的 ADPLA。自 iOS 26.5 起，开发者可在巴西通过第三方商店（marketplace）分发、运营第三方商店，并在 Apple In-App Purchase 之外处理数字商品支付。未接受协议将阻止新提交。 | Apple App Store（巴西） | 2026-06-18 | 至 2026 年 7 月 6 日 | 2026-07-06 | CRITICAL | docs/GLOBAL-REGULATORY-2026.md 第 3.3 节 |
| 2026-07-15 | 《人工智能拟人化交互服务管理暂行办法》（CAC 第 21 号令） | 识别未成年用户并自动切换至未成年人模式，对 14 岁以下者取得监护人同意，且绝不向未成年人提供虚拟伴侣或虚拟亲人服务。在中国上线的任何聊天、伴侣或角色扮演类应用均属适用范围。 | 中国 | 2026-07-15 | none | 2026-07-15 | CRITICAL | docs/GLOBAL-REGULATORY-2026.md 第 3.9 节，references/guidelines/by-app-type/ai-and-generative-apps.md |
| 2026-07-22 | Play 目录访问计划（Play Catalog Access Program）（Play Console Help answers 17117200 与 15582165） | 自 2026 年 7 月 22 日起，已注册的美国第三方 Android 商店可访问 Play 目录，并默认上架你的应用。如果不想通过第三方商店分发，请在 Play Console 的 Settings（设置）、Catalog Settings（目录设置）中退出。 | Google Play（美国） | 2026-07-22 | none | 2026-07-22 | HIGH | docs/GOOGLE-PLAY.md 2026 政策轮次 |
| 2026-08-02 | 欧盟《人工智能法案》（EU AI Act），Regulation (EU) 2024/1689 | 第 50 条透明度义务（AI 交互披露、合成内容标记与深度伪造披露）。 | 欧盟（EU） | 2024-08-01 | 24 个月 | 2026-08-02 | CRITICAL | docs/EU-REGULATORY-2026.md 第 1.2 节，references/guidelines/by-app-type/ai-and-generative-apps.md |
| 2026-08-03 | Google Play 拒付（chargeback）成本责任更新（Play Console Help answer 17068375） | 对 2026 年 8 月 3 日之后下的订单，开发者承担扣除服务费后的购买金额，外加金融机构的拒付手续费；Google Play 仅承担其自身服务费。需处理 PendingRefundReviewNotification，并在 24 小时内调用 Review Refund API，以对不当争议提出异议。 | Google Play（全球） | 2026-08-03 | none | 2026-08-03 | HIGH | docs/GOOGLE-PLAY.md Payments 各行，references/rules/payments.md |
| 2026-08-18 | 电子证据一揽子计划（e-Evidence Package），Regulation (EU) 2023/1543 | 跨境执法可直接获取电子证据（10 天响应时限，以及关键的 8 小时紧急时限）。 | 欧盟（EU） | 2023-08-18 | 36 个月 | 2026-08-18 | HIGH | docs/EU-REGULATORY-2026.md 第 5 节，references/rules/privacy.md |
| 2026-08-26 | 《年龄限制内容、家庭与儿童安全标准》政策扩展至匿名与随机聊天应用（Play Console Help answers 17036597、17122218、14747720） | 核心功能是与陌生人随机或匿名聊天的应用，必须使用 Play Console 工具阻止未成年人，不得在 Families 项目下面向儿童，并纳入《儿童安全标准》政策范围（公布 CSAE 标准、应用内举报、移除 CSAM、儿童安全联系人）。 | Google Play（全球） | 2026-08-26 | none | 2026-08-26 | CRITICAL | docs/GOOGLE-PLAY.md 2026 政策轮次，references/rules/safety.md |
| 2026-08-31 | Google Play 结算政策 | 自 2026 年 8 月 31 日起，所有新应用与更新必须使用 Play Billing Library 8 或更高版本，可申请延期至 2026 年 11 月 1 日。这是一个发布门槛；已发布的 v7 二进制包在 2027 年全应用截止日期之前仍可继续交易。 | Google Play（全球） | 2026-05-01 | 3 个月 | 2026-08-31 | CRITICAL | docs/PLATFORM-MECHANICS-2026.md 第 2.4 节，references/rules/payments.md |
| 2026-08-31 | Google Play 目标 API 要求 | 自 2026 年 8 月 31 日起，新应用与更新必须面向 API level 36（Android 16）或更高，可通过 Play Console 申请延期至 2026 年 11 月 1 日。Wear OS 与 Android Automotive OS 应用须面向 API 35 或更高，Android TV 与 Android XR 应用须面向 API 34 或更高。存量应用须面向 API 35 或更高，才能继续向新设备上的新用户提供。 | Google Play（全球） | 2026-08-31 | none | 2026-08-31 | HIGH | docs/PLATFORM-MECHANICS-2026.md 第 2.5 节，references/rules/android.md |
| 2026-09-01 | App Store Connect 社交媒体能力声明（Apple Developer news 0d2gpmml 与 tlur8uvi） | Apple 表示，自 2026 年 9 月起（未公布具体日期），提交新版本或更新、或为替代分发进行公证时，必须声明你的应用或游戏是否包含社交媒体能力。声明社交媒体会把应用归入社交媒体的 Time Allowance 类别且最低分级为 13+，并要求使用 Declared Age Range API 才能服务 13 岁以下用户。 | Apple App Store（全球） | 2026-09-01 | none | 2026-09-01 | CRITICAL | docs/APPLE.md 第 2 节及 2026 变更清单，references/rules/metadata.md |
| 2026-09-09 | 《应用分发服务在线安全准则》（Class 1C 与 Class 2 材料），《行业统一准则》附表 7，2025 年 9 月 9 日注册 | 在准则生效 6 个月后，应用商店须在允许下载或购买成人应用之前实施年龄核验与访问控制。主条款（Head Terms）的逐步达标宽限期同日结束，首次风险评估也于同日到期。由于 esafety.gov.au 无法访问，内容读取自最后更新于 2026 年 5 月 19 日的 eSafety 页面 Wayback 存档，须在现行登记册上再次确认。 | 澳大利亚 | 2026-03-09 | none | 2026-09-09 | CRITICAL | docs/GLOBAL-REGULATORY-2026.md 第 3.2 节，references/rules/safety.md |
| 2026-09-09 | Apple“即将施行的要求”页面（Upcoming Requirements） | 上传到 App Store Connect 的 iOS 与 iPadOS 应用必须面向 iOS 13 或更高版本。现已生效。提交前检查会对更低的 IPHONEOS_DEPLOYMENT_TARGET 或 Podfile platform 标记告警。 | Apple App Store（全球） | 2026-09-09 | none | 2026-09-09 | CRITICAL | docs/APPLE.md、data/rejection-patterns.json APPLE-MIN-DEPLOYMENT-TARGET-IOS13 |
| 2026-09-11 | 《网络弹性法案》（Cyber Resilience Act），Regulation (EU) 2024/2847 | 主动漏洞报告与安全事件通知义务。 | 欧盟（EU） | 2024-12-11 | 21 个月 | 2026-09-11 | MEDIUM | docs/EU-REGULATORY-2026.md 第 5 节 |
| 2026-09-11 | 《个人信息保护法》修正案（Personal Information Protection Act），第 21445 号法律 | 将 CEO 及法定代表人列为最终问责主体，在达到规模门槛时设置经董事会批准的首席隐私官，并纳入惩罚性附加金以及扩大范围的泄露通知。 | 韩国 | 2026-09-11 | none | 2026-09-11 | HIGH | docs/GLOBAL-REGULATORY-2026.md 第 3.5 节，references/rules/privacy.md |
| 2026-09-12 | 欧盟《数据法》（Data Act），Regulation (EU) 2023/2854 | 面向互联可穿戴设备与设备的“设计即访问”技术落地。这是针对互联产品的第 3(1) 条“设计即访问”义务，而非云切换。第 29(1) 条规定切换费用自 2027 年 1 月 12 日起归零。 | 欧盟（EU） | 2024-01-11 | 32 个月 | 2026-09-12 | MEDIUM | docs/EU-REGULATORY-2026.md 第 5 节 |
| 2026-09-30 | Android 开发者验证政策 | 侧载部分：自 2026 年 9 月 30 日起，在巴西、印度尼西亚、新加坡和泰国的认证设备上安装的应用，必须关联到经验证的开发者身份（Android Developer Console，完整分发 USD 25，受限分发账号免费、最多 20 台设备，组织需 D-U-N-S）。全球扩展仅表述为 2027 年，未公布具体日期。独立的 Play 部分（2026 年 9 月 30 日前在 Play Console 注册所有 Play 包名，全球范围）见 GOOGLE-PLAY-APP-PACKAGE-REGISTRATION。 | Android（巴西、印度尼西亚、新加坡、泰国） | 2026-03-15 | 6 个月 | 2026-09-30 | CRITICAL | docs/PLATFORM-MECHANICS-2026.md 第 2.1 节，references/rules/android.md |
| 2026-09-30 | Play Console 要求：金融、健康、VPN 与政府类应用的组织注册（Play Console Help answers 10788890 与 17125096） | 提供金融产品（银行、贷款、股票交易、投资基金、加密钱包与交易所）的应用、健康类应用（医疗、涉及人体受试者的研究）、获准使用 VpnService 类的应用以及政府类应用，必须通过组织账号发布，且 D-U-N-S 号码须与 Dun and Bradstreet 资料一致。不合规的应用将被下架。 | Google Play（全球） | 2026-07-15 | 至 2026 年 9 月 30 日 | 2026-09-30 | CRITICAL | docs/GOOGLE-PLAY.md 2026 政策轮次，references/rules/android.md |
| 2026-09-30 | Android 开发者验证之 Play 部分：在 Play Console 注册每个 Play 应用包名（Play Console Help answers 17125096 与 17134731） | 通过 Play Console 注册你的应用包名，以符合 Android 开发者验证要求。该部分为全球范围，与巴西、印度尼西亚、新加坡、泰国的侧载部分相互独立。未注册可能导致应用从 Google Play 全球下架。 | Google Play（全球） | 2026-07-15 | 至 2026 年 9 月 30 日 | 2026-09-30 | CRITICAL | docs/GOOGLE-PLAY.md 2026 政策轮次，docs/PLATFORM-MECHANICS-2026.md 第 2 节 |
| 2026-10-01 | 美国替代计费与外部链接计划：交易上报与服务费（Play Console Help answer 16497028） | 加入美国替代计费或外部链接计划的开发者，自 2026 年 10 月 1 日起必须上报交易与成功下载，并支付相应的 Play 服务费。 | Google Play（美国） | 2026-10-01 | none | 2026-10-01 | CRITICAL | docs/GLOBAL-REGULATORY-2026.md 第 2.3 节，docs/GOOGLE-PLAY.md |
| 2026-10-01 | Apple 欧盟商务条款更新：核心技术佣金（Core Technology Commission）取代核心技术费（Core Technology Fee），ADPLA 附件 14（Apple Developer news gmws0jgp 与 0cgo95n6） | 自 2026 年 10 月 1 日起，按安装收取的核心技术费被 5 percent 的核心技术佣金取代（按 App Store 之外分发的应用内数字交易计），初始获取费（Initial Acquisition Fee）与商店服务费（Store Services Fee）被取消，应用可在 Apple In-App Purchase 之外提供替代支付选项，第三方商店（marketplace）与 web 分发的资格放宽为七项替代标准。必须接受 ADPLA 附件 14。 | 欧盟（EU） | 2026-08-18 | 至 2026 年 10 月 1 日 | 2026-10-01 | CRITICAL | docs/EU-REGULATORY-2026.md 第 2.3 节 |
| 2026-10-22 | Apple 多席位（multiseat）订阅购买（Apple Developer news likeohx4） | 自 2026 年 9 月 16 日起，App Store Connect 中订阅默认启用多席位购买。通过 Apple Business 与 Apple School Manager 的批量采购（Volume Purchasing）于 2026 年 10 月 22 日上线，团体采购（Group Purchases）于今年冬季上线。在 10 月 22 日之前，请为每个自动续期订阅决定组织和团体是否可以购买席位，并在其不符合你的定价或 entitlement 逻辑时，跨 App Store、Apple Business 与 Apple School Manager 禁用或限制多席位购买。来源 https://developer.apple.com/news/?id=likeohx4 | Apple App Store（全球） | 2026-09-16 | 约 5 周 | 2026-10-22 | MEDIUM | docs/APPLE.md 2026 必须落实的变更 |
| 2026-10-23 | Apple iPhone Duo 平台就绪 | iPhone Duo 是 Apple 首款可折叠 iPhone，于 2026 年 10 月 16 日开启预购、10 月 23 日发货，搭载 iOS 27.1 发布。使用 Xcode 26 或更早版本构建的应用仍可运行，但不会延伸到状态栏与摄像头下方。请使用 Xcode 27.1（2026 年 9 月 18 日起提供 beta）与 iOS 27.1 SDK 构建，在 Duo 模拟器中测试每一种折叠姿态，依据 size classes 与场景边界调整布局，处理保留区域（外置摄像头、启用时的内置摄像头、折叠区域），并让导航栏、工具栏与标签栏支持竖向呈现。自 2026 年 10 月 5 日起，App Store Connect 接受针对 iPhone Duo 优化的应用与 Duo 截图，可获得产品页徽章；自 2027 年 4 月起，使用 iOS 27.1 SDK 或更高版本的应用必须提供 Duo 截图（APPLE-IPHONE-DUO-SCREENSHOTS-REQ）。在 issue #724 中追踪。来源 https://developer.apple.com/news/?id=kkphp5qo https://www.apple.com/newsroom/2026/09/apple-unveils-iphone-duo/ https://developer.apple.com/documentation/technologyoverviews/preparing-your-app-for-iphone-duo | Apple App Store（全球） | 2026-09-09 | 约 6 周 | 2026-10-23 | HIGH | docs/PLATFORM-MECHANICS-2026.md 第 1.8 节，docs/PRE-SUBMISSION-CHECKLIST.md Apple 专项，docs/GAP-ANALYSIS-2026-09.md 待办事项 |
| 2026-11-13 | 《数字个人数据保护规则 2025》（Digital Personal Data Protection Rules 2025），G.S.R. 846(E)，第 4 条 | 注册同意管理器（Consent Manager）在宪报刊登（2025 年 11 月 13 日）一年后开始实施。请在 2027 年 5 月 13 日的 18 个月批次之前，做好与注册同意管理器互操作的准备。 | 印度 | 2026-11-13 | none | 2026-11-13 | MEDIUM | docs/GLOBAL-REGULATORY-2026.md 第 3.6 节，references/rules/privacy.md |
| 2026-11-16 | CAC 2026 年 10 月 19 日关于指定未成年用户数量极多或对未成年人有重大影响的网络平台的通知 | 注册未成年用户达 1000 万及以上，或未成年月活跃用户达 100 万及以上（面向未成年人的服务为注册用户 1000 万、月活跃用户 100 万），或对未成年人有重大影响的平台，须在通知发出后 20 个工作日内向省级网信部门提交指定材料与自评估报告。该窗口约于 2026 年 11 月 16 日关闭（推算）。符合条件的平台未提交的，将被指定委员会责令提交。 | 中国 | 2026-10-19 | 20 个工作日 | 2026-11-16 | LOW | docs/GLOBAL-REGULATORY-2026.md 第 3.9 节 |
| 2026-12-01 | Play Console 面向向日本销售或自日本销售的开发者的支付授权（2026 年 10 月 29 日政策公告） | 向日本销售或自日本销售的开发者，必须在 2026 年 12 月 1 日前在 Play Console 中填写完成支付授权表单，否则 Google 将在全球范围暂停其付款。 | Google Play（日本） | 2026-10-29 | none | 2026-12-01 | HIGH | docs/GOOGLE-PLAY.md 2026 政策轮次 |
| 2026-12-02 | 欧盟《人工智能法案》（EU AI Act），Regulation (EU) 2024/1689（经 Regulation (EU) 2026/1744 修订），第 111(4) 条与第 5(1)(ba)、(bb)、(1a)、(1b) 条 | 第 111(4) 条：在 2026 年 8 月 2 日之前投放市场、生成合成音频、图像、视频或文本的 AI 系统（包括通用 AI 系统）的提供者，须在 2026 年 12 月 2 日前采取必要措施以符合第 50(2) 条。自同日起，第 5(1a) 条禁止投放市场或投入使用这样的 AI 系统：其生成或操纵未经同意的亲密材料（第 5(1)(ba) 条）或儿童性虐待材料或儿童性虐待表现（第 5(1)(bb) 条，Directive 2011/93/EU 第 2(c) 与 (e) 条），且仅当该生成或操纵是预期目的，或系统的设计、训练、架构、能力或面向用户的功能使其在无需重大技术改动的情况下成为可合理预见且可复现的结果，同时系统在考虑可合理预见误用的情况下，缺乏能够可靠防止、并纠正已发现或被举报误用的合理充分技术安全措施与其他保障手段。只有当部署者为该目的使用系统时，使用才被禁止。第 5(1b) 条：未增加所描绘任何亲密部位暴露程度、亦未改变所描绘任何露骨性行为性质的操纵，不属于 (ba) 项下的操纵。 | 欧盟（EU） | 2026-12-02 | none | 2026-12-02 | HIGH | docs/EU-REGULATORY-2026.md 第 1.1 节，references/guidelines/by-app-type/ai-and-generative-apps.md |
| 2026-12-03 | Apple 税务与价格更新，2026 年 11 月 17 日（Apple Developer news 4o5ie73a） | 2026 年 12 月 3 日，Apple 将更新博茨瓦纳、哥伦比亚、埃及、卢旺达和土耳其的应用与 In-App Purchase 价格，此前博茨瓦纳开征 14 percent 增值税、卢旺达开征 18 percent 增值税（《付费应用协议》（Paid Applications Agreement）附件 B（Exhibit B）现已将 Apple 列为当地代收税款方）。如果这五个店面之一是你的基准店面（base storefront），其价格保持你设置的值不变，Apple 会自动调整其他自动平衡价格店面上的价格，使其与该基准价一致。自动续期订阅以及你手动管理价格的店面不受影响。请检查受影响店面在截图、宣传文本或应用内文案中硬编码的任何价格。 | Apple App Store（博茨瓦纳、哥伦比亚、埃及、卢旺达、土耳其） | 2026-11-17 | none | 2026-12-03 | LOW | docs/APPLE.md 2026 必须落实的变更 |
| 2026-12-09 | 《产品责任指令》（Product Liability Directive）Directive (EU) 2024/2853，第 21 条与第 22 条 | 自 2026 年 12 月 9 日起，各国严格责任法律将独立软件与应用更新视为产品。在该日或之后投放市场或投入使用的任何产品均适用新制度。 | 欧盟（EU） | 2026-12-09 | none | 2026-12-09 | MEDIUM | docs/EU-REGULATORY-2026.md 第 5 节，references/rules/safety.md |
| 2026-12-10 | 《隐私法 1988》APP 1.7 至 1.9，由《隐私及其他立法修正案法 2024》（Privacy and Other Legislation Amendment Act 2024）插入 | 自 2026 年 12 月 10 日起，隐私政策必须说明对权利或利益产生重大影响的自动化决策所使用的个人信息种类及其所作的决策。 | 澳大利亚 | 2026-12-10 | none | 2026-12-10 | HIGH | docs/GLOBAL-REGULATORY-2026.md 第 3.2 节，references/rules/privacy.md |
| 2026-12-10 | 《隐私法 1988》项下的《儿童在线隐私准则》（Children's Online Privacy Code） | 该准则必须在 2026 年 12 月 10 日前定稿并注册，为社交媒体、相关电子服务与指定互联网服务带来具有约束力的儿童隐私义务。 | 澳大利亚 | 2026-12-10 | none | 2026-12-10 | HIGH | docs/GLOBAL-REGULATORY-2026.md 第 3.2 节，references/guidelines/by-app-type/kids-category-and-families.md |
| 2026-12-31 | 2025 年第 17 号政府条例（PP TUNAS）与通信和数字部长 2026 年第 9 号条例 | 每家电子系统运营者必须在 2026 年 12 月 31 日前，针对每个产品、服务与功能完成儿童保护自评估。Kemkomdigi 表示，可将错过截止日期的产品直接指定为高风险，从而适用更严格的高风险义务。 | 印度尼西亚 | 2026-12-31 | none | 2026-12-31 | HIGH | docs/GLOBAL-REGULATORY-2026.md 第 3.11 节，references/rules/safety.md |
| 2027-01-01 | 亚拉巴马州 HB 161（《应用商店问责法》，App Store Accountability Act） | 应用商店须核验年龄段、将未成年人关联到家长账号，并在每次下载与应用内购买（In-App Purchase，IAP）时取得可验证的家长同意。依据 HB 161 第 14 条（通过文本）于 2027 年 1 月 1 日生效。2026 年 10 月 2 日已存在的账号，须在 2027 年 10 月 1 日前完成带同意的年龄核验。 | 亚拉巴马州（美国州级） | 2027-01-01 | none | 2027-01-01 | CRITICAL | docs/GLOBAL-REGULATORY-2026.md 第 2.2 节，references/rules/privacy.md |
| 2027-01-01 | 《数字市场、竞争与消费者法 2024》（Digital Markets, Competition and Consumers Act 2024）第 4 部分第 2 章订阅合同制度 | 向英国消费者销售自动续期订阅应用，需要合同前信息、续期提醒、两个冷静期、便捷的取消路径以及新的退款规则。政府于 2026 年 8 月 9 日宣布该制度于 2027 年 1 月开始实施（具体日期尚未公布），取代早先 2027 年春季的预估。生效法规草案《消费者订阅合同（取消与信息）条例 2026》（The Consumer Subscription Contracts (Cancellation and Information) Regulations 2026）写明 2027 年 1 月 1 日，但截至 2026 年 11 月 14 日尚未正式颁布，因此在颁布之前该日期仍为暂定。 | 英国（UK） | 2027-01-01 | none | 2027-01-01 | HIGH | docs/GLOBAL-REGULATORY-2026.md 第 3.1 节，references/rules/payments.md |
| 2027-01-01 | ANPD《数字 ECA》路线图：Etapa II 与 III | ANPD 自 2026 年 8 月起就年龄核验机制发布指南与规范性参数，适配期持续至 2026 年 11 月，并自 2027 年 1 月起开始积极执法《数字 ECA》的年龄核验义务。 | 巴西 | 2026-08-01 | none | 2027-01-01 | HIGH | docs/GLOBAL-REGULATORY-2026.md 第 3.3 节，references/rules/privacy.md |
| 2027-01-01 | AB 1043《数字年龄核验法》（Digital Age Assurance Act），Civil Code Title 1.81.9 | 操作系统与应用商店在设置时收集年龄，并通过 API 暴露年龄段信号。开发者请求并使用该信号。2027 年 1 月 1 日起可执行。 | 加利福尼亚州（美国州级） | 2027-01-01 | none | 2027-01-01 | CRITICAL | docs/GLOBAL-REGULATORY-2026.md 第 2.4 节，references/rules/privacy.md |
| 2027-01-01 | SB 976《保护我们的孩子免受社交媒体成瘾侵害法》（Protecting Our Kids from Social Media Addiction Act），Health and Safety Code 第 27001 至 27006 节 | 自 2027 年 1 月 1 日起，在提供成瘾性信息流或发送午夜至早 6 时以及上课时间的通知之前，除非年龄核验合理判定并非未成年人，否则一律将用户视为未成年人。州检察长（AG）的年龄核验条例同日到期。 | 加利福尼亚州（美国州级） | 2027-01-01 | none | 2027-01-01 | HIGH | docs/GLOBAL-REGULATORY-2026.md 第 2.4 节，references/guidelines/by-app-type/social-and-user-generated-content.md |
| 2027-01-01 | AB 56，Health and Safety Code 第 25 章（自第 28000 节起） | 受监管的社交媒体平台须展示卫生局局长黑框警告：首次使用时每日一次，累计使用 3 小时后再次展示，此后每小时展示一次。2027 年 1 月 1 日起可执行。 | 加利福尼亚州（美国州级） | 2027-01-01 | none | 2027-01-01 | HIGH | docs/GLOBAL-REGULATORY-2026.md 第 2.4 节，references/guidelines/by-app-type/social-and-user-generated-content.md |
| 2027-01-01 | CPPA 条例，11 CCR 第 7200(b)、7155(b)、7157(a)(1)、7121(a) 节 | 在 2027 年 1 月 1 日前，对用于重大决策的自动化决策技术提供通知、允许退出并响应访问请求。2026 年之前的处理活动须在 2027 年 12 月 31 日前完成风险评估，并于 2028 年 4 月 1 日前提交。营收超过 100 million dollars 的网络安全审计认证自 2028 年 4 月 1 日开始。 | 加利福尼亚州（美国州级） | 2027-01-01 | none | 2027-01-01 | HIGH | docs/GLOBAL-REGULATORY-2026.md 第 2.4 节，references/rules/privacy.md |
| 2027-01-01 | 《适龄设计准则法》（Age-Appropriate Design Code Act），Act 63 | 面向未成年人的最高隐私默认设置、最小化收集、禁止深夜推送通知，并适用州检察长年龄核验规则。2027 年 1 月 1 日生效。规则制定意见截止 2026 年 10 月 2 日。 | 佛蒙特州（美国州级） | 2027-01-01 | none | 2027-01-01 | HIGH | docs/GLOBAL-REGULATORY-2026.md 第 2.5 节，references/guidelines/by-app-type/kids-category-and-families.md |
| 2027-01-01 | HB 2225，《2026 年法律》第 168 章，规范人工智能伴侣聊天机器人 | 伴侣聊天机器人披露与未成年人保护，包括未成年人持续使用时的每小时披露。2027 年 1 月 1 日生效。 | 华盛顿州（美国州级） | 2027-01-01 | none | 2027-01-01 | HIGH | docs/GLOBAL-REGULATORY-2026.md 第 2.5 节，references/guidelines/by-app-type/ai-and-generative-apps.md |
| 2027-01-01 | SB 546《俄克拉何马州消费者数据隐私法》（Oklahoma Consumer Data Privacy Act） | 自 2027 年 1 月 1 日起，响应访问、更正、删除、可携带权，以及退出出售、定向广告与画像的请求。 | 俄克拉何马州（美国州级） | 2027-01-01 | none | 2027-01-01 | MEDIUM | docs/GLOBAL-REGULATORY-2026.md 第 2.5 节，references/rules/privacy.md |
| 2027-01-01 | App Store Connect 发布说明，2026 年 11 月 12 日 | 自 2027 年初起，App Store Connect 将不再接受来自新应用或从未使用过 On-Demand Resources 的应用、包含 On-Demand Resources 的上传。建议迁移到 Background Assets。Apple 未公布具体日期，因此 2027 年 1 月 1 日是可能的最早日期，仅作为尽早迁移的提醒保留，并非 Apple 的执法日期。自该日起，截止日期检查器会将其列为已过期，这正是用于提示确认真实日期；Apple 公布日期后必须替换本条目。已在使用 On-Demand Resources 的应用不在封禁之列。 | Apple App Store（全球） | 2026-11-12 | 至 2027 年初 | 2027-01-01 | HIGH | docs/APPLE.md、data/rejection-patterns.json APPLE-ODR-DEPRECATED-27 |
| 2027-01-01 | Apple 税务与价格更新，2026 年 11 月 17 日（Apple Developer news 4o5ie73a） | 自 2027 年 1 月 1 日起，SaaS、App Store Software、Software Training Material、Dating 与 Boosting 税类别的应用须缴纳加利福尼亚州销售与使用税。美国店面价格显示为不含税、收益不变，但客户支付总额可能上升。App Store Software、Software Training Material、Dating 与 Boosting 税类别新增 Software as a Service（SaaS）属性。请在 2027 年 1 月 1 日前在 Pricing and Availability 中检查每个应用与 In-App Purchase 的税类别及 SaaS 属性，并确认应用内价格文案未向美国买家承诺含税总价。 | Apple App Store（美国加利福尼亚州） | 2026-11-17 | none | 2027-01-01 | MEDIUM | docs/APPLE.md 2026 必须落实的变更 |
| 2027-01-12 | 《数据法》（Data Act），Regulation (EU) 2023/2854，第 29(1) 条 | 数据处理服务提供商对客户迁出不得收费。2025 年 9 月 12 日或之前订立的无限期或长期存量合同，须在 2027 年 9 月 12 日前符合第 IV 章不公平条款规则。 | 欧盟（EU） | 2027-01-12 | none | 2027-01-12 | MEDIUM | docs/EU-REGULATORY-2026.md 第 5 节 |
| 2027-01-12 | Apple 年龄分级内容描述项：共享位置（Shared Location）与约会和社交关系（Dating and Relationships）（Apple Developer news yxkh08us） | 自 2026 年 11 月 16 日起，App Store Connect 年龄分级问卷询问应用是否包含共享位置（与他人或群组共享真实位置）以及约会和社交关系（在真实人群之间建立约会或恋爱关联的功能）。每个应用必须在 2027 年 1 月 12 日前完成这两项声明，此前任何更新或问卷变更都必须回答它们。约会和社交关系设定 18+ 的最低年龄分级。 | Apple App Store（全球） | 2026-11-16 | none | 2027-01-12 | HIGH | docs/APPLE.md 2026 必须落实的变更 |
| 2027-01-25 | 《阻止成瘾性信息流剥削（儿童安全）法》（Stop Addictive Feeds Exploitation (SAFE) for Kids Act），州检察长最终规则于 2026 年 7 月 29 日发布 | 自 2027 年 1 月 25 日起，在使用经认证的年龄核验、且无可验证的家长同意的情况下，限制针对未成年人的成瘾性信息流与午夜至早 6 时通知。 | 纽约州（美国州级） | 2027-01-25 | none | 2027-01-25 | CRITICAL | docs/GLOBAL-REGULATORY-2026.md 第 2.5 节，references/guidelines/by-app-type/social-and-user-generated-content.md |
| 2027-01-27 | Contacts 权限、位置权限与前台服务政策变更（面向 Android 17、API level 37 的应用）（Play Console Help answers 16909972 与 16965181） | 面向 API 37 或更高版本的应用，仅在 Android Contact Picker 不足以支撑核心功能时才可申请 READ_CONTACTS（须提交声明）；必须在 manifest 中使用 onlyForLocationButton 标志实现 Android 位置按钮以获得位置按钮作用域；且地理围栏（geofencing）不得再使用前台服务（应改用 Geofence API）。自 2026 年 10 月 27 日起，Play Console 的预审检查会标记通讯录与位置问题。 | Google Play（全球） | 2026-10-27 | 至 2027 年 1 月 27 日 | 2027-01-27 | HIGH | docs/GOOGLE-PLAY.md 2026 政策轮次，references/rules/android.md |
| 2027-01-27 | 订阅政策：基于持续资格的折扣订阅（2026 年 10 月 29 日公布） | 提供持续资格型折扣的订阅（如学生方案），必须清楚披露资格标准、资格如何核验，以及资格失效后的价格与权益。 | Google Play（全球） | 2026-10-29 | none | 2027-01-27 | MEDIUM | docs/GOOGLE-PLAY.md 2026 政策轮次 |
| 2027-01-27 | SMS 或通话记录权限组的使用：通过电话进行账号验证（Play Console Help answer 10208820，2026 年 10 月 29 日政策公告中的提醒，answer 18100766） | 自 2027 年 1 月 27 日起，通过电话进行账号验证不再是 READ_CALL_LOG 权限的允许用例；在此之前，同一页面的例外表格仍会列出该用例。请使用 Digital Credentials API（直接使用，或使用基于其构建的验证服务商）、SMS Retriever API 或 SMS User Consent API 验证账号。2026 年 10 月 29 日的公告新增 SMS User Consent API，作为账号验证的隐私友好替代方案。 | Google Play（全球） | 2027-01-27 | none | 2027-01-27 | HIGH | docs/GOOGLE-PLAY.md 2026 政策轮次，references/rules/android.md，data/rejection-patterns.json |
| 2027-01-31 | 《在线安全法 2023》：Ofcom 关于儿童使用应用商店的法定报告 | Ofcom 将于 2027 年 1 月前发布其应用商店报告。该报告将影响国务大臣是否把应用商店纳入《在线安全法》范围的决定。属观察项，目前对开发者尚无直接义务。 | 英国（UK） | 2027-01-31 | none | 2027-01-31 | MEDIUM | docs/GLOBAL-REGULATORY-2026.md 第 3.1 节 |
| 2027-01-31 | App Store Connect 中国大陆合规声明（AI 生成或合成内容、安全评估） | 在中国大陆 App Store 上架的每个应用，都必须在 App Compliance 页面（Apps，然后选择应用，再在侧边栏选择 General）完成这两项声明。所需角色为 Account Holder 或 Admin。如果应用向中国大陆用户提供该功能，选择 Yes；如果没有，或该功能在中国大陆被禁用或按地域屏蔽，选择 No。AI 生成或合成内容适用于 AI 聊天机器人、图像或视频生成、语音与面容改造等服务。回答 Yes 需要提供大语言模型或算法的已批准备案号与备案名称。如果这些功能由他人的技术提供，还须上传技术所有方的授权或使用协议，其中包含基础模型或算法的注册名称与备案号、标识你或你的组织为被授权方的提供者名称，以及授权主体，其名称须与中国国家互联网信息办公室（Cyberspace Administration of China，CAC）审批登记册上的所有方一致。安全评估适用于分发 AI 生成或合成内容、或提供端到端加密即时通讯等功能。回答 Yes 需要全国互联网安全管理服务平台（National Internet Security Management Service Platform）的截图，显示应用名称、提供者名称且状态为通过（pass）或已通过审核（passed review），并附安全评估报告副本，其中包含应用名称、提供者名称与公司正式公章。涉密或专有信息应作遮蔽处理。状态包括 Missing Info、Pending Verification、Verification Failed 与 Active。应用会照常在其他所选国家和地区发布，但在合规信息核验通过之前不会在中国大陆 App Store 上架。如果版本已获批但核验失败，将保持在中国大陆不可用。请更新并保存 App Compliance 页面。更新后的声明会在下次提交应用版本时接受审核。核验通过并获批后，应用即在中国大陆上架。到 2027 年 1 月 31 日，中国大陆每个存量应用都必须完成并通过核验的合规声明，才能继续在 App Store 上架。 | Apple App Store（中国大陆） | 2026-11-17 | 存量应用至 2027 年 1 月 31 日 | 2027-01-31 | HIGH | docs/GLOBAL-REGULATORY-2026.md 第 3.9 节，docs/APPLE.md 2026 必须落实的变更，docs/PRE-SUBMISSION-CHECKLIST.md 全球专项，docs/BY-APP-TYPE.md，references/guidelines/by-app-type/ai-and-generative-apps.md，references/guidelines/by-app-type/social-and-user-generated-content.md |
| 2027-02-01 | Play Console 技术质量要求：内存、位图与 DEX 优化阈值（Play Console Help answer 17492799） | Google 表示，自 2027 年 2 月起（未公布具体日期），应用必须使用 R8 等工具达到至少 25 percent 覆盖率的最低优化要求（覆盖优化、收缩与混淆），不得在非可见状态下将位图保留在内存中，且必须保持在内存不良行为阈值以内。不达标会影响可见性与发布能力。 | Google Play（全球） | 2026-08-26 | 至 2027 年 2 月 | 2027-02-01 | HIGH | docs/GOOGLE-PLAY.md 2026 政策轮次，references/rules/performance.md |
| 2027-02-01 | 原 Developer ID 证书颁发机构（Sub-CA）到期（Apple Developer news w4atic4c） | 原 Developer ID Sub-CA 于 2027 年 2 月 1 日到期，其签发的证书当日失效。请从 Developer ID Certification Authority（G2）生成替换的 Developer ID 证书，并在此之前对 Mac App Store 之外分发的每个安装包重新签名。 | Apple App Store（全球） | 2026-10-01 | none | 2027-02-01 | HIGH | docs/PLATFORM-MECHANICS-2026.md 第 1.1 节 |
| 2027-02-01 | Play Console 依据 EEA 与英国法律的商家身份（trader status）申报（Play Console Help answer 17594752） | 每个活跃开发者账号都必须在 Play Console 中按 EEA 与英国法律申报商家或非商家身份，无论其应用面向何处或在哪里分发。不在 EEA 或英国分发的账号可申报为非商家。新账号在创建时申报。存量账号必须在 2027 年 2 月 1 日前申报。商家须自我声明遵守适用法律，提供每个应用的服务条款链接，个人账号还须提供联系电话（地址会展示）。错过该日期可能导致更新受阻，并使应用从 Play 全球下架。虚假的非商家申报可能导致全球下架，为绕过核验或自我声明而谎报身份可能导致账号被全球暂停或终止。 | Google Play（全球） | 2026-10-29 | 存量账号至 2027 年 2 月 1 日 | 2027-02-01 | CRITICAL | docs/GOOGLE-PLAY.md 2026 政策轮次，docs/EU-REGULATORY-2026.md 第 3 节 |
| 2027-03-01 | 16 岁以下社交媒体禁令与功能限制：《儿童福祉与学校法》（Children's Wellbeing and Schools Act）项下附属立法（2026 年 6 月 15 日宣布） | 条例将在 2026 年底前提交议会，并于 2027 年春季实施（具体日期尚未公布，此处按 2027 年 3 月 1 日追踪）。用户对用户社交平台必须阻止 16 岁以下账号。对 16 与 17 岁用户，直播与陌生人联系默认关闭，午夜至早 6 时通知关闭，自动播放与个性化信息流默认关闭。AI 浪漫伴侣聊天机器人必须强制最低年龄 18 岁。 | 英国（UK） | 2027-03-01 | none | 2027-03-01 | CRITICAL | docs/GLOBAL-REGULATORY-2026.md 第 3.1 节，references/guidelines/by-app-type/social-and-user-generated-content.md |
| 2027-03-01 | Play Console 面向 EEA 与英国的在线第三方商店（marketplace）模式及商家信息展示（Play Console Help answer 17594752） | 自 2027 年 3 月 1 日起，Google Play 在 EEA 与英国采用在线第三方商店（marketplace）模式。自该日起，若账号已申报为商家，各地用户都能看到商家的联系方式（个人账号为电话号码与地址）、App support 中的 D-U-N-S 号码，以及（如提供）服务条款链接。EEA 与英国用户还会在 Offered by 字段看到开发者或商家名称替代 Google，并看到产品或服务符合当地法律的自我声明。 | Google Play（全球） | 2027-03-01 | none | 2027-03-01 | HIGH | docs/GOOGLE-PLAY.md 2026 政策轮次，docs/EU-REGULATORY-2026.md 第 3 节 |
| 2027-03-09 | 《个人信息保护法》（Personal Information Protection Act），第 21910 号法律（2026 年 9 月 8 日） | 自 2027 年 3 月 9 日起，为其他目的合法收集的个人信息，在匿名或假名化处理会使该开发难以进行、使用服务于公共利益或类似目的、满足全部法定要求，且个人信息保护委员会（Personal Information Protection Commission）审议并决议通过的情况下，可复用于开发 AI 技术。处理者必须先就对数据主体的影响开展风险要素评估。在韩国用户数据上训练或微调模型的应用，应在依赖此途径之前规划该评估。 | 韩国 | 2027-03-09 | none | 2027-03-09 | MEDIUM | docs/GLOBAL-REGULATORY-2026.md 第 3.5 节，references/rules/privacy.md |
| 2027-04-01 | Apple App Store 提交要求 | 自 2027 年 4 月起，上传到 App Store Connect 的应用与游戏必须使用 iOS 27 与 iPadOS 27 SDK 或更高版本，以及配套的 tvOS 27、visionOS 27 与 watchOS 27 SDK 构建。Apple 仅公布月份、未公布具体日期，因此本条目按 2027 年 4 月 1 日追踪，Apple 公布日期后必须复查。macOS 不在 Apple 的清单中。于 2026 年 9 月 9 日随 Xcode 27 Release Candidate 公布。来源 https://developer.apple.com/news/?id=k1mtkt1k | Apple App Store（全球） | 2026-09-09 | 约 7 个月 | 2027-04-01 | CRITICAL | docs/PLATFORM-MECHANICS-2026.md 第 1.6 节，docs/APPLE.md 2026 变更，docs/PRE-SUBMISSION-CHECKLIST.md Apple 专项 |
| 2027-04-01 | Apple App Store 提交要求 | 自 2027 年 4 月起，App Store Connect 要求使用 iOS 27.1 SDK 或更高版本的任何应用提供 iPhone Duo 截图（Apple 的截图规范页面将其限定为该 SDK，2026 年 10 月 5 日的新闻帖则称适用于提交的每个应用与游戏）。自 2026 年 10 月 5 日起，App Store Connect 已接受针对 iPhone Duo 优化的应用与 Duo 截图，包含 Duo 截图的产品页会显示该应用已针对 iPhone Duo 优化的徽章。Apple 仅公布月份、未公布具体日期，因此本条目按 2027 年 4 月 1 日追踪，Apple 公布日期后必须复查。来源 https://developer.apple.com/news/?id=kkphp5qo https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications | Apple App Store（全球） | 2026-10-05 | 约 6 个月 | 2027-04-01 | HIGH | docs/PLATFORM-MECHANICS-2026.md 第 1.8 节，docs/PRE-SUBMISSION-CHECKLIST.md Apple 专项 |
| 2027-04-01 | Play Console 技术质量要求：零点触登录（Zero-Tap Sign-In）恢复（Play Console Help answer 17492799） | Google 表示，自 2027 年 4 月起（未公布具体日期），任何支持用户登录的应用（无论可选还是强制），都必须在用户迁移到新 Android 设备时使用 Restore Credentials API 恢复其登录状态。游戏目前不在范围内。 | Google Play（全球） | 2026-08-26 | 至 2027 年 4 月 | 2027-04-01 | HIGH | docs/GOOGLE-PLAY.md 2026 政策轮次，references/rules/design.md |
| 2027-04-14 | AppFunctions API 政策（2026 年 10 月 29 日公布） | 暴露 AppFunctions 的应用必须遵守每一项 Play 政策，其 AppFunctions 不得欺骗或操纵 AI 智能体、绕过安全控制或干扰其他应用。 | Google Play（全球） | 2026-10-29 | none | 2027-04-14 | MEDIUM | docs/GOOGLE-PLAY.md 2026 政策轮次 |
| 2027-04-26 | ADA 第二章（Title II）网页与移动应用无障碍，28 CFR Part 35 Subpart H，临时最终规则 FR Doc. 2026-07663（2026 年 4 月 20 日） | 服务人口达 5 万及以上的州或地方政府实体提供或供使用的移动应用必须符合 WCAG 2.1 Level AA。通过合同或许可链条可触及商业开发者。2024 年规则原定的 2026 年 4 月 24 日已延长至 2027 年 4 月 26 日。 | 美国（联邦） | 2026-04-20 | none | 2027-04-26 | HIGH | docs/GLOBAL-REGULATORY-2026.md 第 2.8 节，references/rules/design.md |
| 2027-05-06 | 犹他州 SB 142（《应用商店问责法》，App Store Accountability Act），经 HB 498（2026）修订 | 从商店请求并获取年龄段，为未成年人账号确认家长同意，删除核验数据。HB 498（2026）将所有实体义务移至 2027 年 5 月 6 日起实施，把预装应用纳入范围，废除部门规则制定权，并以私人诉权取代州检察长执法（每次违规最低 1,000 dollars）。CCIA 的诉讼已于 2026 年 4 月 21 日自愿撤回。 | 犹他州（美国州级） | 2027-05-06 | 运营层面 12 个月 | 2027-05-06 | CRITICAL | docs/GLOBAL-REGULATORY-2026.md 第 1 节、第 2.2 节，references/rules/privacy.md |
| 2027-05-11 | 第 504 条：HHS 财政资助受助者的网页与移动应用无障碍，45 CFR 84.84(b)，临时最终规则 91 FR 25496（2026 年 5 月 11 日） | 拥有 15 名及以上员工的 HHS 联邦财政资助受助者，直接或通过合同/许可安排提供的移动应用必须符合 WCAG 2.1 Level AA。已从 2026 年 5 月 11 日延长至 2027 年 5 月 11 日。 | 美国（联邦） | 2026-05-07 | none | 2027-05-11 | HIGH | docs/GLOBAL-REGULATORY-2026.md 第 2.8 节，references/guidelines/by-app-type/health-fitness-and-medical.md |
| 2027-05-13 | 《数字个人数据保护法》（DPDPA）2023 / DPDP 规则 2025 | 18 岁以下者须经政府支持系统（如 DigiLocker）取得可验证的家长同意；禁止行为追踪/定向广告。 | 印度 | 2025-11-13 | 18 个月 | 2027-05-13 | HIGH | docs/GLOBAL-REGULATORY-2026.md 第 3.6 节，references/guidelines/by-app-type/kids-category-and-families.md |
| 2027-07-01 | 路易斯安那州 HB 977（2026），Act No. 185，R.S. 51:1771 至 1775（《应用商店问责法》，App Store Accountability Act），取代 HB 570（2025） | 请求年龄段、家长同意、重大更新时重新请求同意。2025 年 Act 481（HB 570）永不生效。HB 977 重新制定该制度，于 2027 年 7 月 1 日生效。Apple 的店面仍按其自身节奏暴露路易斯安那年龄段信号。 | 路易斯安那州（美国州级） | 2027-07-01 | 12 个月 | 2027-07-01 | CRITICAL | docs/GLOBAL-REGULATORY-2026.md 第 1 节、第 2.2 节，references/rules/privacy.md |
| 2027-07-01 | 《个人信息保护法》（Personal Information Protection Act），第 21445 号法律（2026 年 3 月 10 日），第 32-2(1) 条但书与第 75(2)(15) 条 | 自 2027 年 7 月 1 日起，按营收与所处理个人信息规模达到总统令设定门槛的个人信息处理者，必须持有个人信息保护委员会的隐私认证，未取得将被处以行政罚款。截至 2026 年 11 月 14 日，该总统令门槛尚未公布，待其公布后请核查你在韩国的业务是否落入其范围。 | 韩国 | 2027-07-01 | none | 2027-07-01 | MEDIUM | docs/GLOBAL-REGULATORY-2026.md 第 3.5 节，references/rules/privacy.md |
| 2027-07-01 | SB 243，Business and Professions Code 第 22.6 章，第 22601 至 22606 节 | 自 2027 年 7 月 1 日起，伴侣聊天机器人运营者在已生效的披露与未成年人保护义务之外，还须每年就危机转介与相关协议向自杀预防办公室（Office of Suicide Prevention）报告。 | 加利福尼亚州（美国州级） | 2027-07-01 | none | 2027-07-01 | MEDIUM | docs/GLOBAL-REGULATORY-2026.md 第 2.5 节，references/guidelines/by-app-type/ai-and-generative-apps.md |
| 2027-08-25 | 本地网络权限与 Manage Contacts 权限声明（2026 年 10 月 29 日公布） | 本地网络（Local Network）权限仅限设备选择器不足以支撑的核心功能使用，面向 Android 17（API 37）或更高版本的应用必须提交 Play Console 声明方可使用。Manage Contacts 权限仅限系统选择器不足的核心功能，同样需要声明。所有其他应用改用作用域更窄的平台 intent。 | Google Play（全球） | 2026-10-29 | none | 2027-08-25 | MEDIUM | docs/GOOGLE-PLAY.md 2026 政策轮次 |
| 2027-08-31 | Google Play 结算库（Billing Library）弃用阶梯（developer.android.com 结算弃用 FAQ） | 到 2027 年 8 月 31 日（可延期至 2027 年 11 月 1 日），Play Billing Library 8 成为所有已发布应用的最低要求；到 2028 年 8 月 31 日（可延期至 2028 年 11 月 1 日），要求版本 9。2026 年 8 月 31 日针对新提交的 v8 门槛可延期至 2026 年 11 月 1 日。已发布的低版本二进制包在各自截止日期之前仍可继续交易。 | Google Play（全球） | 2026-08-31 | 至 2027 年 11 月 1 日 | 2027-11-01 | HIGH | docs/PLATFORM-MECHANICS-2026.md 第 2.4 节，references/rules/payments.md |
| 2027-12-02 | 欧盟《人工智能法案》（EU AI Act），Regulation (EU) 2024/1689（经 AI Omnibus 修订，2026 年 7 月 27 日生效） | 高风险 AI 系统（附件 III）义务、合规检查与治理要求，由 AI Omnibus（2026 年 7 月 27 日生效）推迟。日期由 2026 年 7 月 8 日的 Regulation (EU) 2026/1744 设定，已生效，并非提案。 | 欧盟（EU） | 2024-08-01 | 40 个月 | 2027-12-02 | HIGH | docs/EU-REGULATORY-2026.md 第 1.5 节，references/guidelines/by-app-type/ai-and-generative-apps.md |
| 2027-12-11 | 《网络弹性法案》（Cyber Resilience Act），Regulation (EU) 2024/2847 | 主要的安全设计（security-by-design）与漏洞处理义务。 | 欧盟（EU） | 2024-12-11 | 36 个月 | 2027-12-11 | MEDIUM | docs/EU-REGULATORY-2026.md 第 5 节 |
| 2027-12-24 | eIDAS 2，Regulation (EU) 910/2014（经 Regulation (EU) 2024/1183 修订），第 5f(2) 条 | 在银行、金融、健康、电信、交通、能源、教育或数字基础设施中使用强用户身份认证、规模超过微型或小型的私营依赖方（relying party），须在用户请求时接受欧盟数字身份钱包（EU Digital Identity Wallet），即实施法案后 36 个月（推算日期为 2027 年 12 月 24 日）。 | 欧盟（EU） | 2027-12-24 | none | 2027-12-24 | MEDIUM | docs/EU-REGULATORY-2026.md 第 5 节，references/rules/privacy.md |
| 2028-04-03 | 2026 年 7 月 24 日 Regulation (EU) 2026/1881：自愿 CSAM 检测的 ePrivacy 临时豁免 | 在独立于号码的人际通信服务中开展自愿 CSAM 扫描，仅在 2028 年 4 月 3 日之前合法。依赖该豁免的即时通讯应用需要找到永久性的 CSA Regulation 依据，否则必须停止。 | 欧盟（EU） | 2026-08-01 | none | 2028-04-03 | MEDIUM | docs/EU-REGULATORY-2026.md 第 5 节，references/rules/safety.md |
| 2028-04-26 | ADA 第二章（Title II）网页与移动应用无障碍，28 CFR Part 35 Subpart H，临时最终规则 FR Doc. 2026-07663 | 对服务人口低于 5 万的公共实体及所有特别区政府，同样适用 WCAG 2.1 Level AA 义务，已延长至 2028 年 4 月 26 日。 | 美国（联邦） | 2026-04-20 | none | 2028-04-26 | MEDIUM | docs/GLOBAL-REGULATORY-2026.md 第 2.8 节，references/rules/design.md |
| 2028-05-10 | 第 504 条网页与移动应用无障碍，45 CFR 84.84(b)(2)，临时最终规则 91 FR 25496 | 对员工少于 15 人的 HHS 资助受助者，同样适用 WCAG 2.1 Level AA 义务，已从 2027 年 5 月 10 日延长至 2028 年 5 月 10 日。 | 美国（联邦） | 2026-05-07 | none | 2028-05-10 | MEDIUM | docs/GLOBAL-REGULATORY-2026.md 第 2.8 节，references/guidelines/by-app-type/health-fitness-and-medical.md |
| 2028-07-01 | SB26-051《计算设备年龄核验法》（Age Attestation on Computing Devices） | 操作系统提供商在账号设置时请求年龄，并暴露实时年龄信号 API。开发者在启动或账号创建时请求该信号。2028 年 7 月 1 日生效，存量设备到 2029 年 1 月 1 日。 | 科罗拉多州（美国州级） | 2028-07-01 | none | 2028-07-01 | MEDIUM | docs/GLOBAL-REGULATORY-2026.md 第 2.5 节，references/rules/privacy.md |
| 2028-07-16 | 《个人信息保护法》（Act on the Protection of Personal Information）修正案，2026 年 7 月 17 日公布（2026 年第 56 号法律，编号来自二手来源），Act No. 56 of 2026（令和8年法律第56号） | 针对修订后的 APPI 重构同意、儿童数据与生物识别处理，包括新的 16 岁以下门槛（法定代理人为同意、通知与停止使用请求的主体），以及附加金制度。公布后两年内生效，具体日期由内阁政令确定。修订后的刑罚条款（第 176 条与第 178 至 186 条）依据附则第 1 条第 3 款自公布之日起 6 个月后适用，由于该法未写明具体历日，按计算为 2027 年 1 月 17 日。附加金制度则等待公布后两年内出台的内阁政令。 | 日本 | 2028-07-16 | none | 2028-07-16 | HIGH | docs/GLOBAL-REGULATORY-2026.md 第 3.8 节，references/rules/privacy.md |
| 2028-08-02 | 欧盟《人工智能法案》（EU AI Act），Regulation (EU) 2024/1689（经 AI Omnibus 修订，2026 年 7 月 27 日生效） | 嵌入实体产品的高风险 AI 系统（附件 I：机械、玩具、电梯等）的合规，由 AI Omnibus（2026 年 7 月 27 日生效）推迟。日期由 2026 年 7 月 8 日的 Regulation (EU) 2026/1744 设定，已生效，并非提案。 | 欧盟（EU） | 2024-08-01 | 48 个月 | 2028-08-02 | HIGH | docs/EU-REGULATORY-2026.md 第 1.5 节，references/guidelines/by-app-type/ai-and-generative-apps.md |

## 详细合规记录

### ID: US-IL-BIPA

- **辖区**：伊利诺伊州（美国州）
- **法律**：《生物识别信息隐私法》（Biometric Information Privacy Act，BIPA），740 ILCS 14
- **要求**：收集生物识别标识符前须书面告知并取得书面同意（release），留存计划须公开，3 年内销毁，且不得出售。
- **生效日期**：2008-06-01
- **宽限期**：none
- **强制日期**：2008-06-01
- **执法日期**：2008-06-01
- **优先级**：CRITICAL
- **受影响仓库章节**：docs/GLOBAL-REGULATORY-2026.md section 2.6, references/rules/privacy.md

### ID: UK-ICO-CHILDREN-CODE

- **辖区**：英国（UK）
- **法律**：ICO《适龄设计准则》（Age Appropriate Design Code，Children's Code）
- **要求**：默认高隐私、数据最小化、地理位置默认关闭、画像默认关闭，以及强制开展 DPIA。
- **生效日期**：2020-09-02
- **宽限期**：12 个月
- **强制日期**：2021-09-02
- **执法日期**：2021-09-02
- **优先级**：HIGH
- **受影响仓库章节**：docs/GLOBAL-REGULATORY-2026.md section 3.1, references/rules/privacy.md

### ID: KR-TELECOM-BUSINESS-ACT

- **辖区**：韩国
- **法律**：《电信事业法》（Telecommunications Business Act）
- **要求**：使用经批准的计费服务商、26% 佣金、com.apple.developer.storekit.external-purchase entitlement、仅限韩国的二进制包、模态弹窗，以及报告义务。
- **生效日期**：2022-03-15
- **宽限期**：none
- **强制日期**：2022-03-15
- **执法日期**：2022-03-15
- **优先级**：HIGH
- **受影响仓库章节**：docs/GLOBAL-REGULATORY-2026.md section 3.5, references/rules/payments.md

### ID: EU-DMA-EXTERNAL-PURCHASE

- **辖区**：欧盟（EU）
- **法律**：EU《数字市场法》（Digital Markets Act，DMA）
- **要求**：替代支付与应用外优惠（StoreKit External Purchases 或 Offers Entitlement、ExternalPurchaseCustomLink 信息披露弹窗、提供应用内购买（In-App Purchase，IAP）时以同等显著度呈现、面向未成年人的家长门控、选项保留 12 个月、按月报告交易）。
- **生效日期**：2024-03-07
- **宽限期**：none
- **强制日期**：2024-03-07
- **执法日期**：2024-03-07
- **优先级**：HIGH
- **受影响仓库章节**：docs/EU-REGULATORY-2026.md section 2

### ID: CN-MOBILE-APP-FILING

- **辖区**：中国
- **法律**：向 MIIT 办理移动应用备案（ICP 延伸要求）
- **要求**：必须在 MIIT 完成移动应用备案、本地合作伙伴/实体、实名制、PIPL 隐私合规、数据本地化，以及游戏须取得版号（Banhao）许可。
- **生效日期**：2023-09-01
- **宽限期**：7 个月
- **强制日期**：2024-03-31
- **执法日期**：2024-03-31
- **优先级**：CRITICAL
- **受影响仓库章节**：docs/GLOBAL-REGULATORY-2026.md section 3.9, references/rules/metadata.md

### ID: US-FTC-HEALTH-BREACH

- **辖区**：美国（联邦）
- **法律**：FTC《健康泄露通知规则》（Health Breach Notification Rule），16 CFR Part 318
- **要求**：遵守 2024 年最终规则（未经授权向广告主共享健康/敏感数据视为泄露（数据泄露），并强制 60 天通知）。
- **生效日期**：2024-06-25
- **宽限期**：none
- **强制日期**：2024-06-25
- **执法日期**：2024-06-25
- **优先级**：HIGH
- **受影响仓库章节**：docs/GLOBAL-REGULATORY-2026.md section 2.6, references/guidelines/by-app-type/health-fitness-and-medical.md

### ID: EU-GPSR-SAFETY

- **辖区**：欧盟（EU）
- **法律**：《通用产品安全条例》（General Product Safety Regulation，GPSR），Regulation (EU) 2023/988
- **要求**：就消费类产品在在线界面上展示制造商身份、电子与邮寄联系方式，以及产品安全警示。
- **生效日期**：2023-06-12
- **宽限期**：18 个月
- **强制日期**：2024-12-13
- **执法日期**：2024-12-13
- **优先级**：HIGH
- **受影响仓库章节**：docs/REGULATORY-GAP-REPORT-2026.md section 1, references/rules/safety.md

### ID: EU-AI-ACT-ART-4

- **辖区**：欧盟（EU）
- **法律**：EU《人工智能法案》（AI Act），Regulation (EU) 2024/1689（经 Regulation (EU) 2026/1744 修订），第 4 条
- **要求**：第 4 条 AI 素养义务（2026 年 7 月 27 日替换后的文本）。提供者与部署者须采取措施，支持其员工及其他代表其操作与使用 AI 系统的人员发展 AI 素养，同时考虑其技术知识、经验、教育与培训、系统使用场景，以及系统所作用的人员或群体。该义务不要求保证任何个人达到特定水平的 AI 素养。书面政策、入职培训与日志是务实的证据，并非明文法定要求。
- **生效日期**：2024-08-01
- **宽限期**：6 个月
- **强制日期**：2025-02-02
- **执法日期**：2025-02-02
- **优先级**：HIGH
- **受影响仓库章节**：docs/EU-REGULATORY-2026.md section 1.3, references/guidelines/by-app-type/ai-and-generative-apps.md

### ID: EU-AI-ACT-ART-5

- **辖区**：欧盟（EU）
- **法律**：EU《人工智能法案》（AI Act），Regulation (EU) 2024/1689
- **要求**：第 5 条禁止性做法（禁止潜意识操纵、剥削儿童、社会评分、按生物识别特征归类等）。
- **生效日期**：2024-08-01
- **宽限期**：6 个月
- **强制日期**：2025-02-02
- **执法日期**：2025-02-02
- **优先级**：CRITICAL
- **受影响仓库章节**：docs/EU-REGULATORY-2026.md section 1.4, references/guidelines/by-app-type/ai-and-generative-apps.md

### ID: EU-DSA-TRADER-STATUS

- **辖区**：欧盟（EU）
- **法律**：EU《数字服务法》（Digital Services Act，DSA）
- **要求**：申报并验证商家身份（trader status）（D-U-N-S、电话、公开邮箱、已验证的 2FA），否则应用将从欧盟店面下架。
- **生效日期**：2024-02-17
- **宽限期**：12 个月
- **强制日期**：2025-02-17
- **执法日期**：2025-02-17
- **优先级**：CRITICAL
- **受影响仓库章节**：docs/EU-REGULATORY-2026.md section 3, references/rules/metadata.md

### ID: GOOGLE-PLAY-CHILD-SAFETY

- **辖区**：Google Play（全球）
- **法律**：Google Play《儿童安全标准》政策（Child Safety Standards Policy）
- **要求**：在可全球访问的网页上公布 CSAE 标准、提供应用内反馈渠道、制定 CSAM 响应协议，并指定儿童安全联系人。
- **生效日期**：2025-03-19
- **宽限期**：none
- **强制日期**：2025-03-19
- **执法日期**：2025-03-19
- **优先级**：CRITICAL
- **受影响仓库章节**：docs/PLATFORM-MECHANICS-2026.md section 3.2, references/rules/android.md

### ID: GOOGLE-PLAY-PHOTO-VIDEO-PERM

- **辖区**：Google Play（全球）
- **法律**：Google Play《照片与视频权限》政策（Photo and Video Permissions Policy）
- **要求**：大范围访问权限 READ_MEDIA_IMAGES/READ_MEDIA_VIDEO 仅限需要大范围访问的应用使用；其他应用必须改用 Android 照片选择器（Photo Picker）。
- **生效日期**：2025-05-28
- **宽限期**：none
- **强制日期**：2025-05-28
- **执法日期**：2025-05-28
- **优先级**：CRITICAL
- **受影响仓库章节**：docs/PLATFORM-MECHANICS-2026.md section 2.9, references/rules/android.md

### ID: EU-EAA-ACCESSIBILITY

- **辖区**：欧盟（EU）
- **法律**：《欧洲无障碍法案》（European Accessibility Act，EAA），Directive (EU) 2019/882
- **要求**：符合统一标准 EN 301 549 第 11 章 / WCAG 2.1 AA 移动无障碍要求，并按附件五（Annex V）在条款与条件或同等文件中公布无障碍信息（第 13(2) 条）。
- **生效日期**：2022-06-28
- **宽限期**：36 个月
- **强制日期**：2025-06-28
- **执法日期**：2025-06-28
- **优先级**：HIGH
- **受影响仓库章节**：docs/EU-REGULATORY-2026.md section 4, references/rules/design.md

### ID: UK-OSA-CHILD-SAFETY

- **辖区**：英国（UK）
- **法律**：UK《在线安全法》（Online Safety Act 2023）
- **要求**：使用"高效"（Highly Effective）年龄核验方法（面部年龄估算、开放银行、信用卡校验）保护儿童免受有害内容侵害。
- **生效日期**：2025-07-25
- **宽限期**：none
- **强制日期**：2025-07-25
- **执法日期**：2025-07-25
- **优先级**：CRITICAL
- **受影响仓库章节**：docs/GLOBAL-REGULATORY-2026.md section 3.1, references/rules/safety.md

### ID: EU-AI-ACT-GPAI

- **辖区**：欧盟（EU）
- **法律**：EU《人工智能法案》（AI Act），Regulation (EU) 2024/1689
- **要求**：GPAI 模型义务、治理与处罚（第 99 条与第 100 条）。
- **生效日期**：2024-08-01
- **宽限期**：12 个月
- **强制日期**：2025-08-02
- **执法日期**：2025-08-02
- **优先级**：HIGH
- **受影响仓库章节**：docs/EU-REGULATORY-2026.md section 1.1, section 1.6

### ID: GOOGLE-PLAY-TARGET-API-35

- **辖区**：Google Play（全球）
- **法律**：Google Play 目标 API 要求（Target API Requirement）
- **要求**：新应用与更新必须以 API 级别 35（Android 15）或更高为目标，现有应用须达到目标 API 34+。
- **生效日期**：2025-08-31
- **宽限期**：none
- **强制日期**：2025-08-31
- **执法日期**：2025-08-31
- **优先级**：CRITICAL
- **受影响仓库章节**：docs/PLATFORM-MECHANICS-2026.md section 2.5, references/rules/android.md

### ID: EU-DATA-ACT-CORE

- **辖区**：欧盟（EU）
- **法律**：EU《数据法案》（Data Act），Regulation (EU) 2023/2854
- **要求**：应用与互联产品及可穿戴设备交互时的核心数据"设计即访问"（access-by-design）义务。
- **生效日期**：2024-01-11
- **宽限期**：20 个月
- **强制日期**：2025-09-12
- **执法日期**：2025-09-12
- **优先级**：MEDIUM
- **受影响仓库章节**：docs/EU-REGULATORY-2026.md section 5

### ID: AU-SOCIAL-MEDIA-MIN-AGE

- **辖区**：澳大利亚
- **法律**：《在线安全修正（社交媒体最低年龄）法》（Online Safety Amendment (Social Media Minimum Age) Act 2024）
- **要求**：通过稳健的年龄核验阻止 16 岁以下人群在社交媒体持有账号；隔离并销毁年龄数据。
- **生效日期**：2024-12-10
- **宽限期**：12 个月
- **强制日期**：2025-12-10
- **执法日期**：2025-12-10
- **优先级**：CRITICAL
- **受影响仓库章节**：docs/GLOBAL-REGULATORY-2026.md section 3.2, references/rules/safety.md

### ID: US-TX-ASAA

- **辖区**：得克萨斯州（美国州）
- **法律**：得克萨斯州 SB 2420（App Store Accountability Act，《应用商店问责法》）
- **要求**：未成年人的下载、购买与重大更新须进行年龄核验并取得可验证的家长同意；删除年龄数据；请求年龄类别。法定生效日期为 2026 年 1 月 1 日。2025 年 12 月 23 日的初步禁令已于 2026 年 6 月 4 日被第五巡回上诉法院中止，最高法院于 2026 年 7 月 6 日拒绝撤销该中止，因此在实体问题上诉待决期间该法持续有效。
- **生效日期**：2026-01-01
- **宽限期**：none
- **强制日期**：2026-01-01
- **执法日期**：2026-06-04
- **优先级**：CRITICAL
- **受影响仓库章节**：docs/GLOBAL-REGULATORY-2026.md section 1, section 2.2, references/rules/privacy.md

### ID: US-CA-CPRA

- **辖区**：加利福尼亚州（美国州）
- **法律**：加利福尼亚州 CPRA（CPPA 2026 年条例）
- **要求**：响应 Global Privacy Control（GPC）、收集时提供隐私政策/告知、提供出售/共享/画像的退出选项，以及敏感个人信息使用限制。
- **生效日期**：2026-01-01
- **宽限期**：自动化决策自 2027-04-01 起；网络安全审计自 2028-04-01 起
- **强制日期**：2026-01-01
- **执法日期**：2026-01-01
- **优先级**：HIGH
- **受影响仓库章节**：docs/GLOBAL-REGULATORY-2026.md section 2.4, references/rules/privacy.md

### ID: APPLE-AGE-RATING-QUESTIONNAIRE

- **辖区**：Apple App Store（全球）
- **法律**：Apple App Store 审核指南（Guideline 2.3.6）
- **要求**：每个应用都必须填写更新后的年龄分级问卷（13+、16+、18+ 档位及 UGC/直播指示项），否则将被阻止提交更新。
- **生效日期**：2025-07-24
- **宽限期**：6 个月
- **强制日期**：2026-01-31
- **执法日期**：2026-01-31
- **优先级**：CRITICAL
- **受影响仓库章节**：docs/EU-REGULATORY-2026.md section 6, references/rules/metadata.md

### ID: APPLE-18-PLUS-BLOCK

- **辖区**：Apple App Store（巴西、澳大利亚、新加坡）
- **法律**：Apple App Store 地区年龄要求（Region Age Requirements）
- **要求**：阻止巴西、澳大利亚与新加坡用户下载 18+ 分级的应用，除非已通过合理方法确认其年龄。
- **生效日期**：2026-02-24
- **宽限期**：none
- **强制日期**：2026-02-24
- **执法日期**：2026-02-24
- **优先级**：CRITICAL
- **受影响仓库章节**：docs/GLOBAL-REGULATORY-2026.md section 1, references/rules/privacy.md

### ID: US-FTC-COPPA-AGE-VERIFICATION-POLICY

- **辖区**：美国（联邦）
- **法律**：FTC《关于在 COPPA 规则下推广采用年龄验证技术的执法政策声明》（2026 年 2 月 25 日）
- **要求**：面向大众或混合受众的应用只有在满足以下条件时，方可为年龄验证目的收集年龄数据而不承担 COPPA 执法风险：数据仅用于年龄判定、最小化留存、审查第三方、向家长与儿童履行告知义务，并保护数据安全。该声明在 COPPA 规则最终修正案发布或声明被撤回之前持续有效。
- **生效日期**：2026-02-25
- **宽限期**：none
- **强制日期**：2026-02-25
- **执法日期**：2026-02-25
- **优先级**：HIGH
- **受影响仓库章节**：docs/GLOBAL-REGULATORY-2026.md section 2.1, references/guidelines/by-app-type/kids-category-and-families.md

### ID: BR-DIGITAL-ECA

- **辖区**：巴西
- **法律**：《数字 ECA》（Digital ECA，Law 15,211/2025）
- **要求**：可接受的年龄验证方法（证件核验、面部年龄估算、CPF 校验）；禁止以自我声明的勾选框代替。
- **生效日期**：2025-09-17
- **宽限期**：6 个月
- **强制日期**：2026-03-17
- **执法日期**：2026-03-17
- **优先级**：CRITICAL
- **受影响仓库章节**：docs/GLOBAL-REGULATORY-2026.md section 3.3, references/rules/privacy.md

### ID: BR-DECRETO-12880-AGE-SIGNALS-2026

- **辖区**：巴西
- **法律**：Decreto n. 12.880（2026 年 3 月 18 日）第 21 条与第 25 条，对《数字 ECA》作出规定
- **要求**：应用商店与操作系统须免费提供年龄信号，在创建账号时请求年龄，以 ANPD 认可的方法加以验证，允许用户提出异议，寻求监护人授权，并在下载前展示年龄分级。商店必须阻止博彩与彩票应用，以及任何缺乏年龄验证方案的应用。
- **生效日期**：2026-03-18
- **宽限期**：none
- **强制日期**：2026-03-18
- **执法日期**：2026-03-18
- **优先级**：CRITICAL
- **受影响仓库章节**：docs/GLOBAL-REGULATORY-2026.md section 3.3, references/rules/privacy.md

### ID: SG-IMDA-ONLINE-SAFETY

- **辖区**：新加坡
- **法律**：IMDA《应用分发服务在线安全实务守则》（Code of Practice for Online Safety for App Distribution Services）
- **要求**：应用商店年龄核验（筛查并阻止 18 岁以下用户下载不适龄应用），年龄核验数据须销毁。此为年龄核验义务的咬合生效日期。《应用分发服务在线安全实务守则》本身已于 2025 年 3 月 31 日生效。
- **生效日期**：2026-04-01
- **宽限期**：none
- **强制日期**：2026-04-01
- **执法日期**：2026-04-01
- **优先级**：CRITICAL
- **受影响仓库章节**：docs/GLOBAL-REGULATORY-2026.md section 3.7, references/rules/privacy.md

### ID: US-COPPA-AMENDED

- **辖区**：美国（联邦）
- **法律**：《儿童在线隐私保护法》（Children's Online Privacy Protection Act，COPPA），16 CFR Part 312
- **要求**：遵守修订后的 COPPA 规则（生物识别标识符纳入 PII、向第三方披露/投放定向广告须单独取得选择加入同意、书面留存政策、书面信息安全计划）。第 312.11 条的例外时限更早（2025 年 4 月 22 日发布后 90 天与 6 个月），且仅约束经 FTC 批准的 COPPA 安全港项目，不约束应用开发者。
- **生效日期**：2025-06-23
- **宽限期**：10 个月
- **强制日期**：2026-04-22
- **执法日期**：2026-04-22
- **优先级**：CRITICAL
- **受影响仓库章节**：docs/GLOBAL-REGULATORY-2026.md section 2.1, references/guidelines/by-app-type/kids-category-and-families.md

### ID: APPLE-XCODE-26-SDK-REQ

- **辖区**：Apple App Store（全球）
- **法律**：Apple App Store 提交要求（Submission Requirements）
- **要求**：自 2026 年 4 月 28 日起，上传到 App Store Connect 的应用必须以 iOS 26 与 iPadOS 26 SDK 或更高版本构建（以及配套的 watchOS 26、tvOS 26、visionOS 26 SDK）。Apple 以 SDK 而非 Xcode 表述该要求，且 Apple 的清单中不含 macOS。年龄核验功能另需 iOS 26.2 SDK 配合 Xcode 26.2（17C52）或更高版本。
- **生效日期**：2026-02-03
- **宽限期**：2 个月
- **强制日期**：2026-04-28
- **执法日期**：2026-04-28
- **优先级**：CRITICAL
- **受影响仓库章节**：docs/EU-REGULATORY-2026.md section 6, docs/PLATFORM-MECHANICS-2026.md section 1.6

### ID: UK-ICO-STORAGE-ACCESS-GUIDANCE-2026

- **辖区**：英国（UK）
- **法律**：ICO《存储与访问技术》最终指南（2026 年 4 月 29 日），PECR 第 6 条及 DUAA 附件 A1（Schedule A1）豁免，以及上调后的 PECR 罚款（1750 万英镑或营业额的 4%）
- **要求**：对照该指南重新审计每一个 SDK、跟踪像素与设备指纹调用，而不只是 cookie。违反同意要求现在面临 UK GDPR 量级罚款。
- **生效日期**：2026-04-29
- **宽限期**：none
- **强制日期**：2026-04-29
- **执法日期**：2026-04-29
- **优先级**：HIGH
- **受影响仓库章节**：docs/GLOBAL-REGULATORY-2026.md section 3.1, references/rules/privacy.md

### ID: US-TAKE-IT-DOWN-ACT-2026

- **辖区**：美国（联邦）
- **法律**：《TAKE IT DOWN 法》（TAKE IT DOWN Act），Pub. L. 119-12
- **要求**：受规制平台须运行清晰醒目的非自愿亲密影像通知—删除流程，并在 48 小时内删除被举报内容及其已知的完全相同副本。FTC 执法自 2026 年 5 月 19 日开始。
- **生效日期**：2026-05-19
- **宽限期**：none
- **强制日期**：2026-05-19
- **执法日期**：2026-05-19
- **优先级**：CRITICAL
- **受影响仓库章节**：docs/GLOBAL-REGULATORY-2026.md section 2.6, references/rules/safety.md

### ID: APPLE-REGION-AGE-RATINGS-AU-VN-2026

- **辖区**：Apple App Store（澳大利亚、越南）
- **法律**：App Store 地区年龄分级变更——澳大利亚移除 15+ 档位，越南依 Decree 147 第 38 条实行地区专属分级（Apple Developer news yrrb45pw）
- **要求**：自 2026 年 6 月 18 日起，澳大利亚不再提供 15+ 分级（受影响应用改为 16+），且在越南上架的应用需要与 Decree 147 第 38 条一致的地区专属年龄分级。请按店面逐一核查 App Store Connect 中的年龄分级。
- **生效日期**：2026-05-21
- **宽限期**：至 2026 年 6 月 18 日
- **强制日期**：2026-06-18
- **执法日期**：2026-06-18
- **优先级**：HIGH
- **受影响仓库章节**：docs/GLOBAL-REGULATORY-2026.md sections 3.2 and 3.10

### ID: EU-WITHDRAWAL-BUTTON-DIRECTIVE

- **辖区**：欧盟（EU）
- **法律**：《金融服务远程营销指令》（Distance Marketing of Financial Services），Directive (EU) 2023/2673
- **要求**：在线界面（包括应用）上须设醒目且易于访问的"撤回按钮"（withdrawal button）或"撤回功能"，以便消费者撤回合同。
- **生效日期**：2023-11-28
- **宽限期**：30 个月
- **强制日期**：2026-06-19
- **执法日期**：2026-06-19
- **优先级**：HIGH
- **受影响仓库章节**：docs/EU-REGULATORY-2026.md section 5, references/rules/payments.md

### ID: UK-DUAA-COMPLAINTS-PROCESS-2026

- **辖区**：英国（UK）
- **法律**：《数据（使用与访问）法》（Data (Use and Access) Act 2025）第 103 条与附件 10，由 SI 2026/82 第 3 条启动生效
- **要求**：建立并运行数据保护投诉处理流程。在 30 天内确认收到数据主体投诉，并在无不正当延误的情况下予以回复。
- **生效日期**：2026-06-19
- **宽限期**：none
- **强制日期**：2026-06-19
- **执法日期**：2026-06-19
- **优先级**：MEDIUM
- **受影响仓库章节**：docs/GLOBAL-REGULATORY-2026.md section 3.1, references/rules/privacy.md

### ID: SG-OSRAA-COMMENCEMENT-2026

- **辖区**：新加坡
- **法律**：《在线安全（救济与问责）法》（Online Safety (Relief and Accountability) Act 2025），部分生效
- **要求**：作为平台，按在线安全委员会（Online Safety Commission）的通知处理五类优先危害。其余危害类别将逐步纳入，尚无公布的日期。
- **生效日期**：2026-06-29
- **宽限期**：none
- **强制日期**：2026-06-29
- **执法日期**：2026-06-29
- **优先级**：HIGH
- **受影响仓库章节**：docs/GLOBAL-REGULATORY-2026.md section 3.7

### ID: APPLE-ADPLA-ATTACHMENT-12-BRAZIL

- **辖区**：Apple App Store（巴西）
- **法律**：Apple Developer Program License Agreement 附件 12——CADE 裁决下的巴西替代分发（Apple Developer news dhwadr2x 与 umq9wxmm）
- **要求**：所有 Apple Developer Program 成员须在 2026 年 7 月 6 日前接受更新后的 ADPLA。自 iOS 26.5 起，开发者可在巴西通过第三方商店（marketplace）分发、运营第三方商店，并为数字商品提供 Apple 应用内购买（In-App Purchase，IAP）之外的支付处理。未接受协议将阻止新的提交。
- **生效日期**：2026-06-18
- **宽限期**：至 2026 年 7 月 6 日
- **强制日期**：2026-07-06
- **执法日期**：2026-07-06
- **优先级**：CRITICAL
- **受影响仓库章节**：docs/GLOBAL-REGULATORY-2026.md section 3.3

### ID: CN-AI-COMPANION-MINORS-2026

- **辖区**：中国
- **法律**：《AI 拟人化互动服务暂行办法》（Interim Measures for AI Anthropomorphic Interactive Services，CAC Order No. 21）
- **要求**：识别未成年人用户，自动将其切换至未成年人模式，14 岁以下须取得监护人同意，绝不向未成年人提供虚拟陪伴或虚拟亲缘服务。任何在中国上线的聊天、陪伴或角色扮演应用均属适用范围。
- **生效日期**：2026-07-15
- **宽限期**：none
- **强制日期**：2026-07-15
- **执法日期**：2026-07-15
- **优先级**：CRITICAL
- **受影响仓库章节**：docs/GLOBAL-REGULATORY-2026.md section 3.9, references/guidelines/by-app-type/ai-and-generative-apps.md

### ID: GOOGLE-PLAY-CATALOG-ACCESS-DEFAULT

- **辖区**：Google Play（美国）
- **法律**：Play Catalog Access Program（Play Console 帮助文档 17117200 与 15582165）
- **要求**：自 2026 年 7 月 22 日起，已注册的美国第三方 Android 应用商店默认可访问 Play 目录并上架你的应用。若不希望通过第三方商店分发，请在 Play Console 的 Settings、Catalog Settings 中选择退出。
- **生效日期**：2026-07-22
- **宽限期**：none
- **强制日期**：2026-07-22
- **执法日期**：2026-07-22
- **优先级**：HIGH
- **受影响仓库章节**：docs/GOOGLE-PLAY.md 2026 policy rounds

### ID: EU-AI-ACT-ART-50

- **辖区**：欧盟（EU）
- **法律**：EU《人工智能法案》（AI Act），Regulation (EU) 2024/1689
- **要求**：第 50 条透明度义务（AI 交互披露、合成内容标记与深度伪造披露）。
- **生效日期**：2024-08-01
- **宽限期**：24 个月
- **强制日期**：2026-08-02
- **执法日期**：2026-08-02
- **优先级**：CRITICAL
- **受影响仓库章节**：docs/EU-REGULATORY-2026.md section 1.2, references/guidelines/by-app-type/ai-and-generative-apps.md

### ID: GOOGLE-PLAY-CHARGEBACK-COST-SHIFT

- **辖区**：Google Play（全球）
- **法律**：Google Play 拒付（chargeback）费用责任更新（Play Console 帮助文档 17068375）
- **要求**：2026 年 8 月 3 日之后下的订单，开发者承担商品价格减去服务费后的金额，外加金融机构收取的拒付（chargeback）手续费；Google Play 仅承担其自身服务费。请处理 PendingRefundReviewNotification，并在 24 小时内调用 Review Refund API，对不正当争议提出抗辩。
- **生效日期**：2026-08-03
- **宽限期**：none
- **强制日期**：2026-08-03
- **执法日期**：2026-08-03
- **优先级**：HIGH
- **受影响仓库章节**：docs/GOOGLE-PLAY.md Payments rows, references/rules/payments.md

### ID: EU-E-EVIDENCE-REGULATION

- **辖区**：欧盟（EU）
- **法律**：《电子证据一揽子方案》（e-Evidence Package），Regulation (EU) 2023/1543
- **要求**：跨境执法可直接调取电子证据（10 天响应时限，以及 8 小时的紧急时限）。
- **生效日期**：2023-08-18
- **宽限期**：36 个月
- **强制日期**：2026-08-18
- **执法日期**：2026-08-18
- **优先级**：HIGH
- **受影响仓库章节**：docs/EU-REGULATORY-2026.md section 5, references/rules/privacy.md

### ID: GOOGLE-ANON-CHAT-CHILD-SAFETY-2026

- **辖区**：Google Play（全球）
- **法律**：《年龄限制内容、家庭与儿童安全标准》政策扩展至匿名与随机聊天应用（Play Console 帮助文档 17036597、17122218、14747720）
- **要求**：以与陌生人随机或匿名聊天为核心功能的应用必须使用 Play Console 工具阻止未成年人，不得在 Families 计划下面向儿童，并纳入《儿童安全标准》政策范围（公布 CSAE 标准、应用内举报、删除 CSAM 内容、指定儿童安全联系人）。
- **生效日期**：2026-08-26
- **宽限期**：none
- **强制日期**：2026-08-26
- **执法日期**：2026-08-26
- **优先级**：CRITICAL
- **受影响仓库章节**：docs/GOOGLE-PLAY.md 2026 policy rounds, references/rules/safety.md

### ID: GOOGLE-PLAY-BILLING-V8

- **辖区**：Google Play（全球）
- **法律**：Google Play 结算政策（Billing Policy）
- **要求**：自 2026 年 8 月 31 日起，所有新应用与更新必须使用 Play Billing Library 8 或更高版本，可申请延长至 2026 年 11 月 1 日。这是发布门槛；已发布的 v7 二进制包在 2027 年的全应用截止日期之前仍可继续交易。
- **生效日期**：2026-05-01
- **宽限期**：3 个月
- **强制日期**：2026-08-31
- **执法日期**：2026-08-31
- **优先级**：CRITICAL
- **受影响仓库章节**：docs/PLATFORM-MECHANICS-2026.md section 2.4, references/rules/payments.md

### ID: GOOGLE-PLAY-TARGET-API-36

- **辖区**：Google Play（全球）
- **法律**：Google Play 目标 API 要求（Target API Requirement）
- **要求**：自 2026 年 8 月 31 日起，新应用与更新必须以 API 级别 36（Android 16）或更高为目标，可在 Play Console 申请延长至 2026 年 11 月 1 日。Wear OS 与 Android Automotive OS 应用须以 API 35 或更高为目标，Android TV 与 Android XR 应用须达到 API 34 或更高。现有应用必须以 API 35 或更高为目标，才能继续向较新设备上的新用户提供。
- **生效日期**：2026-08-31
- **宽限期**：none
- **强制日期**：2026-08-31
- **执法日期**：2026-08-31
- **优先级**：HIGH
- **受影响仓库章节**：docs/PLATFORM-MECHANICS-2026.md section 2.5, references/rules/android.md

### ID: APPLE-SOCIAL-MEDIA-DECLARATION-GATE

- **辖区**：Apple App Store（全球）
- **法律**：App Store Connect 社交媒体能力申报（Apple Developer news 0d2gpmml 与 tlur8uvi）
- **要求**：Apple 表示，自 2026 年 9 月起（未公布确切日期），提交新版本或更新、或为替代分发进行公证时，必须标明应用或游戏是否包含社交媒体能力。申报社交媒体后，应用将归入社交媒体（Social Media）的时间限额（Time Allowance）类别，年龄分级至少为 13+，且服务 13 岁以下用户必须使用 Declared Age Range API。
- **生效日期**：2026-09-01
- **宽限期**：none
- **强制日期**：2026-09-01
- **执法日期**：2026-09-01
- **优先级**：CRITICAL
- **受影响仓库章节**：docs/APPLE.md section 2 与 2026 变更清单，references/rules/metadata.md

### ID: AU-ADS-CODE-AGE-ASSURANCE-2026

- **辖区**：澳大利亚
- **法律**：《应用分发服务在线安全守则》（App Distribution Services Online Safety Code，Class 1C 与 Class 2 Material）——《综合行业守则》（Consolidated Industry Codes）附件 7，2025 年 9 月 9 日登记
- **要求**：在守则生效满 6 个月后，应用商店须在允许下载或购买成人应用之前实施年龄核验与访问控制。Head Terms 的"努力达标"宽限期于同日结束，首次风险评估也于同日到期。由于 esafety.gov.au 无法访问，本条依据 eSafety 页面 2026 年 5 月 19 日最后更新版本的 Wayback 存档读取，请在现行登记文本上再次确认。
- **生效日期**：2026-03-09
- **宽限期**：none
- **强制日期**：2026-09-09
- **执法日期**：2026-09-09
- **优先级**：CRITICAL
- **受影响仓库章节**：docs/GLOBAL-REGULATORY-2026.md section 3.2, references/rules/safety.md

### ID: APPLE-MIN-DEPLOYMENT-TARGET-IOS13

- **辖区**：Apple App Store（全球）
- **法律**：Apple"即将到来的要求"（Upcoming Requirements）页面
- **要求**：上传到 App Store Connect 的 iOS 与 iPadOS 应用必须以 iOS 13 或更高为目标。现已生效。提交前守卫会对更低的 IPHONEOS_DEPLOYMENT_TARGET 或 Podfile platform 设置给出标记。
- **生效日期**：2026-09-09
- **宽限期**：none
- **强制日期**：2026-09-09
- **执法日期**：2026-09-09
- **优先级**：CRITICAL
- **受影响仓库章节**：docs/APPLE.md, data/rejection-patterns.json APPLE-MIN-DEPLOYMENT-TARGET-IOS13

### ID: EU-CRA-REPORTING

- **辖区**：欧盟（EU）
- **法律**：《网络弹性法案》（Cyber Resilience Act），Regulation (EU) 2024/2847
- **要求**：主动漏洞报告与安全事件通报义务。
- **生效日期**：2024-12-11
- **宽限期**：21 个月
- **强制日期**：2026-09-11
- **执法日期**：2026-09-11
- **优先级**：MEDIUM
- **受影响仓库章节**：docs/EU-REGULATORY-2026.md section 5

### ID: KR-PIPA-AMENDMENT-2026

- **辖区**：韩国
- **法律**：《个人信息保护法》（Personal Information Protection Act）修正案，Act No. 21445
- **要求**：将 CEO 与法定代表人列为最终问责对象；达到规模门槛时设置经董事会批准的首席隐私官；承担惩罚性附加金，并适应扩大的数据泄露通知范围。
- **生效日期**：2026-09-11
- **宽限期**：none
- **强制日期**：2026-09-11
- **执法日期**：2026-09-11
- **优先级**：HIGH
- **受影响仓库章节**：docs/GLOBAL-REGULATORY-2026.md section 3.5, references/rules/privacy.md

### ID: EU-DATA-ACT-DESIGN

- **辖区**：欧盟（EU）
- **法律**：EU《数据法案》（Data Act），Regulation (EU) 2023/2854
- **要求**：面向互联可穿戴设备与设备落实"设计即访问"（access-by-design）的技术实现。这是第 3(1) 条针对互联产品的设计即访问义务，不涉及云切换。依第 29(1) 条，切换费用自 2027 年 1 月 12 日起降为零。
- **生效日期**：2024-01-11
- **宽限期**：32 个月
- **强制日期**：2026-09-12
- **执法日期**：2026-09-12
- **优先级**：MEDIUM
- **受影响仓库章节**：docs/EU-REGULATORY-2026.md section 5

### ID: ANDROID-DEVELOPER-VERIFICATION

- **辖区**：Android（巴西、印度尼西亚、新加坡、泰国）
- **法律**：Android 开发者验证政策（Developer Verification Policy）
- **要求**：侧载部分：自 2026 年 9 月 30 日起，在巴西、印度尼西亚、新加坡和泰国的已认证设备上安装的应用必须关联到经过验证的开发者身份（Android Developer Console；完整分发收费 USD 25，最多 20 台设备的受限分发账号免费；组织须提供 D-U-N-S）。全球扩展仅表述为 2027 年，未公布确切日期。另一项独立的 Play 部分（2026 年 9 月 30 日前在 Play Console 登记所有 Play 包名，全球范围）见 GOOGLE-PLAY-APP-PACKAGE-REGISTRATION。
- **生效日期**：2026-03-15
- **宽限期**：6 个月
- **强制日期**：2026-09-30
- **执法日期**：2026-09-30
- **优先级**：CRITICAL
- **受影响仓库章节**：docs/PLATFORM-MECHANICS-2026.md section 2.1, references/rules/android.md

### ID: GOOGLE-ORG-REGISTRATION-REGULATED-CATEGORIES

- **辖区**：Google Play（全球）
- **法律**：Play Console 要求——金融、健康、VPN 与政府类应用的组织（organization）登记（Play Console 帮助文档 10788890 与 17125096）
- **要求**：提供金融产品（银行、贷款、股票交易、投资基金、加密货币钱包与交易所）的应用、健康应用（医疗、涉及人类受试者的研究）、经批准使用 VpnService 类的应用，以及政府应用，必须从组织账号发布，且其 D-U-N-S 编号须与邓白氏（Dun and Bradstreet）档案一致。不合规应用将被下架。
- **生效日期**：2026-07-15
- **宽限期**：至 2026 年 9 月 30 日
- **强制日期**：2026-09-30
- **执法日期**：2026-09-30
- **优先级**：CRITICAL
- **受影响仓库章节**：docs/GOOGLE-PLAY.md 2026 policy rounds, references/rules/android.md

### ID: GOOGLE-PLAY-APP-PACKAGE-REGISTRATION

- **辖区**：Google Play（全球）
- **法律**：Android 开发者验证之 Play 部分——在 Play Console 登记每一个 Play 应用包名（Play Console 帮助文档 17125096 与 17134731）
- **要求**：通过 Play Console 登记应用包名，以符合 Android 开发者验证要求。这一部分属全球范围，与巴西、印度尼西亚、新加坡、泰国的侧载部分相互独立。不登记可能在全球范围内被 Google Play 下架。
- **生效日期**：2026-07-15
- **宽限期**：至 2026 年 9 月 30 日
- **强制日期**：2026-09-30
- **执法日期**：2026-09-30
- **优先级**：CRITICAL
- **受影响仓库章节**：docs/GOOGLE-PLAY.md 2026 policy rounds, docs/PLATFORM-MECHANICS-2026.md section 2

### ID: GOOGLE-US-ALT-BILLING-FEE-REPORTING

- **辖区**：Google Play（美国）
- **法律**：美国替代计费与外部链接计划——交易报告与服务费（Play Console 帮助文档 16497028）
- **要求**：自 2026 年 10 月 1 日起，加入美国替代计费或外部链接计划的开发者必须报告交易与成功下载，并缴纳相应的 Play 服务费。
- **生效日期**：2026-10-01
- **宽限期**：none
- **强制日期**：2026-10-01
- **执法日期**：2026-10-01
- **优先级**：CRITICAL
- **受影响仓库章节**：docs/GLOBAL-REGULATORY-2026.md section 2.3, docs/GOOGLE-PLAY.md

### ID: EU-DMA-UNIFIED-TERMS-2026

- **辖区**：欧盟（EU）
- **法律**：Apple 欧盟商务条款更新——核心技术佣金（Core Technology Commission）取代核心技术费（Core Technology Fee），ADPLA 附件 14（Apple Developer news gmws0jgp 与 0cgo95n6）
- **要求**：自 2026 年 10 月 1 日起，对在 App Store 之外分发的应用，按安装收取的核心技术费（Core Technology Fee）被按数字交易征收 5% 的核心技术佣金（Core Technology Commission）取代；初始获取费（Initial Acquisition Fee）与商店服务费（Store Services Fee）取消；应用可在 Apple 应用内购买（In-App Purchase，IAP）之外同时提供替代支付选项；第三方商店（marketplace）与 Web 分发的资格扩展到七项替代标准。须接受 ADPLA 附件 14。
- **生效日期**：2026-08-18
- **宽限期**：至 2026 年 10 月 1 日
- **强制日期**：2026-10-01
- **执法日期**：2026-10-01
- **优先级**：CRITICAL
- **受影响仓库章节**：docs/EU-REGULATORY-2026.md section 2.3

### ID: APPLE-MULTISEAT-VOLUME-PURCHASING

- **辖区**：Apple App Store（全球）
- **法律**：Apple 多席位（multiseat）订阅购买（Apple Developer news likeohx4）
- **要求**：自 2026 年 9 月 16 日起，App Store Connect 中的订阅默认启用多席位购买。通过 Apple Business 与 Apple School Manager 的批量购买（Volume Purchasing）于 2026 年 10 月 22 日上线，团体购买（Group Purchases）于今年冬季上线。10 月 22 日前，请为每个自动续期订阅决定是否允许组织与团体购买席位；在不符合你的定价或 entitlement 逻辑之处，禁用多席位购买，或在 App Store、Apple Business 与 Apple School Manager 各渠道加以限制。来源 https://developer.apple.com/news/?id=likeohx4
- **生效日期**：2026-09-16
- **宽限期**：约 5 周
- **强制日期**：2026-10-22
- **执法日期**：2026-10-22
- **优先级**：MEDIUM
- **受影响仓库章节**：docs/APPLE.md 2026 changes you must act on

### ID: APPLE-IPHONE-DUO-LAUNCH

- **辖区**：Apple App Store（全球）
- **法律**：Apple iPhone Duo 平台就绪要求
- **要求**：iPhone Duo 是 Apple 首款折叠屏 iPhone，于 2026 年 10 月 16 日开启预购，2026 年 10 月 23 日发售，随 iOS 27.1 发布。使用 Xcode 26 或更早版本构建的应用仍可运行，但无法延伸到状态栏与相机区域下方。请使用 Xcode 27.1（2026 年 9 月 18 日起提供 beta）与 iOS 27.1 SDK 构建，在 Duo 模拟器中测试每一种形态，依据 size classes 与场景边界进行自适应缩放，处理保留区域（外屏相机、激活时的内屏相机、折叠区域），并让导航栏、工具栏与标签栏支持竖向呈现。自 2026 年 10 月 5 日起，App Store Connect 接受针对 iPhone Duo 优化的应用与 Duo 截图，可获得产品页徽章；自 2027 年 4 月起，使用 iOS 27.1 SDK 或更高版本的应用必须提供 Duo 截图（APPLE-IPHONE-DUO-SCREENSHOTS-REQ）。在 issue #724 中跟踪。来源 https://developer.apple.com/news/?id=kkphp5qo https://www.apple.com/newsroom/2026/09/apple-unveils-iphone-duo/ https://developer.apple.com/documentation/technologyoverviews/preparing-your-app-for-iphone-duo
- **生效日期**：2026-09-09
- **宽限期**：约 6 周
- **强制日期**：2026-10-23
- **执法日期**：2026-10-23
- **优先级**：HIGH
- **受影响仓库章节**：docs/PLATFORM-MECHANICS-2026.md section 1.8, docs/PRE-SUBMISSION-CHECKLIST.md Apple specific, docs/GAP-ANALYSIS-2026-09.md open items

### ID: IN-DPDPA-CONSENT-MANAGERS-2026

- **辖区**：印度
- **法律**：《2025 年数字个人数据保护规则》（Digital Personal Data Protection Rules 2025），G.S.R. 846(E)，第 4 条
- **要求**：已登记的同意管理商（Consent Manager）相关制度在宪报（Gazette）刊登一年后（2025 年 11 月 13 日）开始施行。请在 2027 年 5 月 13 日的 18 个月批次到来之前，做好与已登记同意管理商互操作的准备。
- **生效日期**：2026-11-13
- **宽限期**：none
- **强制日期**：2026-11-13
- **执法日期**：2026-11-13
- **优先级**：MEDIUM
- **受影响仓库章节**：docs/GLOBAL-REGULATORY-2026.md section 3.6, references/rules/privacy.md

### ID: CN-CAC-MINOR-PLATFORM-FILING-2026

- **辖区**：中国
- **法律**：CAC 2026 年 10 月 19 日关于指定未成年人用户数量巨大或对未成年人有重大影响的网络平台的通知
- **要求**：注册未成年人用户达 1000 万及以上，或月活跃未成年人用户达 100 万及以上（面向未成年人的服务则为注册用户 1000 万、月活跃用户 100 万），或对未成年人有重大影响的平台，须在通知发布后 20 个工作日内向省级网信部门提交指定材料与自评估报告。该窗口约于 2026 年 11 月 16 日关闭（推算值）。符合条件但未申报的平台将被指定委员会责令申报。
- **生效日期**：2026-10-19
- **宽限期**：20 个工作日
- **强制日期**：2026-11-16
- **执法日期**：2026-11-16
- **优先级**：LOW
- **受影响仓库章节**：docs/GLOBAL-REGULATORY-2026.md section 3.9

### ID: GOOGLE-JAPAN-PAYMENTS-AUTHORIZATION-2026

- **辖区**：Google Play（日本）
- **法律**：面向“向日本境内销售或从日本向外销售的开发者”的 Play Console 付款授权（政策公告，2026 年 10 月 29 日）
- **要求**：向日本境内销售或从日本向外销售的开发者必须在 2026 年 12 月 1 日前在 Play Console 中完成付款授权表单，否则 Google 将在全球范围冻结其付款。
- **生效日期**：2026-10-29
- **宽限期**：none
- **强制日期**：2026-12-01
- **执法日期**：2026-12-01
- **优先级**：HIGH
- **受影响仓库章节**：docs/GOOGLE-PLAY.md 2026 policy rounds

### ID: EU-AI-ACT-MARKING-RETROFIT-2026

- **辖区**：欧盟（EU）
- **法律**：EU《人工智能法案》（AI Act），Regulation (EU) 2024/1689，经 Regulation (EU) 2026/1744 修订，第 111(4) 条以及第 5(1)(ba)、(bb)、(1a)、(1b) 条
- **要求**：第 111(4) 条：在 2026 年 8 月 2 日之前投放市场的、生成合成音频、图像、视频或文本的人工智能系统（含通用人工智能系统）的提供者，必须在 2026 年 12 月 2 日前采取必要措施以符合第 50(2) 条。自同一日期起，第 5(1a) 条禁止投放市场或投入使用的 AI 系统是那些生成或篡改未经同意的亲密内容（第 5(1)(ba) 条）或儿童性虐待材料或相关表现（第 5(1)(bb) 条，Directive 2011/93/EU 第 2(c) 与 (e) 项）的系统，但仅限于该生成或篡改属于系统的预期目的，或系统的设计、训练、架构、能力或面向用户的功能使其无需重大技术改动即可成为合理预见且可复现的结果，并且系统缺乏合理且充分的技术安全措施与其他保障，无法在考虑可合理预见的滥用的情况下可靠地防止此类行为并纠正已发现或被报告的滥用。仅当部署者将该系统用于上述目的时，使用行为才被禁止。第 5(1b) 条：不增加任何被描绘者暴露亲密部位的程度、亦不改变任何被描绘的露骨性行为性质的篡改，不属于 (ba) 项下的篡改。
- **生效日期**：2026-12-02
- **宽限期**：none
- **强制日期**：2026-12-02
- **执法日期**：2026-12-02
- **优先级**：HIGH
- **受影响仓库章节**：docs/EU-REGULATORY-2026.md section 1.1, references/guidelines/by-app-type/ai-and-generative-apps.md

### ID: APPLE-PRICE-EQUALIZATION-2026-12-03

- **辖区**：Apple App Store（博茨瓦纳、哥伦比亚、埃及、卢旺达、土耳其）
- **法律**：Apple 税务与价格更新（2026 年 11 月 17 日，Apple Developer 新闻 4o5ie73a）
- **要求**：2026 年 12 月 3 日，Apple 将更新博茨瓦纳、哥伦比亚、埃及、卢旺达与土耳其的应用及应用内购买（In-App Purchase，IAP）价格，此前博茨瓦纳新征 14% 增值税、卢旺达新征 18% 增值税（《付费应用协议》附录 B（Exhibit B）现已将 Apple 列为当地代收税款的主体）。如果这五个店面（storefront）之一是你的基准店面，其价格保持你设置的原值，Apple 会自动调整其他自动均衡店面上的价格，使其与基准价格保持一致。自动续期订阅以及由你手动管理价格的店面不受影响。请检查受影响店面在截屏、宣传文本或应用内文案中硬编码的价格。
- **生效日期**：2026-11-17
- **宽限期**：none
- **强制日期**：2026-12-03
- **执法日期**：2026-12-03
- **优先级**：LOW
- **受影响仓库章节**：docs/APPLE.md 2026 changes you must act on

### ID: EU-PRODUCT-LIABILITY-SOFTWARE-2026

- **辖区**：欧盟（EU）
- **法律**：EU《产品责任指令》（Product Liability Directive），Directive (EU) 2024/2853，第 21 条与第 22 条
- **要求**：自 2026 年 12 月 9 日起，各国严格责任法将独立软件与应用更新视为产品。在该日当日或之后投放市场或投入使用的任何软件均适用新制度。
- **生效日期**：2026-12-09
- **宽限期**：none
- **强制日期**：2026-12-09
- **执法日期**：2026-12-09
- **优先级**：MEDIUM
- **受影响仓库章节**：docs/EU-REGULATORY-2026.md section 5, references/rules/safety.md

### ID: AU-PRIVACY-ADM-DISCLOSURE-2026

- **辖区**：澳大利亚
- **法律**：《1988 年隐私法》（Privacy Act 1988）APP 1.7 至 1.9，由《2024 年隐私及其他立法修正案》（Privacy and Other Legislation Amendment Act 2024）新增
- **要求**：自 2026 年 12 月 10 日起，隐私政策必须说明对权利或利益产生重大影响的自动化决策所使用的个人信息种类，以及这些决策所作出的决定。
- **生效日期**：2026-12-10
- **宽限期**：none
- **强制日期**：2026-12-10
- **执法日期**：2026-12-10
- **优先级**：HIGH
- **受影响仓库章节**：docs/GLOBAL-REGULATORY-2026.md section 3.2, references/rules/privacy.md

### ID: AU-CHILDRENS-ONLINE-PRIVACY-CODE-2026

- **辖区**：澳大利亚
- **法律**：《1988 年隐私法》（Privacy Act 1988）下的《儿童在线隐私守则》（Children's Online Privacy Code）
- **要求**：该守则必须在 2026 年 12 月 10 日前定稿并完成登记，为社交媒体、相关电子服务与指定互联网服务带来有约束力的儿童隐私义务。
- **生效日期**：2026-12-10
- **宽限期**：none
- **强制日期**：2026-12-10
- **执法日期**：2026-12-10
- **优先级**：HIGH
- **受影响仓库章节**：docs/GLOBAL-REGULATORY-2026.md section 3.2, references/guidelines/by-app-type/kids-category-and-families.md

### ID: ID-PP-TUNAS-SELF-ASSESSMENT-2026

- **辖区**：印度尼西亚
- **法律**：《2025 年第 17 号政府条例》（PP TUNAS）与《2026 年第 9 号通信与数字部长条例》
- **要求**：每个电子系统运营者都必须在 2026 年 12 月 31 日前针对每个产品、服务与功能完成儿童保护自评估。Kemkomdigi 表示，错过该截止日期的产品可被直接认定为高风险，从而适用更严格的高风险义务。
- **生效日期**：2026-12-31
- **宽限期**：none
- **强制日期**：2026-12-31
- **执法日期**：2026-12-31
- **优先级**：HIGH
- **受影响仓库章节**：docs/GLOBAL-REGULATORY-2026.md section 3.11, references/rules/safety.md

### ID: US-AL-ASAA

- **辖区**：亚拉巴马州（美国州）
- **法律**：亚拉巴马州 HB 161（App Store Accountability Act，《应用商店问责法》）
- **要求**：应用商店须核验年龄类别，将未成年人关联到家长账号，并在每次下载与应用内购买时取得可验证的家长同意。依据 HB 161 第 14 条（已通过文本），自 2027 年 1 月 1 日起生效。2026 年 10 月 2 日已存在的账号必须在 2027 年 10 月 1 日前完成年龄验证并取得同意。
- **生效日期**：2027-01-01
- **宽限期**：none
- **强制日期**：2027-01-01
- **执法日期**：2027-01-01
- **优先级**：CRITICAL
- **受影响仓库章节**：docs/GLOBAL-REGULATORY-2026.md section 2.2, references/rules/privacy.md

### ID: UK-DMCCA-SUBSCRIPTIONS-2027

- **辖区**：英国（UK）
- **法律**：《2024 年数字市场、竞争与消费者法》（Digital Markets, Competition and Consumers Act 2024），第 4 部分第 2 章订阅合同制度
- **要求**：向英国消费者销售的自动续期订阅类应用需要提供合同前信息、续期提醒、两个冷静期、便捷的取消路径以及新的退款规则。政府于 2026 年 8 月 9 日宣布该制度于 2027 年 1 月启动（具体日期尚未公布），取代此前 2027 年春季的预估。草案启动文书《2026 年消费者订阅合同（取消与信息）条例》（The Consumer Subscription Contracts (Cancellation and Information) Regulations 2026）写明 2027 年 1 月 1 日，但截至 2026 年 11 月 14 日尚未正式制定，因此在正式制定之前该日期仍为暂定值。
- **生效日期**：2027-01-01
- **宽限期**：none
- **强制日期**：2027-01-01
- **执法日期**：2027-01-01
- **优先级**：HIGH
- **受影响仓库章节**：docs/GLOBAL-REGULATORY-2026.md section 3.1, references/rules/payments.md

### ID: BR-ANPD-ECA-ENFORCEMENT-2027

- **辖区**：巴西
- **法律**：ANPD 数字 ECA（Digital ECA）路线图，Etapa II 与 Etapa III（第二与第三阶段）
- **要求**：ANPD 自 2026 年 8 月起发布关于年龄核验机制的指引与规范性参数，适应期至 2026 年 11 月，并自 2027 年 1 月起开始主动执法数字 ECA 的年龄核验义务。
- **生效日期**：2026-08-01
- **宽限期**：none
- **强制日期**：2027-01-01
- **执法日期**：2027-01-01
- **优先级**：HIGH
- **受影响仓库章节**：docs/GLOBAL-REGULATORY-2026.md section 3.3, references/rules/privacy.md

### ID: US-CA-AB1043-AGE-SIGNAL-2027

- **辖区**：加利福尼亚州（美国州）
- **法律**：AB 1043（《数字年龄核验法》，Digital Age Assurance Act），Civil Code Title 1.81.9
- **要求**：操作系统与应用商店在设置时收集年龄，并通过 API 暴露年龄段信号；开发者请求并使用该信号。自 2027 年 1 月 1 日起施行。
- **生效日期**：2027-01-01
- **宽限期**：none
- **强制日期**：2027-01-01
- **执法日期**：2027-01-01
- **优先级**：CRITICAL
- **受影响仓库章节**：docs/GLOBAL-REGULATORY-2026.md section 2.4, references/rules/privacy.md

### ID: US-CA-SB976-ADDICTIVE-FEEDS-2027

- **辖区**：加利福尼亚州（美国州）
- **法律**：SB 976（Protecting Our Kids from Social Media Addiction Act，《保护我们的孩子免受社交媒体成瘾法》），Health and Safety Code 第 27001 至 27006 节
- **要求**：自 2027 年 1 月 1 日起，除非年龄核验在此前合理地判定用户为成年人，否则在向其提供成瘾性信息流，或在午夜至早 6 点之间或在校时段发送通知时，一律按未成年人对待。州检察长（AG）的年龄核验条例同日到期出台。
- **生效日期**：2027-01-01
- **宽限期**：none
- **强制日期**：2027-01-01
- **执法日期**：2027-01-01
- **优先级**：HIGH
- **受影响仓库章节**：docs/GLOBAL-REGULATORY-2026.md section 2.4, references/guidelines/by-app-type/social-and-user-generated-content.md

### ID: US-CA-AB56-WARNING-LABEL-2027

- **辖区**：加利福尼亚州（美国州）
- **法律**：AB 56，Health and Safety Code 第 25 章（自第 28000 节起）
- **要求**：受涵盖的社交媒体平台须每天在首次使用时展示美国卫生局局长（Surgeon General）黑框警告，累计使用满 3 小时后再次展示，之后每小时展示一次。自 2027 年 1 月 1 日起施行。
- **生效日期**：2027-01-01
- **宽限期**：none
- **强制日期**：2027-01-01
- **执法日期**：2027-01-01
- **优先级**：HIGH
- **受影响仓库章节**：docs/GLOBAL-REGULATORY-2026.md section 2.4, references/guidelines/by-app-type/social-and-user-generated-content.md

### ID: US-CA-CPPA-ADMT-2027

- **辖区**：加利福尼亚州（美国州）
- **法律**：CPPA 条例，11 CCR section 7200(b)、7155(b)、7157(a)(1)、7121(a)
- **要求**：在 2027 年 1 月 1 日前，对用于重大决策的自动化决策技术（ADMT）提供告知、允许退出并响应访问请求。2026 年之前的处理活动的风险评估须在 2027 年 12 月 31 日前完成，并在 2028 年 4 月 1 日前提交。年收入超过 1 亿美元者自 2028 年 4 月 1 日起开展网络安全审计认证。
- **生效日期**：2027-01-01
- **宽限期**：none
- **强制日期**：2027-01-01
- **执法日期**：2027-01-01
- **优先级**：HIGH
- **受影响仓库章节**：docs/GLOBAL-REGULATORY-2026.md section 2.4, references/rules/privacy.md

### ID: US-VT-AADC-2027

- **辖区**：佛蒙特州（美国州）
- **法律**：《适龄设计守则法》（Age-Appropriate Design Code Act），Act 63
- **要求**：为未成年人提供最高隐私默认设置、最小化收集、禁止深夜推送通知，并适用州检察长的年龄核验规则。自 2027 年 1 月 1 日起生效。规则制定的评论意见须在 2026 年 10 月 2 日前提交。
- **生效日期**：2027-01-01
- **宽限期**：none
- **强制日期**：2027-01-01
- **执法日期**：2027-01-01
- **优先级**：HIGH
- **受影响仓库章节**：docs/GLOBAL-REGULATORY-2026.md section 2.5, references/guidelines/by-app-type/kids-category-and-families.md

### ID: US-WA-HB2225-COMPANION-CHATBOT-2027

- **辖区**：华盛顿州（美国州）
- **法律**：HB 2225（2026 年法律第 168 章），规范人工智能陪伴聊天机器人
- **要求**：陪伴聊天机器人的披露与未成年人保护义务，包括对未成年人持续使用时的每小时披露。自 2027 年 1 月 1 日起生效。
- **生效日期**：2027-01-01
- **宽限期**：none
- **强制日期**：2027-01-01
- **执法日期**：2027-01-01
- **优先级**：HIGH
- **受影响仓库章节**：docs/GLOBAL-REGULATORY-2026.md section 2.5, references/guidelines/by-app-type/ai-and-generative-apps.md

### ID: US-OK-SB546-PRIVACY-2027

- **辖区**：俄克拉何马州（美国州）
- **法律**：SB 546（《俄克拉何马消费者数据隐私法》，Oklahoma Consumer Data Privacy Act）
- **要求**：自 2027 年 1 月 1 日起，须支持访问、更正、删除、可携带权，以及出售、定向广告与画像的退出选择。
- **生效日期**：2027-01-01
- **宽限期**：none
- **强制日期**：2027-01-01
- **执法日期**：2027-01-01
- **优先级**：MEDIUM
- **受影响仓库章节**：docs/GLOBAL-REGULATORY-2026.md section 2.5, references/rules/privacy.md

### ID: APPLE-ODR-UPLOAD-BLOCK-2027

- **辖区**：Apple App Store（全球）
- **法律**：App Store Connect 发布说明（2026 年 11 月 12 日）
- **要求**：自 2027 年年初起，App Store Connect 将不再接受来自新应用或从未使用过按需资源（On-Demand Resources）功能的应用的、包含按需资源的上传包。建议迁移到后台资产（Background Assets）。Apple 尚未公布具体日期，因此 2027 年 1 月 1 日只是最早可能的日期，仅作为尽早迁移的提醒，并非 Apple 的执法日期。自该日起，截止日期检查器会将其列为已过期，这正是用于提示你去确认真实日期的机制；一旦 Apple 公布正式日期，此条目必须替换。已在使用按需资源的应用不在此次封禁之列。
- **生效日期**：2026-11-12
- **宽限期**：至 2027 年年初
- **强制日期**：2027-01-01
- **执法日期**：2027-01-01
- **优先级**：HIGH
- **受影响仓库章节**：docs/APPLE.md, data/rejection-patterns.json APPLE-ODR-DEPRECATED-27

### ID: APPLE-CALIFORNIA-SALES-TAX-DIGITAL-2027

- **辖区**：Apple App Store（美国，加利福尼亚州）
- **法律**：Apple 税务与价格更新（2026 年 11 月 17 日，Apple Developer 新闻 4o5ie73a）
- **要求**：自 2027 年 1 月 1 日起，属于 SaaS、App Store Software、Software Training Material、Dating 与 Boosting 税务类别的应用需缴纳加利福尼亚州销售与使用税。美国店面价格显示为不含税，收益不变，但客户支付的总价可能上升。App Store Software、Software Training Material、Dating 与 Boosting 税务类别新增“软件即服务（SaaS）”属性。请在 2027 年 1 月 1 日前在“定价与可用性”（Pricing and Availability）中复核每个应用与应用内购买的税务类别及 SaaS 属性，并检查应用内价格文案没有向美国买家承诺含税总价。
- **生效日期**：2026-11-17
- **宽限期**：none
- **强制日期**：2027-01-01
- **执法日期**：2027-01-01
- **优先级**：MEDIUM
- **受影响仓库章节**：docs/APPLE.md 2026 changes you must act on

### ID: EU-DATA-ACT-SWITCHING-2027

- **辖区**：欧盟（EU）
- **法律**：EU《数据法案》（Data Act），Regulation (EU) 2023/2854，第 29(1) 条
- **要求**：数据处理服务提供者对客户转离（更换服务商）不得收费。2025 年 9 月 12 日当日或之前订立的无限期或长期存量合同，必须在 2027 年 9 月 12 日前符合第四章不公平条款规则。
- **生效日期**：2027-01-12
- **宽限期**：none
- **强制日期**：2027-01-12
- **执法日期**：2027-01-12
- **优先级**：MEDIUM
- **受影响仓库章节**：docs/EU-REGULATORY-2026.md section 5

### ID: APPLE-AGE-RATING-LOCATION-DATING-2027

- **辖区**：Apple App Store（全球）
- **法律**：Apple 年龄分级内容描述项：共享位置（Shared Location）与约会和社交关系（Dating and Relationships）（Apple Developer 新闻 yxkh08us）
- **要求**：自 2026 年 11 月 16 日起，App Store Connect 年龄分级问卷会询问应用是否包含“共享位置”（与他人或群组共享真实世界位置）与“约会和社交关系”（促成真人之间约会或建立关系）功能。每个应用必须在 2027 年 1 月 12 日前完成这两项申报，此前任何更新或问卷变更也必须回答这两项。“约会和社交关系”会将最低年龄分级设为 18+。
- **生效日期**：2026-11-16
- **宽限期**：none
- **强制日期**：2027-01-12
- **执法日期**：2027-01-12
- **优先级**：HIGH
- **受影响仓库章节**：docs/APPLE.md 2026 changes you must act on

### ID: US-NY-SAFE-FOR-KIDS-2027

- **辖区**：纽约州（美国州）
- **法律**：《阻止成瘾性信息流剥削儿童法》（Stop Addictive Feeds Exploitation (SAFE) for Kids Act），州检察长（AG）最终规则于 2026 年 7 月 29 日公布
- **要求**：自 2027 年 1 月 25 日起，在缺乏可验证的家长同意时，须使用经认证的年龄核验，限制未成年人的成瘾性信息流以及午夜至早 6 点的通知。
- **生效日期**：2027-01-25
- **宽限期**：none
- **强制日期**：2027-01-25
- **执法日期**：2027-01-25
- **优先级**：CRITICAL
- **受影响仓库章节**：docs/GLOBAL-REGULATORY-2026.md section 2.5, references/guidelines/by-app-type/social-and-user-generated-content.md

### ID: GOOGLE-CONTACTS-LOCATION-FGS-API37

- **辖区**：Google Play（全球）
- **法律**：面向 Android 17（API 级别 37）应用的联系人权限、位置权限与前台服务政策变更（Play Console 帮助答案 16909972 与 16965181）
- **要求**：以 API 37 或更高为目标的应用，仅在 Android 联系人选择器不足以支撑核心功能时才可请求 READ_CONTACTS（需申报）；必须实现 Android 位置按钮及 onlyForLocationButton manifest 标志以获得位置按钮范围；且不得再使用前台服务进行地理围栏（改用 Geofence API）。自 2026 年 10 月 27 日起，Play Console 的预审检查会标记联系人与位置问题。
- **生效日期**：2026-10-27
- **宽限期**：至 2027 年 1 月 27 日
- **强制日期**：2027-01-27
- **执法日期**：2027-01-27
- **优先级**：HIGH
- **受影响仓库章节**：docs/GOOGLE-PLAY.md 2026 policy rounds, references/rules/android.md

### ID: GOOGLE-SUBSCRIPTION-ELIGIBILITY-DISCOUNTS-2027

- **辖区**：Google Play（全球）
- **法律**：订阅政策：提供基于持续资格折扣的订阅（2026 年 10 月 29 日宣布）
- **要求**：提供基于持续资格折扣的订阅（如学生计划）时，必须清楚说明资格标准、资格如何核验，以及资格失效后的价格与权益。
- **生效日期**：2026-10-29
- **宽限期**：none
- **强制日期**：2027-01-27
- **执法日期**：2027-01-27
- **优先级**：MEDIUM
- **受影响仓库章节**：docs/GOOGLE-PLAY.md 2026 policy rounds

### ID: GOOGLE-PLAY-CALL-LOG-VERIFICATION-2027

- **辖区**：Google Play（全球）
- **法律**：SMS 或通话记录权限组的使用：通过电话进行账号验证（Play Console 帮助答案 10208820；2026 年 10 月 29 日政策公告中的提醒；帮助答案 18100766）
- **要求**：自 2027 年 1 月 27 日起，“通过电话进行账号验证”不再是 READ_CALL_LOG 权限的允许用例；在该日之前，同一页面的例外表格仍列出该用例。请使用 Digital Credentials API（直接使用，或通过基于其构建的验证服务商）、SMS Retriever API 或 SMS User Consent API 验证账号。2026 年 10 月 29 日的公告将 SMS User Consent API 加入，作为账号验证的隐私保护替代方案。
- **生效日期**：2027-01-27
- **宽限期**：none
- **强制日期**：2027-01-27
- **执法日期**：2027-01-27
- **优先级**：HIGH
- **受影响仓库章节**：docs/GOOGLE-PLAY.md 2026 policy rounds, references/rules/android.md, data/rejection-patterns.json

### ID: UK-OSA-APP-STORES-REPORT-2027

- **辖区**：英国（UK）
- **法律**：《2023 年在线安全法》（Online Safety Act 2023），Ofcom 关于儿童使用应用商店的法定报告
- **要求**：Ofcom 将在 2027 年 1 月前发布其应用商店报告。该报告将输入国务大臣关于是否把应用商店纳入《在线安全法》范围的决定。属于观察项，目前尚无针对开发者的直接义务。
- **生效日期**：2027-01-31
- **宽限期**：none
- **强制日期**：2027-01-31
- **执法日期**：2027-01-31
- **优先级**：MEDIUM
- **受影响仓库章节**：docs/GLOBAL-REGULATORY-2026.md section 3.1

### ID: APPLE-CN-APP-COMPLIANCE-2027

- **辖区**：Apple App Store（中国大陆）
- **法律**：App Store Connect 中国大陆合规申报（AI 生成或合成内容与安全评估）
- **要求**：在中国大陆 App Store 上架的每个应用都必须在“应用合规”（App Compliance）页面（先选 Apps，再选相应应用，然后在侧边栏选择 General）完成两项申报。所需角色为账户持有人（Account Holder）或管理员（Admin）。如果应用向中国大陆用户提供该功能，选择“是”；如果不提供，或该功能在中国大陆被禁用或地域封锁，选择“否”。“AI 生成或合成内容”适用于 AI 聊天机器人、图像或视频生成以及语音与面容变换等服务。回答“是”需要提供大模型或算法的已批准备案编号与备案名称。如果这些功能由他人的技术驱动，还须上传来自技术所有方的授权或使用协议，其中须包含基础模型或算法的备案名称与备案编号、能识别你或你的组织为被授权方的提供者名称，以及一个名称与 CAC（Cyberspace Administration of China）审批登记库中所有方名称一致的授权主体。“安全评估”适用于分发 AI 生成或合成内容、或提供端到端加密即时通讯等功能。回答“是”需要一张来自全国互联网安全管理服务平台（National Internet Security Management Service Platform）的截图，显示应用名称、提供者名称以及“通过”（pass）或“已通过审核”（passed review）状态，并附上一份安全评估报告副本，其中包含应用名称、提供者名称与公司公章。涉密或专有信息应做遮盖处理。状态包括“信息缺失”（Missing Info）、“待验证”（Pending Verification）、“验证失败”（Verification Failed）与“活跃”（Active）。应用会先在其他所有选定国家和地区发布；在合规信息完成验证之前，应用不会在中国大陆的 App Store 上架。如果版本已获批准但验证未通过，其在中国大陆仍不可用。请更新并保存“应用合规”页面；更新后的申报会在下一个应用版本提交时接受审核。一旦验证并批准通过，应用即在中国大陆可用。到 2027 年 1 月 31 日，中国大陆每个现有应用都必须完成并通过验证的合规申报，才能继续在 App Store 上架。
- **生效日期**：2026-11-17
- **宽限期**：现有应用至 2027 年 1 月 31 日
- **强制日期**：2027-01-31
- **执法日期**：2027-01-31
- **优先级**：HIGH
- **受影响仓库章节**：docs/GLOBAL-REGULATORY-2026.md section 3.9, docs/APPLE.md 2026 changes you must act on, docs/PRE-SUBMISSION-CHECKLIST.md Global specific, docs/BY-APP-TYPE.md, references/guidelines/by-app-type/ai-and-generative-apps.md, references/guidelines/by-app-type/social-and-user-generated-content.md

### ID: GOOGLE-TECH-QUALITY-FEB-2027

- **辖区**：Google Play（全球）
- **法律**：Play Console 技术质量要求：内存、位图与 DEX 优化阈值（Play Console 帮助答案 17492799）
- **要求**：Google 表示，自 2027 年 2 月起（具体日期未公布），应用必须达到至少 25% 覆盖率的最低优化要求（使用 R8 等工具进行优化、收缩与混淆），不得在不可见状态下将位图保留在内存中，并须保持在内存异常行为阈值之内。不达标会影响可见性与发布能力。
- **生效日期**：2026-08-26
- **宽限期**：至 2027 年 2 月
- **强制日期**：2027-02-01
- **执法日期**：2027-02-01
- **优先级**：HIGH
- **受影响仓库章节**：docs/GOOGLE-PLAY.md 2026 policy rounds, references/rules/performance.md

### ID: APPLE-DEVELOPER-ID-SUBCA-EXPIRY-2027

- **辖区**：Apple App Store（全球）
- **法律**：原始 Developer ID 认证机构（Sub-CA）到期（Apple Developer 新闻 w4atic4c）
- **要求**：原始 Developer ID Sub-CA 将于 2027 年 2 月 1 日到期，其签发的证书当天起失效。请在此之前从 Developer ID Certification Authority（G2）生成替代的 Developer ID 证书，并对所有在 Mac App Store 之外分发的安装包重新签名。
- **生效日期**：2026-10-01
- **宽限期**：none
- **强制日期**：2027-02-01
- **执法日期**：2027-02-01
- **优先级**：HIGH
- **受影响仓库章节**：docs/PLATFORM-MECHANICS-2026.md section 1.1

### ID: GOOGLE-PLAY-TRADER-STATUS-2027

- **辖区**：Google Play（全球）
- **法律**：EEA 与英国法律下的 Play Console 商家身份（trader status）申报（Play Console 帮助答案 17594752）
- **要求**：每个有效的开发者账号都必须在 Play Console 中按 EEA 与英国法律申报商家或非商家身份，无论其应用面向何处或分发于何处。不在 EEA 或英国分发的账号可申报为非商家。新账号在创建时申报；现有账号必须在 2027 年 2 月 1 日前申报。商家须自我声明遵守适用法律、提供每个应用的服务条款链接，个人账号还须提供联系电话（地址将公开展示）。错过该日期可能阻止更新，并导致应用从 Play 全球下架。虚假的非商家申报可能导致全球下架；为绕过验证或自我声明而谎报身份可能导致账号在全球被暂停或终止。
- **生效日期**：2026-10-29
- **宽限期**：现有账号至 2027 年 2 月 1 日
- **强制日期**：2027-02-01
- **执法日期**：2027-02-01
- **优先级**：CRITICAL
- **受影响仓库章节**：docs/GOOGLE-PLAY.md 2026 policy rounds, docs/EU-REGULATORY-2026.md section 3

### ID: UK-UNDER16-SOCIAL-MEDIA-2027

- **辖区**：英国（UK）
- **法律**：16 岁以下社交媒体禁令与功能限制，《儿童福祉与学校法》（Children's Wellbeing and Schools Act）下的二级立法（2026 年 6 月 15 日宣布）
- **要求**：条例应在 2026 年年底前提交议会，并于 2027 年春季实施（具体日期尚未公布，此处暂按 2027 年 3 月 1 日追踪）。用户对用户社交平台必须封禁 16 岁以下账号。对 16 岁与 17 岁用户，直播与陌生人联系默认关闭，午夜至早 6 点的通知关闭，自动播放与个性化信息流默认关闭。AI 浪漫陪伴聊天机器人必须强制执行 18 岁的最低年龄。
- **生效日期**：2027-03-01
- **宽限期**：none
- **强制日期**：2027-03-01
- **执法日期**：2027-03-01
- **优先级**：CRITICAL
- **受影响仓库章节**：docs/GLOBAL-REGULATORY-2026.md section 3.1, references/guidelines/by-app-type/social-and-user-generated-content.md

### ID: GOOGLE-PLAY-MARKETPLACE-DISPLAY-2027

- **辖区**：Google Play（全球）
- **法律**：面向 EEA 与英国的 Play Console 线上第三方商店（marketplace）模式与商家信息展示（Play Console 帮助答案 17594752）
- **要求**：自 2027 年 3 月 1 日起，Google Play 在 EEA 与英国采用线上第三方商店（marketplace）模式。自该日起，凡账号已申报为商家，各地用户都会看到商家的联系方式（个人账号为电话号码与地址）、“应用支持”（App support）中的 D-U-N-S 号码，以及（如已提供）服务条款链接。EEA 与英国的用户还会在“提供方”（Offered by）字段看到开发者或商家名称取代 Google，并看到产品或服务符合当地法律的自我声明。
- **生效日期**：2027-03-01
- **宽限期**：none
- **强制日期**：2027-03-01
- **执法日期**：2027-03-01
- **优先级**：HIGH
- **受影响仓库章节**：docs/GOOGLE-PLAY.md 2026 policy rounds, docs/EU-REGULATORY-2026.md section 3

### ID: KR-PIPA-AI-DATA-REUSE-2027

- **辖区**：韩国
- **法律**：《个人信息保护法》（Personal Information Protection Act），Act No. 21910（2026 年 9 月 8 日）
- **要求**：自 2027 年 3 月 9 日起，为其他目的合法收集的个人信息，在匿名或假名化处理会导致该开发难以进行、该使用服务于公共利益或类似目的、全部法定要求均获满足，且经个人信息保护委员会审议决议的情形下，可用于开发 AI 技术。处理者必须先就其对数据主体的影响运行风险因素评估。在韩国用户数据上训练或微调模型的应用，应在依赖该途径之前先行安排该评估。
- **生效日期**：2027-03-09
- **宽限期**：none
- **强制日期**：2027-03-09
- **执法日期**：2027-03-09
- **优先级**：MEDIUM
- **受影响仓库章节**：docs/GLOBAL-REGULATORY-2026.md section 3.5, references/rules/privacy.md

### ID: APPLE-SDK-27-REQ

- **辖区**：Apple App Store（全球）
- **法律**：Apple App Store 提交要求（Submission Requirements）
- **要求**：自 2027 年 4 月起，上传到 App Store Connect 的应用与游戏必须以 iOS 27 与 iPadOS 27 SDK 或更高版本构建，并配合相应的 tvOS 27、visionOS 27 与 watchOS 27 SDK。Apple 仅公布月份、未公布具体日期，因此本条目暂按 2027 年 4 月 1 日追踪，Apple 公布日期后必须复核。Apple 的清单中不含 macOS。该要求于 2026 年 9 月 9 日随 Xcode 27 候选版本（Release Candidate）宣布。来源 https://developer.apple.com/news/?id=k1mtkt1k
- **生效日期**：2026-09-09
- **宽限期**：约 7 个月
- **强制日期**：2027-04-01
- **执法日期**：2027-04-01
- **优先级**：CRITICAL
- **受影响仓库章节**：docs/PLATFORM-MECHANICS-2026.md section 1.6, docs/APPLE.md 2026 changes, docs/PRE-SUBMISSION-CHECKLIST.md Apple specific

### ID: APPLE-IPHONE-DUO-SCREENSHOTS-REQ

- **辖区**：Apple App Store（全球）
- **法律**：Apple App Store 提交要求（Submission Requirements）
- **要求**：自 2027 年 4 月起，任何使用 iOS 27.1 SDK 或更高版本的应用都必须提供 iPhone Duo 截屏（Apple 的截屏规范页面将其限定于该 SDK，而 2026 年 10 月 5 日的新闻帖则称覆盖每个提交的应用与游戏）。App Store Connect 自 2026 年 10 月 5 日起已接受 iPhone Duo 优化的应用与 Duo 截屏，包含 Duo 截屏的产品页面会显示该应用已针对 iPhone Duo 优化的徽章。Apple 仅公布月份、未公布具体日期，因此本条目暂按 2027 年 4 月 1 日追踪，Apple 公布日期后必须复核。来源 https://developer.apple.com/news/?id=kkphp5qo https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications
- **生效日期**：2026-10-05
- **宽限期**：约 6 个月
- **强制日期**：2027-04-01
- **执法日期**：2027-04-01
- **优先级**：HIGH
- **受影响仓库章节**：docs/PLATFORM-MECHANICS-2026.md section 1.8, docs/PRE-SUBMISSION-CHECKLIST.md Apple specific

### ID: GOOGLE-RESTORE-CREDENTIALS-APR-2027

- **辖区**：Google Play（全球）
- **法律**：Play Console 技术质量要求：零点击登录（Zero-Tap Sign-In）状态恢复（Play Console 帮助答案 17492799）
- **要求**：Google 表示，自 2027 年 4 月起（具体日期未公布），任何支持用户登录的应用（无论登录可选还是强制）都必须使用 Restore Credentials API，在用户迁移到新的 Android 设备时恢复其登录状态。游戏目前不在范围内。
- **生效日期**：2026-08-26
- **宽限期**：至 2027 年 4 月
- **强制日期**：2027-04-01
- **执法日期**：2027-04-01
- **优先级**：HIGH
- **受影响仓库章节**：docs/GOOGLE-PLAY.md 2026 policy rounds, references/rules/design.md

### ID: GOOGLE-APPFUNCTIONS-POLICY-2027

- **辖区**：Google Play（全球）
- **法律**：AppFunctions API 政策（2026 年 10 月 29 日宣布）
- **要求**：暴露 AppFunctions 的应用必须遵守每一项 Play 政策，其 AppFunctions 不得欺骗或操纵 AI 代理（agent）、绕过安全控制或干扰其他应用。
- **生效日期**：2026-10-29
- **宽限期**：none
- **强制日期**：2027-04-14
- **执法日期**：2027-04-14
- **优先级**：MEDIUM
- **受影响仓库章节**：docs/GOOGLE-PLAY.md 2026 policy rounds

### ID: US-ADA-TITLE-II-WCAG-2027

- **辖区**：美国（联邦）
- **法律**：ADA 第二章（Title II）网页与移动应用无障碍要求，28 CFR Part 35 Subpart H，临时最终规则 FR Doc. 2026-07663（2026 年 4 月 20 日）
- **要求**：由服务人口达 5 万及以上的州或地方政府实体提供或开放使用的移动应用必须符合 WCAG 2.1 AA 级。该要求会通过合同或许可链条触及商业开发者。2024 年规则原定的 2026 年 4 月 24 日已延长至 2027 年 4 月 26 日。
- **生效日期**：2026-04-20
- **宽限期**：none
- **强制日期**：2027-04-26
- **执法日期**：2027-04-26
- **优先级**：HIGH
- **受影响仓库章节**：docs/GLOBAL-REGULATORY-2026.md section 2.8, references/rules/design.md

### ID: US-UT-ASAA

- **辖区**：犹他州（美国州）
- **法律**：犹他州 SB 142（App Store Accountability Act，《应用商店问责法》），经 HB 498（2026）修订
- **要求**：从应用商店请求并接收年龄类别，为未成年人账号确认家长同意，删除验证数据。HB 498（2026）将所有实体义务移至 2027 年 5 月 6 日，将预装应用纳入范围，废除分部（Division）的规则制定权，并以私人诉权（每次违规至少 1000 美元）取代州检察长执法。CCIA 的诉讼于 2026 年 4 月 21 日被自愿撤回。
- **生效日期**：2027-05-06
- **宽限期**：运营层面事项 12 个月
- **强制日期**：2027-05-06
- **执法日期**：2027-05-06
- **优先级**：CRITICAL
- **受影响仓库章节**：docs/GLOBAL-REGULATORY-2026.md section 1, section 2.2, references/rules/privacy.md

### ID: US-HHS-504-WCAG-2027

- **辖区**：美国（联邦）
- **法律**：第 504 条（Section 504）针对 HHS 财政资助受助者的网页与移动应用无障碍要求，45 CFR 84.84(b)，临时最终规则 91 FR 25496（2026 年 5 月 11 日）
- **要求**：雇员 15 人及以上的任何 HHS 联邦财政资助受助者，直接提供或通过合同/许可安排提供的移动应用必须符合 WCAG 2.1 AA 级。期限已从 2026 年 5 月 11 日延长至 2027 年 5 月 11 日。
- **生效日期**：2026-05-07
- **宽限期**：none
- **强制日期**：2027-05-11
- **执法日期**：2027-05-11
- **优先级**：HIGH
- **受影响仓库章节**：docs/GLOBAL-REGULATORY-2026.md section 2.8, references/guidelines/by-app-type/health-fitness-and-medical.md

### ID: IN-DPDPA-RULES

- **辖区**：印度
- **法律**：《2023 年数字个人数据保护法》（Digital Personal Data Protection Act，DPDPA）/《2025 年 DPDP 规则》（DPDP Rules 2025）
- **要求**：18 岁以下用户须经政府支持的系统（如 DigiLocker）取得可验证的家长同意；禁止行为追踪/定向广告。
- **生效日期**：2025-11-13
- **宽限期**：18 个月
- **强制日期**：2027-05-13
- **执法日期**：2027-05-13
- **优先级**：HIGH
- **受影响仓库章节**：docs/GLOBAL-REGULATORY-2026.md section 3.6, references/guidelines/by-app-type/kids-category-and-families.md

### ID: US-LA-ASAA

- **辖区**：路易斯安那州（美国州）
- **法律**：路易斯安那州 HB 977（2026），Act No. 185，R.S. 51:1771 至 1775（App Store Accountability Act，《应用商店问责法》），取代 HB 570（2025）
- **要求**：年龄类别请求、家长同意、重大更新时重新请求同意。《2025 年第 481 号法案》（HB 570）从未生效。HB 977 重新制定该制度，自 2027 年 7 月 1 日起生效。Apple 店面的路易斯安那州年龄段信号仍按 Apple 自身的时间表开放。
- **生效日期**：2027-07-01
- **宽限期**：12 个月
- **强制日期**：2027-07-01
- **执法日期**：2027-07-01
- **优先级**：CRITICAL
- **受影响仓库章节**：docs/GLOBAL-REGULATORY-2026.md section 1, section 2.2, references/rules/privacy.md

### ID: KR-PIPA-MANDATORY-CERTIFICATION-2027

- **辖区**：韩国
- **法律**：《个人信息保护法》（Personal Information Protection Act），Act No. 21445（2026 年 3 月 10 日），第 32-2(1) 条但书与第 75(2)(15) 条
- **要求**：自 2027 年 7 月 1 日起，凡达到总统令按收入与所处理个人信息规模设定的门槛的个人信息处理者，必须持有个人信息保护委员会的隐私认证，未取得该认证将被处以行政罚款。截至 2026 年 11 月 14 日，该总统令门槛尚未公布，公布后请核查你的韩国业务是否落入其内。
- **生效日期**：2027-07-01
- **宽限期**：none
- **强制日期**：2027-07-01
- **执法日期**：2027-07-01
- **优先级**：MEDIUM
- **受影响仓库章节**：docs/GLOBAL-REGULATORY-2026.md section 3.5, references/rules/privacy.md

### ID: US-CA-SB243-COMPANION-CHATBOT-2027

- **辖区**：加利福尼亚州（美国州）
- **法律**：SB 243，Business and Professions Code 第 22.6 章，第 22601 至 22606 节
- **要求**：自 2027 年 7 月 1 日起，陪伴聊天机器人运营者在已有的披露与未成年人保护义务之上，还须每年向自杀预防办公室（Office of Suicide Prevention）报告危机转介与处理规程。
- **生效日期**：2027-07-01
- **宽限期**：none
- **强制日期**：2027-07-01
- **执法日期**：2027-07-01
- **优先级**：MEDIUM
- **受影响仓库章节**：docs/GLOBAL-REGULATORY-2026.md section 2.5, references/guidelines/by-app-type/ai-and-generative-apps.md

### ID: GOOGLE-LOCAL-NETWORK-MANAGE-CONTACTS-2027

- **辖区**：Google Play（全球）
- **法律**：本地网络权限与管理联系人权限申报（2026 年 10 月 29 日宣布）
- **要求**：本地网络（Local Network）权限被限制在设备选择器不足以支撑的核心功能，且以 Android 17（API 37）或更高为目标的应用必须提交 Play Console 申报方可使用。管理联系人（Manage Contacts）权限被限制在系统选择器力有未逮的核心功能，同样需要申报。其他所有应用须改用范围收窄的平台 intent。
- **生效日期**：2026-10-29
- **宽限期**：none
- **强制日期**：2027-08-25
- **执法日期**：2027-08-25
- **优先级**：MEDIUM
- **受影响仓库章节**：docs/GOOGLE-PLAY.md 2026 policy rounds

### ID: GOOGLE-PLAY-BILLING-V8-EXISTING-2027

- **辖区**：Google Play（全球）
- **法律**：Google Play Billing Library 弃用阶梯（developer.android.com 结算弃用 FAQ）
- **要求**：到 2027 年 8 月 31 日（可延长至 2027 年 11 月 1 日），Play Billing Library 8 成为所有已发布应用的最低版本；到 2028 年 8 月 31 日（可延长至 2028 年 11 月 1 日）为版本 9。2026 年 8 月 31 日的 v8 新提交门槛曾附带延长至 2026 年 11 月 1 日。已发布的较低版本二进制包在其截止日期之前仍可继续交易。
- **生效日期**：2026-08-31
- **宽限期**：至 2027 年 11 月 1 日
- **强制日期**：2027-08-31
- **执法日期**：2027-11-01
- **优先级**：HIGH
- **受影响仓库章节**：docs/PLATFORM-MECHANICS-2026.md section 2.4, references/rules/payments.md

### ID: EU-AI-ACT-HIGH-RISK-ANNEX-III

- **辖区**：欧盟（EU）
- **法律**：EU《人工智能法案》（AI Act），Regulation (EU) 2024/1689（经 AI 综合法案（AI Omnibus）修订，2026 年 7 月 27 日生效）
- **要求**：高风险 AI 系统（附件 III）义务、合规检查与治理要求由 AI 综合法案（2026 年 7 月 27 日生效）推迟。日期由 2026 年 7 月 8 日的 Regulation (EU) 2026/1744 设定，已生效，并非提案。
- **生效日期**：2024-08-01
- **宽限期**：40 个月
- **强制日期**：2027-12-02
- **执法日期**：2027-12-02
- **优先级**：HIGH
- **受影响仓库章节**：docs/EU-REGULATORY-2026.md section 1.5, references/guidelines/by-app-type/ai-and-generative-apps.md

### ID: EU-CRA-MAIN

- **辖区**：欧盟（EU）
- **法律**：EU《网络弹性法案》（Cyber Resilience Act），Regulation (EU) 2024/2847
- **要求**：主要的安全设计（security by design）与漏洞处理义务。
- **生效日期**：2024-12-11
- **宽限期**：36 个月
- **强制日期**：2027-12-11
- **执法日期**：2027-12-11
- **优先级**：MEDIUM
- **受影响仓库章节**：docs/EU-REGULATORY-2026.md section 5

### ID: EU-EIDAS-WALLET-ACCEPTANCE-2027

- **辖区**：欧盟（EU）
- **法律**：eIDAS 2，Regulation (EU) 910/2014，经 Regulation (EU) 2024/1183 修订，第 5f(2) 条
- **要求**：在银行、金融、健康、电信、交通、能源、教育或数字基础设施领域使用强用户认证的、超出微型或小型规模的私人信赖方（relying party），必须在用户请求时接受欧盟数字身份钱包，即实施法案（implementing acts）通过后 36 个月（推算日期 2027 年 12 月 24 日）。
- **生效日期**：2027-12-24
- **宽限期**：none
- **强制日期**：2027-12-24
- **执法日期**：2027-12-24
- **优先级**：MEDIUM
- **受影响仓库章节**：docs/EU-REGULATORY-2026.md section 5, references/rules/privacy.md

### ID: EU-CSAM-EPRIVACY-DEROGATION-EXPIRY-2028

- **辖区**：欧盟（EU）
- **法律**：2026 年 7 月 24 日的 Regulation (EU) 2026/1881，关于自愿 CSAM 检测的临时 ePrivacy 减损
- **要求**：与号码无关的人际通信服务中的自愿 CSAM 扫描，仅在 2028 年 4 月 3 日前合法。依赖该依据的即时通讯应用需要永久的 CSA 条例依据，否则必须停止。
- **生效日期**：2026-08-01
- **宽限期**：none
- **强制日期**：2028-04-03
- **执法日期**：2028-04-03
- **优先级**：MEDIUM
- **受影响仓库章节**：docs/EU-REGULATORY-2026.md section 5, references/rules/safety.md

### ID: US-ADA-TITLE-II-WCAG-2028

- **辖区**：美国（联邦）
- **法律**：ADA 第二章（Title II）网页与移动应用无障碍要求，28 CFR Part 35 Subpart H，临时最终规则 FR Doc. 2026-07663
- **要求**：服务人口少于 5 万的公共实体与每个特别区政府适用同样的 WCAG 2.1 AA 义务，已延长至 2028 年 4 月 26 日。
- **生效日期**：2026-04-20
- **宽限期**：none
- **强制日期**：2028-04-26
- **执法日期**：2028-04-26
- **优先级**：MEDIUM
- **受影响仓库章节**：docs/GLOBAL-REGULATORY-2026.md section 2.8, references/rules/design.md

### ID: US-HHS-504-WCAG-2028

- **辖区**：美国（联邦）
- **法律**：第 504 条（Section 504）网页与移动应用无障碍要求，45 CFR 84.84(b)(2)，临时最终规则 91 FR 25496
- **要求**：雇员少于 15 人的 HHS 资助受助者适用同样的 WCAG 2.1 AA 义务，已从 2027 年 5 月 10 日延长至 2028 年 5 月 10 日。
- **生效日期**：2026-05-07
- **宽限期**：none
- **强制日期**：2028-05-10
- **执法日期**：2028-05-10
- **优先级**：MEDIUM
- **受影响仓库章节**：docs/GLOBAL-REGULATORY-2026.md section 2.8, references/guidelines/by-app-type/health-fitness-and-medical.md

### ID: US-CO-SB26-051-AGE-SIGNAL-2028

- **辖区**：科罗拉多州（美国州）
- **法律**：SB26-051（《计算设备年龄证明》，Age Attestation on Computing Devices）
- **要求**：操作系统提供者在账号设置时请求年龄，并暴露实时年龄信号 API。开发者在启动或账号创建时请求该信号。自 2028 年 7 月 1 日起生效，现有设备到 2029 年 1 月 1 日。
- **生效日期**：2028-07-01
- **宽限期**：none
- **强制日期**：2028-07-01
- **执法日期**：2028-07-01
- **优先级**：MEDIUM
- **受影响仓库章节**：docs/GLOBAL-REGULATORY-2026.md section 2.5, references/rules/privacy.md

### ID: JP-APPI-AMENDMENT-2028

- **辖区**：日本
- **法律**：《个人信息保护法》（Act on the Protection of Personal Information）修正案，2026 年 7 月 17 日公布（Act No. 56 of 2026，编号取自二手来源），Act No. 56 of 2026（令和8年法律第56号）
- **要求**：针对修正后的 APPI 重构同意、儿童数据与生物识别处理，包括新增的 16 岁以下门槛（同意、告知与停止使用请求的权利人为法定代理人），以及附加费（surcharge）制度。自公布之日起两年内生效，具体日期由政令确定。经修正的刑罚条款（第 176 条与第 178 至 186 条）依据附则第 1 条第 3 项，自公布之日起满六个月之当日适用；由于该法未写明历日，计算为 2027 年 1 月 17 日。附加费制度则等待公布之日起两年内发布的政令。
- **生效日期**：2028-07-16
- **宽限期**：none
- **强制日期**：2028-07-16
- **执法日期**：2028-07-16
- **优先级**：HIGH
- **受影响仓库章节**：docs/GLOBAL-REGULATORY-2026.md section 3.8, references/rules/privacy.md

### ID: EU-AI-ACT-HIGH-RISK-ANNEX-I

- **辖区**：欧盟（EU）
- **法律**：EU《人工智能法案》（AI Act），Regulation (EU) 2024/1689（经 AI 综合法案（AI Omnibus）修订，2026 年 7 月 27 日生效）
- **要求**：嵌入实体产品中的高风险 AI 系统（附件 I：机械、玩具、电梯等）的合规要求由 AI 综合法案（2026 年 7 月 27 日生效）推迟。日期由 2026 年 7 月 8 日的 Regulation (EU) 2026/1744 设定，已生效，并非提案。
- **生效日期**：2024-08-01
- **宽限期**：48 个月
- **强制日期**：2028-08-02
- **执法日期**：2028-08-02
- **优先级**：HIGH
- **受影响仓库章节**：docs/EU-REGULATORY-2026.md section 1.5, references/guidelines/by-app-type/ai-and-generative-apps.md
