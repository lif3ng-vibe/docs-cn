import Image from '@theme/IdealImage';

# UI - 密钥与团队的路由器设置

在密钥和团队层级配置路由器设置，可以实现细粒度的控制，涵盖路由行为、回退（fallback）、重试（retry）等各项路由器配置。这样就能针对特定密钥或团队定制路由行为，而不影响全局设置。

## 概览

密钥与团队的路由器设置让你能在不同的粒度层级上配置路由器行为。此前，路由器设置只能在全局配置，整个代理实例的所有请求都套用同一套路由策略（routing strategy）、回退、超时（timeout）与重试策略。

有了密钥级和团队级的路由器设置，现在可以：

- **按密钥或团队定制路由策略**（例如高优先级密钥用 `least-busy`，其余用 `latency-based-routing`）
- **为不同的密钥或团队配置不同的回退链**
- **设置密钥专属或团队专属的超时与重试策略**
- **按密钥或团队应用不同的可靠性设置**，如冷却（cooldown）与允许失败次数（allowed failures）
- **在特定场景需要时覆盖全局设置**

<Image img={require('../../img/ui_granular_router_settings.png')} />

## 摘要

路由器设置遵循**层级解析顺序**：**密钥 > 团队 > 全局**。当请求进来时：

1. **最先检查密钥级设置**。如果当前使用的 API 密钥配置了路由器设置，就应用这套设置。
2. **接着检查团队级设置**。如果密钥属于某个团队，且该团队配置了路由器设置，就采用团队的设置（除非密钥已有自己的设置）。
3. **全局设置兜底**。如果密钥和团队都没有配置，就应用代理配置中的全局路由器设置。

这种层级机制保证了最具体的设置优先生效，你既能为单个密钥或团队微调路由行为，又能在全局层面保留合理的默认值。

## 路由器设置的解析原理

路由器设置按以下优先级解析：

### 解析顺序：密钥 > 团队 > 全局

1. **密钥级路由器设置**（优先级最高）
   - 直接在某个 API 密钥上配置了路由器设置时生效
   - 优先于其他所有设置
   - 适合针对单个密钥做定制

2. **团队级路由器设置**（优先级居中）
   - 密钥所属团队配置了路由器设置时生效
   - 仅在密钥自身没有设置时使用
   - 适合让团队内多个密钥保持一致的配置

3. **全局路由器设置**（优先级最低）
   - 来自代理配置文件或数据库
   - 密钥和团队都没有设置时作为默认值使用
   - 此前这是唯一可用的配置方式

## 如何配置路由器设置

### 为密钥配置路由器设置

按以下步骤为 API 密钥配置路由器设置：

