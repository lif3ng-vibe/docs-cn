# 跨平台框架的覆盖

守卫扫描的是应用的构建产物表面（Info.plist、AndroidManifest.xml、entitlements、gradle、PrivacyInfo.xcprivacy）——这些内容无论由什么工具链生成，商店审核都会检查。本页记录的是在原生检查之外，针对生成该应用的框架的专项检查。

## 检测

| 框架 | 检测依据 |
|---|---|
| Flutter | 项目根目录 12 层深度以内存在 `pubspec.yaml` |
| React Native / Expo | 12 层深度以内存在 `package.json`，且依赖 `react-native` 或 `expo` |
| Ionic / Capacitor / Cordova | 12 层深度以内存在 `package.json` 且依赖 `@capacitor/*`、`@ionic/*` 或 `cordova-*`，或在 12 层深度以内存在 `capacitor.config.*` / `config.xml` 文件 |

这些深度取自 `agent-os/hooks/app-store-compliance-guard.sh` 中的 `find_app` 调用。Unity、.NET MAUI、Tauri 移动端与 Kotlin Multiplatform 的搜索深度为 6 层。

一个项目可以命中多个框架标志（例如一个 Capacitor 应用同时引入了 `expo` polyfill）；每一条命中的检查都会运行。检测会扫描深度范围内的**每一个** `package.json`/`config.xml`，而不只是第一个，因此即使 monorepo 根目录的 `package.json` 只装着工具链配置，也能在目录树更深处找到真正的应用。只有带有 `<widget>` 或 `xmlns:cdv` 标记的 `config.xml` 才算作 Cordova 证据，因为该文件名与其他无关工具的配置文件撞名。

下文每一条框架专项发现都以 `IOS_TARGET_ACTIVE` 为开关，而不是仅凭目录树里有没有文件。真实的跨平台仓库里提交一个 `ios/` 目录很常见，即便当前构建只面向 Android，因此单凭文件存在与否无法区分 `flutter build apk` 与 iOS 构建。当发起命令已知（hook 模式）且明显只面向 Android（`build apk/appbundle`、`assembleRelease`、`bundleRelease`、`run-android`、`run:android`、`--platform android`、`capacitor android`，且不含 `ios`/`ipa`/`xcodebuild` 字样）时，命令会覆盖目录树信号，这些 Apple 专属检查保持静默。2.0.0 还要求同一命令行中的其余命令都是已知无害的命令，因此它让检查静默的范围绝不会比 1.0.0 更宽。独立模式（无命令上下文）则退回纯粹的目录树检测。

## 守卫识别的提交命令

`fastlane deliver/pilot/supply/submit`、`eas submit`、`eas build`、`xcrun altool`、`xcrun notarytool`、`transporter`、`gradlew bundleRelease/assembleRelease`、`bundletool`、`xcodebuild archive`、`flutter build ipa/appbundle/apk`、`cap sync/build/run`（带或不带 `npx`）、`ionic capacitor build/run`、`cordova build`（带或不带 `--release`）、`Unity ... -buildTarget iOS/Android`、`dotnet publish -f net8.0-ios/android`、`tauri ios/android build`。

## Flutter 检查

- `FLUTTER-PRIVACY-MANIFEST-MISSING`（严重）。依赖中包含一个涉及需声明理由 API（required reason API）的插件（permission_handler、image_picker、geolocator、device_info_plus、package_info_plus、shared_preferences、sqflite、firebase_*），而项目中找不到任何 `PrivacyInfo.xcprivacy`。自 Flutter 3.19 起，大多数第一方插件都自带清单，但只有应用自己也携带一份清单时，聚合才会生效。
- `FLUTTER-NO-IOS-RUNNER-FOUND`（中，仅提示）。未找到任何 `Info.plist`，因此本守卫中所有 iOS 专项检查均已跳过。提交 iOS 之前，请运行 `flutter create .` 或确认 `ios/` 平台目录确实存在。

已知局限。守卫无法判断某个只存在于本地化 `InfoPlist.strings` 文件中的用途字符串（purpose string）值，是否也被复制进了归档中实际携带的 `Info.plist`（ITMS-90683）。提交前请手工核查这一点。

## React Native / Expo 检查

