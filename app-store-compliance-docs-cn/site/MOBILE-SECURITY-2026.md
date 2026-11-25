# 移动安全要求与最佳实践（2026）

本实战手册为移动应用开发建立了一套严格、全面的安全参考。它覆盖保护用户数据、防止未授权访问，以及确保符合平台政策与行业标准（如 OWASP MASVS）所需的 17 个核心移动安全领域。

每一节都会概览对应的安全领域，给出平台特定的机制（iOS 与 Android）、具体的安全实现建议，以及拒审/合规风险。

---

## 1. 安全存储

### 1.1 概述
敏感信息（会话令牌、密码、个人数据、API 密钥、私有加密密钥）绝不能以明文形式存储。标准的应用沙盒结构——例如 iOS 上的 `UserDefaults` 或 Android 上的标准 `SharedPreferences`——会以未加密格式把内容直接写入 XML 或 plist 文件，在越狱/root 设备上或通过备份分析即可轻松取回。

### 1.2 平台实现与最佳实践

#### iOS：安全存储
- **不安全选项**：`UserDefaults`、CoreData（无自定义加密）、纯 SQLite，或标准的应用 documents/cache 目录。
- **安全选项**：小体积数据（令牌、凭据、密钥）使用 **Keychain Services API**。更大的数据库则使用 SQLCipher 加密本地 SQLite/CoreData 数据库。
- **数据保护类**（Data Protection Class）：把敏感文件直接写入磁盘时，请使用 iOS Data Protection。传入 `Data.WritingOptions.completeFileProtection` 即可加密磁盘上的文件，设备锁定期间文件保持加密状态。

#### Android：安全存储
- **不安全选项**：明文 `SharedPreferences`、标准的内部/外部存储文件，或标准 SQLite 数据库。
- **安全选项**：使用 **EncryptedSharedPreferences** 与 **EncryptedFile**（来自 Jetpack Security 库），它们会自动处理密钥管理，并以 AES-256（文件）与 AES-256-SIV（键值）加密存储组件。
- **数据库加密**：若使用 SQLite 或 Room，请用 **SQLCipher for Android** 加密数据库，主密钥由 Android Keystore 生成并具备硬件背书。

---

## 2. Keychain（iOS 专属）

### 2.1 概述
iOS Keychain 提供一个安全的、硬件加速的隔离区，用于存放小体积、高敏感度的配置与凭据条目。这些条目由操作系统直接加密和管理，与其他应用相互隔离。

### 2.2 安全实现建议
- **可访问性属性**：创建或更新 Keychain 条目时，务必指定严格的可访问性属性（`kSecAttrAccessible`）：
  - `kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly`：**强烈推荐**用于后台任务或推送通知处理。用户解锁设备一次后数据即可用，且不会通过备份恢复到其他物理设备。
  - `kSecAttrAccessibleWhenUnlockedThisDeviceOnly`：适用于仅在前台运行的应用。数据仅在设备解锁时可访问，且不会被备份。
  - **避免使用**：`kSecAttrAccessibleAlways`（已弃用），以及非 `ThisDeviceOnly` 的类（如果你希望防止凭据在备份时迁移到其他物理设备）。
- **访问组共享**：借助 Keychain Sharing entitlement，把 Keychain 共享（`kSecAttrAccessGroup`）严格限制在同一团队经过验证的应用套件内。
- **Keychain 备份**：除非确需 iCloud Keychain 同步，否则确保 `kSecAttrSynchronizable` 属性设为 `false`（默认值）。

---

## 3. Android Keystore（Android 专属）

### 3.1 概述
Android Keystore 系统允许开发者把加密密钥存放在具备硬件背书的容器中（如可信执行环境（TEE）或 StrongBox Security Chip），即使操作系统被攻破或被 root，密钥也极难从设备中提取。

### 3.2 安全实现建议
- **硬件背书**：在密钥生成后检查 `KeyInfo.isInsideSecureHardware()`，强制使用具备硬件背书的密钥。在支持 Android 9（API 28）及以上的设备上，使用 `setIsStrongBoxBacked(true)` 借助专用 HSM 芯片强制硬件保护。
- **密钥认证**（Key Attestation）：在高安全环境中，使用 Key Attestation 向后端服务器以数学方式证明加密密钥确在硬件中创建且未被篡改。
- **用途与加密模式**：创建时严格限制密钥能力（例如仅允许使用特定填充方案的解密/加密）：
  ```kotlin
  val keyGenerator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore")
  keyGenerator.init(
      KeyGenParameterSpec.Builder("MySecureKeyAlias", KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT)
          .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
          .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
          .setUserAuthenticationRequired(true) // require passcode/biometrics to use the key
          .build()
  )
  ```

