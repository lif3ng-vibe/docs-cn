---
title: "如何使用 GStack iOS 测试 iOS 应用"
---


这是 gstack 自带的 iOS QA 能力的端到端实操指南：把权威 Swift 模板装进你的应用，用 USB 连接一台真机 iPhone，再从任意 agent 驱动它（本地用 Claude Code，或经 Tailscale 用任何能说 HTTP 的 agent）。没有模拟器，没有 XCTest 测试装置，没有 WebDriverAgent。

下文的每个环节都已在运行 iOS 26.5 的真机 iPhone 17 Pro Max 上端到端验证过。同样的流程适用于任何 iOS 16+ 设备。

## 你需要准备什么

- 装有 Xcode 16.0+ 的 macOS（`xcrun devicectl --version` 必须能成功运行）。Xcode 16 自带 `devicectl` 经 USB 连接设备所用的 CoreDevice 隧道。
- 一台运行 iOS/iPadOS 16 或更高版本的真实 iPhone 或 iPad（iPad 的台前调度与多窗口布局尚未在真机上验证）。设备已解锁、已与你的 Mac 配对，并在"设置 → 隐私与安全性"中开启**开发者模式**（Developer Mode）。
- 一个 Apple 开发者团队——免费的个人团队即可完成真机调试部署。你需要的是团队 ID（如 `623FYQ2M88`），不是证书 ID。在 Xcode → Settings → Accounts → 你的 Apple ID → 团队列表里可以找到。安装配置会在首次部署时通过 `-allowProvisioningUpdates -allowProvisioningDeviceRegistration` 为你的设备签名应用。
- 已安装 gstack（`./setup` 已完成；`gstack-ios-qa-regen` 和 `gstack-ios-qa-daemon` 必须在 PATH 上）。
- PATH 上有 Bun 运行时（`bun --version`）。Mac 侧的守护进程是一个 bun 进程。

如果要使用可选的远程 agent（Tailscale）模式，还需要在 Mac 上安装 Tailscale，并保证 `/var/run/tailscale.sock` 可读。

## 一口气讲完架构

```
┌─────────────────┐   tailnet (opt)    ┌──────────────────────┐   USB CoreDevice    ┌─────────────────────┐
│ Remote agent    │ ─────────────────▶ │ gstack-ios-qa-daemon │ ──────────────────▶ │ iOS app StateServer │
│ (Claude, GPT,   │  bearer + session  │  (Mac, bun/TS)       │  IPv6 ULA tunnel    │  (loopback only)    │
│  OpenClaw, ...) │                    │                      │                     │                     │
└─────────────────┘                    └──────────────────────┘                     └─────────────────────┘
```

- iOS 应用内嵌一个 `StateServer`（`DebugBridge` SPM 库，仅 `#if DEBUG` 生效），监听 `::1` + `127.0.0.1` 的 9999 端口，以 bearer 令牌做门禁。一次性引导令牌（boot token）存放在应用 `tmp/` 下一个 0600 权限的文件里（绝不写 `os_log`）；守护进程把它复制出来并在约 5 秒内轮换，轮换会删除该文件，因此之后的复制件是死凭证。如果应用写不了这个文件，它会记录 `NOT READY`，`/healthz` 会带上 `boot_token_error`。
- Mac 守护进程在 CoreDevice IPv6 隧道上中转流量，配对设备接入时 `xcrun devicectl` 会自动打开这条隧道。
- 在 Tailscale 模式下，守护进程会另开一个绑定到你 tailnet IP 的监听器，并按会话令牌强制执行能力层级（capability tier：observe 观察 / interact 交互 / mutate 变更 / restore 恢复）。令牌由 Mac 主人通过 `gstack-ios-qa-mint` 显式铸造；远程调用方永远不会被自动加白。

iOS 的 `StateServer` **永远**只监听回环地址，远程模式也不例外。身份校验放在 Mac 侧进行，因为 iPhone 无法校验 Tailscale 身份。

## 第 1 步：生成 DebugBridge 包