- `RN-OTA-UNDECLARED`（高）。存在 OTA（over-the-air）JS bundle 更新器（`react-native-code-push`、`expo-updates`、`react-native-ota-hot-update`、Stallion），但没有向应用审核披露。Apple 3.3.2/2.5.2 允许仅修复缺陷的 OTA 更新，前提是在审核备注中按名称披露；未披露的可替换 bundle 会被解读为休眠功能。
- `RN-PRIVACY-MANIFEST-MISSING`（严重）。通过 JS 依赖间接引入了触及需声明理由 API 的原生模块（Firebase、AsyncStorage、expo-file-system），而项目中找不到任何 `PrivacyInfo.xcprivacy`。在三个框架中，这一项最难用肉眼审计，因为原生 SDK 躲在 JS 包名背后。

## Ionic / Capacitor / Cordova 检查

- `IONIC-4.2-THIN-WRAPPER`（高，仅提示）。这是现实中 Ionic 应用最常见的一条拒审理由，但本检查只是一个启发式代理（HEURISTIC PROXY），不是 Apple 4.2 的真正测试——真正的测试考察的是重新包装的网站之外的功能、内容与界面，而不是插件数量。使用了不在匹配范围内的插件（`@capacitor/preferences`、私有原生插件）的真实应用可能误报；为了装点门面而引入两个匹配插件的薄壳应用也可能漏报。在把它当成硬性阻塞之前，请人工复核。该检查统计的是去重后的插件标识符，而不是文件数，因此同一个引导文件里的多次插件导入会被正确计数。
- `IONIC-UIWEBVIEW-DEPRECATED`（严重）。字面上的 `UIWebView` 符号，通常由一个过时插件带入，即使应用代码从未直接引用它。任何静态链接了它的二进制文件都会被 Apple 自动拒审（ITMS-90809）。
- `IONIC-PRIVACY-MANIFEST-MISSING`（高）。Capacitor/Cordova 插件的清单支持不如 Flutter 那样标准化。请逐一核验：每个封装了原生 SDK 的插件是否都自带 `PrivacyInfo.xcprivacy`。

## Unity、.NET MAUI、Tauri 移动端与 Kotlin Multiplatform

为 issue 837 新增。每个框架都会被检测、在 `Frameworks.` 一行列出名字，且测试套件中都各有一个违规样例项目和一个干净样例项目。

| 框架 | 检测依据 | 现在会读取的源码 | 触发扫描的提交命令 |
|---|---|---|---|
| Unity | `ProjectSettings/ProjectVersion.txt` | `.cs` | `Unity -batchmode ... -buildTarget iOS` 或 `Android` |
| .NET MAUI | 带 `UseMaui` 或 `net8.0-ios` 风格 target 的 `.csproj` | `.cs`、`.xaml`、`.csproj` | `dotnet publish -f net8.0-ios` 或 `net8.0-android` |
| Tauri 移动端 | `tauri.conf.json`、`tauri.conf.json5` 或 `Tauri.toml` | `.rs`、`.toml` | `tauri ios build`、`tauri android build`，带或不带 `cargo`、`npx` 均可 |
| Kotlin Multiplatform | Gradle 文件中的 multiplatform 插件 | `commonMain` 中的 Kotlin 代码，与之前一致 | 已覆盖的 Gradle 与 `xcodebuild archive` 命令 |

有四种扫描行为需要了解。