---

## 4. 生物识别认证

### 4.1 概述
生物识别认证（FaceID、TouchID、Android BiometricPrompt）必须安全地验证用户身份。一个致命错误是把生物识别当作离线 UI 锁——成功后仅仅翻转一个布尔标志（例如 `isLoggedIn = true`）。攻击者可利用运行时插桩（例如对 `LAContext` 或 `BiometricPrompt` 挂 Frida 钩子）绕过布尔返回值。

### 4.2 安全实现建议
- **加密背书的生物识别**：不要依赖简单的成功回调，而是要求通过生物识别认证来解锁或授权存储在 Keychain 或 Keystore 中的加密密钥。
- **iOS 实现**：
  - 使用 `SecAccessControl` 并指定 `.biometryAny` 或 `.biometryCurrentSet` 创建 Keychain 条目。
  - 访问该条目时，系统会自动提示用户进行 FaceID/TouchID 验证，只有生物识别通过才会释放解密后的令牌。
  - **避免**仅用离线的 `LAContext.evaluatePolicy` 检查来做会话授权，除非配合严格的安全约束。
- **Android 实现**：
  - 将初始化好的 `BiometricPrompt.CryptoObject`（封装与 Keystore 密钥关联的 Cipher、Signature 或 Mac）传入 `biometricPrompt.authenticate()`。
  - Keystore 密钥必须配置 `.setUserAuthenticationRequired(true)` 与 `.setUserAuthenticationParameters(0, KeyProperties.AUTH_BIOMETRIC_STRONG)`。
  - 只有用户成功通过强生物识别认证，密钥才能解密/签名。

---

## 5. 证书固定（Certificate Pinning）

### 5.1 概述
证书固定（Certificate Pinning，即公钥固定）通过确保客户端只连接出示预定加密公钥的服务器，来缓解中间人（MITM）攻击。即使攻击者在用户设备上安装了恶意根证书（例如通过企业代理、恶意软件或用户批准的配置描述文件），也能防止流量被截获。

### 5.2 安全实现建议
- **固定 SPKI 哈希**：不要固定叶子证书本身（标准证书轮换期间它频繁变更，会导致应用不可用），而应固定中间或叶子公钥的**主题公钥信息**（Subject Public Key Info，SPKI）哈希。
- **备用固定项**：务必至少包含一个备用固定项（代表备用的证书颁发机构或中间密钥），以免主证书需要紧急更换时应用直接“变砖”。
- **原生实现**：
  - **iOS**：在 `Info.plist` 中使用声明式的 Network Session Pinning，即 `NSPinnedDomains` 键（自 iOS 14 起原生支持）。它在网络栈内部安全生效，无需手写委托代码。
  - **Android**：声明网络安全配置文件（`res/xml/network_security_config.xml`），并在 `<pin-set>` 元素中指定固定项。系统会对任何 `HttpURLConnection` 或 OkHttp 客户端自动强制执行固定：
    ```xml
    <network-security-config>
        <domain-config>
            <domain includeSubdomains="true">api.myproduction.com</domain>
            <pin-set expiration="2026-12-31">
                <pin digest="SHA-256">Base64EncodedSPKIHashHere=</pin>
                <pin digest="SHA-256">Base64EncodedBackupSPKIHashHere=</pin>
            </pin-set>
        </domain-config>
    </network-security-config>
    ```

---

## 6. 越狱检测（iOS）

### 6.1 概述
越狱后的 iOS 设备绕过了关键的平台沙盒保护，使攻击者能够访问私有的应用数据目录、钩挂运行时方法并截获安全通信。

