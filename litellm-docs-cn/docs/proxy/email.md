import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 邮件通知

<Image 
  img={require('../../img/email_2_0.png')}
  style={{width: '70%', display: 'block', margin: '0 0 2rem 0'}}
/>
<p style={{textAlign: 'left', color: '#666'}}>LiteLLM 邮件通知</p>

## 概述

在特定事件发生时，向 LiteLLM Proxy 的用户发送邮件。

| 类别 | 详情 |
|----------|---------|
| 支持的事件 | • 用户被添加为 LiteLLM Proxy 用户<br/>• 为用户创建 Proxy API 密钥<br/>• 为用户轮换 Proxy API 密钥<br/>• 虚拟密钥（virtual key）接近或超出预算 |
| 支持的邮件集成 | • Resend API<br/>• SendGrid API<br/>• SMTP |

## 使用方法

### 1. 配置邮件集成

<Tabs>
  <TabItem value="smtp" label="SMTP">

先获取一套 SMTP 凭证，用于完成下面的配置

```yaml showLineNumbers title="proxy_config.yaml"
litellm_settings:
    callbacks: ["smtp_email"]
```

把以下内容加入代理服务的环境变量

```shell showLineNumbers
SMTP_HOST="smtp.resend.com"
SMTP_TLS="True"
SMTP_PORT="587"
SMTP_USERNAME="resend"
SMTP_SENDER_EMAIL="notifications@alerts.litellm.ai"
SMTP_PASSWORD="xxxxx"
```

  </TabItem>
  <TabItem value="resend" label="Resend API">

在代理的 config.yaml 的 `litellm_settings` 下添加 `resend_email`

设置以下环境变量

```shell showLineNumbers
RESEND_API_KEY="re_1234"
```

```yaml showLineNumbers title="proxy_config.yaml"
litellm_settings:
    callbacks: ["resend_email"]
```

  </TabItem>
  <TabItem value="sendgrid" label="SendGrid API">

在代理的 config.yaml 的 `litellm_settings` 下添加 `sendgrid_email`

设置以下环境变量

```shell showLineNumbers
SENDGRID_API_KEY="SG.1234"
SENDGRID_SENDER_EMAIL="notifications@your-domain.com"
```

```yaml showLineNumbers title="proxy_config.yaml"
litellm_settings:
  callbacks: ["sendgrid_email"]
```

  </TabItem>
</Tabs>

### 2. 创建新用户

在 LiteLLM Proxy 界面中，进入 Users，创建一个新用户。

新用户创建完成后，会收到一封邀请邮件，发送到创建该用户时填写的邮箱地址。

### 3. 配置预算告警（可选）

在代理配置的 `alerting` 列表中加入 "email"，即可启用预算告警邮件：

```yaml showLineNumbers title="proxy_config.yaml"
general_settings:
  alerting: ["email"]
```

#### 预算告警类型

**软预算告警**（soft budget alerts）：密钥超出软预算上限时自动触发，帮助你在逼近关键阈值之前掌握花费情况。

**最大预算告警**（max budget alerts）：密钥达到最大预算的指定百分比（默认 80%）时自动触发，在预算即将耗尽时向你发出预警。

这两类告警在 24 小时内最多发送一封邮件，以免造成骚扰。

#### 按密钥自定义阈值与接收人

默认情况下，最大预算告警只在一个阈值触发，并且只发给密钥所有者的邮箱；没有所有者邮箱的密钥什么都不会发。想自定义阈值并通知更多人，可以在密钥的 metadata 中设置 `max_budget_alert_emails`。其中每一项把该密钥 `max_budget` 的某个百分比映射到一组接收人，花费一旦跨过该百分比，就会通知这组人。

```shell showLineNumbers
curl -X POST 'http://0.0.0.0:4000/key/generate' \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{
    "max_budget": 100,
    "metadata": {
      "max_budget_alert_emails": {
        "50": ["owner@your-company.com"],
        "75": ["owner@your-company.com", "finance@your-company.com"],
        "100": ["oncall@your-company.com"]
      }
    }
  }'
```

对上面这把密钥：花费达到 $50 时会给所有者发邮件，达到 $75 时给所有者和财务发邮件，达到 $100 时给值班人员发邮件。接收人可以写成数组，也可以写成逗号分隔的字符串；无论你怎么配置，密钥所有者的邮箱始终包含在内。在 `EMAIL_BUDGET_ALERT_TTL` 时效内，每个阈值对每把密钥最多发送一封邮件。100% 阈值仍会在耗尽预算的那次请求上触发，因为告警检查发生在请求被拒绝之前。