- 手动运行时，Unity 项目会同时扫描两个商店；作为 hook 运行时，由 `-buildTarget` 的值决定扫描哪个商店。
- Unity 项目在导出之前不包含任何 Xcode 或 Gradle 工程，因此出口合规检查与 R8 检查会保持静默，报告中也会说明这一点。导出后的项目请另行扫描。
- Kotlin Multiplatform 项目作为单个应用扫描，因此 `commonMain` 中的共享代码会同时计入 iOS 与 Android 两侧的检查。
- 位于根级 Expo、React Native、Flutter 或 Capacitor 应用之下的裸 Xcode 或 Android 工程，如果拥有自己的 `Info.plist` 或 `AndroidManifest.xml`，且没有任何根级构建文件提到它的路径（`settings.gradle`、`Podfile` 或 `.xcworkspace`），就会被当作独立应用扫描。只有当它带有会构建应用程序的 `.xcodeproj`（或未声明 product type），或是一个 Android application 模块时，才算作一个应用；因此 library、framework 或本地原生模块仍归属使用它的那个应用。一个在其源码中嵌入根级框架（源码里含 React Native、Expo、Flutter、Capacitor 或 Cordova 代码，例如某个 `RCTAppDelegate`，或体现在其 Podfile 或 Gradle 文件里）的原生宿主属于棕地宿主（brownfield host），仍留在根扫描中，因此根应用的框架检查会继续覆盖它。真正拆分出去的原生应用与其脱离的根应用，都会保留合并目录树下出现过的全部框架检查——原先作为一体扫描时运行的每项检查现在仍会运行，包括只在拆分应用内部发现的框架标志。根应用与其拆分出的原生应用也会像 1.0.0 那样被合并扫描一次，拆分扫描各自遗漏的发现会补记一次，因此分散在共享文件与拆分应用中的证据依然有效。位于名称恰为 `demo`、`example`、`sample` 或 `playground`（或其复数形式）目录中的项目会被视为仓库演示项目，仍归入根扫描。只有当根应用自己拥有该平台的原生工程时，嵌套项目才会拆分出去，因此不含原生工程的 managed Expo 根目录会继续扫描嵌套项目并保留其 iOS 检查。原生根应用永远不会把嵌套项目拆分出去（issue #656）。

## 无法覆盖的场景

这些是能力边界，不是等着修复的 bug。请围绕它们做规划。

- **任何在 CI 服务器上运行的流程**：`gh workflow run`、从 CI 面板发起的发布、由 runner 执行的 fastlane lane，你机器上的 hook 都看不见。
- **从应用窗口发起的上传**：Xcode Organizer、Transporter 应用、Unity Editor 的构建窗口、Android Studio 的 Generate Signed Bundle 都不会执行 shell 命令。
- **在代码中指定目标的 Unity 构建**：命令行上没有 `-buildTarget iOS` 或 `Android` 的 `-executeMethod` 不会被视为提交。
- **Unity 与 .NET MAUI 的构建设置**：工具在构建期生成的 Info.plist 键与 Gradle 设置不会被读取。对 .NET MAUI 而言，`.csproj` 中的 linker 与目标 API 设置不会被检查，`dotnet build -t:Publish` 也不会被匹配。Mac Catalyst 的 publish 不会被视为提交。
- **init 之前的 Tauri**：没有 `src-tauri/gen/apple` 或 `src-tauri/gen/android` 目录时，就没有任何原生内容可扫描。报告中会写明需要运行的命令。
- **与原生应用并列的 Tauri 应用**：在 monorepo 中，没有 `gen/apple` 或 `gen/android` 的 Tauri 目录会被当作桌面应用，因此不会阻断旁边原生应用的 `CLEAR`。
- **Rust 命名**：登录与应用内账号删除相关的模式寻找的是 `signIn` 这类 camelCase 名称。名为 `sign_in` 的 Rust 函数不会触发它们。
- **未检测的框架**：NativeScript 与旧式 Xamarin.Forms 项目。
- **多于一个 Xcode target**：所有 target 被当作同一份源码读取，因此一个 app extension 既可能满足、也可能触发主应用的某条发现。仅含 watchOS 或仅含 visionOS 的 workspace 会被当作 iOS 处理。
- **依然粗糙的合并/拆分布局**（继承自 1.0）：单个嵌套的 managed Expo 应用只会通过根配置读取；扫描根之外的共享包与棕地宿主源码不会被跟进；同一根下的所有原生 target 会被合并；同一仓库中的两个 .NET MAUI 或 Unity 应用会被当作一个应用扫描。
- **Workspace 级 runner**：package script 只会向下跟进一层，因此一个先运行 `turbo run build`、再由它去运行某个移动端包提交的根脚本不会被看见。pnpm 图选择器（`web...`、`...web`、`{apps/web}`）会被化简为包名本身，不会跟进该包的依赖方或被依赖方；`"[origin/main]"` 这类变更集选择器则无法解析，会被当作读取每一个包处理，这在同时包含移动端应用的仓库里可能阻断纯 web 构建。请脱掉包装层直接运行 web 构建，或设置一次 `APP_STORE_GUARD_OK=1`。
- **跨平台购买插件**：1.0.0 只对原生 StoreKit 应用检查恢复购买流程。2.0.0 也会检查使用 react-native-iap、RevenueCat 或 Flutter 购买插件的应用，此时购买列表查询（`getAvailablePurchases`、`queryPastPurchases`）或插件自身的 restore 调用都算作恢复购买流程。请手工确认界面上可见的 Restore Purchases 控件确实调用了它。
- **监控源核验**：监管与隐私监控器只要发现某个官方来源共享了相同关键词，就把一项论断标记为已获佐证，而不是确认该来源陈述了同一论断。在依据监控条目采取行动之前，请先阅读官方来源原文。
- **商店后台状态**：守卫看不见 App Store Connect 或 Play Console，因此年龄分级、社交媒体声明与封闭测试相关条目只是提醒，不能证明存在问题。