### 6.2 安全实现建议
- **多层防御**：使用多个相互独立的指标来评估设备是否被攻破，避免只依赖单一简单函数。
- **标准检查**：
  1. **文件存在性**：检查已知的越狱相关目录与二进制文件（例如 `/Applications/Cydia.app`、`/Applications/Sileo.app`、`/Library/MobileSubstrate/MobileSubstrate.dylib`、`/bin/bash`、`/usr/sbin/sshd`、`/private/var/lib/apt`）。
  2. **目录权限**：尝试在应用沙盒之外写入一个无用文件（例如 `/private/jailbreak.txt`）。标准应用会失败；具备 root 权限的越狱应用可能成功。
  3. **符号链接分析**：检查 `/Library/Ringtones`、`/Applications` 等常见目录是否为符号链接——越狱工具会创建符号链接以节省磁盘空间。
  4. **动态链接器（dyld）检查**：遍历已加载的动态库，检测钩子或注入库（例如 `MobileSubstrate`、`Frida`）。
- **响应措施**：一旦检测到越狱，清除缓存的令牌与本地数据库、通知后端，并安全终止或优雅降级相关功能。

---

## 7. Root 检测（Android）

### 7.1 概述
取得 root 权限的 Android 设备拥有管理员控制权，会绕过关键的安全策略、内存隔离与文件系统沙盒控制。

### 7.2 安全实现建议
- **本地启发式检查**：
  1. **二进制搜索**：在标准路径（`/system/bin/su`、`/system/xbin/su`、`/sbin/su`、`/system/sd/xbin/su`）中查找 `su`、`busybox` 等管理类二进制文件或 root 管理工具。
  2. **构建标签**：检查 `android.os.Build.TAGS` 是否为 `"test-keys"`，它表明是自定义或已 root 的 ROM 构建，而非正式签名的镜像。
  3. **超级用户应用**：检查包列表中是否存在 root 管理包（例如 `com.noshufou.android.su`、`eu.chainfire.supersu`、`com.topjohnwu.magisk`）。
- **硬件背书认证**（强烈推荐）：
  - 标准本地启发式检查很容易被 Magisk Hide 或 zygisk 模块绕过。
  - 依赖 **Google Play Integrity API**：在设备端调用该 API，把经过加密签名的裁定令牌转发到你的后端服务器，并在后端解密/校验。这会给出具备硬件背书的设备完整性裁定，以及设备是否运行经过认证的 Android 构建。

---

## 8. SSL 配置

### 8.1 概述
传输层安全（TLS）配置不当会让移动应用暴露于凭据嗅探与流量篡改之下。生产环境中必须完全禁用明文流量（HTTP）。

### 8.2 安全实现建议
- **至少强制 TLS 1.3 或 1.2**：禁用与已弃用的 SSL v3、TLS 1.0、TLS 1.1 的向后兼容。
- **iOS 实现**：
  - 保持 App Transport Security（ATS）处于启用状态。
  - **避免**在生产 `Info.plist` 中把 `NSAllowsArbitraryLoads` 设为 `true`。若某些域名确需 HTTP 例外，请在 `NSExceptionDomains` 下明确列出并给出严格理由。
- **Android 实现**：
  - 在 `AndroidManifest.xml` 中通过 `android:usesCleartextTraffic="false"` 定义明文流量策略。
  - 或者，在网络安全配置中全局强制执行：
    ```xml
    <network-security-config>
        <base-config cleartextTrafficPermitted="false">
            <trust-anchors>
                <certificates src="system" />
            </trust-anchors>
        </base-config>
    </network-security-config>
    ```

---

## 9. 备份规则

### 9.1 概述
默认情况下，移动操作系统会把应用沙盒内的文件纳入自动备份（iOS 的 iCloud 备份、Android 的 ADB / Google Drive 备份）。这意味着以不安全方式存储的敏感数据会被自动传输到云端硬盘，或可通过物理提取获取。

### 9.2 安全实现建议
- **iOS 备份排除**：
  - 通过给文件 URL 添加 `.isExcludedFromBackup` 资源属性，把任何敏感数据库或本地配置文件排除在自动 iCloud 与 iTunes 备份之外：
    ```swift
    var url = URL(fileURLWithPath: path)
    var values = URLResourceValues()
    values.isExcludedFromBackup = true
    try url.setResourceValues(values)
    ```
