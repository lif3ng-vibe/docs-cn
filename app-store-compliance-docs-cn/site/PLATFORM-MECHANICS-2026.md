# 平台机制硬性规则（2026）。Apple 与 Android

本文档覆盖平台机制与较新政策的缺口，它们与法律层（[EU-REGULATORY-2026.md](EU-REGULATORY-2026.md)、[GLOBAL-REGULATORY-2026.md](GLOBAL-REGULATORY-2026.md)）以及基础拒审映射并列。这些是基础实战手册未涵盖的、当前常见且会造成阻断的成因。每一项都标注了日期与来源。若干日期与版本会变动，因此在依赖某个数字前，请对照所引来源重新核实。无法对照一手来源确认的条目，在最后一节标注为未经验证（unverified）。

## 1. Apple 平台机制

### 1.1 Mac App Store 之外分发时的 macOS 公证（硬性）

通过 Developer ID 分发的应用（不经过 Mac App Store）必须经过公证（notarization），否则 Gatekeeper 会拦截它。四个步骤如下。构建时为每个可执行文件与 dylib 签名。用 Developer ID 证书签名，并加上安全时间戳与 hardened runtime。用 `xcrun notarytool` 提交并等待票据。用 `xcrun stapler` 钉扎（staple）票据。裸的可执行文件无法直接公证，必须先封装进 ZIP、DMG 或 PKG 容器。

