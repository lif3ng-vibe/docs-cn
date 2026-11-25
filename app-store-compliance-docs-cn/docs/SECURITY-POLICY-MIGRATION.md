<!-- SECURITY_POLICY_MONITOR_START -->

> **模拟输出，而非实时公告**。本文件由示例公告生成（内置集合、默认集合，或通过 `--mock` 传入的文件）。下文中的标题、发布日期与描述只是展示迁移报告形态的示例，并非真实发布内容。只有所链接的官方文档 URL 是真实的。
> 本监控器没有实时数据源（Android 安全公告不提供 RSS），因此在把这里的任何内容当作实际要求对待之前，请先核对所链接的官方页面。

# 移动安全要求政策迁移与报告

本报告由 `scripts/monitor-security.py` 持续生成并更新，用于跟踪各安全合规领域。

## 受监控安全要求更新日志

### 1. [安全存储] 安全存储更新：弃用不安全的 SharedPreferences 与明文数据库
- **发布日期**：2026 年 6 月 15 日（周一）10:00:00 PDT
- **官方资源**：[https://developer.android.com/topic/security/data](https://developer.android.com/topic/security/data)
- **描述**：移动应用必须加密所有敏感的本地化数据。标准 SharedPreferences 与明文 SQLite 数据库已被认定在已 root 的设备上不安全，必须迁移到 SQLCipher 或 EncryptedSharedPreferences。

### 2. [root 检测] 安全存储更新：弃用不安全的 SharedPreferences 与明文数据库
- **发布日期**：2026 年 6 月 15 日（周一）10:00:00 PDT
- **官方资源**：[https://developer.android.com/topic/security/data](https://developer.android.com/topic/security/data)
- **描述**：移动应用必须加密所有敏感的本地化数据。标准 SharedPreferences 与明文 SQLite 数据库已被认定在已 root 的设备上不安全，必须迁移到 SQLCipher 或 EncryptedSharedPreferences。

### 3. [Keychain] iOS Keychain 安全强化：强制使用 ThisDeviceOnly 保护类
- **发布日期**：2026 年 6 月 17 日（周三）11:00:00 PDT
- **官方资源**：[https://developer.apple.com/documentation/security/keychain_services](https://developer.apple.com/documentation/security/keychain_services)
- **描述**：Apple 开发者安全指令要求将 Keychain 条目迁移至 kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly，以防止在次级物理设备上进行未经授权的备份恢复。

### 4. [Android Keystore] Android Keystore 系统：强制硬件级密钥认证
- **发布日期**：2026 年 6 月 19 日（周五）12:00:00 PDT
- **官方资源**：[https://developer.android.com/training/articles/keystore](https://developer.android.com/training/articles/keystore)
- **描述**：新的安全指南要求以硬件支持（TEE 或 StrongBox）的方式初始化 KeyGenParameterSpec。用于金融或身份载荷签名的加密密钥必须强制执行用户身份验证要求。

### 5. [Keychain] 生物识别认证：转向基于密码学的安全生物识别验证
- **发布日期**：2026 年 6 月 22 日（周一）09:00:00 PDT
- **官方资源**：[https://developer.android.com/training/sign-in/biometric-auth](https://developer.android.com/training/sign-in/biometric-auth)
- **描述**：为防止通过运行时 instrumentation 和 hook 手段绕过布尔返回值，开发者必须将生物识别提示封装在强化的 Keystore/Keychain CryptoObject 或 SecAccessControl 结构中。

### 6. [生物识别认证] 生物识别认证：转向基于密码学的安全生物识别验证
- **发布日期**：2026 年 6 月 22 日（周一）09:00:00 PDT
- **官方资源**：[https://developer.android.com/training/sign-in/biometric-auth](https://developer.android.com/training/sign-in/biometric-auth)
- **描述**：为防止通过运行时 instrumentation 和 hook 手段绕过布尔返回值，开发者必须将生物识别提示封装在强化的 Keystore/Keychain CryptoObject 或 SecAccessControl 结构中。

### 7. [证书固定] 证书固定指南：强制固定主题公钥信息（SPKI）
- **发布日期**：2026 年 6 月 24 日（周三）14:00:00 PDT
- **官方资源**：[https://owasp.org/www-community/controls/Certificate_and_Public_Key_Pinning](https://owasp.org/www-community/controls/Certificate_and_Public_Key_Pinning)
- **描述**：由于证书轮换可能造成服务中断，不建议固定叶子证书。最佳实践要求固定主用与备用中间证书颁发机构的主题公钥信息（SPKI）。

### 8. [越狱检测] iOS 越狱检测：全面的动态链接器与沙盒写入审计
- **发布日期**：2026 年 6 月 26 日（周五）15:00:00 PDT
- **官方资源**：[https://mas.owasp.org/MASVS/](https://mas.owasp.org/MASVS/)
- **描述**：静态文件存在性检查很容易被绕过。越狱检测必须结合动态库（dyld）检查、目录权限检查与符号链接（symlink）完整性检查。

### 9. [root 检测] Android root 检测：在生产环境中强制使用 Play Integrity API 认证
- **发布日期**：2026 年 6 月 29 日（周一）10:00:00 PDT
- **官方资源**：[https://developer.android.com/google/play/integrity](https://developer.android.com/google/play/integrity)
- **描述**：本地启发式 root 检查难以应对现代 zygisk 伪装。高安全级应用必须使用 Play Integrity API，并在后端对令牌做密码学校验。

### 10. [SSL 配置] SSL 配置策略：全局强制 TLS 1.3 并禁用明文流量
- **发布日期**：2026 年 7 月 1 日（周三）11:00:00 PDT
- **官方资源**：[https://developer.android.com/training/articles/security-config](https://developer.android.com/training/articles/security-config)
- **描述**：移动应用商店默认强制安全网络。必须全局禁用明文 HTTP 流量，并将最低 TLS 版本设置为 TLS 1.2 或 TLS 1.3。

### 11. [备份规则] 不安全的备份控制：配置数据提取规则与备份排除项
- **发布日期**：2026 年 7 月 3 日（周五）13:00:00 PDT
- **官方资源**：[https://developer.android.com/guide/topics/data/autobackup](https://developer.android.com/guide/topics/data/autobackup)
- **描述**：默认情况下，ADB 备份会传输应用的本地数据库。开发者必须声明 allowBackup='false'，或配置精确的 dataExtractionRules 来排除凭据。

### 12. [导出 Activity] 导出 Activity 安全：强制对 Android 组件进行显式导出控制
- **发布日期**：2026 年 7 月 6 日（周一）14:00:00 PDT
- **官方资源**：[https://developer.android.com/guide/components/activities/intro-activities](https://developer.android.com/guide/components/activities/intro-activities)
- **描述**：无意导出的 Activity 会暴露应用内部边界。开发者必须为所有内部类设置 android:exported='false'，以防止 Intent 注入。

### 13. [Intent 过滤器] Intent 过滤器审计：防止隐式 Intent 欺骗与组件劫持
- **发布日期**：2026 年 7 月 8 日（周三）16:00:00 PDT
- **官方资源**：[https://developer.android.com/guide/components/intents-filters](https://developer.android.com/guide/components/intents-filters)
- **描述**：隐式 Intent 过滤器会自动暴露组件。为保障跳转安全，应用应使用显式类 Intent，并强制使用签名级自定义权限。

### 14. [深层链接] 深层链接安全：防止自定义 URL Scheme 劫持与参数注入
- **发布日期**：2026 年 7 月 10 日（周五）12:00:00 PDT
- **官方资源**：[https://developer.android.com/training/app-links/deep-linking](https://developer.android.com/training/app-links/deep-linking)
- **描述**：自定义 URL Scheme 可能被其他应用注册，从而导致会话劫持。所有参数都必须当作不可信输入进行解析、验证与清理。

### 15. [通用链接] 通用链接验证：在 iOS 上通过托管 AASA 实现安全关联
- **发布日期**：2026 年 7 月 13 日（周一）10:00:00 PDT
- **官方资源**：[https://developer.apple.com/library/archive/documentation/General/Conceptual/AppSearch/UniversalLinks.html](https://developer.apple.com/library/archive/documentation/General/Conceptual/AppSearch/UniversalLinks.html)
- **描述**：为防止自定义 Scheme 劫持，应用必须采用通用链接（Universal Links），并通过托管在目标 Web 域名上的安全 apple-app-site-association 文件完成验证。

### 16. [App Links] Android App Links 验证：通过 Digital Asset Links 以数字方式绑定 Web 域名
- **发布日期**：2026 年 7 月 15 日（周三）11:00:00 PDT
- **官方资源**：[https://developer.android.com/training/app-links/verify-site-associations](https://developer.android.com/training/app-links/verify-site-associations)
- **描述**：Android App Links 提供安全路由。宿主域名必须发布包含应用唯一签名密钥证书指纹的 assetlinks.json 文件。

### 17. [认证流程] 认证流程：要求使用 OAuth 2.1 与 PKCE 保护移动端认证令牌
- **发布日期**：2026 年 7 月 17 日（周五）09:00:00 PDT
- **官方资源**：[https://oauth.net/2/pkce/](https://oauth.net/2/pkce/)
- **描述**：在移动端二进制文件中硬编码 client secret 是重大风险。现代移动端认证必须在安全的系统浏览器自定义标签页（Custom Tabs）中使用 Proof Key for Code Exchange（PKCE）。

### 18. [会话处理] 会话处理标准：强制服务端会话失效与快照保护
- **发布日期**：2026 年 7 月 20 日（周一）15:00:00 GMT
- **官方资源**：[https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- **描述**：仅删除客户端令牌并不足够。应用必须在登出时执行服务端会话失效，并对多任务窗口快照做模糊处理，以防数据泄露。

### 19. [Keychain] 令牌存储策略：保护长期有效的刷新令牌与会话凭据
- **发布日期**：2026 年 7 月 22 日（周三）13:00:00 PDT
- **官方资源**：[https://mas.owasp.org/MASVS/](https://mas.owasp.org/MASVS/)
- **描述**：会话令牌与刷新令牌必须存储在加密安全区（Keychain/Keystore）中，而不是本地缓存目录或标准 plist 文件中。访问令牌必须是短效的。

### 20. [令牌存储] 令牌存储策略：保护长期有效的刷新令牌与会话凭据
- **发布日期**：2026 年 7 月 22 日（周三）13:00:00 PDT
- **官方资源**：[https://mas.owasp.org/MASVS/](https://mas.owasp.org/MASVS/)
- **描述**：会话令牌与刷新令牌必须存储在加密安全区（Keychain/Keystore）中，而不是本地缓存目录或标准 plist 文件中。访问令牌必须是短效的。

## 自动化迁移建议与实施任务

### 安全存储任务
- **监管影响**：高优先级。安全审计要求采取行动。
- [ ] **任务 1**：在 Android 上将标准偏好存储更新为 EncryptedSharedPreferences。
- [ ] **任务 2**：使用 SQLCipher 测试本地数据库加密。

### root 检测任务
- **监管影响**：高优先级。安全审计要求采取行动。
- [ ] **任务**：验证 root 检测的所有安全标准均已检查并处理。

### Keychain 任务
- **监管影响**：高优先级。安全审计要求采取行动。
- [ ] **任务 1**：将 Keychain 可访问性配置为 kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly。

### Android Keystore 任务
- **监管影响**：高优先级。安全审计要求采取行动。
- [ ] **任务 1**：强制使用 StrongBox，并在创建密钥时检查 KeyInfo.isInsideSecureHardware()。

### 生物识别认证任务
- **监管影响**：高优先级。安全审计要求采取行动。
- [ ] **任务 1**：集成基于 Keystore CryptoObject 的 BiometricPrompt。

### 证书固定任务
- **监管影响**：高优先级。安全审计要求采取行动。
- [ ] **任务 1**：在 network_security_config.xml 中填入 SPKI 固定值。

### 越狱检测任务
- **监管影响**：高优先级。安全审计要求采取行动。
- [ ] **任务**：验证越狱检测的所有安全标准均已检查并处理。

### SSL 配置任务
- **监管影响**：高优先级。安全审计要求采取行动。
- [ ] **任务**：验证 SSL 配置的所有安全标准均已检查并处理。

### 备份规则任务
- **监管影响**：高优先级。安全审计要求采取行动。
- [ ] **任务**：验证备份规则的所有安全标准均已检查并处理。

### 导出 Activity 任务
- **监管影响**：高优先级。安全审计要求采取行动。
- [ ] **任务**：验证导出 Activity 的所有安全标准均已检查并处理。

### Intent 过滤器任务
- **监管影响**：高优先级。安全审计要求采取行动。
- [ ] **任务**：验证 Intent 过滤器的所有安全标准均已检查并处理。

### 深层链接任务
- **监管影响**：高优先级。安全审计要求采取行动。
- [ ] **任务**：验证深层链接的所有安全标准均已检查并处理。

### 通用链接任务
- **监管影响**：高优先级。安全审计要求采取行动。
- [ ] **任务**：验证通用链接的所有安全标准均已检查并处理。

### App Links 任务
- **监管影响**：高优先级。安全审计要求采取行动。
- [ ] **任务**：验证 App Links 的所有安全标准均已检查并处理。

### 认证流程任务
- **监管影响**：高优先级。安全审计要求采取行动。
- [ ] **任务**：验证认证流程的所有安全标准均已检查并处理。

### 会话处理任务
- **监管影响**：高优先级。安全审计要求采取行动。
- [ ] **任务**：验证会话处理的所有安全标准均已检查并处理。

### 令牌存储任务
- **监管影响**：高优先级。安全审计要求采取行动。
- [ ] **任务**：验证令牌存储的所有安全标准均已检查并处理。

<!-- SECURITY_POLICY_MONITOR_END -->