- **Android 备份规则**：
  - **切勿**在未定义严格过滤规则的情况下保留 `android:allowBackup="true"`。备份会让攻击者用简单的 `adb backup` 命令提取私有的 `/data/data/your.package/` 文件。
  - 对高安全应用，应完全禁用备份：
    ```xml
    <application android:allowBackup="false" ...>
    ```
  - 若确需备份，请在清单中严格配置 `android:dataExtractionRules`（Android 12+）与 `android:fullBackupContent`（Android 11 及以下），只指向安全目录，并明确排除数据库、存有令牌的 shared preferences 以及凭据文件：
    ```xml
    <!-- res/xml/data_extraction_rules.xml -->
    <data-extraction-rules>
        <cloud-backup>
            <exclude domain="sharedpref" path="auth_tokens.xml"/>
            <exclude domain="database" path="secure_db.db"/>
        </cloud-backup>
        <device-to-device-backup>
            <exclude domain="sharedpref" path="auth_tokens.xml"/>
            <exclude domain="database" path="secure_db.db"/>
        </device-to-device-backup>
    </data-extraction-rules>
    ```

---

## 10. 导出 Activity（Android 专属）

### 10.1 概述
在 `AndroidManifest.xml` 中声明为 `android:exported="true"` 的任何 Activity 都能被设备上运行的其他应用启动。无意导出的 Activity 会暴露内部业务逻辑、造成授权绕过，还可能引发点击劫持（tapjacking）或状态篡改。

### 10.2 安全实现建议
- **严格默认值**：为所有内部 Activity 设置 `android:exported="false"`。
- **自 Android 12 起强制执行**：Android 12（API 31）要求每个带 intent filter 的组件（activity、service、receiver）都必须显式声明 `android:exported`。缺少该标签时，应用将无法安装或提交。
- **导出组件保护**：
  - 若某个 Activity 必须导出（例如从主屏幕或第三方启动器启动），请用自定义权限加以限制：
    ```xml
    <activity android:name=".MyExportedActivity"
              android:exported="true"
              android:permission="com.mycompany.myapp.PERMISSION_LAUNCH_ACTIVITY">
    ```
  - 确保该权限使用 `android:protectionLevel="signature"`，从而保证只有用你的开发者密钥签名的应用才能启动该 Activity。

---

## 11. Intent Filter（Android 专属）

### 11.1 概述
Intent filter 定义了应用组件可以响应哪些隐式 intent。注册 intent filter 会自动导出该组件，可能将其暴露给不受信任的第三方应用。

### 11.2 安全实现建议
- **防范 Intent 欺骗与劫持**：在接收组件内先校验发送方并验证传入数据，再进行处理。
  - 使用 `getCallingActivity()` 或 `getCallingPackage()` 检查调用方是否匹配可信的包名与证书。
- **安全的 Intent 分发**：启动内部组件时使用显式 intent（指明确切的目标类或包），而非隐式 intent。这可防止同一设备上的恶意第三方应用截获或“劫持”该 intent。
  ```kotlin
  val explicitIntent = Intent(context, TargetActivity::class.java).apply {
      putExtra("param", value)
  }
  startActivity(explicitIntent)
  ```

---

## 12. 深度链接（Deep Link）

### 12.1 概述
深度链接（Deep Link）让外部来源能够调用应用内部的路由。使用自定义 URL scheme 的标准深度链接（例如 `myapp://route`）天生不安全，因为设备上任何其他应用都可以注册完全相同的 scheme 并劫持通信，进而窃取认证令牌或参数。

### 12.2 安全实现建议
- **净化输入**：把深度链接视为不受信任的外部输入，始终对深度链接参数进行净化、验证和解析，以防 SQL 注入、路径穿越或远程代码执行。
- **不要传输机密信息**：切勿在深度链接 URL 中包含认证令牌、会话 ID、密码或交易数据。
- **认证令牌交换**：若深度链接用于认证（例如魔法登录链接），应传递短时效、一次性、密码学强度高的挑战令牌，并在服务器上通过显式 HTTPS 请求完成交换，绝不能传递处于活跃状态的会话令牌本身。

---

## 13. Universal Links（iOS 专属）

### 13.1 概述
Universal Links 是 iOS 的安全深度链接机制。它不使用自定义 URL scheme，而是使用标准 HTTPS 链接（例如 `https://mycompany.com/profile`）。由于域名验证是针对网站配置进行的，其他应用无法劫持或仿冒 Universal Links。

