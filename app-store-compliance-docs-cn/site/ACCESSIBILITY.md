# App Store 与 Google Play 应用的无障碍要求

眼下两家商店都不会因为应用缺少 VoiceOver 或 TalkBack 支持而拒审，因此无障碍主要是一项法律义务和质量义务，而不是一道审核关卡。真正的约束压力来自法律——欧盟无障碍法案（European Accessibility Act，EAA）、美国司法部（DOJ）针对美国公共实体的 ADA Title II 规则、英国《平等法案》（Equality Act 2010）——也来自每家商店要求你作出的申报，以及它们自家测试报告向你展示的内容。本文覆盖商店侧的申报与检查、各平台的实现标准、欧盟之外的法律层、如何运行本仓库的静态无障碍扫描，以及第 12 节中本仓库自身的无障碍情况。

下面每一项都在 2026 年 11 月 7 日对照一手来源核验过。无法确认的内容列在第 11 节，并且未写入正文。

## 1. 一张表看懂欧盟层面

欧盟无障碍法案（European Accessibility Act，EAA，即指令 Directive (EU) 2019/882）在[欧盟法规文档的第 4 节](EU-REGULATORY-2026.md#4-european-accessibility-act-eaa-directive-eu-2019882-hard-new-gap)中有完整覆盖。义务要点如下。

| 义务 | 对应用意味着什么 | 规定出处 |
|---|---|---|
| 适用范围 | 自 2025 年 6 月 28 日起，对适用范围内的消费类服务生效，包括电子商务、银行、电子书、交通票务、电信和视听媒体访问，经由网站与移动应用交付 | 欧盟文档第 4.1 节 |
| 微型企业豁免 | 员工少于 10 人且营业额或资产负债总额不超过 2,000,000 欧元；仅适用于服务类企业（Article 4(5)） | 欧盟文档第 4.2 节 |
| 技术标准 | 协调标准 EN 301 549（V3.2.1 版本以 WCAG 2.1 AA 为基础，并新增针对非网页软件的第 11 章）。只做 WCAG 审计覆盖不到第 11 章 | 欧盟文档第 4.3 节 |
| 无障碍信息 | 附件 V（Annex V）要求说明服务如何满足附件 I（Annex I）的要求，发布在条款与条件或同等文档中（Article 13(2)） | 欧盟文档第 4.3 节 |
| 处罚 | 由各成员国自行设定。德国最高 100,000 欧元，另有纠正措施或下架 | 欧盟文档第 4.4 节 |

## 2. Apple 无障碍营养标签

无障碍营养标签（Accessibility Nutrition Labels）是 App Store Connect 中的一项按应用申报，会显示在产品页上。Apple 是这样描述它们的：“这些无障碍营养标签帮助用户在下载之前了解一款应用对他们而言是否无障碍，并让开发者有机会更好地告知和教育用户，说明其应用支持哪些功能。”

### 2.1 可声明的九项功能

| 功能 | Apple 的平台说明 |
|---|---|
| VoiceOver | |
| Voice Control | 在 Apple TV 与 Apple Watch 上不支持 |
| Larger Text | 在 Mac 上不支持 |
| Dark Interface | |
| Differentiate Without Color Alone | |
| Sufficient Contrast | |
| Reduced Motion | |
| Captions | |
| Audio Descriptions | |

这些标签会显示在运行 iOS 26、iPadOS 26、macOS 26、tvOS 26、visionOS 26 和 watchOS 26 及更高版本的设备上。你要按应用支持的每台设备分别作答。

### 2.2 现在自愿，日后强制，但无日期

Apple 表示：“起步阶段，提供这些标签将是自愿的。”以及“在成为强制要求之前，你会得到充足的时间和评估资源；但随着时间推移，要向 App Store 提交新应用和应用更新，你将必须共享无障碍支持详情。”Apple 没有公布这一切换的日期。不要引用任何日期。

### 2.3 声明一项功能的门槛

只有当一项功能在整个应用范围内都能正常工作时，才能声明它。Apple 的原文：“要在无障碍营养标签中表明支持某项无障碍功能，用户必须能够仅使用该功能完成你应用的所有常见任务。”Apple 将常见任务定义为用户被期望在应用中完成的主要功能，外加使用任何应用都必需的功能，即首次启动体验、登录、购买和设置。如果已知 bug 会改变上述标准下的答案，Apple 说不要表明支持。

把过度声明当作元数据准确性问题对待。一项已声明的功能如果在登录或购买界面上失灵，就是产品页上的虚假陈述。

### 2.4 如何发布

- 角色：Account Holder（账号持有人）、Admin（管理员）、Finance（财务）、App Manager（App 经理）或 Marketing（市场营销）。
- 路径：Apps（应用），选择你的应用，侧边栏中的 App Accessibility，Get Started，按设备逐一添加支持情况，选择相应功能，保存为草稿，然后 Publish（发布）。
- 你只能为已在 App Store 上有线上版本的设备发布支持声明。
- 已发布的内容会立即上线，但可能需要最多 24 小时才对所有用户可见。Apple 的帮助页面并未说明发布要经过应用审核。
- 产品页上可选的无障碍 URL 可以承载更多细节，例如应用内的无障碍设置、字幕语言，或应用中不支持某项功能的区域。

参考资料：[无障碍营养标签概览](https://developer.apple.com/help/app-store-connect/manage-app-accessibility/overview-of-accessibility-nutrition-labels/)、[管理无障碍营养标签](https://developer.apple.com/help/app-store-connect/manage-app-accessibility/manage-accessibility-nutrition-labels/)。

## 3. Apple 审核指南与无障碍

现行的审核指南（App Review Guidelines）中没有任何一条要求应用支持 VoiceOver、动态字体（Dynamic Type）或任何其他辅助功能。全文检索了 accessibility、accessible、VoiceOver、assistive 和 disability。唯一一次在残障含义上使用该词的地方是 Guideline 3.2.1(ii)，它把无障碍列为“收集第三方应用”类应用的获批需求之一：“展示或推荐专为特定获批需求（如健康管理、航空、无障碍）设计的第三方应用合集。”

其余命中的地方，“accessible” 意为“可达的”，而不是“残障人士可用的”。Guideline 2.3.1(a) 要求新功能“便于审核（accessible for review）”，Guideline 5.1.1(i) 要求隐私政策链接“位于应用内且易于访问（easily accessible）”。

因此，无障碍并没有作为功能要求进入应用审核。它通过第 2 节的营养标签和第 6、7 节的法律抵达商店。

参考资料：[App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)。

## 4. iOS 与 iPadOS 实现清单

本节中的数字与措辞来自 Apple 人机界面指南（Human Interface Guidelines，HIG）的无障碍页面。API 名称对照 Apple 的文档索引核对过。

| 领域 | 要做什么 | API 与数字 |
|---|---|---|
| VoiceOver 标签 | 给每个可交互元素和每张信息性图片一个说明其用途的标签。把装饰性图片标记出来，让 VoiceOver 跳过它们 | `accessibilityLabel`、`accessibilityHint`、`accessibilityTraits`（UIKit）、`.accessibilityLabel(_:)`、`.accessibilityHint(_:)`、`.accessibilityAddTraits(_:)`、`.accessibilityHidden(_:)`、`Image(decorative:)`（SwiftUI） |
| 语音控制（Voice Control） | 给元素打上标签，让语音命令能够指向它们。在可见标签过长或含糊时提供替代名称 | `accessibilityUserInputLabels`（UIKit）、`.accessibilityInputLabels(_:)`（SwiftUI） |
| 更大字体（Larger Text） | HIG 要求允许用户把文字放大“至少 200%（watchOS 应用中为 140%）”。iOS 与 iPadOS 的默认与最小系统字号分别是 17 pt 和 11 pt | `UIFont.preferredFont(forTextStyle:)` 搭配 `adjustsFontForContentSizeCategory`，SwiftUI 文字样式如 `.body` |
| 对比度 | HIG 最低比值：不超过 17 pt 的文字为 4.5:1，18 pt 及以上的文字为 3:1，粗体文字为 3:1。如果默认配色不达标，在开启“增强对比度”时提供更高对比度的配色，并同时检查浅色与深色外观 | `UIAccessibility.isDarkerSystemColorsEnabled`、系统颜色与资源目录颜色 |
| 仅靠颜色 | 不要只靠颜色传递含义 | `accessibilityDifferentiateWithoutColor`（SwiftUI environment） |
| 减弱动态效果（Reduce Motion） | 该设置开启时，减少“自动且重复的动画，包括缩放（zooming）、尺寸变化（scaling）与周边运动”。HIG 建议用淡入淡出替代 x、y、z 轴的位移过渡 | `UIAccessibility.isReduceMotionEnabled`、`accessibilityReduceMotion`（SwiftUI environment） |
| 触控目标 | HIG 针对 iOS 与 iPadOS 的表格：默认控件尺寸 44x44 pt，最小 28x28 pt。给带边框（bezel）的元素四周增加约 12 点的留白，给无边框元素四周增加约 24 点 | 布局约束、`contentShape` |
| 字幕与音频描述 | 不要仅通过音频传递对话或重要信息。提供字幕（captions、subtitles）与音频描述 | AVFoundation 媒体选择、`AVMediaCharacteristic.describesVideoForAccessibility` |

44x44 pt 是 HIG 的默认控件尺寸，28x28 pt 是 HIG 的最小值。请按 44x44 pt 规划触控目标。WCAG 2.2 成功标准 2.5.8 Target Size (Minimum) 在 AA 级要求 24×24 CSS 像素，WCAG 2.1 成功标准 2.5.5 Target Size 在 AAA 级要求 44×44 CSS 像素。

用真实的辅助技术（VoiceOver、语音控制、最大档位的更大字体）对每一项已声明的功能做端到端测试，覆盖首次启动、登录、购买和设置流程，因为这些正是 Apple 标签标准所指的常见任务。

参考资料：[Apple HIG 无障碍](https://developer.apple.com/design/human-interface-guidelines/accessibility)、[WCAG 2.2 Understanding SC 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)、[WCAG 2.1 Understanding SC 2.5.5](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)。

## 5. Android 与 Google Play

### 5.1 实现

| 领域 | Android 文档怎么说 |
|---|---|
| 内容标签 | 描述每个 UI 元素的用途，通常写在 `contentDescription` 中。不要给 `Text` composable 或 `TextView` 添加描述，因为 TalkBack 会朗读文本本身。描述中不要包含元素类型（写“提交”，而不是“提交按钮”）。每条描述都应唯一，包括列表中的各项 |
| 装饰性元素 | Compose：对纯装饰性元素将 `contentDescription` 传 `null`，或使用 `hideFromAccessibility`。Views：设置 `android:importantForAccessibility="no"`（要求 minSdkVersion 16 或更高） |
| 触控目标 | 至少 48dp x 48dp。在 Views 中，`paddingLeft` 加 `minWidth` 加 `paddingRight` 必须达到 48dp，高度同理，所以可见尺寸可以小于触控目标。许多内置 Compose 组件，例如 `Button`、`IconButton` 和 `ListItem`，已经强制执行了这一最小值 |
| 文字大小 | `sp` 单位“还会随用户的字体大小偏好缩放。建议在指定字体大小时使用该单位” |
| 对比度 | 小于 18sp 的文字或小于 14sp 的粗体文字至少 4.5:1。其他所有文字至少 3:1 |

### 5.2 测试工具

- TalkBack，内置屏幕阅读器。逐个元素滑动遍历，检查每个元素都可触达、播报能传达用途、主要工作流能够走完。
- Switch Access 与 Voice Access，面向运动障碍输入和语音输入。
- Android Studio 中的 Compose UI Check 模式，会在问题面板中标记低色彩对比度等问题。
- Accessibility Scanner，基于 Accessibility Test Framework，检查内容标签、可点击项、对比度等。Android 文档指出，Android Studio 中的该框架无法检测只在真机上出现的问题。
- Compose 测试 API，读取的语义树与无障碍服务使用的相同。

### 5.3 Play 预发布报告

当你上传到某个发布轨道（release track）时，Google Play 会用 Accessibility Test Framework 运行无障碍测试，并把结果显示在预发布报告（pre-launch report）的 Accessibility 标签页中。类别为触控目标大小（Touch target size）、低对比度（Low contrast）、内容标记（Content labeling）与实现（Implementation，例如遍历顺序与逻辑布局不匹配）。报告还会给出一条发布建议。抓取的两个页面都没有说明无障碍发现会阻断发布，所以把它们当作待修复的发现，而不是关卡。

### 5.4 AccessibilityService 政策

这是 Google Play 唯一实施政策执法的无障碍领域。规则来自 Play 政策页面“Use of the AccessibilityService API”（AccessibilityService API 的使用）。

- 只有旨在帮助残障人士使用其设备的服务才能声明 `isAccessibilityTool`。帮助残障人士必须是主要目的。示例包括屏幕阅读器、基于开关和语音的输入系统，以及基于盲文的访问系统。
- 并非无障碍工具的应用，例如杀毒软件、自动化工具、助手、监控应用、清理工具、密码管理器和启动器，仍可使用该 API，但必须满足显著披露与同意要求。
- 披露必须位于应用内，不能只写在商店描述、网站、隐私政策或服务条款里。它必须是一条单独的披露，说明应用为何需要该 API；同意则需要用户一次明确的主动操作，例如点击接受或勾选复选框。
- 任何让应用能够“自主发起、规划和执行操作或决策”的 Accessibility API 用法都被严格禁止。遵循静态的、由人工定义脚本的确定性、基于规则的自动化不在禁止之列。经验证的无障碍工具在功能服务于核心无障碍目的时可获豁免。该页面没有给出此条款的生效日期。
- 自 2021 年 11 月 3 日起，目标 API 级别为 31 且包含 AccessibilityService 的应用必须在 Play Console 中完成一项申报。无障碍工具需描述一项核心功能、所服务的残障类型和目标用户。其他应用需解释为何需要该 API，以及是否收集或共享个人或敏感数据。两者都须提供一段视频，展示披露流程、同意与不同意的路径，以及一项核心功能。`AccessibilityService_description` 文本不能替代应用内披露。
- 应用对该 API 用法的任何变更都需要重新提交申报。欺骗性或未申报的使用可能导致应用被暂停或账号被终止。

参考资料：[Make apps more accessible](https://developer.android.com/guide/topics/ui/accessibility/apps)、[Make apps more accessible (Views)](https://developer.android.com/guide/topics/ui/accessibility/views/apps-views)、[Dimension resources](https://developer.android.com/guide/topics/resources/more-resources)、[Test your app's accessibility](https://developer.android.com/guide/topics/ui/accessibility/testing)、[预发布报告](https://support.google.com/googleplay/android-developer/answer/9842757)、[Use of the AccessibilityService API](https://support.google.com/googleplay/android-developer/answer/10964491)。

## 6. 美国

### 6.1 ADA Title II：州和地方政府应用（规则已生效，日期已延后）

美国司法部（DOJ）在 28 CFR Part 35 Subpart H 中的规则要求，州或地方政府“提供或使之可用”的网页内容与移动应用必须达到 WCAG 2.1 Level AA。当商业开发者为一个公共实体构建或授权应用时，也会被纳入约束范围。

合规日期被一项 2026 年 4 月 20 日刊登于 Federal Register（联邦公报）的临时最终规则（interim final rule）推迟（FR Doc. 2026-07663），该规则同日生效，意见征集于 2026 年 6 月 22 日截止。

| 公共实体 | 原日期（2024 年规则） | 现行日期 |
|---|---|---|
| 总人口 50,000 或以上 | 2026 年 4 月 24 日 | 2027 年 4 月 26 日 |
| 总人口低于 50,000，以及所有特别区政府 | 2027 年 4 月 26 日 | 2028 年 4 月 26 日 |

该临时最终规则声明其不改变 2024 年最终规则的要求。只有日期变了，WCAG 2.1 Level AA 仍是标准。此后是否有一项最终规则取代了该临时规则，本文未核查，因此在向客户引用这些日期之前，请对照 Federal Register 重新核验。

### 6.2 ADA Title III：向公众开放的企业（无技术法规）

Title III 适用于向公众开放的企业，DOJ 表示“ADA 的要求适用于公共经营场所（public accommodations）提供的所有商品、服务、特权或活动”，包括通过网页提供的那些。DOJ 还表示其“没有一项规定详细标准的法规”，企业“在如何合规方面有灵活性”。DOJ 将 WCAG 与 Section 508 Standards 指为有用的参考。实践中，消费级应用的风险敞口来自诉讼，而非固定的技术规则。把 WCAG 2.1 AA 当作工作目标。本轮没有核验任何判例法，因此此处不引述判例。

### 6.3 Section 508：联邦机构

Section 508“适用于所有联邦机构在开发、采购、维护或使用电子与信息技术之时”。《修订版 508 标准》（Revised 508 Standards）以引用方式纳入 WCAG 2.0 Level A 与 Level AA 并将其适用于软件（E207.2），同时为非网页软件列明了例外，例如成功标准 2.4.1、2.4.5、3.2.3 和 3.2.4。卖给联邦机构或为其构建的应用属于适用范围。

参考资料：[ADA.gov Title II 网页规则情况说明书](https://www.ada.gov/resources/2024-03-08-web-rule/)、[临时最终规则 FR Doc. 2026-07663](https://www.govinfo.gov/content/pkg/FR-2026-04-20/html/2026-07663.htm)、[ADA.gov 关于网页无障碍的指引](https://www.ada.gov/resources/web-guidance/)、[Section508.gov 法律与政策](https://www.section508.gov/manage/laws-and-policies/)、[US Access Board ICT 标准](https://www.access-board.gov/ict/)。

## 7. 英国与加拿大

**英国**：Equality Act 2010 第 29 条适用于“面向公众提供服务的任何人（即 service-provider，服务提供者）”，该人“不得以拒绝向需要服务的人提供服务的方式歧视该人”。第 29(7) 条把“合理调整的义务（a duty to make reasonable adjustments）”施加于服务提供者。该法案未指名任何技术标准，因此对一个面向英国公众的应用而言，WCAG 2.1 AA 是衡量“合理调整”的惯常尺度，而非法定标准。

**加拿大**：《无障碍加拿大法案》（Accessible Canada Act，长标题为“An Act to ensure a barrier-free Canada”）的目标是“在 2040 年 1 月 1 日或之前建成一个没有障碍的加拿大”。该法案第 7 条将其适用于联邦机构，以及在其事业属于联邦立法权限范围内运营的实体，例如银行、电信和跨省运输。适用范围之外的一般消费级应用不在该法案覆盖之列。本文未审阅省级法律。

参考资料：[Equality Act 2010 第 29 条](https://www.legislation.gov.uk/ukpga/2010/15/section/29)、[《无障碍加拿大法案》（Accessible Canada Act）](https://laws-lois.justice.gc.ca/eng/acts/a-0.6/page-1.html)。

## 8. 本仓库的静态无障碍扫描

`scripts/accessibility-audit.py` 是对源文件的静态扫描。它不构建也不运行应用，不计算对比度比值，也看不到焦点顺序或运行时行为。扫描干净只表示它的模式一条都没命中，不代表应用无障碍。请同时用 VoiceOver、TalkBack、Accessibility Inspector 和 Accessibility Scanner 做测试。

### 8.1 如何运行

```bash
python3 scripts/accessibility-audit.py /path/to/your/app
python3 scripts/accessibility-audit.py /path/to/your/app --rule ANDROID-ACCESSIBILITY-SCANNER
bash scripts/accessibility-audit-test.sh
```

目录默认为当前目录。`--rule` 只运行一条规则。测试脚本会跑夹具套件（截至撰写时为 51 个用例），CI 也会跑同一套件。

值得了解的行为。

- 无论发现多少问题，它都以退出码 0 结束，因为这些发现仅供参考。只有遇到未知的 `--rule` 取值才以 2 退出。目录缺失时会打印一条消息并以 0 退出，所以不要把退出码当作门禁。
- 它跳过 `node_modules`、`Pods`、`.git`、`build`、`DerivedData`、`vendor`、`.dart_tool`、`Carthage`、`androidTest`、`__tests__`，以及任何名称以 `Tests` 结尾的目录。
- iOS 文件是 `.swift`、`.m`、`.h`、`.plist`、`.storyboard` 和 `.xib`。Android 文件是 `.kt`、`.java` 和 `.xml`。只有部分规则读取各类型，如下所列。目前没有任何规则读取 `.java`、`.plist`、`.storyboard` 或 `.xib`。
- 输出会逐条列出发现：严重级别、规则 ID、文件与行号、命中的文本、原因和修复方法，最后是按严重级别汇总的计数。

### 8.2 每条规则实际匹配什么

| 规则 ID | 严重级别 | 读取的文件 | 触发发现的条件 |
|---|---|---|---|
| APPLE-ACCESSIBILITY-VOICEOVER | medium | `.swift` | SwiftUI 的 `Image(...)`，既不是 `decorative:` 也不是 `systemName:`，且其后 300 个字符的代码内没有 `accessibilityLabel`、`accessibilityIdentifier`、`accessibilityHidden` 或 `accessibilityElement`。可能是纯图标 `Button`，其 label 只含 `Image(systemName:)` 而没有 `Text`、`Label` 或 `accessibilityLabel`。文件提到 `UIButton` 或 `UIImageView` 但从未出现 `accessibilityLabel`、`accessibilityIdentifier` 或 `isAccessibilityElement`（在第 1 行报告）。SwiftUI 检查会排除注释与字符串内容 |
| APPLE-ACCESSIBILITY-DYNAMICTYPE | medium | `.swift`、`.m`、`.h` | 每一个 `.system(size: N` 字体。在从未设置 `adjustsFontForContentSizeCategory` 的文件里，每一个 `UIFont.systemFont(ofSize: N` |
| APPLE-ACCESSIBILITY-REDUCEMOTION | medium | `.swift`、`.m` | 使用了 `withAnimation` 或 `UIView.animate`，却从不读取 `isReduceMotionEnabled` 或 `accessibilityReduceMotion` 的文件（每个文件一条发现，位于第 1 行） |
| APPLE-ACCESSIBILITY-COLORCONTRAST | medium | `.swift`、`.m` | 在从未引用 `isDarkerSystemColorsEnabled` 或 `darkerSystemColors` 的文件里，带数值参数的 `UIColor(red:`。它并不测量对比度 |
| APPLE-ACCESSIBILITY-HAPTICS | low | `.swift` | 在没有 `FeedbackGenerator`、`CoreHaptics` 或 `CHHapticEngine` 的文件中出现 `.onTapGesture` 或 `Button`。仅供参考，规则标题注明 WCAG 2.2 与 EN 301 549 都不要求触感反馈 |
| APPLE-ACCESSIBILITY-KEYBOARD | medium | `.swift` | 包含 `focusable` 却既无 `FocusState` 也无 `focused` 的文件 |
| ANDROID-ACCESSIBILITY-TALKBACK | medium | `.xml`、`.kt` | 没有 `contentDescription` 的 `<ImageView` 或 `<ImageButton` 开标签。参数缺少 `contentDescription` 的 Compose `Image(...)` |
| ANDROID-ACCESSIBILITY-FONTSCALING | medium | `.xml`、`.kt` | 以 `dp` 为单位的 `android:textSize`。Compose 的 `fontSize = N.dp` |
| ANDROID-ACCESSIBILITY-HIGHCONTRAST | medium | `.xml`、`.kt` | 硬编码十六进制值的 `android:textColor` 或 `android:background`。Compose 的 `Color(0xFF......)` 字面量 |
| ANDROID-ACCESSIBILITY-SCANNER | medium | `.xml`、`.kt` | 介于 1dp 与 47dp 之间的 `layout_width`、`layout_height`、`minWidth` 或 `minHeight`；若文件中任何宽度或高度是 `wrap_content`，则整个文件跳过。低于 48 的 Compose `.size(N.dp)` |

已知缺口，读代码可知。

- XML 的 TalkBack 检查只看 `contentDescription`。一个正确标注了 `android:importantForAccessibility="no"` 的装饰性 `ImageView` 仍会被报告。
- 触控目标检查逐个单独读取尺寸并忽略 padding，而 Android 会把 padding 计入 48dp 目标（见 5.1 节）。`minWidth` 为 40dp、两侧各 4dp padding 的元素会被报告，尽管它符合 Android 的建议。它也不检查元素是否可点击。
- 若干 Apple 规则是文件级的。文件中任何一处引用了正确的 API，就会清掉该文件内所有同类命中。
- README 列出了 Button label 启发式与正则字面量处理的更多局限。

## 9. 审核员与监管者实际检查什么

| 谁 | 检查什么 | 后果 |
|---|---|---|
| Apple 应用审核 | 审核指南中没有任何无障碍功能要求。营养标签目前是自愿的 | 仅审核本身没有后果。虚假标签属于元数据准确性问题 |
| App Store 产品页 | 你的无障碍营养标签，对照常见任务标准 | 用户会看到声明。过度声明就是详情页上的虚假陈述 |
| Google Play 预发布报告 | 触控目标大小、低对比度、内容标记、实现 | 给出发现与发布建议。没有公开声明说它们会阻断发布 |
| Google Play 政策 | AccessibilityService 用法、`isAccessibilityTool` 资格、应用内披露与同意、Play Console 申报、不得自主执行操作 | 欺骗性或未申报的使用会导致拒审、暂停或账号终止 |
| 欧盟市场监管机构 | 适用范围内服务的 EN 301 549 符合性与附件 V 信息 | 按成员国处罚、纠正措施、下架 |
| 美国 DOJ（Title II） | 州或地方政府提供的应用须符合 WCAG 2.1 AA | 对公共实体执法，再通过合同传导给供应商 |
| 美国法院（Title III） | 应用是否让人充分且平等地享受该服务 | 诉讼，无固定技术规则 |
| 美国联邦采购（Section 508） | 机构使用的 ICT 须符合 WCAG 2.0 A 与 AA | 采购要求 |

## 10. 发布前清单

- [ ] 每个可交互元素与信息性图片都有 VoiceOver 标签和正确的 traits。装饰性图片对 VoiceOver 隐藏。
- [ ] 每个 Android 可交互元素都有唯一、基于用途的 `contentDescription`，装饰性元素已排除。
- [ ] 文字在 iOS 上随更大字体与动态字体（Dynamic Type）缩放（HIG 要求至少 200%），在 Android 上使用 `sp`，且布局在最大字号下不破版。
- [ ] 文字对比度在浅色与深色外观下都达到 4.5:1（大字为 3:1），且含义从不只依赖颜色。
- [ ] 减弱动态效果得到遵守，非必要动画被削减或以淡入淡出替代。
- [ ] 触控目标在 iOS 上为 44x44 pt，在 Android 上至少 48dp x 48dp，含 padding。
- [ ] 视频与音频内容配有字幕，在画面承载信息处配有音频描述。
- [ ] VoiceOver、语音控制与 TalkBack 能走完首次启动、登录、购买和设置。
- [ ] 无障碍营养标签只声明通过常见任务标准的功能，逐设备判断。
- [ ] Play 预发布报告的 Accessibility 标签页已审阅，其发现已修复或有合理保留理由。
- [ ] 任何 AccessibilityService 用法都有正确的 `isAccessibilityTool` 取值、必要时的应用内披露与明确同意、一份最新的 Play Console 申报，且没有自主执行操作。
- [ ] 对欧盟适用范围内的服务，[欧盟法规文档](EU-REGULATORY-2026.md)中的 EN 301 549 与附件 V 各项已满足。
- [ ] 为美国州或地方政府构建的应用，已按现行 Title II 日期规划 WCAG 2.1 AA 符合性。
- [ ] 已运行 `python3 scripts/accessibility-audit.py`，每条发现已修复或记录为误报。

## 11. 未核实与未收录的内容

- Apple 无障碍营养标签变为强制的日期。Apple 没有公布。
- App Review 是否会就误导性的营养标签联系开发者，以及依据哪条指南。抓取的两个 Apple 帮助页面都没有这么说，所以上文没有写。
- Play 预发布报告的无障碍发现是否影响发布建议或阻断发布。
- Play 禁止通过 Accessibility API 自主执行操作这一条款的生效日期。
- 是否有一项最终的 ADA Title II 规则取代了 2026 年 4 月的临时最终规则。
- ADA Title III 的判例法与诉讼量。
- 英国公共部门无障碍条例与加拿大省级法律。

## 12. 本仓库自身的无障碍

GitHub 会按 `.github`、仓库根目录、`docs` 的顺序读取 `ACCESSIBILITY.md` 文件，并将其作为仓库的 Accessibility 标签页展示。GitHub 把这个文件描述为记录项目“无障碍优先级、支持的环境、已知障碍”以及反馈流程的地方。本节就是本仓库的这一页。

**已发布的内容**：Markdown 文档、一个由 `docs/` 用 Jekyll Primer 主题构建的 GitHub Pages 站点，以及用 Python 和 Bash 编写、输出纯文本的命令行脚本。

**优先级**：每篇文档都按顺序作为纯 Markdown 阅读，使用真实的标题、文字链接和带表头行的表格。脚本输出是按行组织的文本，理解结果不需要颜色码。

**已知障碍**：

- 多篇文档使用宽表格，屏幕阅读器朗读起来很慢，而且在窄屏上要横向滚动。
- Pages 站点与脚本输出尚未用 VoiceOver、NVDA 或 JAWS 测试过，两者也都未作 WCAG 符合性声明。

**报告障碍**：在 [mjmirza/app-store-compliance](https://github.com/mjmirza/app-store-compliance/issues) 上开一个 issue。涉及脚本时，请使用守卫（guard）或监控（monitor）bug 模板，并附上命令及其输出。如果愿意，请说明你使用的辅助技术。

参考资料：[创建默认社区健康文件](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/creating-a-default-community-health-file)、[为仓库添加无障碍页面](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/adding-an-accessibility-page-to-your-repository)。

## 参考资料

| 来源 | URL | 核验日期 |
|---|---|---|
| Apple，无障碍营养标签概览 | https://developer.apple.com/help/app-store-connect/manage-app-accessibility/overview-of-accessibility-nutrition-labels/ | 2026-11-07 |
| Apple，管理无障碍营养标签 | https://developer.apple.com/help/app-store-connect/manage-app-accessibility/manage-accessibility-nutrition-labels/ | 2026-11-07 |
| Apple，《审核指南》（App Review Guidelines） | https://developer.apple.com/app-store/review/guidelines/ | 2026-11-07 |
| Apple，人机界面指南：无障碍 | https://developer.apple.com/design/human-interface-guidelines/accessibility | 2026-11-07 |
| Apple 开发者文档（第 4 节中的 API 名称） | https://developer.apple.com/documentation/ | 2026-11-07 |
| W3C，理解成功标准 2.5.8 Target Size (Minimum) | https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html | 2026-11-07 |
| W3C，理解成功标准 2.5.5 Target Size | https://www.w3.org/WAI/WCAG21/Understanding/target-size.html | 2026-11-07 |
| Android，让应用更无障碍 | https://developer.android.com/guide/topics/ui/accessibility/apps | 2026-11-07 |
| Android，让应用更无障碍（Views） | https://developer.android.com/guide/topics/ui/accessibility/views/apps-views | 2026-11-07 |
| Android，Dimension 资源 | https://developer.android.com/guide/topics/resources/more-resources | 2026-11-07 |
| Android，测试你的应用的无障碍 | https://developer.android.com/guide/topics/ui/accessibility/testing | 2026-11-07 |
| Google Play，预发布报告 | https://support.google.com/googleplay/android-developer/answer/9842757 | 2026-11-07 |
| Google Play，AccessibilityService API 的使用 | https://support.google.com/googleplay/android-developer/answer/10964491 | 2026-11-07 |
| ADA.gov，Title II 网页规则情况说明书 | https://www.ada.gov/resources/2024-03-08-web-rule/ | 2026-11-07 |
| Federal Register，FR Doc. 2026-07663（govinfo） | https://www.govinfo.gov/content/pkg/FR-2026-04-20/html/2026-07663.htm | 2026-11-07 |
| ADA.gov，关于网页无障碍与 ADA 的指引 | https://www.ada.gov/resources/web-guidance/ | 2026-11-07 |
| Section508.gov，法律与政策 | https://www.section508.gov/manage/laws-and-policies/ | 2026-11-07 |
| US Access Board，ICT 标准与指南 | https://www.access-board.gov/ict/ | 2026-11-07 |
| legislation.gov.uk，Equality Act 2010 第 29 条 | https://www.legislation.gov.uk/ukpga/2010/15/section/29 | 2026-11-07 |
| Justice Laws，《无障碍加拿大法案》（Accessible Canada Act） | https://laws-lois.justice.gc.ca/eng/acts/a-0.6/page-1.html | 2026-11-07 |
| GitHub Docs，创建默认社区健康文件 | https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/creating-a-default-community-health-file | 2026-11-07 |
| GitHub Docs，为仓库添加无障碍页面 | https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/adding-an-accessibility-page-to-your-repository | 2026-11-07 |

