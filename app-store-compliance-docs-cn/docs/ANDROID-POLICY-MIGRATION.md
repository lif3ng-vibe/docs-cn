<!-- ANDROID_POLICY_MONITOR_START -->

> **模拟输出，并非实时公告**。本文件由示例公告生成（内置集合、默认集合，或通过
> `--mock` 传入的文件）。下方的标题、发布日期与说明均为示例，用于展示迁移报告的
> 形态，并非真实发布内容。只有所链接的官方文档 URL 是真实的。在将此处任何内容
> 视为实际要求之前，请先用 `--live` 针对真实订阅源重新运行监控。

# Android 与 Google Play 政策迁移与要求报告

本报告由 `scripts/monitor-android.py` 持续生成与更新，用于跟踪各合规领域。

## 受监控要求更新日志

### 1. [Google Play 开发者政策] Google Play 执法流程
- **发布日期**：2026 年 6 月 10 日 星期三 10:00:00 PDT
- **官方资源**：[https://support.google.com/googleplay/android-developer/answer/9899234](https://support.google.com/googleplay/android-developer/answer/9899234)
- **说明**：Google Play 针对政策违规的执法流程涵盖拒审、下架、封停、限制可见性与账号终止，依据包括应用元数据、应用内体验与账号信息。

### 2. [Play Console 公告] Play Console 个人账号强制身份验证新规
- **发布日期**：2026 年 6 月 15 日 星期一 09:00:00 PDT
- **官方资源**：[https://support.google.com/googleplay/android-developer/answer/10788890](https://support.google.com/googleplay/android-developer/answer/10788890)
- **说明**：为增进用户信任，Google Play 要求所有在近期政策更新之前创建的个人开发者账号在 2026 年 9 月 30 日前完成强制身份验证。未完成验证将导致更新受阻，商店详情页最终会被移除。

### 3. [目标 SDK 要求] Google Play 目标 SDK 政策：2026 年 8 月 31 日前支持 Android 16（API 36）
- **发布日期**：2026 年 3 月 1 日 星期日 08:00:00 PDT
- **官方资源**：[https://developer.android.com/google/play/requirements/target-sdk](https://developer.android.com/google/play/requirements/target-sdk)
- **说明**：Google Play 正在更新其目标 SDK 要求。自 2026 年 8 月 31 日起，所有新应用与现有应用的更新都必须以 Android 16（API 36）或更高版本为目标。未达到该门槛的提交将被发布门禁拦截。

### 4. [最低 SDK 要求] Android 5.0 弃用对应的最低 SDK 要求政策变更
- **发布日期**：2026 年 3 月 12 日 星期四 11:00:00 PDT
- **官方资源**：[https://developer.android.com/about/versions](https://developer.android.com/about/versions)
- **说明**：为在整个 Google Play 生态中保持高安全性与高性能，应用必须将 minSdkVersion 设为 23（Android 6.0）或更高才能获得更新，此举正式弃用对旧版 Android 5.0 与 5.1（API 21/22）的支持。

### 5. [Android API 弃用] Android 5.0 弃用对应的最低 SDK 要求政策变更
- **发布日期**：2026 年 3 月 12 日 星期四 11:00:00 PDT
- **官方资源**：[https://developer.android.com/about/versions](https://developer.android.com/about/versions)
- **说明**：为在整个 Google Play 生态中保持高安全性与高性能，应用必须将 minSdkVersion 设为 23（Android 6.0）或更高才能获得更新，此举正式弃用对旧版 Android 5.0 与 5.1（API 21/22）的支持。

### 6. [Play Console 公告] 旧版 SafetyNet Attestation API 的弃用与停用时间表
- **发布日期**：2026 年 3 月 20 日 星期五 12:00:00 PDT
- **官方资源**：[https://developer.android.com/google/play/integrity/overview](https://developer.android.com/google/play/integrity/overview)
- **说明**：如此前公告所述，旧版 SafetyNet Attestation API 已完全弃用并停用。所有反滥用、安全检查与完整性校验流程都必须迁移到现代的 Play Integrity API。

### 7. [Android API 弃用] 旧版 SafetyNet Attestation API 的弃用与停用时间表
- **发布日期**：2026 年 3 月 20 日 星期五 12:00:00 PDT
- **官方资源**：[https://developer.android.com/google/play/integrity/overview](https://developer.android.com/google/play/integrity/overview)
- **说明**：如此前公告所述，旧版 SafetyNet Attestation API 已完全弃用并停用。所有反滥用、安全检查与完整性校验流程都必须迁移到现代的 Play Integrity API。

### 8. [Play Integrity API] 旧版 SafetyNet Attestation API 的弃用与停用时间表
- **发布日期**：2026 年 3 月 20 日 星期五 12:00:00 PDT
- **官方资源**：[https://developer.android.com/google/play/integrity/overview](https://developer.android.com/google/play/integrity/overview)
- **说明**：如此前公告所述，旧版 SafetyNet Attestation API 已完全弃用并停用。所有反滥用、安全检查与完整性校验流程都必须迁移到现代的 Play Integrity API。

### 9. [Play Console 公告] Android 权限模型更新：分区媒体与存储授权
- **发布日期**：2026 年 3 月 23 日 星期一 14:00:00 PDT
- **官方资源**：[https://developer.android.com/guide/topics/permissions/overview](https://developer.android.com/guide/topics/permissions/overview)
- **说明**：在更新后的用户数据政策与 Android 权限模型下，申请 READ_MEDIA_IMAGES 与 READ_MEDIA_VIDEO 权限的应用将面临更严格的核验。大范围照片访问受到限制，官方敦促开发者迁移到原生 Android Photo Picker。

### 10. [Android 权限模型] Android 权限模型更新：分区媒体与存储授权
- **发布日期**：2026 年 3 月 23 日 星期一 14:00:00 PDT
- **官方资源**：[https://developer.android.com/guide/topics/permissions/overview](https://developer.android.com/guide/topics/permissions/overview)
- **说明**：在更新后的用户数据政策与 Android 权限模型下，申请 READ_MEDIA_IMAGES 与 READ_MEDIA_VIDEO 权限的应用将面临更严格的核验。大范围照片访问受到限制，官方敦促开发者迁移到原生 Android Photo Picker。

### 11. [用户数据政策] Android 权限模型更新：分区媒体与存储授权
- **发布日期**：2026 年 3 月 23 日 星期一 14:00:00 PDT
- **官方资源**：[https://developer.android.com/guide/topics/permissions/overview](https://developer.android.com/guide/topics/permissions/overview)
- **说明**：在更新后的用户数据政策与 Android 权限模型下，申请 READ_MEDIA_IMAGES 与 READ_MEDIA_VIDEO 权限的应用将面临更严格的核验。大范围照片访问受到限制，官方敦促开发者迁移到原生 Android Photo Picker。

### 12. [后台执行限制] Android 后台执行与精确闹钟受到严格限制
- **发布日期**：2026 年 3 月 27 日 星期五 15:00:00 PDT
- **官方资源**：[https://developer.android.com/about/versions/14/changes/schedule-exact-alarms](https://developer.android.com/about/versions/14/changes/schedule-exact-alarms)
- **说明**：为节省系统电量并提升设备性能，Android 正在引入更严格的运行时检查。对精确闹钟（SCHEDULE_EXACT_ALARM）与后台唤醒锁的更严限制将触发自动的任务节流。

### 13. [Play Console 公告] Play Console 新增前台服务类型声明强制要求
- **发布日期**：2026 年 3 月 31 日 星期二 16:00:00 PDT
- **官方资源**：[https://developer.android.com/guide/components/foreground-services](https://developer.android.com/guide/components/foreground-services)
- **说明**：所有以 API 34+ 为目标且运行前台服务的应用，都必须在其清单（manifest）中声明有效的 foregroundServiceType 属性、持有对应的 FOREGROUND_SERVICE 权限，并在 Play Console 提交详细的前台服务声明与视频。

### 14. [前台服务政策] Play Console 新增前台服务类型声明强制要求
- **发布日期**：2026 年 3 月 31 日 星期二 16:00:00 PDT
- **官方资源**：[https://developer.android.com/guide/components/foreground-services](https://developer.android.com/guide/components/foreground-services)
- **说明**：所有以 API 34+ 为目标且运行前台服务的应用，都必须在其清单（manifest）中声明有效的 foregroundServiceType 属性、持有对应的 FOREGROUND_SERVICE 权限，并在 Play Console 提交详细的前台服务声明与视频。

### 15. [Privacy Sandbox] Privacy Sandbox 技术已排定在 Android 上逐步淘汰
- **发布日期**：2026 年 4 月 1 日 星期三 10:00:00 PDT
- **官方资源**：[https://privacysandbox.google.com/blog/update-on-plans-for-privacy-sandbox-technologies](https://privacysandbox.google.com/blog/update-on-plans-for-privacy-sandbox-technologies)
- **说明**：Google 已排定逐步淘汰 Privacy Sandbox 技术，其中包括 Android 上的 Topics 与 Attribution Reporting API。应用与 SDK 不应再基于这些 API 构建，并应排查仍在调用它们的代码。

### 16. [Google Play 开发者政策] Play Integrity API 更新：Nonce 校验与完整性令牌强制检查
- **发布日期**：2026 年 4 月 6 日 星期一 11:00:00 PDT
- **官方资源**：[https://developer.android.com/google/play/integrity](https://developer.android.com/google/play/integrity)
- **说明**：为缓解中间人重放攻击，Google Play Integrity API 现在强制要求在发放安全载荷之前完成服务端加密 nonce 校验和严格的完整性令牌检查。

### 17. [Play Console 公告] Play Integrity API 更新：Nonce 校验与完整性令牌强制检查
- **发布日期**：2026 年 4 月 6 日 星期一 11:00:00 PDT
- **官方资源**：[https://developer.android.com/google/play/integrity](https://developer.android.com/google/play/integrity)
- **说明**：为缓解中间人重放攻击，Google Play Integrity API 现在强制要求在发放安全载荷之前完成服务端加密 nonce 校验和严格的完整性令牌检查。

### 18. [Play Integrity API] Play Integrity API 更新：Nonce 校验与完整性令牌强制检查
- **发布日期**：2026 年 4 月 6 日 星期一 11:00:00 PDT
- **官方资源**：[https://developer.android.com/google/play/integrity](https://developer.android.com/google/play/integrity)
- **说明**：为缓解中间人重放攻击，Google Play Integrity API 现在强制要求在发放安全载荷之前完成服务端加密 nonce 校验和严格的完整性令牌检查。

### 19. [Play Billing] Play Billing Library v8.0 强制迁移截止日期
- **发布日期**：2026 年 4 月 8 日 星期三 12:00:00 PDT
- **官方资源**：[https://developer.android.com/google/play/billing/deprecation-faq](https://developer.android.com/google/play/billing/deprecation-faq)
- **说明**：到 2026 年 8 月 31 日，所有新应用与现有应用的更新都必须迁移到 Play Billing Library 8.0 或更高版本。尝试使用更早的 Billing Library 版本（包括 v7.x 及以下）发布的应用将被自动拦截。

### 20. [用户数据政策] Google Play 用户数据删除与 Web URL 强制要求更新
- **发布日期**：2026 年 4 月 10 日 星期五 13:00:00 PDT
- **官方资源**：[https://support.google.com/googleplay/android-developer/answer/13327111](https://support.google.com/googleplay/android-developer/answer/13327111)
- **说明**：所有允许应用内创建账号的应用，必须同时向用户提供应用内账号删除流程和一个公开的 Web 端数据删除 URL。无法访问或失效的删除 URL 将触发自动化的商店拒审。

### 21. [Google Play 开发者政策] 数据安全（Data Safety）声明不一致执法：自动静态 SDK 扫描
- **发布日期**：2026 年 4 月 13 日 星期一 14:00:00 PDT
- **官方资源**：[https://support.google.com/googleplay/android-developer/answer/10787469](https://support.google.com/googleplay/android-developer/answer/10787469)
- **说明**：Google Play 正在引入针对编译后二进制文件的增强静态扫描。系统将自动扫描分析类（Firebase、Facebook、AppsFlyer）与广告类 SDK，凡数据安全声明与实际跟踪行为不符的提交一律拒审。

### 22. [用户数据政策] 数据安全（Data Safety）声明不一致执法：自动静态 SDK 扫描
- **发布日期**：2026 年 4 月 13 日 星期一 14:00:00 PDT
- **官方资源**：[https://support.google.com/googleplay/android-developer/answer/10787469](https://support.google.com/googleplay/android-developer/answer/10787469)
- **说明**：Google Play 正在引入针对编译后二进制文件的增强静态扫描。系统将自动扫描分析类（Firebase、Facebook、AppsFlyer）与广告类 SDK，凡数据安全声明与实际跟踪行为不符的提交一律拒审。

### 23. [数据安全部分] 数据安全（Data Safety）声明不一致执法：自动静态 SDK 扫描
- **发布日期**：2026 年 4 月 13 日 星期一 14:00:00 PDT
- **官方资源**：[https://support.google.com/googleplay/android-developer/answer/10787469](https://support.google.com/googleplay/android-developer/answer/10787469)
- **说明**：Google Play 正在引入针对编译后二进制文件的增强静态扫描。系统将自动扫描分析类（Firebase、Facebook、AppsFlyer）与广告类 SDK，凡数据安全声明与实际跟踪行为不符的提交一律拒审。

### 24. [Firebase 政策更新] 数据安全（Data Safety）声明不一致执法：自动静态 SDK 扫描
- **发布日期**：2026 年 4 月 13 日 星期一 14:00:00 PDT
- **官方资源**：[https://support.google.com/googleplay/android-developer/answer/10787469](https://support.google.com/googleplay/android-developer/answer/10787469)
- **说明**：Google Play 正在引入针对编译后二进制文件的增强静态扫描。系统将自动扫描分析类（Firebase、Facebook、AppsFlyer）与广告类 SDK，凡数据安全声明与实际跟踪行为不符的提交一律拒审。

### 25. [AI 生成内容政策] Google Play 生成式 AI 安全防护与应用内举报要求
- **发布日期**：2026 年 4 月 16 日 星期四 15:00:00 PDT
- **官方资源**：[https://support.google.com/googleplay/android-developer/answer/14747720](https://support.google.com/googleplay/android-developer/answer/14747720)
- **说明**：集成生成式 AI 或对话式 LLM 的应用必须提供可靠的用户安全控制，包括醒目的披露声明、应用内内容举报/标记机制、用户拉黑，以及防止深度伪造/NSFW 输出的防护措施。

### 26. [无障碍要求] Google Play 无障碍服务滥用与触摸目标审计
- **发布日期**：2026 年 4 月 21 日 星期二 16:00:00 PDT
- **官方资源**：[https://support.google.com/googleplay/android-developer/answer/10964491](https://support.google.com/googleplay/android-developer/answer/10964491)
- **说明**：Google Play 将标记并拒审申请 BIND_ACCESSIBILITY_SERVICE 权限的非无障碍应用。此外，应用还将面临严格审计，要求触摸目标尺寸不小于 48dp，且所有可交互元素都配有内容描述。

### 27. [设备兼容性要求] 设备兼容性与折叠屏布局指南更新
- **发布日期**：2026 年 4 月 24 日 星期五 17:00:00 PDT
- **官方资源**：[https://developer.android.com/guide/topics/large-screens/get-started-with-large-screens](https://developer.android.com/guide/topics/large-screens/get-started-with-large-screens)
- **说明**：Android 版本更新了相关指南，强制要求在多窗口系统、平板与折叠屏设备上保持屏幕与宽高比兼容。应用必须支持动态调整大小，并在可行的情况下避免固定的方向限制。

### 28. [Google Play 开发者政策] Android 安全公告：加密 Keystore 隔离强制要求
- **发布日期**：2026 年 4 月 27 日 星期一 10:00:00 PDT
- **官方资源**：[https://source.android.com/docs/security/bulletin](https://source.android.com/docs/security/bulletin)
- **说明**：一份 Android 安全公告披露了高危漏洞（CVE-2026-X）。应用开发者被要求将敏感的用户机密与凭据隔离在基于硬件的 Android Keystore 系统中，并强制使用生物识别。

### 29. [安全公告] Android 安全公告：加密 Keystore 隔离强制要求
- **发布日期**：2026 年 4 月 27 日 星期一 10:00:00 PDT
- **官方资源**：[https://source.android.com/docs/security/bulletin](https://source.android.com/docs/security/bulletin)
- **说明**：一份 Android 安全公告披露了高危漏洞（CVE-2026-X）。应用开发者被要求将敏感的用户机密与凭据隔离在基于硬件的 Android Keystore 系统中，并强制使用生物识别。

### 30. [Play Console 公告] Android Enterprise 工作资料安全策略增强
- **发布日期**：2026 年 4 月 30 日 星期四 11:00:00 PDT
- **官方资源**：[https://developer.android.com/work](https://developer.android.com/work)
- **说明**：Google 宣布针对企业与工作资料应用的新 Android Enterprise 标准。DevicePolicyManager 下的增强控制可建立安全的数据边界，阻止侧载与个人应用数据泄露。

### 31. [Android Enterprise 要求] Android Enterprise 工作资料安全策略增强
- **发布日期**：2026 年 4 月 30 日 星期四 11:00:00 PDT
- **官方资源**：[https://developer.android.com/work](https://developer.android.com/work)
- **说明**：Google 宣布针对企业与工作资料应用的新 Android Enterprise 标准。DevicePolicyManager 下的增强控制可建立安全的数据边界，阻止侧载与个人应用数据泄露。

### 32. [Google Play 开发者政策] Firebase 政策更新：Dynamic Links 强制弃用与隐私规则
- **发布日期**：2026 年 5 月 4 日 星期一 09:00:00 PDT
- **官方资源**：[https://firebase.google.com/support/privacy](https://firebase.google.com/support/privacy)
- **说明**：Firebase 正在逐步停用 Dynamic Links，要求开发者迁移到 Firebase Hosting Deep Links、App Links 或 universal links。此外，更新后的 Realtime Database 与 Cloud Firestore 规则强制执行严格的授权边界。

### 33. [Android API 弃用] Firebase 政策更新：Dynamic Links 强制弃用与隐私规则
- **发布日期**：2026 年 5 月 4 日 星期一 09:00:00 PDT
- **官方资源**：[https://firebase.google.com/support/privacy](https://firebase.google.com/support/privacy)
- **说明**：Firebase 正在逐步停用 Dynamic Links，要求开发者迁移到 Firebase Hosting Deep Links、App Links 或 universal links。此外，更新后的 Realtime Database 与 Cloud Firestore 规则强制执行严格的授权边界。

### 34. [Firebase 政策更新] Firebase 政策更新：Dynamic Links 强制弃用与隐私规则
- **发布日期**：2026 年 5 月 4 日 星期一 09:00:00 PDT
- **官方资源**：[https://firebase.google.com/support/privacy](https://firebase.google.com/support/privacy)
- **说明**：Firebase 正在逐步停用 Dynamic Links，要求开发者迁移到 Firebase Hosting Deep Links、App Links 或 universal links。此外，更新后的 Realtime Database 与 Cloud Firestore 规则强制执行严格的授权边界。

## 自动化迁移建议与实施任务

### 针对 Google Play 开发者政策的任务
- **监管影响**：高优先级。发布门禁要求采取行动。
- [ ] **任务 1**：对照开发者政策审计应用元数据、商店详情页内容与应用内体验。
- [ ] **任务 2**：查看 Play Console 政策执法通知，并清除仍未解除的警告。

### 针对 Play Console 公告的任务
- **监管影响**：高优先级。发布门禁要求采取行动。
- [ ] **任务 1**：为开发者账号完成 Play Console 强制身份验证。
- [ ] **任务 2**：每周查看 Play Console 收件箱公告，关注强制发布门禁的更新。

### 针对目标 SDK 要求的任务
- **监管影响**：高优先级。发布门禁要求采取行动。
- [ ] **任务 1**：将 Gradle 构建文件中的 `targetSdkVersion` 与 `compileSdkVersion` 更新到 API 36（Android 16）。
- [ ] **任务 2**：针对 Android 16 目标 API 行为变更执行回归测试。

### 针对最低 SDK 要求的任务
- **监管影响**：高优先级。发布门禁要求采取行动。
- [ ] **任务 1**：对照 AndroidX、Play 服务与 Firebase 依赖所要求的最低版本检查 `minSdkVersion`。Google Play 本身设定的是目标 API 下限，而非 minSdk 下限。
- [ ] **任务 2**：清理针对已弃用 API 级别 21/22 的旧条件判断。

### 针对 Android API 弃用的任务
- **监管影响**：高优先级。发布门禁要求采取行动。
- [ ] **任务 1**：审计代码库中的已弃用 API（例如旧版 SafetyNet Attestation），并替换为现代 API。
- [ ] **任务 2**：移除各模块依赖中对已弃用 Android 类的引用。

### 针对 Play Integrity API 的任务
- **监管影响**：高优先级。发布门禁要求采取行动。
- [ ] **任务 1**：在客户端实现带加密 nonce 的 Play Integrity API 令牌请求。
- [ ] **任务 2**：部署服务端令牌解密与校验检查。

### 针对 Android 权限模型的任务
- **监管影响**：高优先级。发布门禁要求采取行动。
- [ ] **任务 1**：审计 `AndroidManifest.xml` 中的 `<uses-permission>` 标签，剔除不必要的敏感权限。
- [ ] **任务 2**：采用原生 Android Photo Picker 与分区媒体存储权限。

### 针对用户数据政策的任务
- **监管影响**：高优先级。发布门禁要求采取行动。
- [ ] **任务 1**：为用户提供应用内的账号与数据删除路径。
- [ ] **任务 2**：发布公开的 Web 数据删除 URL，并在 Play Console 的用户数据安全表单中填写该链接。

### 针对后台执行限制的任务
- **监管影响**：高优先级。发布门禁要求采取行动。
- [ ] **任务 1**：审计 `WorkManager`、`JobScheduler` 与 `AlarmManager` 的使用情况，检查执行时长限制。
- [ ] **任务 2**：检查 `SCHEDULE_EXACT_ALARM` 的使用，并在适用处迁移到非精确闹钟。

### 针对前台服务政策的任务
- **监管影响**：高优先级。发布门禁要求采取行动。
- [ ] **任务 1**：在面向 API 34+ 的清单 `<service>` 声明中指定 `foregroundServiceType`。
- [ ] **任务 2**：在 Play Console 的应用内容页面完成前台服务声明，并为每个前台服务功能附上视频链接。

### 针对 Privacy Sandbox 的任务
- **监管影响**：高优先级。发布门禁要求采取行动。
- [ ] **任务 1**：审查 Advertising ID 与归因类 SDK 的使用。自 2025 年 10 月起，Google 已将 Android 上的 Topics 与 Attribution Reporting API 排定逐步淘汰，因此不要采用它们。
- [ ] **任务 2**：确认 Advertising ID 权限与数据安全表单同广告类与分析类 SDK 实际收集的内容一致。

### 针对 Play Billing 的任务
- **监管影响**：高优先级。发布门禁要求采取行动。
- [ ] **任务 1**：将项目依赖迁移到 Play Billing Library 8.0 或更高版本。
- [ ] **任务 2**：在 Google Play Console 沙盒环境中执行测试交易。

### 针对数据安全部分的任务
- **监管影响**：高优先级。发布门禁要求采取行动。
- [ ] **任务 1**：审计第三方 SDK（Firebase、Facebook、AppsFlyer）的运行时网络流量。
- [ ] **任务 2**：更新 Play Console 数据安全问卷中的声明，使其与运行时行为保持一致。

### 针对 Firebase 政策更新的任务
- **监管影响**：高优先级。发布门禁要求采取行动。
- [ ] **任务 1**：将已弃用的 Firebase Dynamic Links 配置迁移到 Firebase Hosting deep links 或 App Links。
- [ ] **任务 2**：更新 Cloud Firestore 与 Realtime Database 的安全规则，强制执行严格的数据隔离。

### 针对 AI 生成内容政策的任务
- **监管影响**：高优先级。发布门禁要求采取行动。
- [ ] **任务 1**：增加防护措施，确保生成式 AI 功能不会产出 Play 不当内容政策所限制的内容。
- [ ] **任务 2**：为冒犯性 AI 生成内容提供应用内举报或标记功能，全程无需离开应用。

### 针对无障碍要求的任务
- **监管影响**：高优先级。发布门禁要求采取行动。
- [ ] **任务 1**：确保所有触摸目标的实际尺寸不小于 48dp。
- [ ] **任务 2**：为所有 ImageView 与 ImageButton 添加 `contentDescription` 属性。

### 针对设备兼容性要求的任务
- **监管影响**：高优先级。发布门禁要求采取行动。
- [ ] **任务 1**：在清单中配置 `android:resizeableActivity=true`。
- [ ] **任务 2**：在大屏、折叠屏与平板视口上验证布局的响应式表现。

### 针对安全公告的任务
- **监管影响**：高优先级。发布门禁要求采取行动。
- [ ] **任务 1**：实现基于 Android Keystore 的加密令牌存储封装。
- [ ] **任务 2**：查阅 Android 安全公告，并修复适用的 CVE 漏洞。

### 针对 Android Enterprise 要求的任务
- **监管影响**：高优先级。发布门禁要求采取行动。
- [ ] **任务 1**：在 `DevicePolicyManager` 下实现工作资料边界与安全的跨资料数据交换。
- [ ] **任务 2**：确保与企业托管配置的兼容性。

<!-- ANDROID_POLICY_MONITOR_END -->
