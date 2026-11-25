# 差距分析（2026 年 11 月）

<!-- freshness: 60d -->

本文记录 2026 年 9 月 5 日至 11 月 14 日之间平台与法律层面的变化、本实战手册为此新增了什么，以及哪些内容无法从一手来源读取核实。它沿用 [GAP-ANALYSIS-2026-09.md](GAP-ANALYSIS-2026-09.md) 的方法。下列每一条收录条目都在 2026 年 11 月 14 日于其一手来源上读取核实。凡未能在一手来源读到的内容，一律列在"未经验证"一节，而不是写进规则。下一轮排查应在 2027 年 1 月 13 日之前完成。

## 1. 方法

- Apple：2026 年 9 月 5 日至 11 月 14 日之间的每一条 Apple Developer 新闻帖（21 条，其中 9 月 5 日至 8 日之间没有帖子），以及 Upcoming Requirements 页面。
- Google：时间窗口内的 Play 政策公告（一批，2026 年 10 月 29 日）、Play Policy Deadlines 表格、Android Developers Blog，以及 target API、Billing 弃用与开发者验证页面。
- 法规：四轮区域排查（欧盟与英国、美国、亚太，以及加拿大、澳大利亚、巴西），每轮只返回带日期且附有法规原文引句的条目。gov.ca.gov、ofcom.org.uk 和 esafety.gov.au 在脚本化抓取时拒绝访问或超时，因此这些来源的条目列为未经验证，而不予收录。
- 仓库：每一条发现都先在 `docs/`、`data/` 和 `references/` 中搜索过才落笔，因此 10 月排查已经添加的条目（10 月 16 日的审核指南修订、EU ATT 提示、DSA 商家身份）不会被重复添加。
- 研究轮次返回的每一条发现，在改动数据之前都先在其一手页面上重读核实。有两条与现有条目相矛盾的说法（社交媒体 13+ 规则、iPhone Duo SDK 的适用范围）就是用这种方式核查的，结果证明说法有误，因此现有条目维持不变。

## 2. Apple，已核实的增量

