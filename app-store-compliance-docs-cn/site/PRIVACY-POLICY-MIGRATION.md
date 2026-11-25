<!-- PRIVACY_POLICY_MONITOR_START -->

> **模拟输出，而非实时公告**。本文件由示例公告生成（内置集合、默认集合，或通过 `--mock` 传入的文件）。下文中的标题、发布日期与描述只是展示迁移报告形态的示例，并非真实发布内容。只有所链接的官方文档 URL 是真实的。在把这里的任何内容当作实际要求之前，请先用 `--live` 针对真实 feed 源重新运行监控。

# 移动与 Web 隐私要求迁移与要求报告

本报告由 `scripts/monitor-privacy.py` 持续生成并更新，用于跟踪各隐私合规领域。

## 受监控要求更新日志

### 1. [广告 ID] 应用跟踪透明度（ATT）框架强化
- **发布日期**：2026 年 6 月 17 日（周三）12:00:00 PDT
- **官方资源**：[https://developer.apple.com/app-store/user-privacy-and-data-use](https://developer.apple.com/app-store/user-privacy-and-data-use)
- **核验状态**：优先级 1（已核实）
- **描述**：开发者必须通过 ATTrackingManager 展示应用跟踪透明度（App Tracking Transparency，ATT）提示，并在采集广告标识符（IDFA）或跨其他应用、网站跟踪用户之前取得用户许可。

### 2. [广告 ID] Google Play 广告 ID 政策与 com.google.android.gms.permission.AD_ID
- **发布日期**：2026 年 6 月 21 日（周日）16:00:00 PDT
- **官方资源**：[https://support.google.com/googleplay/android-developer/answer/6048248](https://support.google.com/googleplay/android-developer/answer/6048248)
- **核验状态**：优先级 1（已核实）
- **描述**：面向 Android 12 或更高版本、且使用 Google Play Services 广告 ID 的应用，必须在 manifest 中声明 AD_ID 权限，并为用户提供重置或删除该 ID 的选项。

### 3. [应用跟踪透明度] 应用跟踪透明度（ATT）框架强化
- **发布日期**：2026 年 6 月 17 日（周三）12:00:00 PDT
- **官方资源**：[https://developer.apple.com/app-store/user-privacy-and-data-use](https://developer.apple.com/app-store/user-privacy-and-data-use)
- **核验状态**：优先级 1（已核实）
- **描述**：开发者必须通过 ATTrackingManager 展示应用跟踪透明度（App Tracking Transparency，ATT）提示，并在采集广告标识符（IDFA）或跨其他应用、网站跟踪用户之前取得用户许可。

### 4. [后台定位] Google Play 对 ACCESS_BACKGROUND_LOCATION 权限的限制
- **发布日期**：2026 年 6 月 23 日（周二）18:00:00 PDT
- **官方资源**：[https://support.google.com/googleplay/android-developer/answer/9799150](https://support.google.com/googleplay/android-developer/answer/9799150)
- **核验状态**：优先级 1（已核实）
- **描述**：Google Play 对后台定位访问施以严格限制。开发者必须证明后台定位对应用的核心功能至关重要，并向用户提供清晰醒目的披露。

### 5. [Cookie 同意] ePrivacy 指令的 Cookie 同意横幅要求
- **发布日期**：2026 年 6 月 26 日（周五）21:00:00 PDT
- **官方资源**：[https://commission.europa.eu/cookies_en](https://commission.europa.eu/cookies_en)
- **核验状态**：优先级 1（已核实）
- **描述**：面向欧盟用户的网站必须展示合规的 Cookie 同意横幅，在用户给出明确、主动的同意之前，拦截非必要 Cookie（如营销或分析类 Cookie）。

### 6. [数据安全] Google Play 数据安全（Data Safety）表单合规校验
- **发布日期**：2026 年 6 月 19 日（周五）14:00:00 PDT
- **官方资源**：[https://support.google.com/googleplay/android-developer/answer/10787469](https://support.google.com/googleplay/android-developer/answer/10787469)
- **核验状态**：优先级 1（已核实）
- **描述**：Google Play 对数据安全部分执行严格校验。系统会动态扫描提交内容中的编译库与网络活动，以核验其与所声明的数据安全表单一致。

### 7. [GDPR] 欧盟《通用数据保护条例》（GDPR）执法指南
- **发布日期**：2026 年 6 月 25 日（周四）20:00:00 PDT
- **官方资源**：[https://www.edpb.europa.eu/our-work-tools/general-guidance/guidelines-recommendations-best-practices_en](https://www.edpb.europa.eu/our-work-tools/general-guidance/guidelines-recommendations-best-practices_en)
- **核验状态**：优先级 1（已核实）
- **描述**：EDPB 就 GDPR 项下的有效同意发布指导意见。处理欧盟居民的个人数据需要明确的选择加入、清晰的信息告知、数据可携性，以及可实际行使的被遗忘权（数据删除）。

### 8. [GDPR] GDPR 下的客户端本地存储安全指南
- **发布日期**：2026 年 6 月 27 日（周六）22:00:00 PDT
- **官方资源**：[https://commission.europa.eu/law/law-topic/data-protection_en](https://commission.europa.eu/law/law-topic/data-protection_en)
- **核验状态**：优先级 1（已核实）
- **描述**：强烈不建议把未加密的敏感信息、JWT token 或凭据存入浏览器本地存储（localStorage）。所存数据必须尊重用户同意，并保持防护以免被跨站脚本（XSS）窃取。

### 9. [GDPR] 关于 GDPR 罚款的未经证实的行业博客传言
- **发布日期**：2026 年 7 月 1 日（周三）11:00:00 PDT
- **官方资源**：[https://randomblogsite.com/gdpr-rumor](https://randomblogsite.com/gdpr-rumor)
- **核验状态**：优先级 4（未核实）
- **描述**：某行业博客声称 GDPR 规则下周将被修改，要对所有未立即支持深色模式的网站处以罚款。这是一篇未经证实的博客文章。

### 10. [健康权限] Google Play Health Connect 集成与健身权限
- **发布日期**：2026 年 6 月 24 日（周三）19:00:00 PDT
- **官方资源**：[https://support.google.com/googleplay/android-developer/answer/12253906](https://support.google.com/googleplay/android-developer/answer/12253906)
- **核验状态**：优先级 1（已核实）
- **描述**：通过 Health Connect 访问健康或健身数据，需要在 Play Console 中完成专门的开发者声明、制定详细的健康隐私政策，并进行醒目的应用内披露。

### 11. [IndexedDB] IndexedDB 结构化客户端数据库与用户同意控制
- **发布日期**：2026 年 6 月 28 日（周日）23:00:00 PDT
- **官方资源**：[https://commission.europa.eu/law/law-topic/data-protection_en](https://commission.europa.eu/law/law-topic/data-protection_en)
- **核验状态**：优先级 1（已核实）
- **描述**：在浏览器 IndexedDB 实例中本地存放的大规模离线或结构化数据，必须遵循用户隐私偏好，涉及敏感数据时使用加密，并在登出时执行清理。

### 12. [本地存储] GDPR 下的客户端本地存储安全指南
- **发布日期**：2026 年 6 月 27 日（周六）22:00:00 PDT
- **官方资源**：[https://commission.europa.eu/law/law-topic/data-protection_en](https://commission.europa.eu/law/law-topic/data-protection_en)
- **核验状态**：优先级 1（已核实）
- **描述**：强烈不建议把未加密的敏感信息、JWT token 或凭据存入浏览器本地存储（localStorage）。所存数据必须尊重用户同意，并保持防护以免被跨站脚本（XSS）窃取。

### 13. [隐私清单] Apple 对 App Store 提交的强制隐私清单要求
- **发布日期**：2026 年 6 月 15 日（周一）10:00:00 PDT
- **官方资源**：[https://developer.apple.com/support/privacy-manifest-files](https://developer.apple.com/support/privacy-manifest-files)
- **核验状态**：优先级 1（已核实）
- **描述**：Apple 对所有新提交的应用和第三方 SDK 更新强制执行隐私清单（PrivacyInfo.xcprivacy）。清单必须准确声明数据采集、跟踪域名以及 required reason API（必需理由 API）的使用情况。

### 14. [隐私清单] Apple 更严格的 Required Reason API 使用指南
- **发布日期**：2026 年 6 月 16 日（周二）11:00:00 PDT
- **官方资源**：[https://developer.apple.com/documentation/bundleresources/privacy_manifest_files/describing_use_of_required_reason_api](https://developer.apple.com/documentation/bundleresources/privacy_manifest_files/describing_use_of_required_reason_api)
- **核验状态**：优先级 1（已核实）
- **描述**：为防范设备指纹，Apple 要求开发者在访问指定 Required Reason API（如 UserDefaults、文件时间戳、系统运行时长、磁盘空间）时，在隐私清单中注明经批准的原因代码。

### 15. [隐私营养标签] Apple App Store 隐私营养标签问卷更新
- **发布日期**：2026 年 6 月 18 日（周四）13:00:00 PDT
- **官方资源**：[https://developer.apple.com/app-store/app-privacy-details](https://developer.apple.com/app-store/app-privacy-details)
- **核验状态**：优先级 1（已核实）
- **描述**：Apple 要求开发者在 App Store Connect 中填写自主申报的隐私营养标签（privacy nutrition label）。所有声明的数据采集与使用做法都必须与应用内实际行为一致。

### 16. [Required Reason APIs] Apple 对 App Store 提交的强制隐私清单要求
- **发布日期**：2026 年 6 月 15 日（周一）10:00:00 PDT
- **官方资源**：[https://developer.apple.com/support/privacy-manifest-files](https://developer.apple.com/support/privacy-manifest-files)
- **核验状态**：优先级 1（已核实）
- **描述**：Apple 对所有新提交的应用和第三方 SDK 更新强制执行隐私清单（PrivacyInfo.xcprivacy）。清单必须准确声明数据采集、跟踪域名以及 required reason API 的使用情况。

### 17. [Required Reason APIs] Apple 更严格的 Required Reason API 使用指南
- **发布日期**：2026 年 6 月 16 日（周二）11:00:00 PDT
- **官方资源**：[https://developer.apple.com/documentation/bundleresources/privacy_manifest_files/describing_use_of_required_reason_api](https://developer.apple.com/documentation/bundleresources/privacy_manifest_files/describing_use_of_required_reason_api)
- **核验状态**：优先级 1（已核实）
- **描述**：为防范设备指纹，Apple 要求开发者在访问指定 Required Reason API（如 UserDefaults、文件时间戳、系统运行时长、磁盘空间）时，在隐私清单中注明经批准的原因代码。

### 18. [运行时权限] Android 运行时权限模型与动态检查
- **发布日期**：2026 年 6 月 22 日（周一）17:00:00 PDT
- **官方资源**：[https://developer.android.com/guide/topics/permissions/overview](https://developer.android.com/guide/topics/permissions/overview)
- **核验状态**：优先级 1（已核实）
- **描述**：当应用访问相机、通讯录或存储等敏感能力时，必须动态请求 Android 运行时权限；且在请求权限之前必须先说明理由。

### 19. [会话存储] 浏览器临时会话存储安全建议
- **发布日期**：2026 年 6 月 29 日（周一）09:00:00 PDT
- **官方资源**：[https://commission.europa.eu/law/law-topic/data-protection_en](https://commission.europa.eu/law/law-topic/data-protection_en)
- **核验状态**：优先级 1（已核实）
- **描述**：保存在 sessionStorage 中的数据必须得到安全处理，确保敏感凭据不会暴露给不受信任的脚本，并在用户关闭标签页或登出后被彻底清除。

### 20. [跟踪技术] 跟踪技术、脚本与不可见像素的同意管理
- **发布日期**：2026 年 6 月 30 日（周二）10:00:00 PDT
- **官方资源**：[https://www.edpb.europa.eu/our-work-tools/general-guidance/guidelines-recommendations-best-practices_en](https://www.edpb.europa.eu/our-work-tools/general-guidance/guidelines-recommendations-best-practices_en)
- **核验状态**：优先级 1（已核实）
- **描述**：第三方分析脚本（Google Analytics、Facebook Pixel、Hotjar）必须受到显式控制并默认完全禁用，直到用户接受 Cookie 或跟踪偏好设置。

### 21. [用户数据政策] Google Play 用户数据保护与删除政策
- **发布日期**：2026 年 6 月 20 日（周六）15:00:00 PDT
- **官方资源**：[https://support.google.com/googleplay/android-developer/answer/9899234](https://support.google.com/googleplay/android-developer/answer/9899234)
- **核验状态**：优先级 1（已核实）
- **描述**：Google Play 用户数据政策要求在采集任何个人或敏感数据之前进行醒目披露并取得用户的明确同意。支持应用内创建账号的应用必须同时提供应用内与网页端的账号删除选项。

### 22. [用户数据政策] Google Play 对 ACCESS_BACKGROUND_LOCATION 权限的限制
- **发布日期**：2026 年 6 月 23 日（周二）18:00:00 PDT
- **官方资源**：[https://support.google.com/googleplay/android-developer/answer/9799150](https://support.google.com/googleplay/android-developer/answer/9799150)
- **核验状态**：优先级 1（已核实）
- **描述**：Google Play 对后台定位访问施以严格限制。开发者必须证明后台定位对应用的核心功能至关重要，并向用户提供清晰醒目的披露。

## 自动化迁移建议与实施任务

### 广告 ID 任务
- **监管影响**：高优先级合规领域。
- [ ] **任务 1**：在 AndroidManifest 中配置 AD_ID 权限，并处理用户的选择退出。

### 应用跟踪透明度任务
- **监管影响**：高优先级合规领域。
- [ ] **任务 1**：在获取广告 ID 之前，先通过 ATTrackingManager 向用户弹出提示。
- [ ] **任务 2**：在 Info.plist 中填写 NSUserTrackingUsageDescription。

### 后台定位任务
- **监管影响**：高优先级合规领域。
- [ ] **任务 1**：确保后台定位配有醒目的应用内披露视图。

### Cookie 同意任务
- **监管影响**：高优先级合规领域。
- [ ] **任务 1**：部署一个默认阻止非必要 Cookie 写入的 Cookie 横幅。

### 数据安全任务
- **监管影响**：高优先级合规领域。
- [ ] **任务 1**：开展依赖审计，以对齐 Google Play 数据安全表单。

### GDPR 任务
- **监管影响**：高优先级合规领域。
- [ ] **任务 1**：为欧盟用户提供选择加入控制项与账号删除途径。

### GDPR 任务（受阻：公告来源未经证实）
- **监管状态**：已暂停。来源为未经核实的优先级 4/5 二级来源。

### 健康权限任务
- **监管影响**：高优先级合规领域。
- [ ] **任务 1**：完成专门的健身数据声明，并发布健康说明。

### IndexedDB 任务
- **监管影响**：高优先级合规领域。
- [ ] **任务 1**：在用户登出时安全清空本地数据库的 object store。

### 本地存储任务
- **监管影响**：高优先级合规领域。
- [ ] **任务 1**：对保存在 localStorage 中的 JWT token 或用户信息进行加密。

### 隐私清单任务
- **监管影响**：高优先级合规领域。
- [ ] **任务 1**：在 iOS target 根目录创建 PrivacyInfo.xcprivacy 清单。
- [ ] **任务 2**：在清单中列出所有采集的数据类型与跟踪行为。

### 隐私营养标签任务
- **监管影响**：高优先级合规领域。
- [ ] **任务 1**：对照代码库中的 PII 传输情况，核验 App Store Connect 的营养标签披露。

### Required Reason APIs 任务
- **监管影响**：高优先级合规领域。
- [ ] **任务 1**：识别所有 Required Reason API 引用（如 UserDefaults）。
- [ ] **任务 2**：在 NSPrivacyAccessedAPITypes 下映射原因代码。

### 运行时权限任务
- **监管影响**：高优先级合规领域。
- [ ] **任务 1**：确保权限经过动态核验，并向用户提供清晰的解释。

### 会话存储任务
- **监管影响**：高优先级合规领域。
- [ ] **任务 1**：保障临时会话 token 的安全，并在关闭标签页时清除会话变量。

### 跟踪技术任务
- **监管影响**：高优先级合规领域。
- [ ] **任务 1**：在取得同意之前，延迟加载 Google Analytics 或 Facebook Pixel 脚本。

### 用户数据政策任务
- **监管影响**：高优先级合规领域。
- [ ] **任务 1**：构建清晰的应用内数据删除控制项，并设置公开的网页删除 URL。

<!-- PRIVACY_POLICY_MONITOR_END -->
