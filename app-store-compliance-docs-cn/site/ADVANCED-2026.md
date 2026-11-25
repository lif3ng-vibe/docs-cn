# 进阶与 2026 执法层

本文档补齐基础拒审映射未覆盖的空白。它基于对基础实战手册的一次十角色对抗式评审构建（独立开发者、企业负责人、Apple 审核员视角、隐私官、金融科技、儿童、游戏、AI、ASO、安全）。基础映射覆盖经典的审核指南编号；本层覆盖现代的上传时执法、提交前的账号前置条件、商店政策之下的法律义务，以及各个领域在 2025 年与 2026 年真正导致拒审的深度细节。

整个层级都建立在一个基本框架上：商店合规不等于法律合规。通过审核并不能让应用符合 GDPR、COPPA 或 EU AI Act。商店只执行其中一个子集，其余由监管机构执行。两者都必须满足。

## 1. Apple 上传时执法（现代第一道墙）

这些检查在你上传二进制文件时进行，早于人工审核员打开应用之前。这些项目出错意味着构建被拒或卡住，永远到不了审核环节。

| 项目 | 它是什么 | 触发拦截的条件 | 修复方法 |
|---|---|---|---|
| 隐私清单（privacy manifest）、PrivacyInfo.xcprivacy | 一个随应用打包的文件，声明应用及其 SDK 收集的数据、跟踪域名，以及使用某些 API 的原因 | 应用使用了 required reason API 却未申报经批准的理由，或打包了缺少已签名隐私清单的常用第三方 SDK | 为应用添加 PrivacyInfo.xcprivacy，并确认列出的每个第三方 SDK 都自带已签名的清单。保持 SDK 版本为最新，确保已签名的清单存在 |
| 必需理由 API（Required Reason APIs） | 一组明确定义的 API（文件时间戳、系统启动时间、磁盘空间、user defaults、活跃键盘），需要申报经批准的理由代码 | 使用了这些 API 却没有 NSPrivacyAccessedAPITypes 条目，或理由代码与实际用途不符 | 在隐私清单中为每个必需理由 API 申报一个经批准的理由代码 |
| 跟踪域名 | 清单中的 NSPrivacyTrackingDomains | 某个执行跟踪的域名被访问却未列入清单，同时 ATT 同意也未被授予 | 列出所有跟踪域名，并以 ATT 同意作为门控 |
| 出口合规（export compliance）、ITSAppUsesNonExemptEncryption | 每个 iOS 构建都必须回答的加密声明 | 不作回答会把构建卡在 Missing Compliance 状态，永远到不了审核 | 在 Info.plist 中设置 ITSAppUsesNonExemptEncryption。对于仅使用 HTTPS 的标准应用，适用豁免答案，从而免去每次提交时的提示 |
| 使用当前 SDK 构建 | Apple 要求新提交必须在年度截止日期前使用较新的 SDK 和 Xcode 构建 | 截止日期之后仍使用旧 SDK 的构建会在上传时被拒 | 在年度截止点之前使用当前要求的 Xcode 和 SDK 构建 |

隐私清单是 2024 年之前的任何检查清单中影响最大的单项新增。它是最常见的现代上传拒审原因，而且在拥有众多供应商 SDK 的企业中扩展性很差，因为每个 SDK 都必须自带已签名的清单。

## 2. 提交前的账号前置条件（连提交都无法进行）

这些问题会直接挡住提交按钮本身，或让应用停留在 Developer Action Needed 状态。它们与构建毫无关系。

| 前置条件 | 拦截原因 |
|---|---|
| Apple Developer Program 注册与身份验证 | 注册验证可能需要数天。个人账号还是组织账号，以及组织所需的 D U N S 号码，必须先解决 |
| Paid Applications Agreement 以及税务和银行信息 | 在协议被接受且税务和银行表单填写完整之前，应用内购买（In-App Purchase，IAP）和付费应用无法进入审核 |
| 《数字服务法》（DSA）下的欧盟商家身份（trader status） | 两家商店都要求在欧盟分发时提供经验证的商家或开发者身份信息。缺少商家信息会阻止欧盟地区上架 |
| 必需的商店素材 | 最大尺寸的 iPhone 截图（若为 iPad 应用还需 iPad 尺寸）、无 alpha 通道或透明度的 1024 像素应用图标，以及符合规范的预览视频。缺少必需尺寸会阻止提交 |
| 元数据字段长度限制 | Apple：名称 30 个字符、副标题 30、关键词字段 100、宣传文本 170、描述 4000。Google：标题 30、简短描述 80、完整描述 4000。超出限制或使用被禁止的装饰会阻止上架 |
| 元数据装饰规则 | 标题中不得使用 emoji 或表情符号；除品牌外不得全大写；标题或图标中不得出现排名或价格类宣称（如“第一”“最佳”“顶级”“免费”）；图标上不得有虚假通知徽章 |

