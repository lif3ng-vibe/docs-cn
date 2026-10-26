import Image from '@theme/IdealImage';

# UI 花费日志设置

直接在管理界面（Admin UI）中配置花费日志（spend log）的行为，无需修改配置文件，也无需重启代理服务器。这对云端部署尤其有用，因为这类环境下更新配置往往很困难，或者要走漫长的发布流程。

## 概述

此前，花费日志的相关选项（例如是否存储请求/响应内容、保留期限）只能在 `proxy_config.yaml` 的 `general_settings` 中设置。想修改就得编辑配置文件并重启代理。对于配置不易访问、或部署流程拖慢配置更新的用户（尤其是云端环境的用户）来说，这是个痛点。

<Image img={require('../../img/ui_spend_logs_settings.png')} />

**UI 花费日志设置**支持以下操作：

- **在花费日志中存储提示词**（Store Prompts in Spend Logs）：控制是否在花费日志表中保存请求与响应内容（只影响更改设置之后创建的日志）。
- **设置保留期限**（Retention Period）：配置花费日志保留多久后自动清理（例如 `7d`、`30d`）。
- **立即生效**：无需重启代理，保存之后马上对新请求生效。

:::warning[UI 设置优先于配置文件]
在 UI 中修改的设置会**覆盖**配置文件中的对应值。例如，即使 `general_settings` 中已将 `store_prompts_in_spend_logs` 显式设为 `false`，在 UI 中开启该选项后仍会开始存储提示词。如果希望不重新部署就能在运行时控制这些行为，请使用 UI。
:::

## 可配置的设置项

| 设置 | 说明 |
| --- | --- |
| **在花费日志中存储提示词** | 开启后，**新创建的**花费日志会保存请求消息与响应内容，可在日志 UI 中查看。开启此选项之前创建的日志不含请求/响应内容。关闭时，新日志只保存元数据（如 Token 数、费用、模型）。 |
| **保留期限** | 花费日志在自动删除前保留的最长时间（例如 `7d`、`30d`）。可选；未设置时按配置或默认行为保留日志。 |

同样的选项也可以在配置文件中通过 [general_settings](./config_settings.md#general_settings-参考) 设置（`store_prompts_in_spend_logs`、`maximum_spend_logs_retention_period`），以 UI 中设置的值为准。

## 在 UI 中配置花费日志设置

### 1. 打开日志页面

打开管理界面（例如 `http://localhost:4000/ui` 或你的 `PROXY_BASE_URL/ui`），点击 **日志**（Logs）。

![](https://colony-recorder.s3.amazonaws.com/files/2026-01-31/815f4ab2-4b8c-4dfe-be39-689fd6e12167/ascreenshot_eaaeba1507b441408e0df8bf94bc70cc_text_export.jpeg)

![](https://colony-recorder.s3.amazonaws.com/files/2026-01-31/815f4ab2-4b8c-4dfe-be39-689fd6e12167/ascreenshot_666628f5e62443688a58b7cee7d7559b_text_export.jpeg)

### 2. 打开日志设置

在日志页面点击齿轮形状的 **设置**（Settings）图标，打开花费日志设置面板。

![](https://colony-recorder.s3.amazonaws.com/files/2026-01-31/303077bd-80a0-4f3b-9dc1-4abb90af117f/ascreenshot_63f5dc21a545489ea9266f3bd3dc8455_text_export.jpeg)

### 3. 开启在花费日志中存储提示词（可选）

如果希望新请求的请求与响应内容被保存下来、打开对应日志条目时可以看到，请开启 **在花费日志中存储提示词**。该设置只对开启之后创建的日志生效，已有日志不会补充请求/响应内容。如果只需要元数据（Token 数、费用、模型等），保持关闭即可。

![](https://colony-recorder.s3.amazonaws.com/files/2026-01-31/a25d0051-4b34-4270-99d6-6e8ae0d2936a/ascreenshot_374605862aad42c89a98da7bad910f58_text_export.jpeg)

### 4. 设置保留期限（可选）

可按需设置 **保留期限**（例如 `7d`、`30d`），控制花费日志保留多久后自动清理。格式与配置项 `maximum_spend_logs_retention_period` 相同。

![](https://colony-recorder.s3.amazonaws.com/files/2026-01-31/87086197-b082-4339-b798-37410f47d9ac/ascreenshot_564da14f492540ae8b0b782cfedceff9_text_export.jpeg)

### 5. 保存设置

点击 **保存设置**（Save Settings）。更改对新请求立即生效，无需重启代理；已有日志不会更新。

![](https://colony-recorder.s3.amazonaws.com/files/2026-01-31/8cfd82c1-0ff4-4561-a806-33a7998cf0fd/ascreenshot_673f6155b17f45ee9b80fabdfc42a4ee_text_export.jpeg)

### 6. 验证：查看日志中的请求与响应内容

开启 **在花费日志中存储提示词** 后，通过代理发起一个新请求，然后打开这条日志（或任何在开启设置之后创建的日志）。日志详情中会包含请求与响应内容；开启设置之前就存在的日志则没有这些内容。

![](https://colony-recorder.s3.amazonaws.com/files/2026-01-31/0fbec553-9a11-4f4f-8a1d-f969bb316c70/ascreenshot_62ecbcea97ea4a4abaa460d76e2cf924_text_export.jpeg)

![](https://colony-recorder.s3.amazonaws.com/files/2026-01-31/30e7ea4d-2c03-4b96-88a9-eeee565eaf16/ascreenshot_c00ad6aa75b54b4988a1450647a76f6b_text_export.jpeg)

## 使用场景

### 云端与托管部署

当代理运行在托管或云端环境时，配置可能存放在另一个仓库、需要漫长的发布流程，或由其他团队掌管。通过 UI 修改花费日志行为（例如为调试开启提示词存储、或设置保留期限），就不必走这套流程。

### 调试用的快速开关

调试时可临时开启 **在花费日志中存储提示词**，检查新请求的请求/响应内容，之后直接在 UI 里关闭，不用改配置也不用重启。只有开启期间创建的日志才会包含这些内容。

### 无需重新部署即可调整保留期限

调整花费日志的保留时长（例如缩短以节省存储，或为满足合规要求而延长），新的保留期限和清理任务会立即生效。

## 相关文档

- [UI 日志入门](./ui_logs.md)：概述记录了哪些内容，以及基于配置的选项
- [配置项](./config_settings.md)：`general_settings` 中的 `store_prompts_in_spend_logs`、`disable_spend_logs`、`maximum_spend_logs_retention_period`
- [花费日志删除](./spend_logs_deletion.md)：保留与清理机制的工作方式
