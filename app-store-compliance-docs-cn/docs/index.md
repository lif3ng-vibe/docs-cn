---
title: App Store 与 Google Play 拒审实战手册
description: 如何避开常见的 App Store 与 Google Play 拒审：拒审地图、提交前清单、隐私清单与 Data safety 自检、应用法规截止日期，以及一个在你提交前运行的守卫。
---

# App Store 与 Google Play 拒审实战手册

**先说结论**。大多数拒审都能追溯到少数有案可查的原因：给审核员的演示账号用不了、隐私声明与应用及其 SDK 实际收集的数据不符、缺少应用内账号删除、数字商品绕开了应用内购买，以及一个不完整或占位的构建。本手册把这些有案可查的拒审模式逐条对应到背后的审核规则与修复方法，并附带一个守卫（guard），在你提交前对项目中的选定风险发出提示。

- **124 类拒审模式**，各附审核指南、在你代码中的检测方法与修复方法。
- **112 个已跟踪截止日期**，覆盖 33 个司法辖区与平台范围，包括欧盟 AI 法案、数字服务法案、COPPA 与美国各州年龄法。
- **一个提交前守卫**，可在本地运行，也可内嵌在 Claude Code、Codex、Cursor 等 AI 编码工具中运行。
- **一份诚实的分界**，说明哪些是扫描能证明的、哪些只有人工才能确认，见[扫描能证明什么](WHAT-THE-SCAN-PROVES.md)。扫描干净不等于过审。
- 免费阅读，源码在 [GitHub](https://github.com/mjmirza/app-store-compliance)。

## 从这里开始

| 你的处境 | 该读哪篇 |
|---|---|
| 即将提交 | [提交前清单](PRE-SUBMISSION-CHECKLIST.md) |
| 在 App Store 被拒 | [Apple 拒审地图](APPLE.md) |
| 在 Google Play 被拒 | [Google Play 拒审地图](GOOGLE-PLAY.md) |
| 想申诉 | [根因分析与申诉实战手册](MISTAKE-PATTERNS.md) |
| 在做某一类应用 | [按应用类型的拒审地图](BY-APP-TYPE.md) |
| 在用 Expo、React Native 或 Flutter | [跨平台框架](CROSS-PLATFORM-FRAMEWORKS.md) |

## 法律与截止日期

- [App Store 与 Google Play 应用的无障碍要求](ACCESSIBILITY.md)。营养标签（Nutrition Labels）、TalkBack 与 VoiceOver、ADA 第二章、静态扫描。
- [2026 年欧盟应用法规](EU-REGULATORY-2026.md)。欧盟 AI 法案、数字服务法案商家身份（trader status）、欧洲无障碍法案、DMA。
- [美国与全球法规](GLOBAL-REGULATORY-2026.md)。COPPA、各州应用商店问责法案、英国、澳大利亚、巴西等。
- [法规时间线](REGULATORY-TIMELINE.md)与[裁决登记册](RULING-REGISTER.md)。
- [平台机制](PLATFORM-MECHANICS-2026.md)。公证、Android 开发者验证、目标 API 级别、Play Billing。

## 隐私、安全与支付

- [移动隐私指南](MOBILE-PRIVACY-MONITOR-2026.md)。隐私清单、应用跟踪透明度（App Tracking Transparency）、Google Data safety。
- [移动安全要求](MOBILE-SECURITY-2026.md)。
- [各国开箱与博彩规则](GAMBLING-MATRIX.md)。
- [其他应用商店](OTHER-STORES.md)。

## 常见问题

**为什么我的应用被 Apple 审核指南 2.1 条拒审**？审核员无法完整使用你的应用。通常是演示账号失效、后端宕机、占位内容，或应用内购买没有加载出来。

**我需要隐私清单吗**？需要。凡调用了 required-reason API 的 iOS 应用都需要。Apple 常用 SDK 清单中的 SDK 必须自带清单，作为二进制依赖使用时还要附签名。缺少 API 声明会在上传时触发 ITMS-91053。

**我需要应用内账号删除吗**？需要。Apple 要求删除入口必须从应用内开始；Google 要求应用内提供路径，外加一个供用户申请删除的网页。

**能用 Stripe 替代应用内购买吗**？实物商品和现实世界服务可以。数字商品则取决于店面（storefront）：应用内购买是默认要求，欧盟允许替代支付处理，美国的站外链接规则在 2025 年有所放宽。

**新的 Google Play 账号需要多少名测试者**？2023 年 11 月 13 日之后创建的个人账号，需要先做一次封闭测试——至少 12 名测试者连续 14 天选择加入——才能申请正式版（production）访问权限。

**欧盟 AI 法案会影响我的应用吗**？可能会。第 50 条透明度义务自 2026 年 8 月 2 日起适用；具体哪些义务约束你，取决于你是提供者（provider）还是部署者（deployer）。

来自 X 回复的问题在 [FAQ](FAQ.md) 中作答。更多回答见[完整问题索引](questions.md)与 [Q&A 讨论](https://github.com/mjmirza/app-store-compliance/discussions/categories/q-a)。

## 运行守卫

```bash
git clone https://github.com/mjmirza/app-store-compliance ~/repositories/app-store-compliance
bash ~/repositories/app-store-compliance/scripts/install.sh install
```

维护者：[Mirza Iqbal](https://github.com/mjmirza)。与 Apple 或 Google 无隶属关系。App Store 是 Apple Inc. 的商标，Google Play 是 Google LLC 的商标。

<script type="application/ld+json">
{"@context":"https://schema.org","@type":"SoftwareSourceCode","name":"App Store Compliance Playbook","description":"Open playbook and pre-submission guard to stop App Store and Google Play rejections.","codeRepository":"https://github.com/mjmirza/app-store-compliance","programmingLanguage":["Shell","Python"],"author":{"@type":"Person","name":"Mirza Iqbal","url":"https://github.com/mjmirza","sameAs":["https://twitter.com/MirzaJhanzaib","https://next8n.com"]},"keywords":"App Store rejection, Google Play rejection, app review guidelines, privacy manifest, Data safety, account deletion, EU AI Act, COPPA"}
</script>
