# 开源模式。社区已经沉淀成文的规则

已经有人把 App Store 与 Google Play 上来之不易的拒审经历，做成了开源工具和清单。本文档把这些模式收录进来——一直细到次要的元数据规则——并并入本实战手册，让社区学到的东西无一失传。凡是可以自动化的模式，都会加入拒审模式分类（rejection pattern taxonomy）与守卫（guard）。

## fastlane precheck。开源元数据规则集

`fastlane precheck` 是最广为使用的开源工具，能在提交之前抓出 App Store 元数据层面的拒审风险。它的规则，就是社区把"Apple 会在元数据里盯什么"整理成的一份清单。每条规则默认取 error 级别，团队也可以把某条规则改为 warn 或 skip。我们把这个完整规则集采纳为元数据检查。

| precheck 规则 | 能抓到什么 | 对应规则 |
|---|---|---|
| `curse_words` | 应用元数据中的脏话 | Apple 2.3.1（准确且恰当的元数据） |
| `future_functionality` | 描述尚不存在的功能：coming soon（即将推出）、beta，以及占位式的功能承诺 | Apple 2.3.1（误导性营销；隐藏或休眠功能已于 2026 年 10 月 16 日移至 2.5.19） |
| `negative_apple_sentiment` | 提到某个 iOS bug，或对 Apple 做出负面或不敏感的指涉 | Apple 2.3.1 与开发者行为准则（Developer Code of Conduct） |
| `other_platforms` | 在元数据或关键词里提到 Android、Google Play 或其他平台、第三方商店（marketplace） | Apple 2.3.10 |
| `unreachable_urls` | 元数据、支持 URL 或营销 URL 中存在失效或无法访问的链接 | Apple 1.5 与 2.1 |
| `placeholder_text` | 商店详情页里残留 Lorem ipsum 或模板文字 | Apple 2.1 与 2.3.1 |
| `test_words` | 正式上架的详情页里残留 test、demo、sample 之类的词 | Apple 2.1 |
| `copyright_date` | 版权年份已经过期 | Apple 2.3.1 |
| `free_stickers` | 在 sticker（贴纸包）或应用名称里滥用 free 一词 | Apple 2.3.7（元数据） |
| `custom_text` | 团队自行指定要标记的任何单词或短语 | 团队自定义 |

