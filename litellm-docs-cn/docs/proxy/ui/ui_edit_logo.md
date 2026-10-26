import Image from '@theme/IdealImage';

# 自定义 UI Logo

把默认 Logo 换成自己公司的品牌图，让 LiteLLM 仪表板更有你的风格。你可以通过 UI 或 API 设置自定义 Logo。

## 通过 UI 操作

### 1. 进入设置页

点击侧边栏里的 **Settings**（设置）图标。

![进入设置页](https://colony-recorder.s3.amazonaws.com/files/2026-03-13/57a15404-51f7-481e-9db2-cea94566d3ce/ascreenshot_7a348567c839448bb806fd71cf4abca0_text_export.jpeg)

### 2. 打开 UI 主题设置

在设置菜单中点击 **UI Theme**（UI 主题）。

![打开 UI 主题](https://colony-recorder.s3.amazonaws.com/files/2026-03-13/30663fe1-9f78-4496-96d4-c53513cbaf82/ascreenshot_ac1eb59eda0e423fbd0e7d3a6cabd4c7_text_export.jpeg)

### 3. 点击 Logo URL 输入框

点击 **Logo URL** 文本框，开始编辑。

![点击 Logo URL 输入框](https://colony-recorder.s3.amazonaws.com/files/2026-03-13/069e8412-8ec1-4d36-ba38-6b2e2858a45a/ascreenshot_8fc7fb4a3af74815bc1b69a8554bc110_text_export.jpeg)

### 4. 找到你的 Logo 图片

新开一个浏览器标签页，找到你想用的 Logo 图片（比如在 Google 图片里搜索你公司的 Logo）。

![找到 Logo 图片](https://colony-recorder.s3.amazonaws.com/files/2026-03-13/d9b55dac-bc4e-4728-b422-4afbc21f9034/ascreenshot_2a805f39c83d4b5e95f43495a6ea4e79_text_export.jpeg)

### 5. 右键点击 Logo 图片

右键点击你打算用作 Logo 的那张图片。

![右键点击图片](https://colony-recorder.s3.amazonaws.com/files/2026-03-13/9d42d13e-6028-4710-acb2-c6af04a855c7/ascreenshot_0f21f29ba0e44132afe483a4b88e8b70_text_export.jpeg)

### 6. 复制图片地址

在右键菜单中选择 **Copy Image Address**（复制图片地址），把 URL 复制下来。

![复制图片地址](https://colony-recorder.s3.amazonaws.com/files/2026-03-13/c25637be-383a-498b-ad11-eb1761d52757/ascreenshot_b237ee800979462189a02c1e1942ebf1_text_export.jpeg)

### 7. 切回 LiteLLM

切回 LiteLLM UI 标签页（比如按 **Cmd + Left**，或直接点击该标签页）。

![切回 LiteLLM](https://colony-recorder.s3.amazonaws.com/files/2026-03-13/f0647856-679c-4591-9ff7-7fd3cfbc70b4/ascreenshot_3ce46dae64c94891ac0983f5ed8f085a_text_export.jpeg)

### 8. 粘贴 Logo URL

用 **Cmd + V** 把刚复制的图片 URL 粘贴到 **Logo URL** 输入框中。

![粘贴 URL](https://colony-recorder.s3.amazonaws.com/files/2026-03-13/54dd30d9-7a88-41e8-a580-a6acf707c7fa/ascreenshot_8a772218ac0743d9ae8ffd3311eccd5a_text_export.jpeg)

### 9. 保存更改

点击 **Save Changes**（保存更改），新 Logo 即可生效。

![保存更改](https://colony-recorder.s3.amazonaws.com/files/2026-03-13/4baf6494-d146-4600-b6f2-ef667338d580/ascreenshot_722cbcd568ec4267af5122b3958bb248_text_export.jpeg)

现在，你的自定义 Logo 会出现在 LiteLLM 仪表板的侧边栏和登录页上。

## 深色模式 Logo

为浅色背景设计的 Logo 放到深色背景上往往难以看清，因此你可以再设置一个 Logo，供仪表板处于深色模式时使用。在同一个 UI Theme 页面填写 **Custom Logo URL (dark mode)**，或设置 `UI_LOGO_PATH_DARK` 即可。

留空也是合法的选择。此时深色模式会沿用浅色 Logo 的设置，品牌形象照常展示，而不会退回 LiteLLM 默认 Logo。深色 Logo 已设置但加载失败时也是如此，图片损坏或被删都不会让你的品牌形象丢失。

只设深色 Logo 的话，浅色模式仍会显示 LiteLLM 默认 Logo；想让两种主题都用自己的图，就把两个都设上。

## 通过 API 操作

### 设置自定义 Logo

```bash
curl -X PATCH 'http://localhost:4000/update/ui_theme_settings' \
  -H 'Authorization: Bearer <your-admin-key>' \
  -H 'Content-Type: application/json' \
  -d '{
    "logo_url": "https://example.com/your-company-logo.png",
    "logo_url_dark": "https://example.com/your-company-logo-dark.png"
  }'
```

`logo_url_dark` 是可选的。省略时，深色模式会复用 `logo_url`。

### 设置自定义 Favicon

你还可以自定义浏览器标签页图标（favicon）：

```bash
curl -X PATCH 'http://localhost:4000/update/ui_theme_settings' \
  -H 'Authorization: Bearer <your-admin-key>' \
  -H 'Content-Type: application/json' \
  -d '{
    "logo_url": "https://example.com/your-company-logo.png",
    "favicon_url": "https://example.com/your-favicon.ico"
  }'
```

### 获取当前主题设置

```bash
curl -X GET 'http://localhost:4000/get/ui_theme_settings'
```

### 重置为默认 Logo

把 `logo_url` 置为空字符串，即可恢复 LiteLLM 默认 Logo：

```bash
curl -X PATCH 'http://localhost:4000/update/ui_theme_settings' \
  -H 'Authorization: Bearer <your-admin-key>' \
  -H 'Content-Type: application/json' \
  -d '{
    "logo_url": ""
  }'
```

## 通过 `proxy_config.yaml` 配置

你也可以在代理配置文件中设置 Logo URL：

```yaml
litellm_settings:
  ui_theme_config:
    logo_url: "https://example.com/your-company-logo.png"
    logo_url_dark: "https://example.com/your-company-logo-dark.png"  # optional
    favicon_url: "https://example.com/your-favicon.ico"  # optional
```

也可以改用环境变量来设置：

```yaml
environment_variables:
  UI_LOGO_PATH: "https://example.com/your-company-logo.png"
  UI_LOGO_PATH_DARK: "https://example.com/your-company-logo-dark.png"
```

## 支持的 Logo 格式

| 格式 | 是否支持 |
|--------|-----------|
| JPEG / JPG | 是 |
| PNG | 是 |
| SVG | 是 |
| ICO（仅限 favicon） | 是 |
| HTTP/HTTPS URL | 是 |
| 本地文件路径 | 是 |