在密钥上配置 `max_budget_alert_emails` 会取代该密钥默认的 80% 告警。要修改已有密钥的阈值，向 `/key/update` 传入相同的 `metadata` 块即可。

目前界面上还没有对应的配置项，请通过 `/key/generate` 或 `/key/update` 设置。

#### 团队成员预算阈值与接收人

设置了 `team_member_budget` 的团队会限制每个成员在该团队内可花费的额度，而默认情况下，成员逼近或到达上限时不会发送任何邮件。要接收成员预算告警，在团队的 metadata 中设置 `team_member_max_budget_alert_emails` 即可。其中每一项把 `team_member_budget` 的某个百分比映射到一组额外接收人，该成员在团队内的花费一旦跨过该百分比，就会通知这组人。

```shell showLineNumbers
curl -X POST 'http://0.0.0.0:4000/team/update' \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{
    "team_id": "my-team",
    "team_member_budget": 100,
    "metadata": {
      "team_member_max_budget_alert_emails": {
        "50": [],
        "100": ["finance@your-company.com"]
      }
    }
  }'
```

对上面这个团队：成员在 $100 预算中花到 $50 时会收到邮件，花到 $100 时成员本人和财务都会收到。成员自己的邮箱（来自其用户记录）始终包含在内，因此空数组意味着只通知成员本人；档案里没有邮箱的成员收不到邮件，但你配置的其他接收人仍然会收到。告警在 `EMAIL_BUDGET_ALERT_TTL` 时效内按成员、按团队、按阈值最多触发一次，100% 告警同样在耗尽预算的那次请求上、于请求被拒绝之前发出。一旦花费达到最低配置阈值，Slack 和 webhook 目标还会在其他预算类型采用的固定时点（剩余 15% 和 5%，以及预算被跨过时）收到该成员的 `Team Member Budget` 事件，事件的 `event_group` 为 `team_member`。

同样的配置块也可以在 Admin UI 中团队的 Team Member Settings 下设置，`/team/new` 的 `metadata` 同样接受它。无效条目（例如阈值不是 1 到 100 之间的整数）会被直接忽略。

#### 所有密钥的默认阈值

设置 `default_key_max_budget_alert_emails` 可以为所有密钥套用一套基线。密钥级条目会按阈值逐项合并进全局配置：在某个阈值上，密钥会继承全局接收人，并在其基础上追加自己的接收人，而不是覆盖。

```yaml showLineNumbers title="proxy_config.yaml"
general_settings:
  alerting: ["email"]

litellm_settings:
  default_key_max_budget_alert_emails:
    "80": ["platform-team@your-company.com"]
```

#### 配置选项

使用以下环境变量自定义预算告警行为：

```bash showLineNumbers title=".env"
# Percentage of max budget that triggers alerts (as decimal: 0.8 = 80%)
# Only applies to keys without max_budget_alert_emails configured
EMAIL_BUDGET_ALERT_MAX_SPEND_ALERT_PERCENTAGE=0.8

# Time-to-live for alert deduplication in seconds (default: 24 hours)
EMAIL_BUDGET_ALERT_TTL=86400
```

## 邮件模板


### 1. 用户被添加为 LiteLLM Proxy 用户

在 LiteLLM Proxy 上创建新用户时，会发送这封邮件。

<Image 
  img={require('../../img/email_event_1.png')}
  style={{width: '70%', display: 'block', margin: '0 0 2rem 0'}}
/>

**如何触发该事件**

在 LiteLLM Proxy 界面中，依次进入 Users > Create User，输入用户邮箱地址，点击 Create User。

<Image 
  img={require('../../img/new_user_email.png')}
  style={{width: '70%', display: 'block', margin: '0 0 2rem 0'}}
/>

### 2. 为用户创建 Proxy API 密钥

在 LiteLLM Proxy 上为用户新建 API 密钥时，会发送这封邮件。

<Image 
  img={require('../../img/email_event_2.png')}
  style={{width: '70%', display: 'block', margin: '0 0 2rem 0'}}
/>

**如何触发该事件**

在 LiteLLM Proxy 界面中，依次进入 Virtual Keys > Create API Key，选择 User ID。