来源：[fastlane precheck 文档](https://docs.fastlane.tools/actions/precheck/) 与 [precheck 介绍文章](https://krausefx.com/blog/introducing-fastlane-precheck)。

教训：很大一部分拒审是由商店详情页里的文字造成的，而不是代码。其中大多数在提交前用一次字符串扫描就能低成本地查出来。

## 值得挖掘的社区拒审模式仓库

这些开源仓库来自真实的开发者，记录的是他们亲身碰到的拒审，以及让应用过审的修复方法。它们是持续更新的活清单，本实战手册的后续贡献可以直接从中取材。

| 仓库 | 收录内容 |
|---|---|
| [aashishtamsya/Appstore-Review-Guidelines](https://github.com/aashishtamsya/Appstore-Review-Guidelines) | 一份精选的提交前审核指南清单，涵盖类别、位置数据、平台提及与误导性内容 |
| [jaywcjlove/app-rejection-fixes](https://github.com/jaywcjlove/app-rejection-fixes) | 记录在案的拒审原因，并逐条附上当时让它过审的解决方案 |
| [hnxyzhw/AppStoreReviewsAndRejected](https://github.com/hnxyzhw/AppStoreReviewsAndRejected) | iOS 审核与拒审问题汇总 |
| [andrewmcwattersandco/app-store-rejections](https://github.com/andrewmcwattersandco/app-store-rejections) | 真实 App Store 拒审案例的社区合集 |
| [lukylab/appstore-submission-checklist](https://github.com/lukylab/appstore-submission-checklist) | 面向新应用与版本更新的实用提交前清单 |
| [truongduy2611/app-store-preflight-skills](https://github.com/truongduy2611/app-store-preflight-skills) | 一个 AI agent 技能，在提交前扫描 iOS 与 macOS 项目中的拒审模式——与本实战手册的技能同一思路 |
| [github/awesome-copilot apple-appstore-reviewer](https://github.com/github/awesome-copilot/blob/main/skills/apple-appstore-reviewer/SKILL.md) | 为 AI 编码工具发布的一个审核员角色（persona）技能 |

模式：整个行业一直在私下反复重学同一批拒审。把它们收进一份开放实战手册并配上自动化守卫，正是本项目要填补的空白。

## Google Play 预发布报告。内置的开放检查

当应用 bundle 上传到测试或生产轨道（track）后，Google 会在测试实验室的真机上安装它、启动它，并抓取运行数分钟。预发布报告（pre-launch report）是 Google 最接近自动化提交前检查的东西，且对所有开发者免费。把一份干净的预发布报告当成发布关卡来对待。

| 领域 | 能查出什么 |
|---|---|
| 稳定性 | 自动化抓取在大量真机上捕获的崩溃 |
| 兼容性 | 使用了不属于公开 Android SDK 的 API |
| 安全与隐私 | 应用及其 SDK 中可能被攻击者利用的漏洞 |
| 无障碍 | 抓取过程中暴露出的无障碍问题 |
| 性能 | 测试实验室设备上的性能问题 |

来源：[预发布报告帮助](https://support.google.com/googleplay/android-developer/answer/9842757) 与 [理解你的预发布报告](https://support.google.com/googleplay/android-developer/answer/9844487)。

教训：先跑封闭测试轨道，并在上生产之前读一遍预发布报告。它能抓住单台设备测试漏掉的设备相关崩溃、非公开 API 使用和安全漏洞。

## 我们采纳进守卫的内容

基于这些开源模式，守卫与拒审模式分类在原有代码级检查之外，新增了与 fastlane precheck 相对应的元数据级检查。

- 详情页中的未上线功能话术，例如 coming soon（即将推出）、beta，或本构建中并未交付却已承诺的功能。
- 对 Apple 的负面情绪，例如在详情页里点名某个 iOS bug。
- 其他平台提及——已有覆盖，此处加以强化。
- 随包发布的资源中的占位与测试用词——已有覆盖。

其余的 precheck 规则（如 curse words 与版权年份）在这里只作为一次人工元数据走查来记录，因为一份安全的自动化词表应当放在各团队自己的配置里，而不是硬编码进共享的守卫。

## Android 这一边。Google 官方与开源工具

Apple 这一边有 fastlane precheck。Android 这一边也有自己的对应物，其中一些来自 Google 官方。

| 工具 | 作用 |
|---|---|
| Android Studio 中的 Play Policy Insights | Google 官方的政策 lint，在近期的 Android Studio 版本中以 lint 检查的形式呈现。它会在你提交前标出可能的政策问题，是 Android 上最接近审核前检查的对应物。来源：[Play Policy Insights](https://developer.android.com/studio/publish/insights) |
| [google/android-security-lints](https://github.com/google/android-security-lints) | Google 开源的安全向自定义 lint 检查，比内置 lint 更偏安全、也更具实验性 |
| Google Play 预发布报告 | 在真机测试实验室里跑的抓取，见上文相应章节 |

三条值得钉牢的 Android 事实，整理自社区清单。

- 目标 API 级别。自 2026 年 8 月 31 日起，新应用与版本更新必须以 Android 16（API 级别 36）或更高为目标。低于该门槛会被自动拒审。
- 包名（即 applicationId）一旦发布便永久固定。慎重选择。
- 启用 R8 或 ProGuard。它能缩小应用体积并加大逆向工程的难度，同时也有助于安全审查。

## 如何与 fastlane 搭配使用

如果团队已经在用 fastlane，就把 precheck 接进 lane、放在 deliver 之前跑，并把本实战手册留给 precheck 覆盖不到的代码级、隐私与政策检查。二者互补：precheck 守住详情页里的文字，本实战手册守住应用本身、隐私姿态与提交设置。