## 3. 应用内购买与支付深度

| 项目 | 开发者容易遗漏的点 | 修复方法 |
|---|---|---|
| IAP 必须创建、关联并随版本一并提交 | IAP 在 App Store Connect 中存在，但未关联到应用版本，审核员找不到它，因而依据 2.3.2 或 2.1 拒审 | 将每个 IAP 关联到应用版本，并在首次审核时随二进制文件一并提交审核 |
| 恢复购买（Restore Purchases） | 非消耗型或非续期型购买没有恢复途径 | 提供可见的“恢复购买”（Restore Purchases）控件。非消耗型项目必须提供 |
| 实体商品不得使用 IAP | Apple 3.1.5(a)。现实世界的商品与服务必须使用 IAP 以外的支付方式。对实体商品使用 IAP 本身就是一条拒审理由 | 实体商品使用外部支付方式，IAP 仅用于数字商品 |
| 外购（external purchase）、反站外引导与 DMA | 基础映射把外部链接视为一个狭窄的地区性 entitlement。2025 与 2026 年的真实图景包括：欧盟《数字市场法》（DMA）的替代支付与第三方商店（marketplace）规则、Epic 诉 Apple 案禁令之后美国的外部链接状态、StoreKit External Purchase API、强制披露页（disclosure sheet），以及 Google User Choice Billing 与替代结算计划 | 把外部支付当作一个分地区的专项计划来对待：需要申请、披露页规则和上报。在依赖它之前，先确认各地区的当前状态 |
| 佣金层级 | Apple Small Business Program 适用降低后的费率，外购或替代结算也有降低的费率层级 | 如果符合条件就加入 Small Business Program，并按地区和计划正确测算费用 |
| 记录商户（merchant of record）与税务 | 外部支付会把税务、退款、拒付（chargeback）、PCI DSS 和强客户认证（SCA）转移到开发者身上 | 如果你采用外部支付，PCI DSS 范围、SCA 与 PSD2 3 D Secure、退款和税务都由你承担 |
| 订阅深度 | 涨价同意、宽限期（grace period）、账单重试、账号保留（account hold）、免费试用与推介优惠（intro offer）披露 | 实现完整的订阅生命周期，而不仅仅是购买环节 |

## 4. 演示账号与审核员的可达性

基础映射说要提供演示账号。真正的失败点在于可达性。

- 演示账号不能藏在审核员无法通过的 2FA 或短信验证之后。请为审核账号禁用或绕过它。
- 凭据不得在审核窗口期内过期。
- 账号必须预置示例数据，让功能可见。
- 后端必须能从 Apple 的审核网络访问。地理 IP 封锁、VPN 要求、白名单或拦截审核员的 WAF 规则，都会被读作一个损坏的应用。
- 对于难以触达的功能，在 App Review Notes 中附上演示视频。

## 5. 设计质量、HIG 与设备类型

Apple 4.0 Design 涵盖了“你的应用看起来是坏的”这一实际类别，而基础映射没有覆盖它。

- 布局损坏、文本截断、内容被刘海、灵动岛（Dynamic Island）或安全区裁切。
- 应用是通用（universal）应用而非标记为仅 iPhone 时，却不支持的方向和糟糕的 iPad 体验。
- 通用应用在 iPhone 上通过审核，却在 iPad 上崩溃或渲染异常。请测试所有支持的设备类型。
- 不遵循基本《人机界面指南》（Human Interface Guidelines）的非原生或未完成 UI。

## 6. 法律层（商店合规不等于法律合规）

