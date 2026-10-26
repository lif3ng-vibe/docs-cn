import Image from '@theme/IdealImage';

# 为内部用户控制页面可见性

在 LiteLLM UI 中，配置内部用户（非管理员开发者）可以看到哪些导航标签页与页面。

借助这一功能，你可以简化界面，并控制内部用户/开发者在登录后能看到哪些页面。

## 概览

默认情况下，内部用户可访问的所有页面都会显示在导航侧边栏中。页面可见性控制让管理员能够限制内部用户可见的页面范围，打造更聚焦、更精简的使用体验。


## 配置页面可见性

### 1. 进入 Settings

点击侧边栏中的 **Settings** 图标。

![进入 Settings](https://colony-recorder.s3.amazonaws.com/files/2026-01-28/cbb6f272-ab18-4996-b57d-7ed4aad721ea/ascreenshot_ab80f3175b1a41b0bdabdd2cd3980573_text_export.jpeg)

### 2. 打开 Admin Settings

在设置菜单中点击 **Admin Settings**。

![打开 Admin Settings](https://colony-recorder.s3.amazonaws.com/files/2026-01-28/e2b327bf-1cfd-4519-a9ce-8a6ecb2de53a/ascreenshot_23bb1577b3f84d22be78e0faa58dee3d_text_export.jpeg)

### 3. 选择 UI Settings

点击 **UI Settings**，进入页面可见性控制项。

![选择 UI Settings](https://colony-recorder.s3.amazonaws.com/files/2026-01-28/fff0366a-4944-457a-8f6a-e22018dde108/ascreenshot_0e268e8651654e75bb9fb40d2ed366a9_text_export.jpeg)

### 4. 打开页面可见性配置

点击 **Configure Page Visibility**，展开配置面板。

![打开配置面板](https://colony-recorder.s3.amazonaws.com/files/2026-01-28/3a4761d6-145a-4afd-8abf-d92744b9ac9f/ascreenshot_23c16eb79c32481887b879d961f1f00a_text_export.jpeg)

### 5. 选择要显示的页面

勾选你希望内部用户看到的页面。页面按类别分组，便于查找。

![选择页面](https://colony-recorder.s3.amazonaws.com/files/2026-01-28/b9c96b54-6c20-484f-8b0b-3a86decb5717/ascreenshot_3347ade01ebe4ea390bc7b57e53db43f_text_export.jpeg)

**可选页面包括**：
- 虚拟密钥（Virtual Keys）
- Playground
- 模型与端点（Models + Endpoints）
- 智能体（Agents）
- MCP 服务器（MCP Servers）
- 搜索工具（Search Tools）
- 向量存储（Vector Stores）
- 日志（Logs）
- 团队（Teams）
- 组织（Organizations）
- 用量（Usage）
- 预算（Budgets）
- 以及其他更多页面

### 6. 保存配置

点击 **Save Page Visibility Settings**，应用更改。

![保存设置](https://colony-recorder.s3.amazonaws.com/files/2026-01-28/8a215378-44f5-4bb8-b984-06fa2aa03903/ascreenshot_44e7aeebe25a477ba92f73a3ed3df644_text_export.jpeg)

### 7. 验证更改

此后，内部用户的导航侧边栏中就只会显示所选页面。

![验证更改](https://colony-recorder.s3.amazonaws.com/files/2026-01-28/493a7718-b276-40b9-970f-5814054932d9/ascreenshot_ad23b8691f824095ba60256f91ad24f8_text_export.jpeg)

## 恢复默认

若要把所有页面恢复给内部用户：

1. 打开页面可见性配置
2. 点击 **Reset to Default (All Pages)**
3. 点击 **Save Page Visibility Settings**

该操作会清除限制，让内部用户重新看到全部可访问页面。

## API 配置

你也可以通过 API 以编程方式配置页面可见性：

### 获取当前设置

```bash
curl -X GET 'http://localhost:4000/get/ui_settings' \
  -H 'Authorization: Bearer <your-admin-key>'
```

### 更新页面可见性

```bash
curl -X PATCH 'http://localhost:4000/update/ui_settings' \
  -H 'Authorization: Bearer <your-admin-key>' \
  -H 'Content-Type: application/json' \
  -d '{
    "enabled_ui_pages_internal_users": [
      "api-keys",
      "agents",
      "mcp-servers",
      "logs",
      "teams"
    ]
  }'
```

### 清除页面可见性限制

```bash
curl -X PATCH 'http://localhost:4000/update/ui_settings' \
  -H 'Authorization: Bearer <your-admin-key>' \
  -H 'Content-Type: application/json' \
  -d '{
    "enabled_ui_pages_internal_users": null
  }'
```