在应用根目录运行 `/ios-qa`，或直接调用同一个确定性再生成器：

```bash
gstack-ios-qa-regen \
  --app-source "$PWD/Sources/YourApp" \
  --bridge-dir "$PWD/DebugBridge"
```

该命令把一份显式白名单内的权威模板复制到本地 `DebugBridge/` Swift 包中，
生成 `DebugBridgeGenerated/StateAccessor.swift`，并把已安装版本写入
`DebugBridgeGenerated/.gstack-version`。它把生成产物排除在自身
schema 哈希之外，因此源码不变时重跑就是一次快速且字节稳定的
缓存命中。它还会删除旧扁平测试装置布局中显式列出的遗留生成文件集，
避免陈旧的桥接源码遮蔽这个包。

1. 把 `DebugBridge/` 添加为本地包依赖。仅在 Debug 配置中依赖
   `DebugBridgeUI` 产品；`DebugBridgeCore` 和
   `DebugBridgeTouch` 会传递性地带进来。
2. 把 `DebugBridgeGenerated/StateAccessor.swift` 加入应用 target。
3. 在你的 `@main` App init 中，先安装 UIKit 解析器再启动服务器，
   然后注册生成的访问器。把示例中的 state/accessor 名称换成
   生成器实际找到的类型：

   ```swift
   #if DEBUG
   import DebugBridgeCore
   #if canImport(UIKit)
   import DebugBridgeUI
   #endif
   #endif

   // Inside App.init(), after appState is initialized:
   #if DEBUG
   #if canImport(UIKit)
   DebugBridgeUIWiring.installAll()
   #endif
   DebugBridgeManager.shared.start(
       appState: appState,
       register: AppStateAccessor.register
   )
   #endif
   ```

三个 SwiftPM target 的分工是：`DebugBridgeCore` 跨平台（所以在 CI 的 Mac 主机上跑 `swift build` 就能验证大部分代码，无需 UIKit）；`DebugBridgeUI` 和 `DebugBridgeTouch` 仅限 iOS（它们链接 UIKit）。`DebugBridgeTouch` 是 Objective-C——它承载派生自 KIF 的 UITouch 合成，以及让 SwiftUI Button 点按真正触发的 iOS 18+ `_UIHitTestContext` 修复。

结构性的 Release 构建防护是分层的。`Package.swift` 中的 `.when(configuration: .debug)` 子句意味着 SwiftPM 在 Release 构建中拒绝链接任何 `DebugBridge*` target，因此即使你忘记清理，桥接代码也上不了 TestFlight。在此之上，`DebugBridgeTouch.m` 的私有 API 触摸合成被编译在 `#if TARGET_OS_IOS && DEBUG` 之后（`DEBUG` 仅在该 target 的 debug 配置中经 `Package.swift` 的 `cSettings` 定义），因此触摸桥的 Release 编译产出一个空翻译单元——即便链接防护被绕过，二进制里也没有任何私有符号。

## 第 2 步：构建并安装到设备

在应用的项目目录下执行：

```
xcodebuild \
  -scheme YourAppScheme \
  -configuration Debug \
  -destination 'generic/platform=iOS' \
  -derivedDataPath /tmp/build \
  -allowProvisioningUpdates -allowProvisioningDeviceRegistration \
  CODE_SIGN_STYLE=Automatic \
  DEVELOPMENT_TEAM=YOUR_TEAM_ID \
  build
```

然后安装并启动：

```
UDID=$(xcrun devicectl list devices 2>/dev/null | awk 'NR>2 && $0!="" {print $(NF-2); exit}')
xcrun devicectl device install app --device "$UDID" /tmp/build/Build/Products/Debug-iphoneos/YourApp.app
xcrun devicectl device process launch --device "$UDID" --terminate-existing your.bundle.id
```

如果手机处于锁定状态，你会得到 `FBSOpenApplicationServiceErrorDomain error 1 — Locked`。解锁后重试。首次安装会在手机上弹出"信任"对话框；点一下"信任"，然后重跑。

## 第 3 步：启动 Mac 侧守护进程