| 义务 | 商店政策之外还要求什么 |
|---|---|
| GDPR 合法基础（lawful basis），Article 6 | 每一项处理活动都要有书面的合法基础。同意只是六种之一，并非默认选项 |
| GDPR 告知内容，Articles 13 与 14 | 隐私声明需说明身份、目的、合法基础、接收方、跨境传输、保留期限和权利。仅仅挂着一个链接的隐私政策是不够的 |
| 国际传输，Chapter V | 美国的分析工具和第三方 AI 属于跨境传输，需要传输机制，而不仅仅是披露 |
| ePrivacy 与德国 TTDSG 或 TDDDG | 同意的质量、真正的同意横幅，以及在任何非必要 SDK 加载之前的 SDK 同意门控 |
| 数据处理协议，Article 28 | 与每个处理者签署 DPA，并对每个 SDK 做控制者与处理者的角色分类 |
| DPIA，Article 35 | 对高风险处理活动开展数据保护影响评估 |
| 特殊类别数据，Article 9 | 对健康及类似数据，除商店框架规则之外，还需要明示同意或其他 Article 9 条件 |
| 儿童数字同意年龄，Article 8 | 欧盟数字同意年龄在 13 到 16 岁之间不等，德国为 16 岁。COPPA 的 13 岁以下是美国规则，不是全球规则 |
| 数据主体权利，Articles 15 至 22 | 访问、更正、删除、可携带与反对权，而不只是一个账号删除按钮 |
| EU AI Act | 在欧盟上线的 AI 功能需要履行透明度义务、风险分类和披露要求，并在 2025 与 2026 年间分阶段生效 |
| DSA 商家身份（trader status） | 在欧盟分发需要经验证的商家或开发者身份 |

上面的欧盟义务只是浅层指引。完整的欧盟法律层——针对 EU AI Act（含 2026 年 8 月 2 日的 Article 50 透明度截止日期）、《数字市场法》（DMA）与 Core Technology Fee、DSA 商家身份（trader status），以及《欧洲无障碍法案》（European Accessibility Act，2025 年 6 月 28 日生效）——附有带日期的硬性规则（HARD）与来源，见 [EU-REGULATORY-2026.md](EU-REGULATORY-2026.md)。美国及其他国家的法律层见 [GLOBAL-REGULATORY-2026.md](GLOBAL-REGULATORY-2026.md)。平台机制与较新政策的硬性规则（HARD）——包括 macOS 公证（notarization）、Guideline 4.2 与 4.3、reader apps、法国 ANSSI 加密申报、visionOS、watchOS 与 tvOS 细节、Android 开发者验证、Foreground Service 类型、Play Integrity、Play Billing v8、target API、Health Connect，以及横切的 CSAM、UGC、无障碍、制裁与 PCI 条目——见 [PLATFORM-MECHANICS-2026.md](PLATFORM-MECHANICS-2026.md)。

## 7. 儿童与家庭深度

- COPPA 关键事实：阈值是 13 岁以下。设备 ID、广告 ID、IDFA 或 cookie 等持久标识符，对儿童而言本身就是个人信息。2025 年修订后的 COPPA Rule 收紧了同意与保留要求。
- 可验证的家长同意（verifiable parental consent）：家长门控（parental gate）不等于数据收集的同意。真正的 VPC 是一个独立且更强的步骤。
- 有效的家长门控使用幼儿无法完成的成人操作，并对外部链接和购买进行门控。
- 中立年龄屏与家长门控：混合受众应用使用不会诱导偏低答案的中立年龄屏，然后再做分支处理。
- Apple Kids Category 1.3 禁止行为广告，并要求广告适合相应年龄且经过人工审核，而不是一刀切禁止所有广告。请核对当前措辞。
- Google Families：Play Console 中的受众与内容声明就是触发条件。使用自我认证的广告 SDK 计划，并设置 AdMob 的面向儿童（child-directed）标志。
- 其他制度：教育科技领域的美国 FERPA 与各州学生数据法、英国《儿童法典》（Children's Code），以及加州《适龄设计法典》（Age Appropriate Design Code）。

## 8. 博彩深度

- 模拟博彩与社交老虎机是区别于真钱博彩的独立类别，有各自的年龄分级和地区规则。
- 抽奖（sweepstakes）与双币制 sweeps coins 模式、有现金奖的技巧锦标赛和每日幻想体育，常被当作博彩处理，需要相应的牌照与地域限制。
- 真钱博彩计划的机制：需要 entitlement 或申请、国家白名单，以及免费下载要求。
- 各国的开箱（loot box）与博彩法律矩阵，决定了每个国家的概率披露要求与合法性。
- Google Play 要求做出“应用内购买包含随机物品”（in-app purchases including random items）声明，并对概率披露的位置有具体要求。

## 9. AI 内容政策（2026）

