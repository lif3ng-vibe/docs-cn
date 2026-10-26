import Image from '@theme/IdealImage';

# 团队软预算告警

<EnterpriseFeature>邮件预算告警需要企业版（enterprise license）。</EnterpriseFeature>

为团队设置软预算（soft budget）后，一旦花费超过阈值就会收到邮件告警，且不会拦截任何请求。

## 概述

**软预算**是一个花费阈值，超过时会触发邮件通知，但**不会拦截请求**。这与硬预算（`max_budget`）不同，后者一旦达到上限就会拒绝请求。

<Image img={require('../../img/ui_team_soft_budget_alerts.png')} />

团队软预算告警可以帮助你：

- **提前收到通知**：团队花费超过软预算阈值时，及时收到邮件告警
- **保持请求畅通**：与硬预算不同，软预算从不拦截 API 调用
- **指定收件人**：告警可发送到指定邮箱（如团队负责人、财务），而不只是团队成员
- **不依赖全局告警**：团队软预算告警通过邮件独立发送，与 Slack 或其他全局告警配置无关

:::warning[需要邮件集成]
团队软预算告警通过邮件发送。你的代理服务器必须配置了可用的邮件集成（SendGrid、Resend 或 SMTP），告警才能送达。设置方法参见[邮件通知](./email.md)。
:::

:::info[自动生效]
只要为团队配置了软预算和至少一个告警邮箱，团队软预算告警就**自动生效**。无需额外的代理配置或重启；每次请求时都会检查告警条件。
:::

## 工作原理

每次使用属于某个团队的 API 密钥发起请求时，代理会检查：

1. 该团队是否设置了 `soft_budget`？
2. 团队当前的 `spend` 是否 >= `soft_budget`？
3. `soft_budget_alerting_emails` 中是否配置了邮箱？

三个条件全部满足时，就会向配置的收件人发送邮件告警。告警会**去重**，同一告警在 24 小时窗口内只发送一次。

## 如何设置团队软预算告警

### 1. 进入管理界面（Admin UI）

打开 Admin UI（如 `http://localhost:4000/ui` 或你的 `PROXY_BASE_URL/ui`）。

![](https://colony-recorder.s3.amazonaws.com/files/2026-02-07/f06d75ad-25ef-4ee8-90c3-9604f8e46a1c/ascreenshot_1a6defaed1494d6da0001459511ecfd5_text_export.jpeg)

### 2. 进入 Teams 页面

点击侧边栏中的 **Teams**。

![](https://colony-recorder.s3.amazonaws.com/files/2026-02-07/f06d75ad-25ef-4ee8-90c3-9604f8e46a1c/ascreenshot_2d258fa280f6463b966bf7a05bb102d5_text_export.jpeg)

### 3. 选择团队

点击你要配置软预算告警的团队。

![](https://colony-recorder.s3.amazonaws.com/files/2026-02-07/490f09fb-6bf5-45a8-a384-676889f34c88/ascreenshot_15cceb22abe64df0bf7d7c742ecb5b2f_text_export.jpeg)

### 4. 打开团队 Settings

点击 **Settings** 标签页，查看团队的配置。

![](https://colony-recorder.s3.amazonaws.com/files/2026-02-07/28dd1bc5-7d07-462f-b277-33f885bdc07e/ascreenshot_12f2b762b5d24686801d93ad5b067e06_text_export.jpeg)

### 5. 编辑设置

点击 **Edit Settings**，修改团队的预算配置。

![](https://colony-recorder.s3.amazonaws.com/files/2026-02-07/30a483ea-7e01-4fdc-ac5f-a5572388d138/ascreenshot_0915eadd9e754a798489853b82de3cb5_text_export.jpeg)

### 6. 设置软预算

点击 **Soft Budget (USD)** 字段，输入你想要的阈值。例如测试时输入 `0.01`，生产环境可以输入 `500` 这样的更高数值。

![](https://colony-recorder.s3.amazonaws.com/files/2026-02-07/8b306d80-4943-4ad0-a51a-94b5ebdd6680/ascreenshot_5bb6e65c6428473fac2607f6a7f4b98a_text_export.jpeg)

### 7. 添加告警邮箱

点击 **Soft Budget Alerting Emails** 字段，输入一个或多个以逗号分隔的邮箱地址，告警会发送到这些邮箱。

![](https://colony-recorder.s3.amazonaws.com/files/2026-02-07/a97c6efa-cc93-45d7-979e-d2a533f423b9/ascreenshot_2d8223ce8e934aa1bfadfb2f78aee5fc_text_export.jpeg)

### 8. 保存更改

点击 **Save Changes**。软预算告警随即生效，无需重启代理。

![](https://colony-recorder.s3.amazonaws.com/files/2026-02-07/865ba6f1-3fc6-4c19-8e08-433561d6c3f7/ascreenshot_b2f0503ada3a479a83dc8b7d01c1f8da_text_export.jpeg)

### 9. 验证：已收到告警邮件

团队花费超过软预算后，告警邮件会发送到配置的收件人。下面是一封告警邮件示例：

<Image img={require('../../img/ui_team_soft_budget_email_example.png')} />

## 设置项参考

| 设置项                         | 说明                                                                                                                                   |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **Soft Budget (USD)**           | 触发邮件告警的花费阈值。超过该上限**不会**拦截请求。                                                                |
| **Soft Budget Alerting Emails** | 以逗号分隔的邮箱地址列表，软预算超限时告警发送到这些邮箱。至少需要一个邮箱，告警才能发出。 |

:::tip[软预算 vs. Max Budget]

- **软预算**：提示性阈值。发送邮件告警，但**不会**拦截请求。
- **Max Budget**：硬性上限。一旦超出预算就拦截请求。

同一个团队可以两者都设：软预算提前预警，Max Budget 硬性拦截。
:::

## API 配置

也可以在创建或更新团队时，通过 API 配置团队软预算：

```bash
curl -X POST 'http://localhost:4000/team/update' \
  --header "Authorization: Bearer $LITELLM_API_KEY" \
  --header 'Content-Type: application/json' \
  --data '{
    "team_id": "your-team-id",
    "soft_budget": 500.00,
    "metadata": {
      "soft_budget_alerting_emails": ["lead@example.com", "finance@example.com"]
    }
  }'
```

## 相关文档

- [邮件通知](./email.md)：为 LiteLLM Proxy 配置邮件集成（Resend、SMTP）
- [告警](./alerting.md)：设置 Slack 及其他告警渠道
- [成本追踪](./cost_tracking.md)：跨团队、密钥和用户追踪并管理花费