两种做法。

**方案 A——交给技能拉起**。在 Claude Code 中从任何位置运行 `/ios-qa`；技能会按需拉起守护进程、引导隧道、轮换引导令牌，并通过代理暴露设备。这是本地 USB 使用最省事的路径。

**方案 B——自己启动**。运行：

```
gstack-ios-qa-daemon
```

两个回环监听器都绑定后，守护进程会打印 `READY: port=<n> pid=<pid>`。默认端口是 9099。拉起方可以用约 5 秒超时读这一行来确认就绪；你也可以把 `curl` 指向打印出的端口。

无论哪种方式，守护进程都会对 `~/.gstack/ios-qa-daemon.pid` 加独占 flock——从两个 Claude Code 会话各跑一次是安全的；第二次调用会发现运行中守护进程的端口并加入。

设置这些环境变量来指定设备或 bundle：

```
GSTACK_IOS_TARGET_UDID=248C3A58-B843-5BDB-8F5D-89ADB7D7BF6A
GSTACK_IOS_TARGET_BUNDLE_ID=com.yourorg.yourapp
GSTACK_IOS_DAEMON_PORT=9099       # 回环监听器端口；默认 9099
GSTACK_IOS_LAUNCH_ENV='{"DEBUG_BRIDGE":"1"}'   # 可选：守护进程启动应用时传给它的环境变量
```

`GSTACK_IOS_LAUNCH_ENV` 面向调试桥（或其他任何部分）以环境变量为开关的
应用。它是一个字符串到字符串的 JSON 对象，守护进程在其执行的每次启动中
都会把它传给 `xcrun devicectl device process launch
--environment-variables`，包括下文提到的强制重启。它只在守护进程启动
应用时生效；已在运行的应用保持它启动时的环境。JSON 无效、出现非字符串
值，或包含 `GSTACK_` 前缀键（为调试桥保留）时，启动会以
`IOS_LAUNCH_ENV_INVALID` 拒绝，而不是在缺少该变量的情况下启动应用。

如果未设置 `GSTACK_IOS_TARGET_UDID`，守护进程会挑选状态最好的已配对、
可用的 iPhone 或 iPad，优先有线设备。当两台设备不相上下（一台 iPhone
和一台 iPad 都在 USB 上）时，它拒绝瞎猜：引导错误会列出每台设备及其
UDID，并打印一条现成的
`export GSTACK_IOS_TARGET_UDID=<udid>`。
守护进程在其生命周期内维持一条健康的轮换隧道。当 CoreDevice
路由断开（`503 device_disconnected` / `504 upstream_timeout`）时，它会
为同一 UDID 重新解析隧道地址，并用手中已有的 bearer 探测运行中的
应用，应用因此保住自身状态。只有当应用拒绝该 bearer（401，应用被
重启过）、应用未在运行（做一次正常启动），或改选了另一台设备时，它才
重新引导；旧 bearer 绝不会发给另一台设备。响应丢失的点按或其他变更
操作绝不会被重放。
如果新启动的守护进程连上了一个已在运行的目标，而它的一次性引导
令牌已被先前的守护进程消费掉，它会校验 bundle 归属，强制重启该目标
一次，等待新令牌，再次校验归属，然后照常轮换。

## 第 4 步：驱动设备

守护进程跑起来后，你就在 `http://127.0.0.1:9099`（或 `[::1]:9099`）拥有一个 HTTP 接口面。技能流程会替你做这些，但原始端点如下：

