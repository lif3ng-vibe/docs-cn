# UI 贡献指南

感谢你为 LiteLLM UI 做出贡献！本指南将帮你搭建本地开发环境。


## 1. 克隆仓库

```bash
git clone https://github.com/BerriAI/litellm.git
cd litellm
```

## 2. 启动代理

创建一个配置文件（例如 `config.yaml`）：

```yaml
model_list:
  - model_name: {{openai_large}}
    litellm_params:
      model: openai/{{openai_large}}

general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
  database_url: postgresql://<user>:<password>@<host>:<port>/<dbname>
  store_model_in_db: true
```

在端口 4000 启动代理：

```bash
uv run litellm --config config.yaml --port 4000
```

UI 在仓库中已预先构建好，直接访问 `http://localhost:4000/ui` 即可。

## 3. UI 开发

UI 开发有两种方式：

### 方式 A：开发模式（热重载）

这种方式在端口 3000 上以热重载运行 UI，代理则运行在端口 4000。

```bash
cd ui/litellm-dashboard
npm install
npm run dev
```

**登录流程**：
1. 访问 `http://localhost:3000`
2. 会被重定向到 `http://localhost:4000/ui` 进行登录
3. 登录后，手动回到 `http://localhost:3000/`
4. 现在已完成认证，可以带着热重载进行开发了

:::note
如果遇到重定向循环或认证问题，请清除浏览器中 localhost 的 Cookie，或改用构建模式。
:::

### 方式 B：构建模式

这种方式会构建 UI 并复制到代理中，改动需要重新构建。

1. 在 `ui/litellm-dashboard/src/` 中修改代码

2. 构建 UI
```bash
cd ui/litellm-dashboard
npm install
npm run build
```

构建完成后，把产物复制到代理：

```bash
cp -r out/* ../../litellm/proxy/_experimental/out/
```

然后重启代理，访问 `http://localhost:4000/ui` 即可使用 UI。

## 4. 提交 PR 前的检查清单

提交 pull request 之前，请先在 `ui/litellm-dashboard/` 目录下于本地确认以下检查都能通过：

**运行与改动相关的测试**：

```bash
npx vitest run src/components/path/to/YourComponent.test.tsx
```

测试文件与组件放在同一目录（例如 `TeamInfo.tsx` → `TeamInfo.test.tsx`）。新增组件时，请在旁边添加对应的 `.test.tsx` 文件。

**执行构建**：

```bash
npm run build
```

这两项分别对应 CI 中的 `ui_tests` 和 `ui_build` 检查。

## 5. 提交 PR

1. 为改动新建一个分支：
```bash
git checkout -b feat/your-feature-name
```

2. 暂存并提交改动：
```bash
git add .
git commit -m "feat: description of your changes"
```

3. 推送到你的 fork：
```bash
git push origin feat/your-feature-name
```

4. 按照 [PR 模板](https://github.com/BerriAI/litellm/blob/main/.github/pull_request_template.md) 在 GitHub 上创建 Pull Request