<Image 
  img={require('../../img/key_email.png')}
  style={{width: '70%', display: 'block', margin: '0 0 2rem 0'}}
/>

在 Create Key 弹窗中，选择 Advanced Settings，并把 Send Email 设为 True。

<Image 
  img={require('../../img/key_email_2.png')}
  style={{width: '70%', display: 'block', margin: '0 0 2rem 0'}}
/>

### 3. 用户 Proxy API 密钥轮换

在 LiteLLM Proxy 上为用户轮换 API 密钥时，会发送这封邮件。

<Image 
  img={require('../../img/email_regen2.png')}
  style={{maxHeight: '600px', width: 'auto', display: 'block', margin: '0 0 2rem 0'}}
/>

**如何触发该事件**

在 LiteLLM Proxy 界面中，依次进入 Virtual Keys，点击某个密钥，再点击 "Regenerate Key"。

:::info

确保密钥上关联了 `user_id`。这个值应该在创建密钥时就已设置。

:::

<Image 
  img={require('../../img/email_regen.png')}
  style={{width: '70%', display: 'block', margin: '0 0 2rem 0'}}
/>

轮换密钥后，用户会收到一封邮件通知，内容包括：
- 围绕本次轮换的安全提示
- 新的 API 密钥（若 `EMAIL_INCLUDE_API_KEY=false`，则为占位符）
- 更新其应用程序的操作说明
- 安全最佳实践

## 邮件自定义

<EnterpriseFeature feature="Customizing Email Branding" />

LiteLLM 支持自定义邮件通知的多个方面。以下是全部可自定义字段的完整参考：

| 字段 | 环境变量 | 类型 | 默认值 | 示例 | 说明 |
|-------|-------------------|------|---------------|---------|-------------|
| Logo URL | `EMAIL_LOGO_URL` | string | LiteLLM logo | `"https://your-company.com/logo.png"` | 公司 logo 的公开访问 URL |
| 支持联系人 | `EMAIL_SUPPORT_CONTACT` | string | support@berri.ai | `"support@your-company.com"` | 用于用户支持的邮箱地址 |
| 邮件签名 | `EMAIL_SIGNATURE` | string (HTML) | Standard LiteLLM footer | `"<p>Best regards,<br/>Your Team</p><p><a href='https://your-company.com'>Visit us</a></p>"` | 所有邮件使用的 HTML 格式页脚 |
| 邀请邮件主题 | `EMAIL_SUBJECT_INVITATION` | string | "LiteLLM: New User Invitation" | `"Welcome to Your Company!"` | 邀请邮件的主题行 |
| 密钥创建邮件主题 | `EMAIL_SUBJECT_KEY_CREATED` | string | "LiteLLM: API Key Created" | `"Your New API Key is Ready"` | 密钥创建邮件的主题行 |
| 密钥轮换邮件主题 | `EMAIL_SUBJECT_KEY_ROTATED` | string | "LiteLLM: API Key Rotated" | `"Your API Key Has Been Rotated"` | 密钥轮换邮件的主题行 |
| 邮件中包含 API 密钥 | `EMAIL_INCLUDE_API_KEY` | boolean | true | `"false"` | 是否在邮件中包含真实 API 密钥（为提升安全性可设为 false） |
| Proxy Base URL | `PROXY_BASE_URL` | string | `http://0.0.0.0:4000` | `"https://proxy.your-company.com"` | LiteLLM Proxy 的基础 URL（用于生成邮件中的链接） |


## 邮件签名中的 HTML 支持

`EMAIL_SIGNATURE` 字段支持 HTML 格式，便于做出内容丰富、带有品牌风格的邮件页脚。下面是一个示例，展示可以包含哪些内容：

```html
<p>Best regards,<br/>The LiteLLM Team</p>
<p>
  <a href='https://docs.litellm.ai'>Documentation</a> |
  <a href='https://github.com/BerriAI/litellm'>GitHub</a>
</p>
<p style='font-size: 12px; color: #666;'>
  This is an automated message from LiteLLM Proxy
</p>
```

支持的 HTML 特性：
- 文本格式（粗体、斜体等）
- 换行（`<br/>`）
- 链接（`<a href='...'>`）
- 段落（`<p>`）
- 基础的内联样式
- 公司信息和社交媒体链接
- 法律声明或服务条款链接

## 环境变量

你可以通过环境变量自定义邮件的以下方面：