| 端点 | 作用 | 鉴权 |
|---|---|---|
| `GET /healthz` | 版本探测。 | none (loopback) |
| `POST /auth/rotate` | 仅守护进程可用；把引导令牌轮换为仅存于内存的值。 | boot token |
| `POST /session/acquire` | 获取每设备会话锁。返回 `{session_id, ttl_seconds}`。 | bearer |
| `POST /session/release` | 释放该锁。 | bearer + session |
| `GET /screenshot` | 截取当前活动窗口的 PNG。返回 `{png_base64: "..."}`。 | bearer |
| `GET /elements` | 无障碍树快照。 | bearer |
| `GET /state/snapshot` | 把每个 `// @Snapshotable` 字段导出为 JSON。 | bearer |
| `POST /state/restore` | 校验完整快照，然后在 MainActor 上恢复。 | bearer + session, mutate tier |
| `POST /tap` `{x,y}` | 在窗口坐标合成一次真实的 UITouch。SwiftUI Button 会触发。 | bearer + session, interact tier |
| `POST /swipe` `{from_x,from_y,to_x,to_y}` | 滚动最近的外层 UIScrollView。 | bearer + session, interact tier |
| `POST /type` `{text}` | 在当前第一响应者上设置文本。 | bearer + session, interact tier |

变更类请求需要同时携带 `Authorization: Bearer <token>` 头和 `X-Session-Id` 头。只读端点（`/screenshot`、`/elements`、`GET /state/*`）只需要 bearer。

状态快照按字段选择性加入：在属性正上方放一条独立的生成器标记
注释。它有意不用 property wrapper，因此与 Observation 能干净地
一起编译：

```swift
@Observable
final class AppState {
    // @Snapshotable
    var username: String = ""

    var authToken: String = "" // never exported
}
```

未标记的字段绝不会出现在快照中，这默认就把令牌、PII（个人敏感信息）
和认证状态挡在录制 fixture 之外。被标记的字段必须是文件级 observable 类
上可写的实例 `var`，带显式类型和 internal 或 public 的 setter。支持的
快照类型是 JSON 原生标量（`String`、`Bool`、有符号/无符号整数各宽度、
`Float`、`Double`、`CGFloat`）、数组、以 String 为键的字典，以及这些
类型的 Optional 组合。快照键必须在所有 observable 类之间唯一。遇到无效
声明、自定义值、隐式解包 Optional、嵌套 observable 类或重复键，生成器
会报告并停止，而不是产出损坏或有损的 Swift。恢复分两个阶段：每个模型
先校验完整输入，之后才在 MainActor 上应用赋值。

## 第 5 步：让远程 agent 工作（可选）

要让另一台机器上的 agent 驱动设备，给守护进程加上 `--tailnet` 运行：

```
gstack-ios-qa-daemon --tailnet
```

守护进程先探测 `/var/run/tailscale.sock`；如果套接字缺失或不可读，它就完全拒绝打开 tailnet 监听器（回环监听照常运行）。远程模式从不半启动。

然后为应有权连接的身份铸造会话令牌：

```
gstack-ios-qa-mint grant --remote 'alice@example.com' --capability interact
gstack-ios-qa-mint grant --remote 'tag:ci' --capability mutate --ttl 86400 --note 'nightly'
gstack-ios-qa-mint list
```

能力层级是嵌套的：`observe`（仅只读端点）⊂ `interact`（点按、滑动、输入）⊂ `mutate`（`POST /state/*`）⊂ `restore`（`POST /state/restore`）。选能完成任务的最小层级。白名单文件在 `~/.gstack/ios-qa-allowlist.json`（权限 0600）——守护进程在每次 `/auth/mint` 请求时都会重读它，改动立即生效，无需重启。

远程 agent 随后向守护进程的 tailnet 监听器发起 `POST /auth/mint`。守护进程经 tailscaled 的 WhoIs 端点规范化调用方身份，核对白名单，然后返回一个短时会话令牌（默认 1 小时，上限 24 小时）。每个通过鉴权的变更请求都会落到 `~/.gstack/security/ios-qa-audit.jsonl`；被拒绝的请求落到 `~/.gstack/security/attempts.jsonl`。

## 第 6 步：发布 release 构建

在发布到 TestFlight 或 App Store 之前，运行 `/ios-clean`。它会移除 `DebugBridge` SPM 依赖，并从你的 `@main` App 中剥掉 `#if DEBUG` 接线。`Package.swift` 中的结构防护（`condition: .when(configuration: .debug)`）意味着即使你忘了清理，Release 构建也不会链接桥接代码，但 `/ios-clean` 给你一份干净利落的 diff 供评审和发布。