- 原 Developer ID Certification Authority 将于 2027 年 2 月 1 日到期，由其签发的证书自当日起失效。请在此之前从 Developer ID Certification Authority（G2）创建替换证书，并对安装器安装包重新签名。[Apple](https://developer.apple.com/news/?id=w4atic4c)
- hardened runtime 是公证的前提条件（启用该 capability 并声明所需的 entitlement）。
- 签名形式为 `codesign --options runtime --timestamp -s "Developer ID Application: NAME (TEAMID)" <App>`（`--options runtime` 标志即 hardened runtime，`--timestamp` 即安全时间戳）。
- 提交 `xcrun notarytool submit <container> --apple-id ... --team-id TEAMID --password <app-specific-password> --wait`，然后执行 `xcrun stapler staple <App>`。
- 什么会出问题。未钉扎票据的应用在离线 Mac 上无法启动，因为 Gatekeeper 无法获取票据。完全未公证的应用会显示"Apple cannot check it for malicious software"或"app is damaged"对话框，并在更严格的策略下被拦截。

来源：[Apple 对 macOS 软件进行公证](https://developer.apple.com/documentation/security/notarizing-macos-software-before-distribution)、[Apple Developer ID](https://developer.apple.com/developer-id/)、[Apple 自定义公证工作流](https://developer.apple.com/documentation/security/customizing-the-notarization-workflow)。

### 1.2 Guideline 4.2 最小功能与 4.3 垃圾或重复应用（硬性，最主要的拒审类别）

- 4.2 最小功能（Minimum Functionality）。应用须包含使其超越"重打包网站"的功能、内容与 UI。单薄的网页视图或壳套（wrapper）会被拒审。网页技术（WebView、React Native）只有在最终成品具备原生质感与持久价值时才被允许。读起来像未完成的占位或残缺内容会被拒审。
- 4.3(a) 垃圾或重复（Spam or duplicate）。与其他应用提供相同功能集、仅在内容或语言上不同的应用会被视为垃圾应用。提交多个相似应用，或将同一应用反复重打包，都会触发此条。
- 4.3(b) 山寨（Copycat）。克隆或模仿其他开发者的应用。
- 2026 年 6 月收紧。Apple 强化了 4.3，并点名了饱和品类（交友、手电筒、音效、壁纸、简易计时器、算命）。这些品类的新提交不再被接受，除非它们提供实质性不同或改进的体验；Apple 还可能下架这些品类中未更新、未改进或未吸引到用户的既有应用。

来源：[Apple App Review Guidelines（审核指南）](https://developer.apple.com/app-store/review/guidelines/)、[Apple 2026 年 6 月 8 日审核指南更新：4.3(b) 以示例澄清](https://developer.apple.com/news/?id=a233fmpw)、[MacRumors 关于 4.3 饱和品类收紧的报道](https://www.macrumors.com/2026/06/09/app-store-guidelines-low-quality-apps/)。

### 1.3 阅读类应用与 External Link Account Entitlement（Guideline 3.1.3(a)）

阅读类应用（reader app）指以杂志、报纸、图书、音频、音乐或视频为主要功能的应用。可选的 External Link Account Entitlement 允许其包含一个指向开发者自有网站的信息性链接，用于创建或管理账号。资格条件：合资格内容是应用的主要功能；可登录在外部创建的账号；登录后可访问此前购买的内容；使用该 entitlement 期间不得提供应用内购买（In-App Purchase，IAP）；不提供实时的人人对人服务（辅导、医疗、健身）。链接规则，全部为必须满足：链接指向你自有的网站；在默认浏览器的新窗口中打开，而非 web view；使用 https scheme，不带 query 或额外 URL 参数；无重定向；在提交前静态定义于 Info.plist；每页只展示一次，并使用标准 HTML 样式。entitlement 标识符为 `com.apple.developer.storekit.external-link.account`（iOS 16 或更高）。更早版本的系统则必须使用 Apple 的原样模态表单（modal sheet）。

来源：[Apple 阅读类应用（reader apps）](https://developer.apple.com/support/reader-apps/)。

### 1.4 法国 ANSSI 加密申报（ITSAppUsesNonExemptEncryption 之外）

Apple 的出口合规文档矩阵。

| 所用加密 | 所需文档 |
|---|---|
| 仅使用 Apple OS 自带加密 | App Store Connect 中无需任何文档 |
| 使用 Apple OS 未提供的行业标准算法 | 若在法国分发，需在 App Store Connect 上传法国加密申报 |
| 使用 IEEE、IETF 或 ITU 不接受的专有算法 | 需同时上传美国 CCATS 与法国加密申报 |

只有当应用在法国 App Store 上分发时才需要法国申报，在 App Store Connect 中上传，主管机关为 ANSSI。银行（Banking）与医疗（Medical）类应用豁免。Info.plist 中的 `ITSAppUsesNonExemptEncryption` 可避免每次提交都重复回答加密问题。注意：向 BIS 提交的美国年度自分类报告属于 EAR 义务，不是 App Store Connect 的字段，因此它是需要跟踪的外部法律事项，而非商店检查项。

来源：[Apple 加密出口合规文档](https://developer.apple.com/help/app-store-connect/reference/export-compliance-documentation-for-encryption/)。

### 1.5 App Store Connect 中的内容版权声明（对应 Guideline 5.2）

App Store Connect 在每次提交前会询问应用是否包含、展示或访问第三方内容。若是，开发者必须依据应用上架的每个国家/地区的法律持有相应权利，且必须能够向 Apple 提供权利证明（在 App Review 备注中附上佐证文件）。来源：[Apple App Information 参考](https://developer.apple.com/help/app-store-connect/reference/app-information/app-information/)。

### 1.6 visionOS、watchOS 与 tvOS 提交细则

- visionOS App Motion。如果应用包含快速转身或镜头骤变之类的运动内容，需在 App Store Connect 中声明。产品页面随后会为对运动敏感的用户显示运动徽章。
- visionOS Developer Capture。截图与预览须使用 Reality Composer Pro 中的 Developer Capture 功能，而非控制中心的屏幕录制（后者为注视点渲染且分辨率低）。
- SDK 下限，自 2026 年 4 月 28 日起生效。watchOS 应用须以 watchOS 26 SDK 构建，tvOS 应用须以 tvOS 26 SDK 构建，全部使用 Xcode 26，与 iOS 26 和 visionOS 26 同一截止日期。
- SDK 下限，自 2027 年 4 月起。上传必须以 iOS 27、iPadOS 27、tvOS 27、visionOS 27 或 watchOS 27 SDK 或更高版本构建。Apple 只给出月份而未给出日期，在截止日期数据中按 2027 年 4 月 1 日跟踪。macOS 不在 Apple 的清单中。Xcode 27 已于 2026 年 9 月 9 日以 Release Candidate 形式发布。
- 应用完整性（Guideline 2.1）与隐私声明适用于所有平台，包括 watchOS 与 tvOS。各设备的确切截图与素材尺寸请从 App Store Connect 截图规范页面实时获取，因为它们随设备变化。2026 年 9 月 9 日的更新新增了 iPhone Duo（外屏 1398 x 2034，内屏 2007 x 2853）、iPhone 18 Pro Max（1260 x 2736）、iPhone 18 Pro（1179 x 2556）、Apple Watch Ultra 4（422 x 514）与 Apple Watch Series 12（416 x 496）。自 2026 年 10 月 5 日起 App Store Connect 接受 iPhone Duo 截图；自 2027 年 4 月起，任何使用 iOS 27.1 SDK 或更高版本的应用都必须提供（截止日期编号 APPLE-IPHONE-DUO-SCREENSHOTS-REQ）。当前必需的 iPhone 尺寸是：带 Dynamic Island 的 iPhone（中等显示屏）至少一张截图，1179 x 2556 或 1206 x 2622 竖屏；应用支持 iPadOS 时另需至少一张 13 英寸 iPad 截图；watch 截图在所有本地化中统一使用一种尺寸。

来源：[Apple 提交 visionOS 应用](https://developer.apple.com/visionos/submit/)、[Apple SDK 下限（2026 年 4 月 28 日）](https://developer.apple.com/news/?id=ueeok6yw)、[Apple 面向 27 系操作系统开放提交，2027 年 4 月 SDK 下限](https://developer.apple.com/news/?id=k1mtkt1k)、[App Store Connect 截图规范](https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications)、[App Store Connect 发布说明](https://developer.apple.com/help/app-store-connect/release-notes/)。

### 1.7 In-App Events、Custom Product Pages 与提交并发上限

- In-App Events（App 内活动）。同一时间最多 10 个处于上线状态，每个应用最多 15 个通过审核；每一项都作为提交项按审核指南审核。
- Custom Product Pages（自定义产品页）。最多 70 个额外的产品页版本，其元数据独立于应用更新进行审核，但仍受审核指南约束。
- 提交并发。一个平台同一时间最多只能有两个处于审核中的提交：一个含应用版本，另一个含不带版本的条目（活动或自定义产品页）。
- StoreKit External Purchase entitlement 按区域设限。`allowed-regions` entitlement 数组必须与 Apple 授予的 entitlement 一致（欧盟，以及外购（external purchase）场景下的韩国，另有单独的美国外链路径）。要核检的是 entitlement 的存在与配置，而不是费用数字——后者仍在变动。

来源：[Apple In-App Events](https://developer.apple.com/help/app-store-connect/manage-submissions-to-app-review/submit-an-in-app-event/)、[Apple Custom Product Pages](https://developer.apple.com/app-store/custom-product-pages/)、[Apple StoreKit 外购（external purchase）](https://developer.apple.com/documentation/storekit/external-purchase)。

### 1.8 iPhone Duo 适配就绪（折叠屏 iPhone，2026 年 10 月 23 日发售）

截止日期编号 APPLE-IPHONE-DUO-LAUNCH，在 issue #724 中跟踪。iPhone Duo 配备 5.4 英寸外屏与 7.6 英寸内屏，两者由铰链连接，各有一枚前置摄像头，随 iOS 27.1 发布。预订于 2026 年 10 月 16 日开启，2026 年 10 月 23 日发售。Apple 不要求为留在商店而针对 Duo 重新构建，但无视这一形态的应用在它上面会显得排版错乱。

- 构建。用 Xcode 26 或更早版本构建的应用可以运行，但不会延伸到状态栏与摄像头之下。请用 Xcode 27.1（自 2026 年 9 月 18 日起提供 beta）与 iOS 27.1 SDK 构建，其中附带 iPhone Duo 模拟器。测试外屏、完全展开的内屏、部分折叠的内屏，以及每个旋转方向。
- 自适应尺寸，绝不预设尺寸。使用 size class（外屏为 compact width，内屏为 regular width）与 scene 或容器边界。Apple 表示不要用 `userInterfaceIdiom` 或 `UIInterfaceOrientation` 做布局决策，也不要依据固定的 iPhone 尺寸或屏幕尺寸来设定视图大小。
- 保留区域。外屏前置摄像头始终遮挡内容，内屏前置摄像头在启用时遮挡，折叠区域在部分展开时会分割内屏。系统容器（split view、导航栈、sheet、alert、上下文菜单）会自行适配。自定义视图在 SwiftUI 中从 geometry proxy、在 UIKit 中从视图读取 `ReservedRegion`，并把内容移出这些区域。`ArrangementView`（SwiftUI）与 `UIArrangementViewController`（UIKit）可围绕折叠区排布主、副两个视图。
- 纵向栏。在外屏上，以及内屏的尾随（trailing）视图上，系统会把导航栏、工具栏与标签栏沿侧边纵向呈现。只有通过 `NavigationStack`、`NavigationSplitView` 或导航控制器提供的栏才会如此；手工构建的 `UIToolbar`、`UINavigationBar` 或 `UITabBar` 不会。既有标题又无图标、或使用自定义视图的工具栏项永远不会纵向显示，因此请为每一项同时提供图标与标题。
- 每种姿态下功能一致。控件可以移动或溢出，但无论手机展开还是合上，同样的控件与内容都必须可达。游戏可以锁定方向，但随姿态变化必须填满显示屏。
- 相机应用。开合或旋转手机可能把应用移到另一块屏幕，并改变当前启用摄像头的朝向。请按朝向选择摄像头。
- App Store 素材。已有截图规范（外屏 1398 x 2034，内屏 2007 x 2853，两种方向均可）。自 2026 年 10 月 5 日起，App Store Connect 接受针对 iPhone Duo 优化的应用与 Duo 截图；带 Duo 截图的产品页会显示"已针对 iPhone Duo 优化"徽章；App Store Connect 中的预览工具可展示截图与元数据在 Duo 上的效果。自 2027 年 4 月起，任何使用 iOS 27.1 SDK 或更高版本的应用都必须提供 iPhone Duo 截图（截图规范页面把该规则限定于此 SDK），按 2027 年 4 月 1 日跟踪为 APPLE-IPHONE-DUO-SCREENSHOTS-REQ，因为 Apple 只给出月份。尚未发布任何针对 Duo 的 App Review 审核指南，因此本手册也不执行任何此类要求。在声称存在此类指南之前请先复核。

来源：[Apple Newsroom：iPhone Duo 发布公告](https://www.apple.com/newsroom/2026/09/apple-unveils-iphone-duo/)、[让应用适配 iPhone Duo](https://developer.apple.com/documentation/technologyoverviews/preparing-your-app-for-iphone-duo)、[为 iPhone Duo 而设计（HIG）](https://developer.apple.com/design/human-interface-guidelines/designing-for-iphone-duo)、[为 iPhone Duo 做好准备](https://developer.apple.com/iphone-duo/)、[让应用为 iPhone Duo 做好准备并提交（2026 年 10 月 5 日）](https://developer.apple.com/news/?id=kkphp5qo)、[App Store Connect 发布说明](https://developer.apple.com/help/app-store-connect/release-notes/)、[截图规范](https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications)。

## 2. Google Play 与 Android 机制

### 2.1 Android 开发者核验（身份，覆盖包括侧载在内的所有 Android 应用）

一项设备级服务会检查已安装的应用是否登记在已核验的开发者身份之下，覆盖认证设备上的所有 Android 应用，包括侧载与第三方商店（marketplace）应用，而不只是 Play Store 应用。时间线：2026 年 3 月核验向所有开发者开放；2026 年 6 月核验服务开始在设备上自动安装；自 2026 年 9 月 30 日起，在巴西、印度尼西亚、新加坡与泰国的认证设备上安装或更新应用，必须由已核验开发者完成登记，参与商店包括 Google Play、Samsung、Xiaomi 等；2027 年起推向全球。学生或爱好者可使用受限分发账号向最多 20 台设备分享应用，无需政府证件，也无需付费。后果：在参与国家的截止日期之后，来自未核验开发者的应用将无法通过参与商店在认证设备上安装或更新。

来源：[Android 开发者核验](https://android-developers.googleblog.com/2026/06/android-developer-verification.html)、[Android 核验向所有开发者推开](https://android-developers.googleblog.com/2026/03/android-developer-verification-rolling-out-to-all-developers.html)。

### 2.2 前台服务类型，Android 14（API 34）及更高（硬性）

以 API 34 或更高为目标平台且运行前台服务的应用，必须在 manifest 中声明 `android:foregroundServiceType`，并且持有对应的 `FOREGROUND_SERVICE_*` 权限。缺少权限会抛出运行时异常，服务无法启动。另外，Play Console 要求在 App content 页面为每种前台服务类型作出声明，包括描述、若延后处理对用户的影响、演示视频以及映射的用例。缺少 Play 声明会依据 Device and Network Abuse 政策造成更新拒审。相关：在 API 34 或更高上，`USE_FULL_SCREEN_INTENT` 仅对闹钟与通话类应用自动授予；其他应用要么在 Play Console 中声明，要么在运行时请求并做优雅降级。

来源：[Android 强制要求 FGS 类型](https://developer.android.com/about/versions/14/changes/fgs-types-required)、[Play Console FGS 声明](https://support.google.com/googleplay/android-developer/answer/13392821?hl=en)。

### 2.3 Play Integrity API 与 SafetyNet 退役（硬性）

SafetyNet Attestation 已完全关闭（2025 年 1 月 31 日完成停用）。所有证明（attestation）与反滥用检查必须改用 Play Integrity API。仍在调用 `com.google.android.gms:play-services-safetynet` 的应用是在调用一个已停服的服务。请核验服务端使用 `requestHash` 请求绑定来校验 Play Integrity 判定结果。来源：[Play Integrity API](https://developer.android.com/google/play/integrity)。

### 2.4 Play Billing Library 最低版本（硬性）

自 2026 年 8 月 31 日起，所有新应用与既有应用的更新都必须使用 Play Billing Library 版本 8 或更高（可申请延期至 2026 年 11 月 1 日）。这是一道发布闸门，不是运行时开关。已发布的版本 7 二进制包可以继续交易，但闸门生效后任何新版本——包括安全补丁——都不能再以版本 7 发布。版本 9 已于 2026 年 5 月发布，且不存在从版本 7 直接跳到版本 9 的升级路径，因此请先迁移到版本 8。请在截止日期前核验 `com.android.billingclient:billing` 依赖至少为版本 8，并核验售卖数字商品的应用确实使用 Play Billing，而非旁路支付流程。来源：[Android Play Billing 弃用 FAQ](https://developer.android.com/google/play/billing/deprecation-faq)。

### 2.5 目标 API 级别（年度上调，硬性）

自 2026 年 8 月 31 日起，新应用与更新必须以 Android 16（API 36）或更高为目标（Play Console 可延期至 2026 年 11 月 1 日）；既有应用必须以 API 35 或更高为目标，才能在新设备上对新用户保持可见；Wear OS 与 Automotive OS 必须以 API 35 或更高为目标；TV 与 XR 为 API 34 或更高。Android 17 即 API 37，于 2026 年 6 月 16 日发布，其 Play 政策变化于 2027 年 1 月 27 日落地（Wear OS、Android TV 与 Automotive 目标 API 34 或更高），自 2025 年 8 月 31 日起生效并设有延期窗口。2026 年对 API 36（Android 16）的上调——适用于新应用与更新，据报道为 2026 年 8 月 31 日，既有应用最低 API 35——与 Google 的年度发布规律一致，但在把它写为固定日期之前，应在 target-sdk 页面实时核验。请核验 `targetSdkVersion` 当前至少为 35，并计划在 2026 年截止日期前达到至少 36。

来源：[Android 目标 SDK 要求](https://developer.android.com/google/play/requirements/target-sdk)、[Play Console 目标 API 帮助](https://support.google.com/googleplay/android-developer/answer/11926878?hl=en)。

### 2.6 干扰性广告与意外出现的全屏插页广告（硬性）

Better Ads Experiences 政策禁止：意外出现的全屏插页广告（例如用户正要阅读文章或任务进行到一半时）、出现在内容段落开头或应用加载画面之前的广告，以及 15 秒后仍无法关闭的全屏插页广告（选择加入型与激励式广告除外）。允许：出现在自然过渡节点（游戏关卡或章节结束）的插页广告、非全屏广告，以及真正的选择加入型或激励式广告。请核验：应用启动时或任务中途不触发插页广告；每个插页广告都有 15 秒内可用的关闭控件；广告不遮挡系统控件或应用自身的 UI。

来源：[Play Console 广告政策](https://support.google.com/googleplay/android-developer/answer/9857753?hl=en)、[Play Better Ads Experiences 政策](https://support.google.com/googleplay/android-developer/answer/12271244?hl=en)。

### 2.7 Health Connect 与健康类应用数据政策

健康类应用须完成 Health Apps Declaration（Health Connect 申报表自 2025 年 3 月起开始执行）。2026 年 1 月的收紧新增了医疗器械标签体系、更严格的 Health Connect 数据用途说明，以及禁止将年龄受限信号用于健康画像。申请敏感的 Health Connect 读取权限须证明该数据对应用的主要功能必不可少。既有健康类应用须在 2026 年 1 月 28 日前迁移到已核验的 Organization Account。未取得监管许可的应用须展示"本应用不是医疗器械"的免责声明。请核验：申报已完整填写；每个 Health Connect 权限都有核心功能用途说明；Organization Account 已完成迁移；标签或免责声明正确无误。

来源：[Play Console 健康内容与服务](https://support.google.com/googleplay/android-developer/answer/16679511?hl=en)、[Play Console Health Connect 权限](https://support.google.com/googleplay/android-developer/answer/12991134?hl=en)。

### 2.8 真金游戏（real-money games）与巴西博彩牌照（硬性）

- **Google 真金游戏（Real-Money Games）**：Google 历来只在存在政府牌照体系的地方允许真金游戏。2024 年的一项试点为未被既有体系覆盖的真金游戏开放了计划（首批为印度、墨西哥、巴西）；随后 Google 以部分地区缺乏中央审批机构为由暂停了新类型的扩展。印度在 2025 年年中转向开发者自我声明模式，状态仍在演变。请核验：真金游戏应用位于受支持的国家/地区，并持有被认可的牌照或有效的自我声明；真金游戏各项申报、年龄准入控制（age-gating）、地域限制以及正确的服务费模式均已就位。
- **Apple 巴西博彩牌照（2026 年 5 月 8 日）**：随着巴西固定赔率博彩监管的变更，具有固定赔率博彩（gambling）功能的应用，只有在持有 **Secretariat of Prizes and Bets（SPA）** 颁发的有效固定赔率博彩牌照时，才能在巴西的 App Store 上分发。
  - 在 App Store Connect 的年龄分级问卷中对博彩问题回答"是"，会自动把应用的巴西年龄分级设为 **A18**。
  - 要触发牌照核验流程，必须**提交一个新的应用版本**进入审核；仅更新 App Store Connect 中的 App Review Information 部分并不足够，也不会启动核验审核。
  - 在提交新版本时，必须在 App Review Information 部分明确提供牌照信息。

来源：[Google 真金游戏方案](https://android-developers.googleblog.com/2024/01/a-new-approach-to-real-money-games-on-google-play.html)、[Google 暂停真金游戏扩展（NEXT.io）](https://next.io/news/regulation/google-halts-rmg-expansion-on-play-store/)、Apple Developer News："Brazilian betting license requirement for App Store availability"（2026 年 5 月 8 日）。

### 2.9 媒体权限、精确闹钟、软件包可见性与账号删除 URL

- 照片与视频权限。只有确实需要广泛访问权的应用才能保留 `READ_MEDIA_IMAGES` 或 `READ_MEDIA_VIDEO`；一次性或有限使用应使用 Android Photo Picker。2025 年 5 月 28 日起必须完全合规，不合规的应用可能被下架。
- 账号删除。允许在应用内创建账号的应用，必须同时提供应用内删除路径与基于网页的删除 URL，并在数据安全（Data safety）表单中声明两者。删除 URL 无法访问是常见的拒审原因。
- `QUERY_ALL_PACKAGES`（软件包可见性）与 `SCHEDULE_EXACT_ALARM` 或 `USE_EXACT_ALARM` 仍属于须经声明放行的权限，需要对照获批用例给出用途说明。

来源：[Play Console 照片与视频权限](https://support.google.com/googleplay/android-developer/answer/14115180?hl=en)、[Play Console 账号删除](https://support.google.com/googleplay/android-developer/answer/13327111?hl=en)。

## 3. 跨领域事项（双平台）

### 3.1 UGC 应用的 CSAM 举报义务（法律）

- 美国，18 U.S.C. 2258A。实际知悉表面成立的儿童性虐待违规的服务提供者，必须在合理可行的前提下尽快向 NCMEC CyberTipline 举报。提供者没有被要求主动搜索，但知悉后必须举报。《REPORT 法案》（REPORT Act，2024 年 5 月 7 日签署）提高了处罚（首次违规 600,000 至 850,000 美元，惯犯最高 1,000,000 美元，按提供者规模递增），把可举报行为扩展到儿童性贩运与引诱，并把证据保存期限从 90 天延长到 1 年。
- 英国，《2023 年在线安全法案》（Online Safety Act 2023）。范围内的用户对用户服务与搜索服务承担包括儿童性剥削与虐待在内的非法危害义务。首批非法内容准则（Codes）于 2025 年 3 月 17 日生效，儿童可及性义务自 2025 年 7 月 25 日起适用。处罚最高可达 1,800 万英镑或全球收入的 10%。
- 欧盟，CSA Regulation 尚未成为最终的永久性法律文件（强制性扫描的推动已让位于自愿检测，三方会谈仍在进行）。允许自愿扫描的临时豁免已恢复，延至 2028 年。不要现在就把欧盟强制扫描义务硬编码进系统，应将其作为待定事项跟踪。

针对面向美国的 UGC 应用，请核验：实际知悉后提交 NCMEC 举报的成文升级路径；针对被举报内容的 1 年保存政策；以及举报机制。来源：[18 U.S.C. 2258A](https://www.law.cornell.edu/uscode/text/18/2258A)、[Ofcom 非法危害](https://www.ofcom.org.uk/online-safety/illegal-and-harmful-content/)、[欧盟理事会 CSA Regulation 立场](https://www.consilium.europa.eu/en/press/press-releases/2025/11/26/child-sexual-abuse-council-reaches-position-on-law-protecting-children-from-online-abuse/)。

### 3.2 UGC 最低要求与儿童安全标准（商店）

- Apple Guideline 1.2。UGC 或社交类应用必须四项齐备：内容过滤器；能及时响应的应用内举报机制；屏蔽滥用用户的能力；公开发布的开发者联系信息。应用必须在收到举报后 24 小时内移除被举报内容并清退违规用户。2026 年 2 月 6 日的更新指出：随机或匿名聊天应用明确适用 1.2。
- Google Play UGC 政策。含 UGC 的应用必须要求用户在发布前接受条款，定义并禁止不良内容，提供应用内举报与屏蔽不良内容及用户的系统，并对举报采取行动。
- Google Play Child Safety Standards（儿童安全标准），自 2025 年 3 月 19 日起对社交与交友品类生效。五项要求：在全球可访问的网页上发布 CSAE 标准，页面须写明应用与开发者名称，并把链接填入 Play Console；应用内反馈机制；CSAM 响应协议；指定的儿童安全联系人；遵守所在司法辖区的儿童安全法律。无论应用是否实际拥有儿童用户均适用，对社交与交友品类而言这是下架事由。

来源：[Apple App Review Guidelines（审核指南）](https://developer.apple.com/app-store/review/guidelines/)、[Google Play Child Safety Standards（儿童安全标准）](https://support.google.com/googleplay/android-developer/answer/14747720?hl=en)。

### 3.3 无障碍作为商店审核维度

两家商店都不会因未达 WCAG 而硬性拒审，因此这是中等商店风险与高法律风险（见 3.6 以及欧盟文档中的《欧洲无障碍法案》）。

- Apple Accessibility Nutrition Labels（无障碍营养标签），2025 年推出，显示在产品页上，覆盖 9 项功能（VoiceOver、Voice Control、Larger Text、Dark Interface、Differentiate Without Color Alone、Sufficient Contrast、Reduced Motion、Captions、Audio Descriptions）。目前为自愿性质，Apple 表示随着时间推移将逐步成为提交时的必填项。声称支持的功能必须能让用户借其完成所有常见任务。App Review 是否会依据 Guideline 2.3（元数据准确性）对误导性标签采取行动，尚未经验证，见 [ACCESSIBILITY.md](ACCESSIBILITY.md) 第 11 节。
- Google Play 提供的是工具，不是闸门：Accessibility Scanner 与 TalkBack。可检查的标准包括至少 48dp 的触控目标、所有交互与图形元素上的内容描述，以及可用 TalkBack 导航的控件。

请核验：Apple Accessibility Nutrition Labels 已填写且未过度声称；UIAccessibility 标签与 traits 齐备；Android 侧 48dp 触控目标、内容描述齐备，且 Accessibility Scanner 检查干净通过。来源：[Apple Accessibility Nutrition Labels](https://developer.apple.com/help/app-store-connect/manage-app-accessibility/overview-of-accessibility-nutrition-labels/)、[Android 无障碍测试](https://developer.android.com/guide/topics/ui/accessibility/testing)。

### 3.4 账号与数据删除的网页 URL（商店，常见遗漏）

- Apple Guideline 5.1.1(v)。允许创建账号的应用须让用户能在应用内发起账号及关联数据的删除（自 2022 年 6 月 30 日起生效）。公开的网页删除或隐私选择页面通过 App Store Connect 中可选的 Privacy Choices URL 提供。
- Google Play。允许创建账号的应用必须同时提供应用内删除路径，以及一个在卸载后仍然可用的账号与数据删除网页链接资源，并在数据安全（Data safety）表单中声明两者。删除 URL 无效或无法访问是常见的拒审原因。

请核验：应用内删除流程是真正删除数据（而非停用）；已声明一个公开可达的网页删除 URL（返回 200，无登录墙）。来源：[Apple 在应用中提供账号删除](https://developer.apple.com/support/offering-account-deletion-in-your-app/)、[Google Play 账号删除](https://support.google.com/googleplay/android-developer/answer/13327111?hl=en)。

### 3.5 OFAC 制裁与受禁地区可用性（法律）

美国制裁禁止向被封锁人员与受禁地区提供商品或服务。Apple 自己就曾因托管被封锁开发者的应用而于 2019 年与 OFAC 以 466,912 美元和解；2025 年的报道发现与受制裁方关联的应用仍混入两家商店，因此开发者自身的合规仍然重要。请核验：开发者或实体不在 OFAC SDN 名单上；App Store Connect 与 Play Console 中应用的国家/地区可用性排除了受禁地区（古巴、伊朗、朝鲜以及乌克兰的受制裁地区）。来源：[TTP：商店中的受制裁应用](https://www.techtransparencyproject.org/articles/u.s.-sanctioned-firms-find-opening-in-apple-and-google-app-stores)。

叙利亚已不再是全面受禁地区，但也并非不受限制。根据 Executive Order 14312，OFAC 叙利亚制裁计划已于 2025 年 7 月 1 日结束；OFAC 随后移除了 Syrian Sanctions Regulations（31 CFR Part 542）；国务院对"支持恐怖主义国家"（state sponsor of terrorism）的认定自 2026 年 8 月 24 日起撤销。仍存两项管制。第一，15 CFR 746.9 仍要求：向叙利亚出口或再出口任何受 EAR 管辖的物项（EAR99 食品与药品除外）均需商务部许可证，其列明的许可例外包括适用于合资格 EAR99 物项的 SPP，以及适用于合资格消费级通信软件的 CCD。因此，在让应用于叙利亚可用之前，请留下成文记录，写明它是否受 EAR 管辖、其分类，以及所依据的例外或许可。已发布的软件可依 15 CFR 734.3(b)(3) 与 734.7 落在 EAR 之外，但加密需要单独分析，而且上架应用商店本身并不能使应用构成"已发布"。第二，基于名单的阿萨德问责制裁（31 CFR Part 569）仍封锁被指定人员及其持有 50% 或以上权益的任何实体（无论是否列名），因此要筛查交易对手与所有权结构，而不只是开发者自己的名称。Apple 或 Google 是否服务叙利亚店面是它们自己的决定，与美国法律相互独立。来源：[Executive Order 14312](https://www.govinfo.gov/content/pkg/DCPD-202500725/html/DCPD-202500725.htm)、[15 CFR 746.9](https://www.ecfr.gov/current/title-15/subtitle-B/chapter-VII/subchapter-C/part-746/section-746.9)、[15 CFR 734.7](https://www.ecfr.gov/current/title-15/subtitle-B/chapter-VII/subchapter-C/part-734/section-734.7)、[31 CFR 569.406](https://www.ecfr.gov/current/title-31/subtitle-B/chapter-V/part-569/section-569.406)、[OFAC FAQ 1220](https://ofac.treasury.gov/faqs/1220)、[SST 认定撤销，Federal Register 2026-17653](https://www.govinfo.gov/content/pkg/FR-2026-08-31/html/2026-17653.htm)。

### 3.6 ADA Title III 无障碍诉讼（法律，美国）

2025 年，联邦 Title III 网页无障碍诉讼增长约 27%，移动应用诉讼占比不断上升；WCAG 2.1 AA 是事实上的法院标准，不过针对私营企业的 DOJ Title III 技术规则并不存在。DOJ Title II 规则要求州与地方政府应用达到 WCAG 2.1 AA。一项临时最终规则（FR Doc. 2026-07663，自 2026 年 4 月 20 日起生效）把日期调整为：人口 50,000 及以上的为 2027 年 4 月 26 日，更小实体为 2028 年 4 月 26 日，见 [ACCESSIBILITY.md](ACCESSIBILITY.md) 第 6 节。对美国消费类应用，请把 WCAG 2.1 AA 标记为法律风险缓释事项；对政府或公共实体应用，则视为硬性截止日期。来源：[ABA 关于 Title III 数字无障碍的讨论](https://businesslawtoday.org/2025/08/digital-accessibility-under-title-iii-of-the-ada/)。

### 3.7 商店计费之外的卡支付的 PSD2 SCA 与 PCI DSS（法律与合同）

这些要求只适用于为现实商品与服务进行的合规非商店卡支付。数字商品与订阅仍必须经由 Apple 应用内购买（In-App Purchase，IAP）或 Google Play Billing。

- PSD2 强客户认证（Strong Customer Authentication，SCA）。欧盟或英国的实物商品远程卡支付需要三种因素中的两种（知识、持有、固有），通常是 3D Secure，并有有限豁免（低价值、交易风险分析）。PSD3 预计在 2026 至 2027 年前后出台，需持续关注。
- PCI DSS 版本 4.0.1 是现行标准，所有带未来生效日期的要求自 2025 年 3 月 31 日起强制执行。令牌化（tokenization）或 Apple Pay 或 Google Pay 可让应用不接触卡号，并把范围大致缩小到 SAQ A。处理原始卡数据则会引入沉重得多的要求。

请核验：若应用为实物商品接受欧盟或英国卡支付，SCA 与 3D Secure 已实现；若应用处理银行卡，则任何卡号都不被存储、记录或缓存，输入直接进入做令牌化的处理商或钱包，并已确定正确的 SAQ。来源：[Stripe SCA 指南](https://stripe.com/guides/strong-customer-authentication)、[PCI SSC v4.0.1 SAQ 公告](https://www.pcisecuritystandards.org/wp-content/uploads/2024/10/SAQs_for_PCI_DSS_v4.0.1_Bulletin.pdf)。

## 4. 汇总审计清单（硬性关卡）

| 关卡 | 核验 | 平台 |
|---|---|---|
| macOS 公证 | Developer ID 签名、hardened runtime、notarytool 已提交、已钉扎票据 | Apple（非商店 macOS） |
| 4.2 / 4.3 | 非单薄壳套，非重复或克隆应用，非无差异化的饱和品类应用 | Apple |
| 阅读类应用 entitlement | 满足 3.1.3(a) 条件与链接规则，使用期间不提供 IAP | Apple |
| 法国加密 | 若使用非豁免加密且在法国分发，已上传法国 ANSSI 申报 | Apple |
| 内容版权 | ASC 第三方内容问题已作答，权利证明可用 | Apple |
| visionOS App Motion | 已声明，使用 Developer Capture 截图 | Apple |
| SDK 26（所有平台） | 2026 年 4 月 28 日前以 Xcode 26 与对应平台 26 SDK 构建 | Apple |
| SDK 27（除 macOS 外所有平台） | 自 2027 年 4 月起以对应平台 27 SDK 构建，确切日期尚未公布 | Apple |
| 开发者核验 | 若分发到巴西、印度尼西亚、新加坡、泰国，须在 2026 年 9 月 30 日前完成核验 | Android |
| 前台服务类型 | manifest 类型 + 对应权限 + 含演示视频的 Play Console 声明 | Android |
| Play Integrity | 不使用 SafetyNet Attestation，判定结果在服务端校验 | Android |
| Play Billing v8+ | 2026 年 8 月 31 日前 Billing Library 至少为版本 8 | Android |
| 目标 API | targetSdkVersion 当前至少 35，2026 年 8 月前计划到 36 | Android |
| 干扰性广告 | 无启动或任务中途插页广告，15 秒内可关闭 | Android |
| Health Connect | 申报、核心功能用途说明、组织账号、标签正确 | Android |
| UGC 管控 | 举报、屏蔽、过滤、公开联系方式、24 小时移除并清退（Apple 1.2） | 双平台 |
| Child Safety Standards | 已发布 CSAE URL、应用内举报、响应协议、指定联系人（社交与交友品类） | Google Play |
| CSAM 举报 | 面向美国的 UGC 应用具备 NCMEC CyberTipline 路径与 1 年保存 | 法律 |
| 账号与数据删除 | 应用内删除加可达的网页删除 URL，且已声明 | 双平台 |
| 制裁 | 实体与所有者不在 SDN 名单，可用性排除受禁地区，叙利亚发布前完成出口管制审查 | 法律 |
| 卡支付 | 欧盟或英国实物商品卡流程启用 SCA 与 3D Secure，不存储 PAN，确定正确的 PCI SAQ | 法律 |
| 无障碍标签 | Apple Accessibility Nutrition Labels 已填写且未过度声称 | Apple |

## 5. 来源与核实说明

Apple 相关事实引用 developer.apple.com；Android 与 Google Play 相关事实引用 developer.android.com 与 Play Console 帮助；法律相关事实引用法条、监管机构或标准组织。凡是政府或 Apple 页面渲染为客户端应用、无法自动读取的情形，相关事实已跨多家可信来源交叉核对，并在此处标记。

### 来源可信度层级

用于确立监管要求的全部来源都必须遵守以下优先级准则：

- 优先级 1（一手官方来源）：European Commission、EUR-Lex、Official Journal of the European Union、ENISA、EDPB、FTC、NIST、CISA、ICO 及官方政府出版物。
- 优先级 2（高可信新闻）：Reuters、AP（Associated Press）、Bloomberg。
- 优先级 3（学术）：学术论文与同行评审期刊。
- 优先级 4（行业）：行业博客与厂商出版物。
- 优先级 5（社交与未经验证）：LinkedIn、Reddit、Twitter 以及 AI 生成的摘要。

### 合规 Pull Request 规则

- 绝不在官方来源之前信任二手来源。
- 绝不使用优先级 4 或优先级 5 来源创建合规 pull request，除非已由优先级 1 来源核验。凡引用或主张出自优先级 4 或 5，都必须能由优先级 1 的官方出版物可追溯地佐证。

以下各项标注为未经验证；在依赖其中数字前请先对照一手来源确认：2026 年 Android 目标 API 36 的日期（报道广泛，与年度发布规律一致，但抓取时官方 target-sdk 页面仍显示 2025 年文本）；`codesign`、`notarytool` 与 `stapler` 的确切命令串（已跨来源相互印证，并非复制自渲染后的 Apple 页面）；visionOS、watchOS 与 tvOS 各设备的确切截图像素尺寸（请从 App Store Connect 截图页面实时获取）；Apple Accessibility Nutrition Labels 变为强制的确切日期（Apple 只说"随时间推移"，未公布日期）；Google 真金游戏在印度的最终落地状态；欧盟 CSA Regulation 的最终形态（三方会谈中）；美国 BIS 年度自分类报告的具体细节；以及 PSD3 的时间表。

在对照所引来源重新核实之前，请把本文档视为：对每项义务的存在与方向是硬性的（HARD），对任何具体数字、版本或日期仅作建议（advisory）。