1. 前往 [http://localhost:4000/ui/?login=success](http://localhost:4000/ui/?login=success)

![](https://colony-recorder.s3.amazonaws.com/files/2026-01-24/61889da3-32de-4ebf-9cf3-7dc1db2fc993/ascreenshot_2492cf6d916a4ab98197cc8336e3a371_text_export.jpeg)

2. 点击 "+ Create New Key"（或编辑现有密钥）

![](https://colony-recorder.s3.amazonaws.com/files/2026-01-24/61889da3-32de-4ebf-9cf3-7dc1db2fc993/ascreenshot_5a25380cf5044b4f93c146139d84403a_text_export.jpeg)

3. 点击 "Optional Settings"

![](https://colony-recorder.s3.amazonaws.com/files/2026-01-24/e5eb5858-1cc1-4273-90bd-19ad139feebd/ascreenshot_33888989cfb9445bb83660f702ba32e0_text_export.jpeg)

4. 点击 "Router Settings"

![](https://colony-recorder.s3.amazonaws.com/files/2026-01-24/d9eeca83-1f76-4fcf-bf61-d89edf3454d3/ascreenshot_825c7993f4b24949aee9b31d4a788d8a_text_export.jpeg)

5. 配置所需的路由器设置。例如点击 "Fallbacks" 来配置回退模型：

![](https://colony-recorder.s3.amazonaws.com/files/2026-01-24/30ff647f-0254-4410-8311-660eef7ec0c4/ascreenshot_16966c8a0160473eb03e0f2c3b5c3afa_text_export.jpeg)

6. 点击 "Select a model to begin configuring fallbacks"，然后配置你的回退链：

![](https://colony-recorder.s3.amazonaws.com/files/2026-01-24/918f1b5b-c656-4864-98bd-d8c58924b6d9/ascreenshot_79ca6cd93be04033929f080e0c8d040a_text_export.jpeg)

### 为团队配置路由器设置

按以下步骤为团队配置路由器设置：

1. 前往 [http://localhost:4000/ui/?login=success](http://localhost:4000/ui/?login=success)

![](https://colony-recorder.s3.amazonaws.com/files/2026-01-24/60a33a8c-2e48-4788-a1a2-e5bcffa98cca/ascreenshot_9e255ba48f914c72ae57db7d3c1c7cd5_text_export.jpeg)

2. 点击 "Teams"

![](https://colony-recorder.s3.amazonaws.com/files/2026-01-24/60a33a8c-2e48-4788-a1a2-e5bcffa98cca/ascreenshot_070934fa9c17453987f21f58117e673b_text_export.jpeg)

3. 点击 "+ Create New Team"（或编辑现有团队）

![](https://colony-recorder.s3.amazonaws.com/files/2026-01-24/6f964ce2-f458-4719-a070-1af444ad92f5/ascreenshot_10f427f3106a4032a65d1046668880bd_text_export.jpeg)

4. 点击 "Router Settings"

![](https://colony-recorder.s3.amazonaws.com/files/2026-01-24/a923c4ae-29f2-42b5-93ae-12f62d442691/ascreenshot_144520f2dd2f419dad79dffb1579ec04_text_export.jpeg)

5. 配置所需的路由器设置。例如点击 "Fallbacks" 来配置回退模型：

![](https://colony-recorder.s3.amazonaws.com/files/2026-01-24/b062ecfa-bf5b-4c99-93a1-84b8b56fdb4c/ascreenshot_ea9acbc4e75448709b64a22addfb4157_text_export.jpeg)

6. 点击 "Select a model to begin configuring fallbacks"，然后配置你的回退链：

![](https://colony-recorder.s3.amazonaws.com/files/2026-01-24/67ca2655-4e82-4f93-be9a-7244ad22640f/ascreenshot_4fdbed826cd546d784e8738626be835d_text_export.jpeg)

## 使用场景

### 不同密钥使用不同路由策略

为不同的场景配置不同的路由策略：

- **高优先级生产密钥**：用 `latency-based-routing` 获得最佳性能
- **开发密钥**：用 `simple-shuffle` 求简单
- **成本敏感密钥**：用 `cost-based-routing` 压低开销

### 团队级一致性

让团队内所有密钥套用一致的路由器设置：

- 设置团队级回退链，提升可靠性
- 配置团队专属的超时策略
- 让团队成员的密钥统一重试策略

### 覆盖全局设置

针对特定场景覆盖全局设置：

- 生产密钥的超时策略可能要比开发环境更严格
- 某些团队可能需要不同的回退模型
- 个别密钥可能需要针对特定场景的自定义重试策略

### 灰度发布

在全局生效前，先在特定密钥或团队上验证新的路由器设置：

- 先在测试密钥上配置新的路由策略
- 全量铺开前，先在小团队上验证回退链
- 在不同密钥间 A/B 测试不同的超时值

## 相关功能

- [路由器设置参考](./config_settings.md#router_settings-参考)：全部路由器设置的完整参考
- [负载均衡](./load_balancing.md)：了解路由策略与负载均衡
- [可靠性](./reliability.md)：配置回退、重试与错误处理
- [密钥](./virtual_keys.md)：管理 API 密钥及其设置
- [团队](./multi_tenant_architecture.md)：把密钥组织成团队
