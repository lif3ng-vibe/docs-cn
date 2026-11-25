# 致谢与来源

这本实战手册站在开源社区的肩膀上。下文的模式都学自这里列出的仓库，我们逐一署名致谢。凡项目使用的许可证要求署名，本页即为该署名。凡项目采用宽松许可证，我们同样致谢，因为这是应当之事。

如果你是其中某个项目的维护者，希望修改措辞或更正链接，请提交 issue。

## 贡献者

| 人员 | 贡献 |
|---|---|
| Omar Albeik ([@omaralbeik](https://github.com/omaralbeik)) | 修正了制裁章节中的叙利亚条目（[#967](https://github.com/mjmirza/app-store-compliance/pull/967)，已并入 [#1001](https://github.com/mjmirza/app-store-compliance/pull/1001)） |
| Akash Sharma ([@akash5852](https://github.com/akash5852)) | 修复了 guard 中 vendor 目录的平台检测，并新增隐私清单（privacy manifest）校验（[#596](https://github.com/mjmirza/app-store-compliance/pull/596)） |

## 我们从中学习的仓库

| 项目 | 作者 | 许可证 | 我们采纳的内容 |
|---|---|---|---|
| [app-store-preflight-skills](https://github.com/truongduy2611/app-store-preflight-skills) | truongduy2611 | MIT | 应用类型清单结构、对 macOS 的覆盖、审核备注模板及其六个小节的完整性要求、未使用 entitlements 检查、Sign in with Apple 的用户体验规则、非必要个人数据规则、订阅披露细节，以及用 asc CLI 拉取 App Store Connect 实时元数据的思路 |
| [appstore-submission-checklist](https://github.com/lukylab/appstore-submission-checklist) | lukylab | CC BY 4.0 | 新应用清单与更新清单的划分，以及隐藏调试功能、scheme 中的 StoreKit 配置、将 CloudKit schema 部署到生产环境、关键词字段填写格式、分阶段发布等具体条目 |
| [app-store-rejections](https://github.com/andrewmcwattersandco/app-store-rejections) | andrewmcwattersandco | 见仓库 | 错误模式文档中的真实具名拒审案例研究 |
| [app-rejection-fixes](https://github.com/jaywcjlove/app-rejection-fixes) | jaywcjlove | MIT | 拒审原因与对应修复方案的相互印证 |
| [AppStoreReviewsAndRejected](https://github.com/hnxyzhw/AppStoreReviewsAndRejected) | hnxyzhw | 见仓库 | Apple 真实拒审邮件措辞、用户生成内容的 24 小时处置时限规则，以及金融应用企业账号规则 |
| [Appstore-Review-Guidelines](https://github.com/aashishtamsya/Appstore-Review-Guidelines) | aashishtamsya | 见仓库 | 早期的审核指南精选结构 |

## 我们引用的工具与参考资料

| 来源 | 提供的内容 |
|---|---|
| [fastlane precheck](https://docs.fastlane.tools/actions/precheck/) | 开源的 App Store 元数据规则集，已采纳为我们的元数据检查 |
| [Play Policy Insights](https://developer.android.com/studio/publish/insights) | Google 在 Android Studio 中自带的策略 lint |
| [google/android-security-lints](https://github.com/google/android-security-lints) | Google 开源的安全 lint 检查 |
| [App Store Review Guidelines History](https://www.appstorereviewguidelineshistory.com/) | 追踪审核指南历年变更的记录站 |
| [lukylab/ios-permissions-descriptions](https://github.com/lukylab/ios-permissions-descriptions) | 权限用途说明字符串示例 |

## 权威一手来源

本实战手册中的每一个事实性论断都能追溯到其中之一。

- [Apple App Store 审核指南](https://developer.apple.com/app-store/review/guidelines/)
- [Apple 开发者新闻](https://developer.apple.com/news/)
- [Google Play 开发者计划政策](https://play.google/developer-content-policy/)
- [Google Play Console 帮助](https://support.google.com/googleplay/android-developer)