| 变化 | 来源 | 仓库动作 |
|---|---|---|
| 新的年龄分级描述项 Shared Location 与 Dating and Relationships 自 2026 年 11 月 16 日起纳入问卷，每个应用都须在 2027 年 1 月 12 日前作答，Dating 会将年龄分级下限设为 18+ | [yxkh08us](https://developer.apple.com/news/?id=yxkh08us) | APPLE-AGE-RATING-LOCATION-DATING-2027, APPLE.md |
| 原 Developer ID Sub-CA 于 2027 年 2 月 1 日到期，安装包须改用 G2 证书颁发机构重新签名 | [w4atic4c](https://developer.apple.com/news/?id=w4atic4c) | APPLE-DEVELOPER-ID-SUBCA-EXPIRY-2027, PLATFORM-MECHANICS section 1.1 |
| Developer Program License Agreement 于 2026 年 10 月 13 日更新，需要接受 | [17mwd36z](https://developer.apple.com/news/?id=17mwd36z) | APPLE.md |
| 台湾地区标准佣金自 2026 年 10 月 31 日起从 30% 降至 26% | [w9mxlhek](https://developer.apple.com/news/?id=w9mxlhek) | APPLE.md |
| App Review Guidelines 于 2026 年 10 月 16 日修订（2.3.14、2.5.19、1.2 NCII），以及 iOS 27.2 起的欧盟 ATT 替代提示 | [92th7e5i](https://developer.apple.com/news/?id=92th7e5i), [idsft9ai](https://developer.apple.com/news/?id=idsft9ai) | 10 月排查已收录进仓库，无变化 |

已核实但只精确到月份，占位条目保留：社交媒体声明（2026 年 9 月）、上传所需的最低 SDK、以及 iPhone Duo 截图规则（后两项均为 2027 年 4 月）。

## 3. Google Play 与 Android，已核实的增量

以下全部来自 2026 年 10 月 29 日的政策公告与 Play Policy Deadlines 表格。

| 截止日期 | 变化 | 仓库动作 |
|---|---|---|
| 2026 年 12 月 1 日 | 日本支付授权，否则款项将在全球范围被暂扣 | GOOGLE-JAPAN-PAYMENTS-AUTHORIZATION-2026 |
| 2027 年 1 月 27 日 | 基于资格的订阅折扣须披露判定标准、验证方式与资格确认后的价格 | GOOGLE-SUBSCRIPTION-ELIGIBILITY-DISCOUNTS-2027 |
| 2027 年 4 月 14 日 | AppFunctions API 政策 | GOOGLE-APPFUNCTIONS-POLICY-2027 |
| 2027 年 8 月 25 日 | Local Network 与 Manage Contacts 权限声明 | GOOGLE-LOCAL-NETWORK-MANAGE-CONTACTS-2027 |

同一份公告还提到商家身份（trader status）自 2026 年 11 月起须在 Play Console 中申报，仓库对此已有覆盖。Android 开发者验证对全球阶段仍只给出 2027 年、没有具体日期。target API 与 Billing 页面没有变化。

## 4. 法规，已核实的增量

- 欧盟：《Cyber Resilience Act》的漏洞与事件报告义务自 2026 年 9 月 11 日起适用，已收录。欧盟委员会于 2026 年 11 月 11 日提出《Digital Fairness Act》（COM(2026) 1100），将在生效 12 个月后适用，因此目前尚不产生任何义务。EDPB 定稿了 DSA 与 GDPR 相互作用指南，并就罚款指南征求意见至 2026 年 11 月 13 日。
- 英国：《Consumer Subscription Contracts (Cancellation and Information) Regulations 2026》草案给出的日期是 2027 年 1 月 1 日，截至 2026 年 11 月 14 日尚未正式制定。
- 美国：纽约州 S.9051B/A.10379C（2026 年 10 月 28 日签署）禁止面向未成年人的不安全 AI 聊天机器人功能，并要求年龄验证时提供不依赖证件的选项，尚未公布生效日期。FTC 于 2026 年 10 月 1 日就冒充诈骗开启拟议规则制定预告（意见征集至 2026 年 11 月 30 日）。Louisiana Act 502 自 2027 年 1 月 1 日起生效。DOJ 的 ADA Title II 规则仍是临时最终规则，FTC 的 AI 准确性声明仍处于提案阶段。

## 5. 亚太、加拿大、澳大利亚、巴西，已核实的增量

亚太、加拿大、澳大利亚与巴西的区域排查在本轮排查合入时仍在进行。其发现在 2026 年 11 月 15 日的后续变更中落地，每一条都在其一手来源上读取核实。新增内容：韩国的 AI 开发复用规则（Act No. 21910，自 2027 年 3 月 9 日起）、印度尼西亚的 PP TUNAS 自评估截止日期（2026 年 12 月 31 日）、中国 CAC 针对拥有大量未成年受众平台的备案窗口（约 2026 年 11 月 16 日截止）。已在 2026 年 11 月 14 日的 [#659](https://github.com/mjmirza/app-store-compliance/issues/659) 中确认的条目：韩国强制隐私认证（自 2027 年 7 月 1 日起）、日本 APPI 修正案（作为 2026 年第 56 号法律）、以及印度 DPDP 规则 4 的 Consent Manager 日期。

## 6. 未经验证，刻意不予收录

- 2026 年 9 月签署的加州法案（AB 1709：面向 16 岁以下人群的社交媒体；SB 1119：陪伴型聊天机器人；AB 1856：年龄信号；AB 2246：取代 Age-Appropriate Design Code；SB 1000 与 AB 2713：AI 透明度）。一轮研究读取了州长的新闻稿，但本次核查中 gov.ca.gov 拒绝了每一次抓取，且没有一份新闻稿写明生效日期。收录之前请先在 leginfo 上读取已编入法典的文本。
- Ofcom 修订后的《Illegal Content Codes of Practice》（2026 年 10 月 12 日发布，2026 年 11 月 2 日生效）及其分类服务风险评估日期。ofcom.org.uk 对脚本化读取返回浏览器验证挑战，因此相关措辞只是通过搜索索引看到的。
- 英国 16 岁以下社交媒体法规，据报道将于 2026 年 12 月提交议会、2027 年春季生效。仅有二手来源。
- 阿拉巴马州 App Store Accountability Act 的诉讼挑战（CCIA，2026 年 10 月 28 日报道）。未找到案件卷宗。
- 澳大利亚 App Distribution Services Code，现列于 eSafety 在线登记册，从 [#659](https://github.com/mjmirza/app-store-compliance/issues/659) 延续而来。同一 issue 中的韩国 MyData 日期已于 2026 年 11 月 23 日读取核实，并收录为 `KR-PIPA-SELF-TRANSMISSION-2027`。

## 7. 后续跟进（2026 年 11 月 15 日）

第二轮通读了 App Store Connect 发布说明与 Upcoming Requirements 页面的每一行，而第一轮只是粗略浏览过。

| 变化 | 来源 | 仓库动作 |
|---|---|---|
| 自 2027 年年初起，App Store Connect 将不再接受来自新应用或从未使用过该功能的应用、包含 On-Demand Resources 的上传（发布说明，2026 年 11 月 12 日） | [发布说明](https://developer.apple.com/help/app-store-connect/release-notes/) | APPLE-ODR-UPLOAD-BLOCK-2027，APPLE-ODR-DEPRECATED-27 扩充 |
| 上传到 App Store Connect 的 iOS 与 iPadOS 应用必须以 iOS 13 或更高版本为目标 | [Upcoming Requirements](https://developer.apple.com/news/upcoming-requirements/) | APPLE-MIN-DEPLOYMENT-TARGET-IOS13，新增守卫检查 |

已核实但未收录：App Store Connect API 4.6 中 INSTALLS 分析报告的弃用影响的是报表，而非审核。韩国关于将订阅优惠转换为标准付费订阅的同意时间表（2026 年 9 月 30 日）已列入下一轮排查的跟踪清单，因为其详情页在首次读取时加载失败。

## 8. 后续跟进（2026 年 11 月 19 日）

2026 年 10 月 29 日的公告说商家身份自 2026 年 11 月起须在 Play Console 中申报，上文第 3 节把这一句当作已有覆盖处理。公告所链接的 Play Console 页面（answer 17594752）在 2026 年 11 月 19 日读取后，给出了公告没有的两个日期：现有账号须在 2027 年 2 月 1 日前申报商家或非商家身份；面向 EEA 与英国的线上第三方商店（marketplace）展示自 2027 年 3 月 1 日开始。它们分别对应 `GOOGLE-PLAY-TRADER-STATUS-2027` 与 `GOOGLE-PLAY-MARKETPLACE-DISPLAY-2027`。二者不是 2027 年 2 月的技术质量截止日期（`GOOGLE-TECH-QUALITY-FEB-2027`），也不是 Apple 的 DSA 商家义务（`EU-DSA-TRADER-STATUS`）。

## 9. 后续跟进（2026 年 11 月 23 日）

2026 年 10 月 29 日的公告（answer 18100766）还说，自 2027 年 1 月 27 日起，通过电话呼叫进行账号验证将不再是 READ_CALL_LOG 的允许用例，而 SMS User Consent API 是账号验证的一种隐私友好替代方案。上文第 3 节没有记录这一句。Play Console Help 的 answer 10208820 在 2026 年 11 月 23 日读取后给出了相同的日期，并点名 Digital Credentials API（直接使用，或通过构建于其上的验证服务商）以及 SMS Retriever API。该页面的例外情形表格仍将"通过电话呼叫进行账号验证"列为可用，直至 2027 年 1 月 27 日。9 月的差距分析曾记录为 2026 年 8 月 26 日。修正后的截止日期是 `GOOGLE-PLAY-CALL-LOG-VERIFICATION-2027`。