## 已知缺口（由 Codex 与 Qwen 对抗性审查发现，尚未修复）

- **含换行符的文件路径**。`package.json`/`config.xml` 扫描循环能防住空格与 shell 元字符（使用了加引号的 `IFS= read -r`），但防不住路径中真实的换行符——`find` 以换行分隔的输出无法表示它。实践中极不可能出现，但也未被证明安全。
- **`config.xml` 的 widget 标记检查可被注释欺骗**。被注释掉的 `<!-- <widget ...> -->` 或形似标签 `<widgetConfig>` 仍会被算作 Cordova 证据。严重程度低，在真实的 Cordova 项目上不会造成现实的漏报，但也不是严格意义上的证明。
- **Android 侧的框架检查很薄弱**。除了 managed Expo 应用配置中声明的 Android 权限数组之外，本文档中的每一项检查都面向 Apple 侧。Flutter/RN/Ionic 应用同样会上架 Google Play，在那里，随包 SDK 的数据安全（Data safety）披露、由 WebView 控制的数据收集、明文流量以及混合内容/调试标志，都是与框架相关、而本守卫尚未检查的真实风险。
- **PrivacyInfo.xcprivacy 检查只读取应用自己的清单**。位于 `Pods`、`Carthage`、`node_modules`、SwiftPM 的 `.build` 或 checkouts、`SourcePackages` 或 Flutter 的 `.symlinks` 之下的清单不算数。managed Expo 应用只要在应用配置里写了 `expo.ios.privacyManifests` 即可通过，因为原生项目由 EAS 在构建期生成。
- **Expo 持续原生生成（Continuous Native Generation，CNG）仅按配置建模**。没有把 `ios/` 或 `android/` 目录入库的 managed Expo 项目，其 `app.json` 或 `app.config` 会被读取，用于相机与位置用途字符串、`ios.privacyManifests` 以及敏感的 `android.permissions` 条目。在 `npx expo prebuild` 运行之前，其原生代码仍**不会被检查**。
- **有两个框架没有覆盖**。NativeScript 与旧式 Xamarin.Forms 不会被检测。Unity、.NET MAUI、Tauri 移动端与 Kotlin Multiplatform 会被检测；至于每个框架仍看不到什么，见上一节说明。
- **提交判定正则宁可误触发**。`agent-os/hooks/app-store-compliance-guard.sh` 中的 `SUBMIT_RE` 会匹配带或不带 `--platform` 标志的 `eas build`，全局标志位于子命令之前时同样匹配。它还会匹配每一次 `cap run` 与 `cap open`，因此一次毫无发布意图的本地开发运行也会触发守卫。

这些问题都有记录，并非被掩盖。在把它当作跨平台团队的完整覆盖之前，请先跟踪这些问题；现有检查相对只看原生代码已是实实在在的进步，但还不是最终的答案。

## 诚实的边界

守卫读取的是 Swift、Kotlin、XML、Gradle、Plist、Dart、JS、TS、C# 与 Rust 的源码文本。它不执行应用，不解析 Dart 或 JS 的 AST，也看不见运行时行为（例如某次 OTA 更新是否真的改变了界面）。请把每条发现都当作有待核实的线索，而不是确凿的缺陷；把一次干净的运行理解为“从源码文本中检测不到任何东西”，而不是获批的保证。