### 13.2 安全实现建议
- **AASA 配置**：在你的域名上托管一份有效的 **Apple App Site Association**（AASA）文件，路径为 `https://yourdomain.com/.well-known/apple-app-site-association`。
  - 以 `Content-Type: application/json` 提供该文件，且不使用重定向。
  - 该文件声明了哪些应用 bundle ID 有权处理特定 URL 路径：
    ```json
    {
      "applinks": {
        "details": [
          {
            "appIDs": ["TEAMID12345.com.mycompany.myapp"],
            "components": [
              { "/": "/profile/*" }
            ]
          }
        ]
      }
    }
    ```
- **Associated Domains entitlement**：在 Xcode 中启用 “Associated Domains” 能力，并按 `applinks:yourdomain.com` 的格式添加域名。

---

## 14. App Links（Android 专属）

### 14.1 概述
Android App Links 是标准 HTTPS 链接，通过验证域名所有权来跳过平台的“消歧对话框”，从而配置为直接自动启动匹配的应用。

### 14.2 安全实现建议
- **AssetLinks 验证**：在你的域名上托管 **Digital Asset Links** JSON 文件，路径为 `https://yourdomain.com/.well-known/assetlinks.json`：
  ```json
  [
    {
      "relation": ["delegate_permission/common.handle_all_urls"],
      "target": {
        "namespace": "android_app",
        "package_name": "com.mycompany.myapp",
        "sha256_cert_fingerprints": ["AA:BB:CC:DD:EE:FF:11:22:33:44:55:66:77:88:99:00:11:22:33:44:55:66:77:88:99:00:11:22:33:44:55:66"]
      }
    }
  ]
  ```
- **清单验证标签**：在 `AndroidManifest.xml` 的 intent filter 中添加 `android:autoVerify="true"`，指示操作系统在应用安装时验证域名所有权：
  ```xml
  <intent-filter android:autoVerify="true">
      <action android:name="android.intent.action.VIEW" />
      <category android:name="android.intent.category.DEFAULT" />
      <category android:name="android.intent.category.BROWSABLE" />
      <data android:scheme="https" android:host="yourdomain.com" />
  </intent-filter>
  ```

---

## 15. 认证流程

### 15.1 概述
移动认证流程必须安全地处理用户凭据、防止后端机密被逆向工程，并实现密码学挑战以防重放攻击。

### 15.2 安全实现建议
- **OAuth 2.1 / OIDC 与 PKCE**：移动端 OAuth 集成务必使用**授权码交换证明密钥**（Proof Key for Code Exchange，PKCE，RFC 7636）。PKCE 无需把客户端机密存进移动应用二进制文件（那里很容易被逆向工程提取），并能保护授权码交换免受拦截攻击。
- **内嵌浏览器与系统浏览器**：认证界面应使用安全的系统组件（如 iOS 的 `ASWebAuthenticationSession` 与 Android 的 **Custom Tabs**）。避免使用内嵌的 `WKWebView` 或 Android `WebView` 组件——它们会让宿主应用得以嗅探或篡改用户输入的凭据与密码。

---

## 16. 会话处理

### 16.1 概述
会话令牌必须安全生成、恰当限定作用范围、定期轮换，并在不再使用时被妥善销毁。

### 16.2 安全实现建议
- **服务端会话校验**：客户端绝不能对会话有效性做本地假设。每个关键操作都必须在服务器上授权并校验。
- **会话超时与后台策略**：
  - 应用退到后台时，清除敏感屏幕数据与缓存会话。
  - 对应用快照（多任务视图）做模糊处理，防止敏感用户信息泄漏到截屏中。
- **登出完整性**：用户登出时，在服务端执行完整的会话失效处理，同时在设备上清除所有本地访问/刷新令牌、cookie 以及本地数据库密钥。

---

## 17. 令牌存储

### 17.1 概述
令牌（访问令牌、刷新令牌、JWT）是敏感的授权凭据，一旦泄露即可被用于完整的身份盗用。

### 17.2 安全实现建议
- **不落盘泄露**：切勿把令牌写入普通文件、未加密的 SQLite 数据库、标准日志或控制台输出（`NSLog`、`print`、`Log.d`）。
- **安全保管**：令牌只能严格存放在 **iOS Keychain** 或 **Android EncryptedSharedPreferences** / 经 Keystore 加密的数据库中。
- **刷新令牌隔离**：刷新令牌生命周期长，必须施以额外的安全约束（例如要求生物识别，或限定为 `ThisDeviceOnly`）。访问令牌应短时效（例如 15 分钟），并在每次使用时轮换刷新令牌。
