# 扫描能证明什么，不能证明什么

<!-- freshness: 60d -->

2026 年 11 月这本实战手册在 X 上传开之后，开发者问得最多的问题，本页逐一作答。2026 年 11 月 19 日，约 300 条回复被通读并按主题归类。每个答案都指向本仓库中的一个文件，你可以去核对，而不必凭空相信。

## 1. 就绪的两半

扫描干净与提交就绪是两回事。守卫（the guard）读的是你的工程；审核员（reviewer）读的是你跑起来的构建、商店详情页（store listing）和审核说明（review notes）。最令人痛苦的拒审（rejection）大多出在后一半。

| 哪一半 | 覆盖什么 | 如何证明 |
|---|---|---|
| 扫描可查 | 源代码中的选定模式、Info.plist 中缺失的用途说明（purpose string）键、隐私清单（privacy manifest）、AndroidManifest 权限、Gradle 与 Xcode 构建设置、依赖中的 SDK 名称、占位文本、非商店支付代码的迹象。用途说明是否契合其功能属于人工检查 | `bash agent-os/hooks/app-store-compliance-guard.sh "/path/to/app"` |
| 只能由人证明 | 能登录的演示账号（demo account）、在线且存有测试数据的后端、说明每个功能位于何处的审核说明、你支持的每种设备家族上本构建的截图、在真机上可用的应用内账号删除、与真实流量相符的隐私营养标签、审核员能触达的应用内购买（In-App Purchase，IAP） | `.app-review-readiness.json`，由同一个守卫读取 |