## 常见故障

| 症状 | 原因与处置 |
|---|---|
| `xcodebuild` 失败，报 `Could not locate device support files for iOS X.Y` | 运行 `xcodebuild -downloadPlatform iOS` 获取你 iPhone 的 iOS 版本对应的设备支持包（约 8GB）。 |
| 安装成功，但 `process launch` 失败并报 `Locked` | 手机被锁了。解锁后重试。 |
| 在已配对设备上首次安装失败且没有明确报错 | 手机需要信任这台 Mac。在手机上打开"设置 → 通用 → VPN 与设备管理"确认。 |
| "设置 → 隐私与安全性"里找不到开发者模式开关 | 把设备连接到 Xcode → Window → Devices and Simulators 一次，或对它执行任意 `devicectl device install`。首次尝试后 iOS 就会出现该开关。 |
| `xcrun devicectl device copy from` 返回 ERROR 7000 | 源路径不对——引导令牌在应用数据容器（NSTemporaryDirectory）内的 `tmp/gstack-ios-qa.token`，不在路径根部。 |
| 引导失败，报 `multiple_devices` | 连接了不止一台 iPhone/iPad。执行打印出的 `export GSTACK_IOS_TARGET_UDID=<udid>` 并重启守护进程。 |
| 启动被拒，报 `(IOS_LAUNCH_ENV_INVALID)` | `GSTACK_IOS_LAUNCH_ENV` 不是字符串到字符串的 JSON 对象，或设置了 `GSTACK_` 前缀键。修正或取消设置后重启守护进程；见[故障排查](/troubleshooting/#ios-launch-env-invalid)。 |
| `boot_token_unavailable ... could not write tmp/gstack-ios-qa.token` | 应用写不了自己的引导令牌文件。修复应用的 `tmp/` 目录并重新启动应用。 |
| iOS 26 上 SwiftUI 的 `DragGesture` 或 `Canvas` 对点按和滑动无响应 | iOS 26 上进程内合成的触摸到不了 SwiftUI 手势识别器，而 `/swipe` 只会滚动 `UIScrollView`。输入路由的绕行方案见 `/ios-qa` 技能中的 "Known limits"。 |
| `/healthz` 返回 200，但 `/tap` 返回 ok:true 且界面无变化 | 手机已配对，但 StateServer 端口可能随启动而变化。重新解析 CoreDevice IPv6（`dscacheutil -q host -a name '<DeviceName>.coredevice.local'`）。 |
| `/auth/mint` 返回 `403 identity_not_allowed` | 远程调用方的身份不在 Mac 的白名单里。在 Mac 上运行 `gstack-ios-qa-mint grant --remote <identity> --capability interact`。 |
| 守护进程打不开 tailnet 监听器 | 没装 Tailscale，或 `/var/run/tailscale.sock` 不可读。修好 Tailscale 后重启守护进程。期间回环监听照常运行。 |
| SwiftUI Button 点按返回 `ok:true` 但动作从不触发 | 你用的是 iOS 17 或更早版本，`_UIHitTestContext` 尚不存在。DebugBridgeTouch 实现会退回普通 `hitTest:`，它解析不进 SwiftUI 的手势容器。把设备升级到 iOS 18+，或改点 UIKit 控件。 |

## 你能得到什么

你可以用任何能说 HTTP 的语言写一个 agent 循环：截屏，问模型该做什么，发一个点按。在前后抓取状态快照，就能为 `/ios-fix` 回归测试录制确定性 fixture。把同事加进白名单，他就能从自己的笔记本经 Tailscale 驱动你的 iPhone，全程不碰硬件。给同一个守护进程铸一个带变更级能力和 24 小时 TTL 的 `tag:ci` 会话令牌，就能把它接入 CI。

整套技术栈就是你已有的 Mac、你已有的 iPhone、一个免费的 Apple 开发者账号，加上 gstack。没有付费测试服务，没有模拟器漂移。用户看到的东西，就是 agent 驱动的东西。