- Google Play 有独立的 AI 生成内容（AI Generated Content）政策。它不在基础映射中，任何生成式应用都必须满足。
- Apple UGC 规则 1.2 适用于 AI 生成的输出（OUTPUT），而不仅仅是用户对用户内容。模型是一个内容来源，需要过滤、举报和屏蔽机制。
- 图像与头像生成的滥用：NSFW、deepfake、换脸（face swap）和“脱衣”生成属于高风险，会导致下架。
- AI 应用的年龄分级现实：能够产生敏感内容的陪伴型或角色 AI，需要相应的年龄分级，以及自残与危机干预防护。
- 套壳 AI（thin AI wrapper）：在第三方模型之上只做一层没有任何附加值的前端，有触发 4.2 与 4.3 的风险，这与网页套壳的情况不同。
- AI 应用的审核员演示账号需要高配额或不限额配额，让审核员能够实际使用该功能。

## 10. 基础映射低估的 Android 细节

| 项目 | 触发条件 | 修复方法 |
|---|---|---|
| 动态代码加载 | 使用 DexClassLoader 或在运行时下载可执行代码 | 所有代码随安装包一起发布。服务器变更属于数据，而不是代码 |
| 软件包可见性（package visibility） | 在没有许可用途的情况下使用 QUERY_ALL_PACKAGES | 声明具体的软件包，或使用许可的用途 |
| 悬浮窗与点击劫持（tapjacking） | 使用 SYSTEM_ALERT_WINDOW 或滥用应用悬浮窗，尤其是与 AccessibilityService 结合使用 | 移除悬浮窗滥用。悬浮窗加无障碍服务的组合是强烈的恶意软件信号 |
| 细粒度媒体权限 | 在 Android 13 及更高版本上申请宽泛的存储权限而非细粒度的照片和视频权限，或滥用“照片和视频权限”（Photo and Video Permissions）政策 | 使用细粒度媒体权限和照片选择器（photo picker） |
| SDK Index | 使用 Google Play SDK Index 中被禁用或被标记的 SDK | 检查 SDK Index 并移除被标记的 SDK |
| 应用内账号与数据删除 | Google 同时要求应用内账号删除和一个网页版数据删除 URL | 提供应用内删除功能，并在商店详情页（store listing）提供公开的数据删除 URL |
| 设备指纹（fingerprinting） | 使用持久标识符或设备指纹跟踪用户 | 两家商店都禁止。Apple 5.1.2 禁止设备指纹，无论是否已获得 ATT 同意 |

## 11. 评分、评论与元数据完整性

- Apple 要求评分提示使用原生 SKStoreReviewController，并禁止评分门控（rating gating）与激励式评论（incentivized reviews）。
- Google 禁止激励式评论、虚假评论和人工刷量安装。
- 在 Apple 关键词字段或 Google 描述中出现竞争者的品牌名或商标，是一项单独列名的拒审理由。
- 图标与截图完整性：图标上不得有促销、价格或排名徽章，不得有虚假通知圆点，不得使用 emoji，不得有误导性的覆盖层、说明文字、应用中不存在的宣称或虚假推荐语。

## 12. 账号删除必须真删

只有在应用内真正删除账号及其数据，才算满足应用内账号删除（in-app account deletion）要求。仅做停用（deactivate）的流程、一个 mailto 链接，或必须离开应用才能触达的网页表单，都不满足要求。用 grep 搜索删除账号相关的符号是必要但不充分的。请确认该流程确实执行了删除。

## 13. 企业分发与账号影响范围

- Apple 受管理渠道：Apple Business Manager 自定义应用（custom apps）、非公开上架（unlisted）应用与内部（in-house）计划各有自己的规则，且不同于公开审核。
- 组织账号的影响范围：同一组织账号下的产品组合共享同一命运。一次严重违规可能导致整个账号被停用。请隔离风险，并把账号层面的处置当作最高严重级事件对待。

## 14. 注意事项与核验

本实战手册映射的是构建日期抓取的 Apple 与 Google 现行政策的结构。有两点必须坦诚说明。

1. 审核指南编号和统计数据会变化。这里的每个审核指南编号都可追溯到 Apple App Store Review Guidelines 页面，每个政策名称都可追溯到 Google Play 政策中心。在对外引用之前，请对照线上来源确认当前的确切编号和任何被引用的数字。已公布的拒审统计数据应视为方向性参考（来自商店透明度报告），而不是经过审计的固定数值。
2. 部分执法行为属于报道，未经官方确认。凡本实战手册描述自动化或 AI 辅助审核之处，请将其视为行业报道而非商店的官方声明。

自动化守卫是必要的，但不是充分的。它使用字符串信号，看不到你的 App Store Connect 设置、隐私清单内容、后端可达性或法律姿态。守卫运行干净只意味着廉价的机械检查通过了。其余部分由人工检查清单和本进阶篇承担。