```bash
# Email Branding
EMAIL_LOGO_URL="https://your-company.com/logo.png"  # Custom logo URL
EMAIL_SUPPORT_CONTACT="support@your-company.com"     # Support contact email
EMAIL_SIGNATURE="<p>Best regards,<br/>Your Company Team</p><p><a href='https://your-company.com'>Visit our website</a></p>"  # Custom HTML footer/signature

# Email Subject Lines
EMAIL_SUBJECT_INVITATION="Welcome to Your Company!"  # Subject for invitation emails
EMAIL_SUBJECT_KEY_CREATED="Your API Key is Ready"    # Subject for key creation emails
EMAIL_SUBJECT_KEY_ROTATED="Your API Key Has Been Rotated"  # Subject for key rotation emails

# Security Settings
EMAIL_INCLUDE_API_KEY="false"  # Set to false to hide API keys in emails (default: true)

# Proxy Configuration
PROXY_BASE_URL="https://proxy.your-company.com"      # Base URL for the LiteLLM Proxy (used in email links)
```

## 安全：在邮件中隐藏 API 密钥

出于安全考虑，你可以配置 LiteLLM 在邮件通知中**不**包含真实的 API 密钥。以下场景下尤其有用：

- 希望降低密钥因邮件被截获而暴露的风险
- 安全策略要求只能从受保护的仪表板获取密钥
- 担心邮件转发或存储环节的安全性

关闭后，邮件会显示 `[Key hidden for security - retrieve from dashboard]`，而不是真实的 API 密钥。

**配置**：

```bash
# Hide API keys in emails (enhanced security)
EMAIL_INCLUDE_API_KEY="false"

# Include API keys in emails (default behavior)
EMAIL_INCLUDE_API_KEY="true"  # or omit this variable
```

**行为表现**：

| 设置 | 密钥创建邮件 | 密钥轮换邮件 |
|---------|------------------|-------------------|
| `true`（默认） | 显示真实 `sk-xxxxx` 密钥 | 显示真实 `sk-xxxxx` 密钥 |
| `false` | 显示占位提示信息 | 显示占位提示信息 |

用户始终可以从 LiteLLM Proxy 仪表板获取自己的密钥。

## 邮件签名中的 HTML 支持

`EMAIL_SIGNATURE` 环境变量支持 HTML 格式，让你能制作内容丰富、带有品牌风格的邮件页脚。可以包含：

- 文本格式（粗体、斜体等）
- 用 `<br/>` 换行
- 用 `<a href='...'>` 添加链接
- 用 `<p>` 分段
- 公司信息和社交媒体链接
- 法律声明或服务条款链接

HTML 签名示例：
```html
<p>Best regards,<br/>The LiteLLM Team</p>
<p>
  <a href='https://docs.litellm.ai'>Documentation</a> |
  <a href='https://github.com/BerriAI/litellm'>GitHub</a>
</p>
<p style='font-size: 12px; color: #666;'>
  This is an automated message from LiteLLM Proxy
</p>
```

## 默认模板

未设置环境变量时，LiteLLM 会使用默认模板：

- 默认 logo：LiteLLM logo
- 默认支持联系人：support@berri.ai
- 默认签名：LiteLLM 标准页脚
- 默认主题："LiteLLM: \{event_message\}"（替换为实际事件消息）

## 模板变量

设置自定义邮件主题时，唯一支持的模板变量是 `\{event_message\}`，它会被替换为事件消息（例如 "Welcome to LiteLLM Proxy" 或 "API Key Created"）。其他任何占位符（比如 `\{company_name\}`）都会在构建邮件时引发 `KeyError`，导致邮件无法发出。其余内容请使用纯文本：

```bash
# Examples of template variable usage
EMAIL_SUBJECT_INVITATION="Welcome to Acme! \{event_message\}"
EMAIL_SUBJECT_KEY_CREATED="Your Acme API Key"
```

## FAQ

### 为什么邮件链接中显示 `http://0.0.0.0:4000`？

邮件链接由 `PROXY_BASE_URL` 环境变量构建。如果在本地环境使用 LiteLLM Proxy，邮件链接中就会显示 `http://0.0.0.0:4000`。

如果在生产环境使用 LiteLLM Proxy，邮件链接中会显示 LiteLLM Proxy 实际的基础 URL。

你可以把 `PROXY_BASE_URL` 环境变量设置为 LiteLLM Proxy 实际的基础 URL。

```bash
PROXY_BASE_URL="https://proxy.your-company.com"
```
