# GLOSSARY — App Store Compliance Playbook 汉化术语表

> 翻译规范基线：意译；术语首次出现附英文原词「知识图谱（knowledge graph）」；产品名/工具名不译；
> 中文全角标点；中英文/数字之间一个半角空格；引号用 ""；破折号——不带空格。
> 本表是并行子代理的注入材料与终检的 grep 清单。终检定稿后回写「终检补充」表。

## 不译名单

App Store、Google Play、Apple、App Store Connect、Play Console、Xcode、iOS、iPadOS、watchOS、
tvOS、visionOS、macOS、Android、Expo、React Native、Flutter、SDK、API、WCAG、COPPA、DSA、DMA、
GPSR、EAA、PIPL、BIPA、CPRA、PECR、GDPR、UK GDPR、DPIA、GPAI、CSAM、ANPD、IMDA、CAC、MIIT、
ICP、FTC、ICO、CADE、ADPLA、StoreKit、entitlement、SDK 条款（如 `com.apple.developer.*`）、
法条编号（如 Regulation (EU) 2024/1689、740 ILCS 14、16 CFR Part 312）、指南编号（Guideline 2.3.1）、
产品/工具/代码名（PrivacyInfo.xcprivacy、ExternalPurchaseCustomLink、PendingRefundReviewNotification 等）。

## 核心术语

| 英文 | 中文 |
|---|---|
| rejection | 拒审 |
| rejection pattern | 拒审模式 |
| rejection map | 拒审地图 |
| guideline（Apple Review Guidelines 条目） | 审核指南（保留编号：Guideline 2.3.1） |
| playbook | 实战手册 |
| the guard / pre-submission guard | 守卫 / 提交前守卫 |
| submission | 提交 |
| pre-submission checklist | 提交前清单 |
| appeal | 申诉 |
| reviewer | 审核员 |
| app review | 应用审核 |
| demo account | 演示账号 |
| placeholder build | 占位构建 |
| in-app purchase (IAP) | 应用内购买（In-App Purchase，IAP） |
| in-app account deletion | 应用内账号删除 |
| store listing | 商店详情页 |
| storefront | 店面（Apple 地区店面） |
| privacy manifest | 隐私清单 |
| Data safety | 数据安全（Data safety，Google Play 表单） |
| App Tracking Transparency (ATT) | 应用跟踪透明度（App Tracking Transparency，ATT） |
| privacy nutrition label | 隐私营养标签 |
| age assurance | 年龄核验 |
| age verification | 年龄验证 |
| age rating | 年龄分级 |
| age-inappropriate | 不适龄 |
| verifiable parental consent | 可验证的家长同意 |
| guardian consent | 监护人同意 |
| trader status | 商家身份（trader status） |
| deadline | 截止日期 |
| effective date | 生效日期 |
| grace period | 宽限期 |
| enforcement date | 执法日期 |
| mandatory date | 强制日期 |
| jurisdiction | 司法辖区 |
| law / act / regulation | 法律 / 法案 / 条例 |
| enforcement | 执法 |
| compliance | 合规 |
| notarization | 公证 |
| target API level | 目标 API 级别 |
| loot box | 开箱（loot box） |
| gambling | 博彩 |
| wagering | 投注 |
| consent | 同意 |
| opt-in / opt-out | 选择加入 / 选择退出 |
| tracking pixel | 跟踪像素 |
| device fingerprinting | 设备指纹 |
| data minimisation / minimization | 数据最小化 |
| retention | 保留期 / 数据留存 |
| breach | 泄露（数据泄露）；违规（政策违规视语境） |
| notice-and-removal | 通知—删除 |
| non-consensual intimate imagery | 未经同意的亲密影像 |
| account deactivation | 账号停用 |
| scan | 扫描 |
| static scan | 静态扫描 |
| false positive | 误报 |
| waiver | 豁免 |
| fleet | 应用矩阵（fleet） |
| fleet sweep | 应用矩阵扫描 |
| rules / references | 规则 / 参考资料 |
| UGC (user-generated content) | 用户生成内容（UGC） |
| livestream | 直播 |
| minor | 未成年人 |
| biometric identifier | 生物识别标识符 |
| workaround | 变通做法 |
| trigger | 触发条件 |
| fix | 修复方法 |
| Prohibited Practices | 禁止行为（EU AI Act 第 5 条） |
| Transparency Obligations | 透明度义务 |
| AI literacy | AI 素养 |
| design code | 设计准则 |
| accountability act | 问责法案 |
| age-appropriate | 适龄 |
| safe harbor | 安全港 |
| chargeback | 拒付（chargeback） |
| service fee | 服务费 |
| marketplace（第三方商店） | 第三方商店（marketplace） |
| alternative distribution | 替代分发 |
| commission | 佣金 |
| entitlement | entitlement（iOS 权限声明，不译） |
| steering / out-of-app offers | 站外引导 / 应用外优惠 |
| external purchase | 外购（external purchase，StoreKit 外部购买） |

## 终检补充

（终检时统计各译法文件数，取多数派全文统一后回写本表。2026-11-25 终检回写。）

| 英文 | 定稿译法 | 备注 |
|---|---|---|
| playbook | 实战手册 | 17 篇用「实战手册」；产品/仓库名（App Store Compliance Playbook）保留英文 |
| fleet / fleet sweep | 应用矩阵 / 应用矩阵扫描 | 作为该仓库工具名时保留英文（Fleet Sweep、Waiver Ledger） |
| the guard | 守卫（guard） | 17 篇一致；首次出现附原词 |
| 拒审错误原文 | 逐字保留英文 | questions.md 等处引号内的报错/拒审原文一律不译 |
| docs/X.md section N | 逐字保留 | REGULATORY-TIMELINE 交叉引用 token（94 处一致） |
| 引号 | "" 全站统一 | 「」终检 0 处 |
| CJK 粗体闭合 | 句读/括注移出粗体 | `**……（gloss）**：` 型合法（两侧标点），dist 字面 `**` 为 0 |