自 2.5.0 版起，守卫每次运行都会把两半都打印出来。若没有就绪文件（readiness file），它会明说哪些检查它看不到。把[模板](https://github.com/mjmirza/app-store-compliance/blob/main/templates/app-review-readiness.json)复制进你的应用文件夹，在发布构建上逐项验证，填写 `pass`、`fail`、`n/a` 或 `todo`，并把 `checked_on` 设为当天。

- 标记为 `fail` 的检查总是阻断，因此一个坏掉的演示登录与一个缺失的用途说明一样，都会拦下这次提交。
- 在文件里设置 `"enforce": true`，或设置 `APP_STORE_GUARD_REQUIRE_READINESS=1`，则任何仍为 `todo` 的检查也会阻断。请在 CI 中使用这一招。
- 就绪文件存在却无法读取时，无论设置如何都会阻断，因为藏在里面的 fail 看不见。这包括 JSON 损坏、检查值不是纯文本、与就绪文件同名的文件夹或失效链接，以及没有 python3 的机器。以带字节顺序标记（BOM）的 UTF-8、UTF-16 或 UTF-32 保存的文件可以正常读取。
- `n/a` 只有在该检查的 `notes` 下写明原因时才作数。隐私营养标签检查从不接受 `n/a`，因为每个应用都有隐私营养标签。
- `checked_on` 日期超过 30 天、缺失或落在未来，都会被标记，因为上个月构建上的通过说明不了这一个构建的任何事。
- 在 monorepo 中，每个应用各自读取自己的文件。守卫会采用每个应用上方最近的就绪文件，直到工作区根目录为止，并报告它实际使用的那个文件。在单应用目录树中，它只读取你扫描的文件夹里的那一份。如果另一个就绪文件位于其下最多八层文件夹处（node_modules、Pods、.pub-cache 和 .git 之外），报告会把其中一个标为未读取，此时请扫描那个应用文件夹以启用它。文件中的重复键会被报告，取值中记录的 fail 仍然作数。

完整的人工走查见[提交前清单](PRE-SUBMISSION-CHECKLIST.md)。审核说明本身请使用[审核说明模板](https://github.com/mjmirza/app-store-compliance/blob/main/templates/REVIEW-NOTES-TEMPLATE.md)。

## 2. 规则有多新

一份过时的清单给人虚假的信心，好几位开发者表示这比没有清单更糟。因此现在每份报告都以这样一行开头。

```
Rule pack. v2.5.0. Its 109 dated sources were verified between 2026-07-13 and 2026-11-21 (newest 0 days ago). The checks run against this dated snapshot, not the live guideline pages.
Rule pack. 2 of 109 dated sources were last verified more than 60 days ago, so their rules may have changed since. Each one carries its date as verified_on in data/regulatory-deadlines.json.
```

- 这些检查是一份快照，不是对 Apple 或 Google 页面的实时读取。[data/regulatory-deadlines.json](https://github.com/mjmirza/app-store-compliance/blob/main/data/regulatory-deadlines.json) 中的每个截止日期都带有读取它所用的 `source_url` 和 `verified_on` 日期。
- 这一行会显示最旧与最新的来源日期，并统计超出时间窗的来源数量，因此一条新鲜的记录掩盖不了陈旧的记录。当连最新的来源也超过 60 天时，守卫会打印 `Rule pack STALE` 和更新命令。时间窗可用 `APP_STORE_GUARD_STALE_DAYS` 调整。若日期无法读取或比较，它会明说新鲜度未检查，而不是保持沉默。
- 巡检（sweep）约每两个月进行一次，并写成差距分析（gap analysis），最新一篇是 [2026 年 11 月](GAP-ANALYSIS-2026-11.md)。两次巡检之间，`scripts/monitor*.py` 中的监控脚本会盯住 Apple 的新闻源与 Play 政策页面。

## 3. 两大商店，深度相近

这本实战手册同时覆盖 Apple App Store 与 Google Play。有人问 Play 是不是附属品。并不是，下面的数字可以说明（2026 年 11 月 21 日取自本仓库）。

| | Apple | Google Play | 两者共有 |
|---|---|---|---|
| `data/rejection-patterns.json` 中的拒审模式 | 62 | 43 | 13 |
| 守卫中独立的代码检查 | 34 | 38（20 项 Play 政策，18 项 Android 构建） | 5 |
| 规则地图 | [APPLE.md](APPLE.md) | [GOOGLE-PLAY.md](GOOGLE-PLAY.md) | [MISTAKE-PATTERNS.md](MISTAKE-PATTERNS.md) |

在 Play 上，守卫会读取每个 `AndroidManifest.xml` 检查敏感权限（后台定位、短信与通话记录、所有文件、无障碍、照片与视频、前台服务特殊用途），在 Gradle 中核对目标 SDK 与 64 位 ABI，检查数字商品是否接入了 Play Billing，并标记分析或广告 SDK，以便你去核对数据安全（Data safety）表单。截图与构建不一致，在两个商店都属于人工检查项。

Mac App Store 与 Apple 的审核指南共用一套规则，在代码共用的范围内被覆盖。商店外分发应用的公证（notarization）与 Developer ID 见 [PLATFORM-MECHANICS-2026.md](PLATFORM-MECHANICS-2026.md)。

守卫未覆盖的范围：华为 AppGallery 及其他中国 Android 商店、Samsung Galaxy Store 等的规则。它们的审核规则汇总在 [OTHER-STORES.md](OTHER-STORES.md) 供阅读，背后没有代码检查。新的个人 Google Play 账号在进入正式版（production）前，还需要至少 12 名测试者连续 14 天的封闭测试。守卫看不到 Play Console，因此这一项只能作为清单事项。

## 4. Guideline 4.3 垃圾应用与 4.2 最低功能要求：坦率地说

许多回复都在问 4.3，而且往往是在被拒八到十次之后。静态扫描无法判定 4.3。Apple 判断的依据，是你的二进制文件、元数据和创意是否与商店里已有的应用（包括其他开发者的应用）相像，而那个商店并不在你的仓库里。

针对 4.3 和 4.2，实战手册能做的事。

- 标记几乎没有原生功能的 WebView、Capacitor 或 Cordova 壳应用（IONIC-4.2-THIN-WRAPPER）。这只是启发式判断，不是结论。
- 在 [MISTAKE-PATTERNS.md](MISTAKE-PATTERNS.md) 中点出 4.3 背后的流程性成因：同一账号下大量近乎相同的应用、模板应用或转售应用、为应用变体复制 bundle ID，以及以低投入挤进已饱和的细分赛道。
- 在[申诉实战手册](MISTAKE-PATTERNS.md#申诉实战手册)里给出有效的答复方式。不要盲目重新提交。在 Resolution Center 中逐条回应 App Review，说明你的应用独特在哪里、面向谁，并附上一段展示关键差异功能的简短录屏。

它做不到的事：告诉你你的创意与别人的过于接近。任何声称能做到这一点的工具都值得怀疑。

## 5. 开发者报告的拒审，以及本工具能否捕获

取自开发者 2026 年 11 月在公开回复中描述的拒审原因。它们是开发者自己的陈述，不是经过核实的拒审函。原因含糊的，表中如实注明。

| 报告的拒审原因 | 捕获手段 | 可靠程度 |
|---|---|---|
| 缺失隐私清单、用途说明与实际不符 | 守卫。键缺失时报 APPLE-PRIVACY-MANIFEST-MISSING 和 APPLE-5.1.1-MISSING-USAGE-DESCRIPTION，另有 `scripts/validate-privacy-manifest.py`。措辞是否契合功能不在检查范围 | 缺键靠扫描，措辞靠人工 |
| 引导按钮在定位权限弹窗之前写着 "Allow permissions"，而 Apple 要求写成 "Continue" | 守卫。2.5.0 新增的 APPLE-5.1.1-PRE-PROMPT-ALLOW-BUTTON，在按钮与权限请求位于同一文件时触发 | 扫描，中等强度，据报告可能捕获 |
| 审核员无法登录 | 守卫。后端为预发环境或 localhost 时报 APPLE-2.1-STAGING-BACKEND，另外还有就绪文件中的 `demo_account` | 扫描标记一部分，其余由人工证明 |
| 审核员找不到应用内购买 | 就绪文件中的 `iap_reachable_by_reviewer` 与 `review_notes` | 人工 |
| 六次拒审中有五次是账号信息与隐私政策 | 守卫。APPLE-5.1.1-MISSING-PRIVACY-POLICY 和 GOOGLE-MISSING-PRIVACY-POLICY，详情页 URL 由 `scripts/metadata-audit.py` 检查 | 部分覆盖 |
| 在 iOS 应用内提到 Google Play 或某个 Android API | `scripts/metadata-audit.py` 对详情页文本检查 APPLE-2.3-CROSS-PLATFORM-REFERENCE。二进制内的字符串不在检查范围 | 部分覆盖 |
| AI 生成的网页壳应用以 4.2 被拒 | 守卫。对 WebView 壳报 IONIC-4.2-THIN-WRAPPER | 扫描，启发式 |
| 4.3(a) 与 4.3(b) 垃圾应用、重复应用、饱和细分赛道 | 扫描无法判定。见第 4 节 | 仅指导 |
| UI 未做到"1:1 且各屏幕一致" | 未覆盖。所报告的原因过于含糊，无法对应到某条审核指南 | 无 |
| iPad 布局与 iPad 截图 | 就绪文件中的 `screenshots_match_build`。iPad 上的布局不做扫描 | 人工 |
| 向已用过试用资格的 Apple ID 展示试用或介绍性优惠文案 | 不做扫描。展示试用文案前请检查 `Product.SubscriptionInfo.isEligibleForIntroOffer`（StoreKit 2），并说明试用期结束后收取什么费用（3.1.2(a)） | 仅指导 |
| 删除账号后账号仍能重新登录 | 守卫。APPLE-5.1.1-NO-ACCOUNT-DELETION 和 APPLE-ACCOUNT-DELETION-WEAK，另外还有就绪文件中的 `account_deletion_device_test` | 扫描找到流程，人工证明其可用 |
| 第三方 SDK 带进来的权限 | 守卫。跟踪 SDK 报 APPLE-5.1.2-MISSING-ATT，需说明理由的 SDK 报 APPLE-PRIVACY-MANIFEST-MISSING，分析与广告 SDK 报 GOOGLE-DATASAFETY-MISMATCH | 部分覆盖 |

标注为"无"或"仅指导"的行就是诚实的空白。如果你因其中某项被拒，请带上拒审函中的指南编号[提交 issue](https://github.com/mjmirza/app-store-compliance/issues)，它会变成一条检查或一个成文的模式。

## 6. 扫描干净不等于过审

`CLEAR.` 的含义是：扫描看得见的范围内没有关键风险。它不等于 Apple 或 Google 会批准。审核员也是人，提交仍可能因主观判断被拒。实战手册帮你省下的，是本可避免的拒审之后那一轮额外的返工，而不是排队时间本身。

关于排队时间，Apple 的 App Review 页面称，至少 50% 的提交在 24 小时内完成审核，90% 在 48 小时内完成（[Apple](https://developer.apple.com/distribute/app-review/)）。回复区的开发者经历的时间从当天到五周不等，新应用和被拒后的那一轮最久。如果关键的 bug 修复被卡住，Apple 接受附带 bug 复现步骤的加急审核申请。

## 7. 守卫何时运行，退出码意味着什么

手动运行时，报告以一行判定收尾，退出码与判定一致。其后可能跟一行 `Next.`，写明下一步该做什么。

| 退出码 | 判定行 | 含义 |
|---|---|---|
| 0 | `CLEAR.` | 扫描可见范围内无关键风险。不等于过审 |
| 2 | `BLOCKED.` | 代码中存在关键风险，或某项人工检查被记录为失败 |
| 1 | `NOT CHECKED.` | 未找到 iOS 或 Android 工程，什么都没有被证明。在 CI 中按失败处理，绝不能当作通过 |

`APP_STORE_GUARD_OK=1` 会把阻断改为退出码 0，并打印一行 `APP_STORE_GUARD_OK set.`，同时记录本次运行。只对你已人工核实过的发现使用它。

作为 AI 编码工具中的钩子（hook），守卫只在该工具即将执行提交命令时运行（fastlane、eas submit、xcrun altool、Gradle release bundle，以及 README 中的其他命令）。由此有两点推论。

- `NOT CHECKED` 结果默认放行命令，因此钩子绝不会在非应用文件夹里挡住你的工作。若想改为阻断，设置 `APP_STORE_GUARD_BLOCK_UNCHECKED=1`。
- 你在终端或 CI 中自行发起的提交不经过钩子。这两处也要调用守卫。在 CI 步骤中，对应用文件夹运行它，并在退出码不为 0 时停止。

```
bash /path/to/app-store-compliance/agent-os/hooks/app-store-compliance-guard.sh "$PWD"
```

在 Fastlane 中，把同一条命令放进 `before_all` 块并用 `sh(...)` 执行，即可中止 lane，因为 `sh` 在非零退出时会失败。

## 8. 运行它安全吗

无论 star 数多少，先读脚本再信任。以下是值得关注的地方。

- 守卫是单个 Bash 文件：[agent-os/hooks/app-store-compliance-guard.sh](https://github.com/mjmirza/app-store-compliance/blob/main/agent-os/hooks/app-store-compliance-guard.sh)。它只读取你的工程，只写入自己的临时文件并在退出时删除，绝不编辑、移动或删除你应用中的任何文件。
- 守卫不发起任何网络调用。它只在运行本仓库中的本地辅助脚本时调用 `python3`（截止日期清单、就绪文件、清单解析器）。
- `scripts/monitor*.py` 中的监控脚本确实会抓取 Apple 与 Google 页面，而且只在你运行它们时才抓取。
- `scripts/install.sh` 会写入你的 AI 工具配置文件夹，并备份它改动过的每个设置文件。先运行 `bash scripts/install.sh --dry-run` 查看所有写入操作。
- 想更严格的话，可以在容器或一次性虚拟机中运行守卫，并把工程以只读方式挂载。

在脚本中发现了安全问题？请按 [SECURITY.md](https://github.com/mjmirza/app-store-compliance/blob/main/.github/SECURITY.md) 中的说明私下报告。
