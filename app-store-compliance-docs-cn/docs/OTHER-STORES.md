# 超越 Apple 与 Google：其他应用商店与值得借鉴的模式

基础实战手册只讲 Apple 与 Google，因为全球大多数应用分发都经由这两家。但一个严肃的移动战略不会只发这两个商店，而那些商店也各自发布自己的审核规则。本文档梳理 Huawei AppGallery、中国 Android 商店、Samsung Galaxy Store、Amazon Appstore、Microsoft Store 与 RuStore 各自执行的要求，再提炼出值得采纳的跨商店共性模式，让同一个错误不在新商店重演。

内容取自各平台自己的开发者文档。在据此行事之前，请先到来源处确认当前细节。

## Huawei AppGallery

华为设备出厂不带 Google Mobile Services，其上的主流商店就是 Huawei AppGallery。官方 AppGallery Review Guidelines 分为四大领域。

| 领域 | 覆盖内容 |
|---|---|
| App Information | 元数据、商店详情页信息准确性、应用名称与描述 |
| App Security | 恶意软件、数据处理、安全审核标准 |
| App Functions | 功能完整性、不崩溃、应用行为与其宣称相符 |
| App Content | 内容政策、受限内容、年龄适宜性 |

最容易坑到 Android 开发者的模式：只针对 Google Mobile Services 构建的应用，在华为设备上会出问题。推送、地图、应用内购买（In-App Purchase，IAP）与定位必须改用 Huawei Mobile Services 的对应能力，否则应用会在审核和运行时双双失败。来源：[AppGallery Review Guidelines](https://developer.huawei.com/consumer/en/doc/app/50104)。

## 中国 Android 商店（华为、腾讯、小米、OPPO、vivo）

中国没有一个统一的 Google Play。分发分散在众多商店之间，而这些商店共享一组与应用内容无关的全国性法律门槛。任何一条没过，应用就无法在其中任何一家上架。

| 门槛 | 内容 |
|---|---|
| MIIT 应用备案 | 每个应用都必须在工业和信息化部登记，自 2023 年 9 月 1 日起为发布前的强制要求 |
| 软件著作权证书 | 政府对应用著作权的认证，提交时必需。官费大致在 2,200 至 3,200 CNY |
| ICP 备案 | 应用访问的每个域名都必须持有有效的 ICP 备案 |
| 合规托管 | 应用后端必须运行在获批准的中国云服务商上 |
| 境内法律实体 | 只有境内法律实体才能发布。海外公司需设立中国实体，或与持牌分发商合作 |
| 办理时长 | 仅 ICP 备案一项就需约 20 个工作日 |

共性模式：在中国，真正的约束是市场准入合规，而不是构建本身。一个完美的应用，如果没有备案、没有著作权证书、没有境内实体，就无法发布。来源：[AppInChina 应用备案指南](https://appinchina.co/blog/the-complete-guide-to-chinas-mobile-app-filing/)、[TMO Group ICP 指南](https://www.tmogroup.asia/insights/china-icp-license/)。

## Samsung Galaxy Store

| 规则 | 触发条件 |
|---|---|
| 禁止抄袭 | 抄袭已发布应用的某些方面 |
| 禁止应用内下载其他应用 | 在应用内提供其他应用的下载 |
| 禁止 Samsung 标识 | 展示 Samsung 标识或暗示与 Samsung 存在关联 |
| 遵守当地法律 | 不遵守发布所在国家的法律要求与当地习俗 |
| 用户生成内容 | UGC 缺少内容过滤、知识产权纠纷处理途径，以及用户举报内容的渠道 |

来源：[Samsung Galaxy Store 分发指南](https://developer.samsung.com/galaxy-store/distribution-guide.html)。

## Amazon Appstore

| 规则 | 触发条件 |
|---|---|
| 真实价值 | 应用只是一个单薄的网站、歌曲、电影或书籍，没有附加价值 |
| 稳定性 | 无法启动、频繁崩溃或有明显缺陷 |
| 自动加人工审核 | 先做恶意软件与政策的自动检查，再进行人工内容与功能审核 |

Amazon 发布了提交前清单与测试标准，与 Apple 和 Google 的清单形态相同。来源：[Amazon 提交前清单](https://developer.amazon.com/docs/app-submission/presubmission-checklist.html)、[Amazon 测试标准](https://developer.amazon.com/docs/app-testing/test-criteria.html)。

## Microsoft Store

| 规则 | 触发条件 |
|---|---|
| 认证标准 | 产品未达到 Store 认证标准 |
| 有用且契合 | 产品并非真正有用，或与 Store 定位不契合 |
| 认证报告 | 未通过时，Microsoft 会返回一份认证报告，说明技术或政策原因 |

认证最多需要约三个工作日。来源：[避免常见的认证失败](https://learn.microsoft.com/en-us/windows/apps/publish/publish-your-app/avoid-common-certification-failures)。

## RuStore（俄罗斯）

一家有国家背景的 Android 商店，俄罗斯法律正日益要求设备对其提供支持。

| 规则 | 触发条件 |
|---|---|
| 语言 | 应用必须使用俄语或英语，或提供切换到其中之一的选项。否则审核无法进行，申请会被拒绝 |
| 设备适配 | 在现代设备上出现报错或布局错乱 |
| 用户生成内容 | UGC 未定义何为不当内容，且缺少事前审核或基于投诉的事后审核 |
| 禁用的权限 | 保护级别为“不供第三方应用使用”（not for use by third party applications）的权限会在上传时被拒 |
| 敏感权限 | 敏感权限需要逐项说明理由 |
| 安全扫描 | 应用会经 Kaspersky 扫描，外加一道人工审核环节。审核通常在约一小时之内完成 |

来源：[RuStore 应用审核指南](https://www.rustore.ru/help/en/developers/publishing-and-verifying-apps/requirement-apps)。

## 我们采纳的跨商店共性模式

这些是每个商店都在传授的教训，已融入我们面向任何平台的构建方式。

1. 市场准入是与构建相互独立的一道门槛。中国用应用备案、著作权证书、ICP 备案和境内实体把这一点讲得最明白。瞄准新市场之前，先列出它的法律门槛。
2. 同一个二进制包很少能通过所有商店。华为要求用 Huawei Mobile Services 替代 Google Mobile Services。从一开始就按商店规划 SDK 替换。
3. 本地化可能是一道审核门槛，而不是锦上添花。RuStore 会拒绝它读不懂的应用。请提供商店接受的语言。
4. 永远不要展示或暗示与商店运营方存在关联。Samsung 禁止 Samsung 标识，Apple 禁止暗示获得 Apple 背书。把这条当作普适规则。
5. 每个商店都要求逐个权限说明理由。RuStore 与华为把它写得明明白白。同一套最小化与理由说明纪律对所有商店都适用。
6. 每个商店拒审时都会给出理由。Microsoft 的认证报告、Apple 的 Resolution Center、Google 的政策邮件。读一遍被引述的理由，修掉它，回复一次。绝不要盲目重新提交。
7. 用户生成内容总是需要过滤、举报与屏蔽。Apple、Google、Samsung 与 RuStore 都有此要求。审核机制只建一次，即可满足所有商店。
8. 相对单薄套壳的真实附加价值是普适要求。Apple 4.2、Google 的最低功能性要求与 Amazon 都会拒绝套壳网站。

## 这些模式如何汇入守卫

Apple 与 Google 的检查仍是自动化守卫（guard）的核心，因为它们覆盖的应用最多。上文这些模式记录在此，是为了让项目面向华为、中国商店、Samsung、Amazon、Microsoft 或 RuStore 时，团队能手工套用对应的门槛；而在检查可自动化的地方，可以逐步把它加入拒审模式分类（rejection pattern taxonomy）。欢迎提交能新增按商店检测的贡献。
